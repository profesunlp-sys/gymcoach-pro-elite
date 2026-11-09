import React, { useState } from 'react';
import { AlumnoRecord, AsistenciaRecord } from '../types';
import { CalendarCheck, Users, CheckCircle2, Clock, XCircle, AlertCircle, Save } from 'lucide-react';

interface AttendanceViewProps {
  gymnasts: AlumnoRecord[];
  onSaveAsistencia: (asistencia: Omit<AsistenciaRecord, 'id'>) => Promise<void>;
  profesorEmail: string;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  gymnasts,
  onSaveAsistencia,
  profesorEmail,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('Federadas B (08:30 a 11:30)');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceState, setAttendanceState] = useState<
    Record<string, 'presente' | 'ausente' | 'tarde' | 'justificado'>
  >({});
  const [savedBanner, setSavedBanner] = useState(false);
  const [saving, setSaving] = useState(false);

  const groupsList = [
    { id: 'g-b', name: 'Federadas B (08:30 a 11:30)', filter: (g: AlumnoRecord) => g.nivel === 'Federado Nivel B' },
    { id: 'g-c', name: 'Competitivas C1/C2 (16:30 a 19:30)', filter: (g: AlumnoRecord) => g.nivel.includes('C1') || g.nivel.includes('C2') },
    { id: 'g-prom', name: 'Promocional Semillero (15:00 a 16:30)', filter: (g: AlumnoRecord) => g.nivel.includes('Promocional') },
    { id: 'g-esc', name: 'Escuelita Inicial & Avanzada (17:30 a 18:45)', filter: (g: AlumnoRecord) => g.nivel.includes('Escuelita') },
  ];

  const currentGroupObj = groupsList.find((g) => g.name === selectedGroup) || groupsList[0];
  const groupGymnasts = gymnasts.filter(currentGroupObj.filter);

  const getGymnastStatus = (id: string) => attendanceState[id] || 'presente';

  const setStatus = (id: string, status: 'presente' | 'ausente' | 'tarde' | 'justificado') => {
    setAttendanceState((prev) => ({ ...prev, [id]: status }));
  };

  const handleMarkAllPresent = () => {
    const next: Record<string, 'presente' | 'ausente' | 'tarde' | 'justificado'> = {};
    groupGymnasts.forEach((g) => {
      next[g.id] = 'presente';
    });
    setAttendanceState((prev) => ({ ...prev, ...next }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      const recordsToSave: Record<string, 'presente' | 'ausente' | 'tarde' | 'justificado'> = {};
      groupGymnasts.forEach((g) => {
        recordsToSave[g.id] = getGymnastStatus(g.id);
      });

      const presentes = groupGymnasts.filter((g) => getGymnastStatus(g.id) === 'presente').length;
      const ausentes = groupGymnasts.filter((g) => getGymnastStatus(g.id) === 'ausente').length;
      const tardes = groupGymnasts.filter((g) => getGymnastStatus(g.id) === 'tarde').length;
      const justificados = groupGymnasts.filter((g) => getGymnastStatus(g.id) === 'justificado').length;

      await onSaveAsistencia({
        fecha: selectedDate,
        grupo: selectedGroup,
        horario: selectedGroup.split('(')[1]?.replace(')', '') || '',
        profesorEmail,
        registros: recordsToSave,
        presentes,
        ausentes,
        tardes,
        justificados,
      });

      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = groupGymnasts.filter((g) => getGymnastStatus(g.id) === 'presente').length;
  const absentCount = groupGymnasts.filter((g) => getGymnastStatus(g.id) === 'ausente').length;
  const lateCount = groupGymnasts.filter((g) => getGymnastStatus(g.id) === 'tarde').length;
  const attendancePct = groupGymnasts.length > 0 ? Math.round((presentCount / groupGymnasts.length) * 100) : 100;

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#003640] border border-[#4cd7f6]/40 flex items-center justify-center text-[#4cd7f6]">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Pase de Lista en Piso de Gimnasio
            </h2>
          </div>
          <p className="text-xs text-[#c4c5d5] mt-1">
            Registro diario directo en Firestore (colección <span className="font-mono text-[#4cd7f6]">asistencias</span>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 text-xs font-bold text-[#dae2fd] bg-[#171f33] hover:bg-[#222a3d] border border-[#222a3d] rounded-xl transition-colors active:scale-95"
          >
            Todos Presentes
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-xl transition-all shadow-[0_0_15px_rgba(76,215,246,0.3)] active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Planilla'}</span>
          </button>
        </div>
      </div>

      {savedBanner && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>¡Asistencia registrada con éxito en la colección asistencias!</span>
        </div>
      )}

      {/* Selectors and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#131b2e] border border-[#222a3d]">
          <label className="text-xs font-bold uppercase text-[#8e909f] block mb-1.5">
            Grupo / Turno
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
          >
            {groupsList.map((grp) => (
              <option key={grp.id} value={grp.name}>
                {grp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 rounded-xl bg-[#131b2e] border border-[#222a3d]">
          <label className="text-xs font-bold uppercase text-[#8e909f] block mb-1.5">
            Fecha de Clase
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
        </div>

        <div className="p-4 rounded-xl bg-[#131b2e] border border-[#222a3d] flex items-center justify-around text-center">
          <div>
            <span className="text-[10px] text-[#8e909f] block uppercase">Presentes</span>
            <span className="text-lg font-black text-emerald-400">{presentCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8e909f] block uppercase">Ausentes</span>
            <span className="text-lg font-black text-rose-400">{absentCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8e909f] block uppercase">Tarde</span>
            <span className="text-lg font-black text-amber-300">{lateCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8e909f] block uppercase">Asistencia</span>
            <span className="text-lg font-black text-[#4cd7f6]">{attendancePct}%</span>
          </div>
        </div>
      </div>

      {/* Roster List */}
      <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
          Nómina de Gimnastas ({groupGymnasts.length} atletas en {selectedGroup})
        </h3>

        <div className="space-y-2">
          {groupGymnasts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8e909f]">
              No hay gimnastas asignadas a este grupo o turno todavía. Inscribí atletas en este nivel para realizar el pase de lista.
            </div>
          ) : (
            groupGymnasts.map((g) => {
              const status = getGymnastStatus(g.id);
              return (
                <div
                  key={g.id}
                  className="p-3 sm:p-4 rounded-xl bg-[#0b1326] border border-[#222a3d] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        g.foto ||
                        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80'
                      }
                      alt={g.apellido_nombre}
                      className="w-10 h-10 rounded-xl object-cover border border-[#4cd7f6]/30 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{g.apellido_nombre}</h4>
                      <p className="text-[11px] text-[#8e909f]">
                        DNI: {g.documento} · {g.nivel}
                      </p>
                    </div>
                  </div>

                  {/* Status selector buttons */}
                  <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center">
                    <button
                      onClick={() => setStatus(g.id, 'presente')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        status === 'presente'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 shadow-sm'
                          : 'bg-[#171f33] text-[#8e909f] hover:text-white'
                      }`}
                    >
                      Presente
                    </button>
                    <button
                      onClick={() => setStatus(g.id, 'ausente')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        status === 'ausente'
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-500/50 shadow-sm'
                          : 'bg-[#171f33] text-[#8e909f] hover:text-white'
                      }`}
                    >
                      Ausente
                    </button>
                    <button
                      onClick={() => setStatus(g.id, 'tarde')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        status === 'tarde'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'bg-[#171f33] text-[#8e909f] hover:text-white'
                      }`}
                    >
                      Tarde
                    </button>
                    <button
                      onClick={() => setStatus(g.id, 'justificado')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        status === 'justificado'
                          ? 'bg-[#003640] text-[#4cd7f6] border border-[#4cd7f6]/50 shadow-sm'
                          : 'bg-[#171f33] text-[#8e909f] hover:text-white'
                      }`}
                    >
                      Justif.
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
