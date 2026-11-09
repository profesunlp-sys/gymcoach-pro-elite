import React, { useState } from 'react';
import { AlumnoRecord, MedicalStatus, ApparatusType } from '../types';
import { X, Award, Phone, Mail, Calendar, Activity, ShieldAlert, CheckCircle2, MessageCircle, TrendingUp, BarChart2 } from 'lucide-react';
import { ApparatusIcon } from './GymnastIcon';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface GymnastDetailModalProps {
  gymnast: AlumnoRecord | null;
  onClose: () => void;
  onUpdateStatus: (gymnastId: string, status: MedicalStatus) => void;
  onOpenScorer: (gymnastId: string, apparatus: ApparatusType) => void;
}

export const GymnastDetailModal: React.FC<GymnastDetailModalProps> = ({
  gymnast,
  onClose,
  onUpdateStatus,
  onOpenScorer,
}) => {
  const [selectedChartApparatus, setSelectedChartApparatus] = useState<'Todos' | ApparatusType>('Todos');

  if (!gymnast) return null;

  const apparatusList: ApparatusType[] = ['Salto', 'Paralelas', 'Viga', 'Suelo'];

  const getStatusColor = (status: MedicalStatus) => {
    switch (status) {
      case 'En forma':
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40';
      case 'En recuperación':
        return 'text-amber-300 bg-amber-950/50 border-amber-500/40';
      case 'En descanso':
        return 'text-[#4cd7f6] bg-[#003640]/50 border-[#4cd7f6]/40';
      case 'Lesionado':
      default:
        return 'text-rose-400 bg-rose-950/50 border-rose-500/40';
    }
  };

  const calculateAllAround = () => {
    if (!gymnast.scores) return '0.00';
    const total = Object.values(gymnast.scores).reduce((acc, curr) => acc + (curr?.total || 0), 0);
    return total.toFixed(2);
  };

  // Prepare chart data from score_history or fallback mock progression if history is starting
  const chartData = (gymnast.score_history && gymnast.score_history.length > 0)
    ? gymnast.score_history
    : [
        { mes: 'Marzo', date: '2026-03-20', Salto: 11.2, Paralelas: 10.8, Viga: 11.4, Suelo: 11.8, total: 45.2 },
        { mes: 'Mayo', date: '2026-05-18', Salto: 11.6, Paralelas: 11.2, Viga: 11.9, Suelo: 12.1, total: 46.8 },
        { mes: 'Julio', date: '2026-07-22', Salto: 11.9, Paralelas: 11.8, Viga: 12.4, Suelo: 12.6, total: 48.7 },
        { mes: 'Septiembre', date: '2026-09-15', Salto: 12.1, Paralelas: 12.3, Viga: 12.8, Suelo: 12.9, total: 50.1 },
        {
          mes: 'Noviembre',
          date: '2026-11-04',
          Salto: gymnast.scores?.Salto?.total || 12.3,
          Paralelas: gymnast.scores?.Paralelas?.total || 12.5,
          Viga: gymnast.scores?.Viga?.total || 13.1,
          Suelo: gymnast.scores?.Suelo?.total || 13.0,
          total: Number(calculateAllAround()),
        },
      ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b1326] border border-[#222a3d] rounded-xl p-3 shadow-2xl text-xs space-y-1">
          <p className="font-bold text-white mb-1 border-b border-[#222a3d] pb-1">{label}</p>
          {payload.map((item: any) => (
            <div key={item.name} className="flex items-center justify-between gap-3 text-[11px]">
              <span style={{ color: item.color }} className="font-semibold">
                {item.name}:
              </span>
              <span className="font-mono font-bold text-white">{Number(item.value).toFixed(2)} pts</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0b1326] border border-[#222a3d] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#131b2e] border-b border-[#222a3d]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#4cd7f6]" />
            <h3 className="text-base font-bold text-white">Ficha Deportiva & Evolución FIG</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#c4c5d5] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Gymnast Info Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d]">
            <img
              src={
                gymnast.foto ||
                'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80'
              }
              alt={gymnast.apellido_nombre}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#4cd7f6]/40 shadow-lg shrink-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                <h4 className="text-xl font-black text-white">{gymnast.apellido_nombre}</h4>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(
                      gymnast.estado_medico
                    )}`}
                  >
                    {gymnast.estado_medico}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#4cd7f6] mt-0.5">
                {gymnast.nivel} · {gymnast.rango_etario}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs text-[#c4c5d5]">
                <div className="bg-[#171f33] p-2 rounded-xl">
                  <span className="text-[#8e909f] block text-[10px] uppercase">DNI</span>
                  <span className="font-bold text-white truncate block">{gymnast.documento}</span>
                </div>
                <div className="bg-[#171f33] p-2 rounded-xl">
                  <span className="text-[#8e909f] block text-[10px] uppercase">Horario</span>
                  <span className="font-bold text-white truncate block">{gymnast.horario_completo || '17:00 a 18:30'}</span>
                </div>
                <div className="bg-[#171f33] p-2 rounded-xl">
                  <span className="text-[#8e909f] block text-[10px] uppercase">Asistencia</span>
                  <span className="font-bold text-emerald-400">{gymnast.asistencia_porcentaje || 95}%</span>
                </div>
                <div className="bg-[#171f33] p-2 rounded-xl">
                  <span className="text-[#8e909f] block text-[10px] uppercase">All-Around (AA)</span>
                  <span className="font-bold text-[#4cd7f6]">{calculateAllAround()} pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* RECHARTS: Visual History of Apparatus Scores Over Time */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4cd7f6]" />
                <h5 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                  Evolución Histórica de Puntajes (Recharts)
                </h5>
              </div>

              {/* Apparatus filter for chart */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['Todos', 'Salto', 'Paralelas', 'Viga', 'Suelo'] as const).map((app) => (
                  <button
                    key={app}
                    onClick={() => setSelectedChartApparatus(app)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      selectedChartApparatus === app
                        ? 'bg-[#4cd7f6] text-[#001f26] shadow-sm'
                        : 'bg-[#171f33] text-[#c4c5d5] hover:text-white'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Container */}
            <div className="w-full h-64 sm:h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222a3d" vertical={false} />
                  <XAxis dataKey="mes" stroke="#8e909f" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8e909f" fontSize={11} domain={[8, 15]} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                  />

                  {(selectedChartApparatus === 'Todos' || selectedChartApparatus === 'Salto') && (
                    <Line
                      type="monotone"
                      dataKey="Salto"
                      name="Salto"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#f59e0b' }}
                      activeDot={{ r: 6 }}
                    />
                  )}

                  {(selectedChartApparatus === 'Todos' || selectedChartApparatus === 'Paralelas') && (
                    <Line
                      type="monotone"
                      dataKey="Paralelas"
                      name="Paralelas"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#8b5cf6' }}
                      activeDot={{ r: 6 }}
                    />
                  )}

                  {(selectedChartApparatus === 'Todos' || selectedChartApparatus === 'Viga') && (
                    <Line
                      type="monotone"
                      dataKey="Viga"
                      name="Viga"
                      stroke="#4cd7f6"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#4cd7f6' }}
                      activeDot={{ r: 6 }}
                    />
                  )}

                  {(selectedChartApparatus === 'Todos' || selectedChartApparatus === 'Suelo') && (
                    <Line
                      type="monotone"
                      dataKey="Suelo"
                      name="Suelo"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-[#8e909f] text-center">
              Puntajes oficiales FIG computados por el cuerpo técnico durante entrenamientos y torneos evaluatorios.
            </p>
          </div>

          {/* Quick Status Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8e909f] mb-2">
              Modificar Condición Física / Médica
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['En forma', 'En recuperación', 'En descanso', 'Lesionado'] as MedicalStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(gymnast.id, st)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                    gymnast.estado_medico === st
                      ? 'border-[#4cd7f6] bg-[#003640]/60 text-[#4cd7f6] shadow-sm'
                      : 'border-[#222a3d] bg-[#131b2e] text-[#c4c5d5] hover:bg-[#171f33]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Apparatus FIG Scores */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#4cd7f6]" />
                Puntajes Actuales por Aparato FIG
              </h5>
              <span className="text-[11px] text-[#8e909f]">Reglamento FIG 2025/2028</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {apparatusList.map((app) => {
                const score = gymnast.scores?.[app] || {
                  apparatus: app,
                  dScore: 2.5,
                  eScore: 8.5,
                  penalties: 0,
                  total: 11.0,
                  updatedAt: '2026-11-04',
                };
                return (
                  <div
                    key={app}
                    className="p-3.5 rounded-xl bg-[#131b2e] border border-[#222a3d] hover:border-[#4cd7f6]/40 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#171f33] border border-[#222a3d] flex items-center justify-center text-[#4cd7f6]">
                          <ApparatusIcon apparatus={app} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{app}</p>
                          <span className="text-[10px] text-[#8e909f]">
                            Actualizado: {score.updatedAt}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#4cd7f6] tracking-tight">
                          {score.total.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#8e909f] block">Total pts</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-[#222a3d]/70 text-[11px] text-center">
                      <div className="bg-[#171f33] p-1.5 rounded">
                        <span className="text-[#8e909f] block text-[9px]">Dificultad (D)</span>
                        <span className="font-bold text-white">{score.dScore.toFixed(1)}</span>
                      </div>
                      <div className="bg-[#171f33] p-1.5 rounded">
                        <span className="text-[#8e909f] block text-[9px]">Ejecución (E)</span>
                        <span className="font-bold text-white">{score.eScore.toFixed(2)}</span>
                      </div>
                      <div className="bg-[#171f33] p-1.5 rounded">
                        <span className="text-[#8e909f] block text-[9px]">Deducción</span>
                        <span className="font-bold text-rose-400">-{score.penalties.toFixed(1)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenScorer(gymnast.id, app);
                      }}
                      className="mt-3 w-full py-1.5 text-center text-xs font-bold text-[#4cd7f6] bg-[#003640]/30 hover:bg-[#003640]/60 rounded-lg border border-[#4cd7f6]/30 transition-colors"
                    >
                      Calificar {app}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Tutor */}
          <div className="p-4 rounded-xl bg-[#131b2e] border border-[#222a3d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8e909f] block">
                Tutor Responsable
              </span>
              <p className="text-sm font-bold text-white mt-0.5">
                {gymnast.contacto_tutor || 'Familiar a cargo'}
              </p>
              <p className="text-xs text-[#c4c5d5] flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#4cd7f6]" /> {gymnast.telefono_tutor || '+54 221 000-0000'}
              </p>
            </div>
            <a
              href={`https://wa.me/${(gymnast.telefono_tutor || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hola, nos comunicamos desde GymCoach Pro Elite respecto a la gimnasta ${gymnast.apellido_nombre}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-xl transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp al Tutor</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#131b2e] border-t border-[#222a3d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-xl transition-all"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
