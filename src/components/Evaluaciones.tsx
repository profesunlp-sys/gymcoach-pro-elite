import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, onSnapshot, addDoc, deleteDoc, doc
} from 'firebase/firestore';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { db, COLLECTIONS } from '../../services/firebase';
import { Alumno, GrupoConfig, ViewMode, Evaluacion } from '../../types';
import { BackButton, Button } from './ui/CommonUI';

interface EvaluacionesProps {
  setVista: (v: ViewMode) => void;
  handleNavigation: (v: ViewMode) => void;
  userRole?: string;
}

const BIOMETRICOS: { key: keyof Pick<Evaluacion, 'fuerza' | 'flexibilidad' | 'tecnica' | 'resistencia' | 'coordinacion'>; label: string }[] = [
  { key: 'fuerza', label: 'Fuerza' },
  { key: 'flexibilidad', label: 'Flexibilidad' },
  { key: 'tecnica', label: 'Técnica' },
  { key: 'resistencia', label: 'Resistencia' },
  { key: 'coordinacion', label: 'Coordinación' },
];

const emptyForm = {
  disciplina: 'GAF',
  aparato: 'Suelo',
  fuerza: 5,
  flexibilidad: 5,
  tecnica: 5,
  resistencia: 5,
  coordinacion: 5,
  observaciones: '',
};

