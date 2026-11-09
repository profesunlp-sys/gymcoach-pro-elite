import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../services/firebase';
import { Alumno, GrupoConfig, ViewMode } from '../../types';
import { BackButton, Button } from './ui/CommonUI';

interface MorososProps {
  setVista: (v: ViewMode) => void;
  handleNavigation: (v: ViewMode) => void;
  userRole?: string;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface MorosoItem {
  alumno: Alumno;
  mesesAdeudados: string[];
}

/**
 * Módulo de "Morosos" (deudores de cuota).
 * Calcula, a partir de los datos reales de Firestore, qué alumnos no pagaron
 * la cuota del mes actual y de los últimos N meses del ciclo.
 */
export const Morosos: React.FC<MorososProps> = ({ setVista, handleNavigation, userRole }) => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [grupos, setGrupos] = useState<GrupoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroGrupo, setFiltroGrupo] = useState<string>('Todos');
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anio, setAnio] = useState(new Date().getFullYear());

  useEffect(() => {
    const unsubAlumnos = onSnapshot(collection(db, COLLECTIONS.ALUMNOS), (snap) => {
      setAlumnos(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Alumno));
      setLoading(false);
    }, () => setLoading(false));
    const unsubGrupos = onSnapshot(collection(db, COLLECTIONS.GRUPOS), (snap) => {
      setGrupos(snap.docs.map(d => ({ id: d.id, ...d.data() }) as GrupoConfig));
    });
    return () => { unsubAlumnos(); unsubGrupos(); };
  }, []);

  // Morosos = alumnos con al menos una cuota impaga desde el inicio del ciclo (marzo) hasta el mes actual
  const morosos = useMemo<MorosoItem[]>(() => {
    const inicioCiclo = 2; // Marzo (índice 2)
    const mesesAControlar = MESES.slice(inicioCiclo, mesActual + 1);

    return alumnos
      .filter(a => a.estadoPago !== 'Exento') // los exentos no son morosos
      .map(alumno => {
        const pagados = new Set(
          (alumno.pagosMensuales || [])
            .filter(p => p.anio === anio)
            .map(p => p.mes)
        );
        const mesesAdeudados = mesesAControlar.filter(m => !pagados.has(m));
        return { alumno, mesesAdeudados };
      })
      .filter(item => item.mesesAdeudados.length > 0)
      .sort((a, b) => b.mesesAdeudados.length - a.mesesAdeudados.length);
  }, [alumnos, mesActual, anio]);

  const filtrados = filtroGrupo === 'Todos'
    ? morosos
    : morosos.filter(m => m.alumno.grupo === filtroGrupo);

  const totalAdeudado = filtrados.reduce((sum, m) => sum + m.mesesAdeudados.length, 0);

  return (
    <div className="min-h-screen bg-ios-gray px-6 py-8 space-y-8 page-transition pb-32 relative max-w-[640px] mx-auto">
      <BackButton onClick={() => handleNavigation('Dashboard')} />

      <header className="pt-16">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-ios-red/10 rounded-2xl flex items-center justify-center text-ios-red shadow-sm">
            <span className="material-icons-outlined text-3xl">report_problem</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black tracking-tight">Morosos</h2>
            <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mt-1">Control de cuotas impagas</p>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filtroGrupo}
          onChange={(e) => setFiltroGrupo(e.target.value)}
          className="bg-white border border-black/5 rounded-xl px-4 py-3 text-xs font-bold text-black outline-none focus:ring-2 focus:ring-ios-blue/20"
        >
          <option value="Todos">Todos los grupos</option>
          {grupos.map(g => <option key={g.id} value={g.nombre}>{g.nombre}</option>)}
        </select>

        <select
          value={mesActual}
          onChange={(e) => setMesActual(parseInt(e.target.value))}
          className="bg-white border border-black/5 rounded-xl px-4 py-3 text-xs font-bold text-black outline-none focus:ring-2 focus:ring-ios-blue/20"
        >
          {MESES.map((m, i) => <option key={m} value={i}>{m} {anio}</option>)}
        </select>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-black/5 text-center">
          <p className="text-3xl font-black text-ios-red">{filtrados.length}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-secondary mt-1">Alumnos</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-black/5 text-center">
          <p className="text-3xl font-black text-ios-orange">{totalAdeudado}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-secondary mt-1">Cuotas adeudadas</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-black/5 text-center">
          <p className="text-3xl font-black text-ios-blue">{alumnos.length - morosos.length}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-secondary mt-1">Al día</p>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary text-[10px] font-bold uppercase tracking-widest">Cargando morosos</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-10 text-center border border-black/5">
          <span className="material-icons-outlined text-5xl text-ios-green">task_alt</span>
          <p className="text-black font-bold mt-4">¡Sin morosos! 🎉</p>
          <p className="text-secondary text-xs mt-1">Todos los alumnos están al día en el período seleccionado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtrados.map(({ alumno, mesesAdeudados }) => (
              <motion.div
                key={alumno.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl p-4 border border-black/5 flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shrink-0 ${
                  mesesAdeudados.length >= 3 ? 'bg-ios-red' : mesesAdeudados.length === 2 ? 'bg-ios-orange' : 'bg-ios-blue'
                }`}>
                  {alumno.nombre?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black truncate">{alumno.nombre}</p>
                  <p className="text-[10px] text-secondary uppercase font-bold tracking-wider truncate">
                    {alumno.grupo || 'Sin grupo'} • {alumno.contacto?.padreTelefono || alumno.contacto?.madreTelefono || 'sin teléfono'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    mesesAdeudados.length >= 3 ? 'bg-ios-red/10 text-ios-red' : mesesAdeudados.length === 2 ? 'bg-ios-orange/10 text-ios-orange' : 'bg-ios-blue/10 text-ios-blue'
                  }`}>
                    {mesesAdeudados.length} {mesesAdeudados.length === 1 ? 'cuota' : 'cuotas'}
                  </span>
                  <p className="text-[9px] text-secondary font-bold mt-1 uppercase tracking-wider">
                    {mesesAdeudados.slice(0, 3).map(m => m.slice(0, 3)).join(' · ')}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {userRole === 'Coordinator' && filtrados.length > 0 && (
        <Button onClick={() => handleNavigation('ControlPagos')} className="w-full" variant="secondary">
          <span className="material-icons-outlined text-base">payments</span>
          Ir a Control de Pagos
        </Button>
      )}
    </div>
  );
};

export default Morosos;
