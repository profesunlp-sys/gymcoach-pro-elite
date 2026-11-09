import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Alumno } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { SincronizacionTotal } from './SincronizacionTotal';

interface ControlPagosProps {
  onBack: () => void;
  onImportPayments: () => void;
}

export const ControlPagos: React.FC<ControlPagosProps> = ({ onBack, onImportPayments }) => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showSincronizacion, setShowSincronizacion] = useState(false);
  
  const years = [2024, 2025, 2026, 2027];
  const meses = [
    { n: 3, name: 'Mar', label: 'Marzo' },
    { n: 4, name: 'Abr', label: 'Abril' },
    { n: 5, name: 'May', label: 'Mayo' },
    { n: 6, name: 'Jun', label: 'Junio' },
    { n: 7, name: 'Jul', label: 'Julio' },
    { n: 8, name: 'Ago', label: 'Agosto' },
    { n: 9, name: 'Sep', label: 'Septiembre' },
    { n: 10, name: 'Oct', label: 'Octubre' },
    { n: 11, name: 'Nov', label: 'Noviembre' }
  ];

  useEffect(() => {
    const unsubAlumnos = onSnapshot(collection(db, 'alumnos'), (snapshot) => {
      setAlumnos(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Alumno));
    });
    const unsubGrupos = onSnapshot(collection(db, 'grupos'), (snapshot) => {
      setGrupos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubAlumnos(); unsubGrupos(); };
  }, []);

  const norm = (s: unknown): string => String(s ?? '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const isPaid = (alumno: Alumno, mesN: number): boolean => {
    if (!Array.isArray(alumno.pagosMensuales)) return false;
    const mesObj = meses.find(m => m.n === mesN);
    if (!mesObj) return false;
    const labelNorm = norm(mesObj.label);
    const abrevNorm = norm(mesObj.name);
    const prefijo = labelNorm.slice(0, 3);
    const numStr = String(mesN);

    return alumno.pagosMensuales.some(p => {
      if (!p) return false;
      const pAnio = parseInt(String(p.anio ?? '0'), 10);
      if (isNaN(pAnio) || pAnio !== selectedYear) return false;
      
      // FILTRO: Solo Gimnasia Artística Infantil
      if (p.categoria) {
        const cat = norm(String(p.categoria));
        if (!cat.includes('gimnasia') && !cat.includes('artistica') && !cat.includes('gaf') && !cat.includes('gai')) {
          return false;
        }
      }
      
      const pMes = norm(p.mes);
      return pMes === labelNorm || pMes === abrevNorm || pMes.startsWith(prefijo) || pMes === numStr;
    });
  };

  const togglePago = async (alumno: Alumno, mesN: number) => {
    if (!alumno.id) return;
    const mesLabel = meses.find(m => m.n === mesN)?.label ?? 'Enero';
    const yaPagado = isPaid(alumno, mesN);
    const alumnoRef = doc(db, 'alumnos', alumno.id);

    try {
      if (yaPagado) {
        const pagoARemover = alumno.pagosMensuales?.find(p => {
          const pAnio = parseInt(String(p.anio ?? '0'), 10);
          return pAnio === selectedYear && norm(p.mes) === norm(mesLabel);
        });
        if (pagoARemover) await updateDoc(alumnoRef, { pagosMensuales: arrayRemove(pagoARemover) });
      } else {
        await updateDoc(alumnoRef, {
          pagosMensuales: arrayUnion({ mes: mesLabel, anio: selectedYear, fechaPago: new Date().toISOString(), categoria: "Gimnasia Artística Infantil" }),
        });
      }
    } catch (err) { console.error(err); }
  };

  const getGrupoDetalle = (alumno: Alumno) => {
    if (!alumno.grupo || alumno.grupo === 'SIN GRUPO') return 'SIN GRUPO';
    const config = grupos.find(g => g.nombre === alumno.grupo);
    if (!config) return alumno.grupo;
    const dias = Array.isArray(config.dias) ? config.dias.join(' Y ') : config.dias;
    return `${dias} ${config.horario ?? ''}`.trim().toUpperCase();
  };

  const alumnosOrdenados = [...alumnos].sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="min-h-screen bg-ios-gray pb-32 relative">
      {showSincronizacion && (
        <SincronizacionTotal 
          onComplete={(count) => { setShowSincronizacion(false); onImportPayments(); }} 
          onCancel={() => setShowSincronizacion(false)} 
        />
      )}

      <header className="bg-white px-6 pt-12 pb-6 shadow-sm border-b border-black/5 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-primary font-medium flex items-center gap-1">
            <span className="material-icons-outlined text-lg">arrow_back_ios</span>
            <span>Atrás</span>
          </button>
          <div className="flex bg-ios-gray p-1 rounded-xl gap-1">
            {years.map(y => (
              <button key={y} onClick={() => setSelectedYear(y)} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${selectedYear === y ? 'bg-white text-ios-blue shadow-sm' : 'text-secondary hover:text-black'}`}>
                {y}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-black tracking-tight">Control de Pagos</h1>
        <p className="text-secondary text-sm mt-1">Temporada Marzo–Noviembre · {selectedYear}</p>

        {/* Banner Sincronización Total */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl p-5 relative overflow-hidden group cursor-pointer" onClick={() => setShowSincronizacion(true)}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl group-hover:bg-purple-200/30 transition-colors" />
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20 animate-pulse">
              <span className="material-icons-outlined text-2xl">sync_alt</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-purple-900">Sincronización Total desde Excel</h4>
              <p className="text-[10px] text-purple-700 font-medium leading-relaxed">
                Reemplaza toda la base de datos con el listado oficial de la oficina. Crea alumnos nuevos y actualiza pagos masivamente.
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap">
              <span className="material-icons-outlined text-base">upload_file</span>
              Sincronizar Ahora
            </motion.button>
          </div>
        </div>

        {/* Banner Importar Clásico */}
        <div className="mt-4 bg-ios-blue/5 border border-ios-blue/10 rounded-3xl p-5 relative overflow-hidden group" onClick={onImportPayments}>
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 cursor-pointer">
            <div className="w-12 h-12 bg-ios-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-ios-blue/20">
              <span className="material-icons-outlined text-2xl">auto_fix_high</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-black">Importar Pagos Rápido</h4>
              <p className="text-[10px] text-secondary font-medium leading-relaxed">
                Agrega pagos sueltos sin modificar la lista de alumnos existente.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="bg-white rounded-[2rem] shadow-ios overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black/5">
                <th className="p-4 text-left text-[10px] font-bold text-secondary uppercase tracking-widest sticky left-0 bg-white z-10 w-52">Gimnasta</th>
                {meses.map(m => (
                  <th key={m.n} className="p-4 text-center text-[10px] font-bold text-secondary uppercase tracking-widest min-w-[52px]">{m.name}</th>
                ))}
                <th className="p-4 text-center text-[10px] font-bold text-secondary uppercase tracking-widest min-w-[48px]">/9</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {alumnosOrdenados.map(alumno => {
                const pagosAnio = meses.filter(m => isPaid(alumno, m.n)).length;
                return (
                  <tr key={alumno.id} className="hover:bg-ios-gray/30 transition-colors">
                    <td className="p-4 sticky left-0 bg-white z-10 border-r border-black/5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-black line-clamp-1">{alumno.nombre}</span>
                        <span className="text-[9px] font-bold text-secondary uppercase tracking-tighter leading-tight">{getGrupoDetalle(alumno)}</span>
                      </div>
                    </td>
                    {meses.map(m => {
                      const paid = isPaid(alumno, m.n);
                      return (
                        <td key={m.n} className="p-3 text-center">
                          <motion.button whileTap={{ scale: 0.82 }} onClick={() => togglePago(alumno, m.n)} className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${paid ? 'bg-ios-green text-white shadow-sm shadow-ios-green/30' : 'bg-ios-gray text-transparent border border-black/5 hover:border-black/20'}`}>
                            <span className="material-icons-outlined text-[16px]">check</span>
                          </motion.button>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center">
                      <span className={`text-[11px] font-black tabular-nums ${pagosAnio === 9 ? 'text-ios-green' : pagosAnio >= 5 ? 'text-ios-blue' : pagosAnio > 0 ? 'text-amber-500' : 'text-black/20'}`}>
                        {pagosAnio}/9
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-center text-[9px] text-secondary/60 mt-3 font-medium">Usa "Sincronización Total" para cargar el Excel de la oficina por primera vez.</p>
      </div>
    </div>
  );
};