export const Evaluaciones: React.FC<EvaluacionesProps> = ({ setVista, handleNavigation, userRole }) => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [grupos, setGrupos] = useState<GrupoConfig[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [search, setSearch] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubAl = onSnapshot(collection(db, COLLECTIONS.ALUMNOS), (snap) => {
      setAlumnos(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Alumno));
      setLoading(false);
    }, () => setLoading(false));
    const unsubGr = onSnapshot(collection(db, COLLECTIONS.GRUPOS), (snap) => {
      setGrupos(snap.docs.map(d => ({ id: d.id, ...d.data() }) as GrupoConfig));
    });
    const unsubEv = onSnapshot(collection(db, COLLECTIONS.EVALUACIONES), (snap) => {
      setEvaluaciones(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Evaluacion));
    }, () => {});
    return () => { unsubAl(); unsubGr(); unsubEv(); };
  }, []);

  const alumnosFiltrados = useMemo(() => {
    return alumnos.filter(a => {
      const matchGrupo = filtroGrupo === 'Todos' || a.grupo === filtroGrupo;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || (a.nombre || '').toLowerCase().includes(q);
      return matchGrupo && matchSearch;
    }).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  }, [alumnos, filtroGrupo, search]);

  const evaluacionesDelAlumno = useMemo(() => {
    if (!selectedAlumno?.id) return [];
    return evaluaciones
      .filter(e => e.alumnoId === selectedAlumno.id)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [evaluaciones, selectedAlumno]);

  const radarData = useMemo(() => {
    if (!selectedAlumno) return [];
    const ultima = evaluacionesDelAlumno[evaluacionesDelAlumno.length - 1];
    if (!ultima) return [];
    return BIOMETRICOS.map(b => ({ metrica: b.label, valor: ultima[b.key] }));
  }, [evaluacionesDelAlumno, selectedAlumno]);

  const evolucionData = useMemo(() => {
    return evaluacionesDelAlumno.map(e => ({
      fecha: new Date(e.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      Fuerza: e.fuerza,
      Flexibilidad: e.flexibilidad,
      'Técnica': e.tecnica,
      Resistencia: e.resistencia,
      'Coordinación': e.coordinacion,
    }));
  }, [evaluacionesDelAlumno]);

  const handleGuardar = async () => {
    if (!selectedAlumno?.id) return;
    const alumnoId: string = selectedAlumno.id;
    setSaving(true);
    setError('');
    try {
      await addDoc(collection(db, COLLECTIONS.EVALUACIONES), {
        alumnoId: alumnoId,
        alumnoNombre: selectedAlumno.nombre,
        grupo: selectedAlumno.grupo,
        fecha: new Date().toISOString(),
        evaluador: userRole === 'Coordinator' ? 'Coordinador' : 'Entrenador',
        disciplina: form.disciplina,
        aparato: form.aparato,
        fuerza: Number(form.fuerza),
        flexibilidad: Number(form.flexibilidad),
        tecnica: Number(form.tecnica),
        resistencia: Number(form.resistencia),
        coordinacion: Number(form.coordinacion),
        habilidadesEvaluadas: selectedAlumno.habilidades?.map(h => ({ nombre: h.name, status: h.status, aparato: h.apparatus })) || [],
        observaciones: form.observaciones,
        createdAt: new Date().toISOString(),
      } satisfies Evaluacion);
      setForm({ ...emptyForm });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la evaluación');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta evaluación?')) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.EVALUACIONES, id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    }
  };

  const Slider = ({ label, field }: { label: string; field: 'fuerza' | 'flexibilidad' | 'tecnica' | 'resistencia' | 'coordinacion' }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] uppercase font-bold text-secondary tracking-widest">{label}</label>
        <span className="text-sm font-black text-ios-blue">{form[field]}</span>
      </div>
      <input
        type="range" min={0} max={10} step={1}
        value={form[field]}
        onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
        className="w-full accent-[#007AFF]"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-ios-gray px-6 py-8 space-y-6 page-transition pb-32 relative max-w-[640px] mx-auto">
      <BackButton onClick={() => selectedAlumno ? setSelectedAlumno(null) : handleNavigation('Dashboard')} />

      <header className="pt-16">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-accent-purple/10 rounded-2xl flex items-center justify-center text-accent-purple shadow-sm">
            <span className="material-icons-outlined text-3xl">assessment</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black tracking-tight">Evaluaciones</h2>
            <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mt-1">Control periódico de gimnastas</p>
          </div>
        </div>
      </header>

      {!selectedAlumno ? (
        <>
          {/* Búsqueda y filtro */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar gimnasta..."
                className="w-full bg-white border border-black/5 rounded-xl pl-10 pr-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-ios-blue/20"
              />
            </div>
            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="bg-white border border-black/5 rounded-xl px-3 py-3 text-xs font-bold text-black outline-none"
            >
              <option value="Todos">Todos</option>
              {grupos.map(g => <option key={g.id} value={g.nombre}>{g.nombre}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-widest">Cargando</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alumnosFiltrados.map(a => {
                const total = evaluaciones.filter(e => e.alumnoId === a.id).length;
                return (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAlumno(a); setShowForm(false); }}
                    className="w-full bg-white rounded-2xl p-4 border border-black/5 flex items-center gap-4 active:scale-[0.99] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-ios-blue/10 flex items-center justify-center text-ios-blue font-black shrink-0">
                      {a.nombre?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black truncate">{a.nombre}</p>
                      <p className="text-[10px] text-secondary uppercase font-bold tracking-wider truncate">{a.grupo || 'Sin grupo'} · {a.disciplina || '-'}</p>
                    </div>
                    <span className="text-[10px] font-black text-secondary shrink-0">{total} {total === 1 ? 'eval' : 'evals'}</span>
                  </button>
                );
              })}
              {alumnosFiltrados.length === 0 && (
                <p className="text-center text-secondary text-xs py-10">No se encontraron gimnastas.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Cabecera del alumno */}
          <div className="bg-white rounded-[2rem] p-5 border border-black/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center text-accent-purple font-black text-lg">
              {selectedAlumno.nombre?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black text-black truncate">{selectedAlumno.nombre}</p>
              <p className="text-[10px] text-secondary uppercase font-bold tracking-wider">{selectedAlumno.grupo || 'Sin grupo'}</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="!px-4 !py-3 !rounded-xl !text-[9px]">
              {showForm ? 'Cancelar' : 'Nueva evaluación'}
            </Button>
          </div>

          {/* Formulario nueva evaluación */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-[2rem] p-6 border border-black/5 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-secondary tracking-widest">Disciplina</label>
                      <select value={form.disciplina} onChange={(e) => setForm({ ...form, disciplina: e.target.value })}
                        className="w-full bg-ios-gray border-none rounded-xl px-3 py-3 text-sm font-medium outline-none">
                        {['GAF', 'GAM', 'Trampolín', 'Rítmica'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-secondary tracking-widest">Aparato</label>
                      <select value={form.aparato} onChange={(e) => setForm({ ...form, aparato: e.target.value })}
                        className="w-full bg-ios-gray border-none rounded-xl px-3 py-3 text-sm font-medium outline-none">
                        {['Suelo', 'Viga', 'Paralelas', 'Salto', 'Anillas', 'Arzones', 'Barra Fija'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {BIOMETRICOS.map(b => (
                      <Slider key={b.key} label={b.label} field={b.key} />
                    ))}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary tracking-widest">Observaciones</label>
                    <textarea
                      value={form.observaciones}
                      onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                      placeholder="Notas del entrenador..."
                      className="w-full bg-ios-gray border-none rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-ios-blue/10 resize-none h-20"
                    />
                  </div>

                  {error && <p className="text-ios-red text-xs font-bold">{error}</p>}

                  <Button onClick={handleGuardar} disabled={saving} className="w-full">
                    {saving ? 'Guardando...' : 'Guardar evaluación'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {evaluacionesDelAlumno.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-10 text-center border border-black/5">
              <span className="material-icons-outlined text-5xl text-secondary/40">fact_check</span>
              <p className="text-black font-bold mt-4">Sin evaluaciones todavía</p>
              <p className="text-secondary text-xs mt-1">Crea la primera evaluación para empezar a ver la evolución.</p>
            </div>
          ) : (
            <>
              {/* Radar de la última evaluación */}
              <div className="bg-white rounded-[2rem] p-6 border border-black/5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-black">Perfil actual</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="75%">
                      <PolarGrid stroke="#00000010" />
                      <PolarAngleAxis dataKey="metrica" tick={{ fontSize: 10, fill: '#8E8E93' }} />
                      <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 8, fill: '#8E8E93' }} />
                      <Radar dataKey="valor" stroke="#AF52DE" fill="#AF52DE" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Evolución */}
              <div className="bg-white rounded-[2rem] p-6 border border-black/5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-black">Evolución en el tiempo</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolucionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: '#8E8E93' }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: '#8E8E93' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {['Fuerza', 'Flexibilidad', 'Técnica', 'Resistencia', 'Coordinación'].map((k, i) => (
                        <Line
                          key={k}
                          type="monotone"
                          dataKey={k}
                          stroke={['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE'][i]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Historial */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-black px-1">Historial</h3>
                {[...evaluacionesDelAlumno].reverse().map((e, i) => (
                  <div key={e.id} className="bg-white rounded-2xl p-4 border border-black/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-black">
                        {new Date(e.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-secondary uppercase font-bold">{e.disciplina} · {e.aparato}</span>
                        <button onClick={() => handleEliminar(e.id!)} className="w-7 h-7 flex items-center justify-center text-ios-red/60 hover:text-ios-red rounded-lg">
                          <span className="material-icons-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {BIOMETRICOS.map(b => (
                        <div key={b.key} className="bg-ios-gray rounded-xl py-2">
                          <p className="text-base font-black text-black">{e[b.key]}</p>
                          <p className="text-[7px] uppercase font-bold text-secondary">{b.label.slice(0, 4)}</p>
                        </div>
                      ))}
                    </div>
                    {e.observaciones && <p className="text-[11px] text-secondary italic">"{e.observaciones}"</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Evaluaciones;
