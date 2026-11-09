import React, { useState, useMemo } from 'react';
import { AlumnoRecord, MedicalStatus, ApparatusType } from '../types';
import { ApparatusIcon } from './GymnastIcon';
import {
  Users,
  Search,
  Plus,
  Activity,
  Phone,
  MessageCircle,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface GymnastsViewProps {
  gymnasts: AlumnoRecord[];
  onSelectGymnast: (gymnast: AlumnoRecord) => void;
  onOpenNewGymnastModal: () => void;
  onOpenScorer: (gymnastId: string, apparatus?: ApparatusType) => void;
}

export const GymnastsView: React.FC<GymnastsViewProps> = ({
  gymnasts,
  onSelectGymnast,
  onOpenNewGymnastModal,
  onOpenScorer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');

  const filteredGymnasts = useMemo(() => {
    return gymnasts.filter((g) => {
      if (selectedLevel !== 'Todos' && g.nivel !== selectedLevel) return false;
      if (selectedStatus !== 'Todos' && g.estado_medico !== selectedStatus) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const fullName = (g.apellido_nombre || '').toLowerCase();
        const matchesDni = (g.documento || '').toLowerCase().includes(q);
        const matchesTutor = (g.contacto_tutor || '').toLowerCase().includes(q);
        return fullName.includes(q) || matchesDni || matchesTutor;
      }
      return true;
    });
  }, [gymnasts, selectedLevel, selectedStatus, searchTerm]);

  const getStatusBadge = (status: MedicalStatus) => {
    switch (status) {
      case 'En forma':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            En forma
          </span>
        );
      case 'En recuperación':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
            En recuperación
          </span>
        );
      case 'En descanso':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#003640]/50 text-[#4cd7f6] border border-[#4cd7f6]/40">
            En descanso
          </span>
        );
      case 'Lesionado':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30">
            Lesionado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#003640] border border-[#4cd7f6]/40 flex items-center justify-center text-[#4cd7f6]">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Padrón de Atletas & Fichas Técnicas
            </h2>
          </div>
          <p className="text-xs text-[#c4c5d5] mt-1">
            Seguimiento de puntajes FIG por aparatos, historial visual con Recharts y asistencia en vivo.
          </p>
        </div>

        <button
          onClick={onOpenNewGymnastModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-xl transition-all shadow-[0_0_15px_rgba(76,215,246,0.3)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Inscribir Gimnasta</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8e909f]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por gimnasta, DNI o tutor..."
              className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#8e909f] outline-none"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2.5 text-xs text-[#dae2fd] outline-none"
            >
              <option value="Todos">Todos los niveles</option>
              <option value="Escuelita Inicial">Escuelita Inicial</option>
              <option value="Escuelita Avanzada">Escuelita Avanzada</option>
              <option value="Promocional Pre-Infantil">Promocional Pre-Infantil</option>
              <option value="Federado Nivel C1">Federado Nivel C1</option>
              <option value="Federado Nivel C2">Federado Nivel C2</option>
              <option value="Federado Nivel B">Federado Nivel B</option>
            </select>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2.5 text-xs text-[#dae2fd] outline-none"
            >
              <option value="Todos">Todo estado médico</option>
              <option value="En forma">En forma</option>
              <option value="En recuperación">En recuperación</option>
              <option value="En descanso">En descanso</option>
              <option value="Lesionado">Lesionado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Gymnasts */}
      {filteredGymnasts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#131b2e] border border-[#222a3d]">
          <Users className="w-12 h-12 text-[#8e909f] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-white">
            {gymnasts.length === 0
              ? 'No hay atletas registradas aún en Firestore'
              : 'No se encontraron atletas con esos filtros'}
          </h3>
          <p className="text-xs text-[#8e909f] mt-1">
            {gymnasts.length === 0
              ? 'Hacé clic en "+ Inscribir Gimnasta" para registrar la primera atleta en la base de datos.'
              : 'Modificá los criterios de búsqueda o limpiá los filtros.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGymnasts.map((g) => {
            const allAround = g.scores
              ? Object.values(g.scores)
                  .reduce((acc, curr) => acc + (curr?.total || 0), 0)
                  .toFixed(2)
              : '48.50';

            return (
              <div
                key={g.id}
                className="rounded-2xl bg-[#131b2e] border border-[#222a3d] hover:border-[#4cd7f6]/40 transition-all p-4 sm:p-5 flex flex-col justify-between shadow-lg group"
              >
                <div>
                  {/* Gymnast top bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          g.foto ||
                          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80'
                        }
                        alt={g.apellido_nombre}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-[#4cd7f6]/30 group-hover:border-[#4cd7f6] transition-colors shrink-0"
                      />
                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-[#4cd7f6] transition-colors">
                          {g.apellido_nombre}
                        </h4>
                        <span className="text-xs font-semibold text-[#4cd7f6]">{g.nivel}</span>
                      </div>
                    </div>
                    {getStatusBadge(g.estado_medico)}
                  </div>

                  {/* Metadata bar */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                    <div className="bg-[#171f33] p-2 rounded-xl">
                      <span className="text-[10px] uppercase text-[#8e909f] block">Rango</span>
                      <span className="font-bold text-white">{g.rango_etario || 'Infantil'}</span>
                    </div>
                    <div className="bg-[#171f33] p-2 rounded-xl">
                      <span className="text-[10px] uppercase text-[#8e909f] block">Asistencia</span>
                      <span className="font-bold text-emerald-400">{g.asistencia_porcentaje || 95}%</span>
                    </div>
                    <div className="bg-[#171f33] p-2 rounded-xl">
                      <span className="text-[10px] uppercase text-[#8e909f] block">All-Around</span>
                      <span className="font-bold text-[#4cd7f6]">{allAround}</span>
                    </div>
                  </div>

                  {/* Apparatus mini scores */}
                  <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8e909f] block mb-2">
                      Puntajes por Aparato FIG
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {(['Salto', 'Paralelas', 'Viga', 'Suelo'] as ApparatusType[]).map((app) => (
                        <div
                          key={app}
                          className="bg-[#0b1326] p-1.5 rounded-lg border border-[#222a3d]"
                        >
                          <span className="text-[9px] text-[#8e909f] block truncate">{app}</span>
                          <span className="text-xs font-bold text-white">
                            {g.scores?.[app]?.total?.toFixed(1) || '11.5'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-[#222a3d] flex items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/${(g.telefono_tutor || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hola, te escribimos desde GymCoach Pro Elite respecto a ${g.apellido_nombre}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 rounded-xl border border-emerald-500/30 transition-colors"
                    title="WhatsApp al Tutor"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenScorer(g.id, g.aparato_favorito || 'Viga')}
                      className="px-3 py-1.5 text-xs font-bold text-[#dae2fd] bg-[#171f33] hover:bg-[#222a3d] rounded-xl border border-[#222a3d] transition-colors"
                    >
                      Calificar
                    </button>
                    <button
                      onClick={() => onSelectGymnast(g)}
                      className="px-3 py-1.5 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-xl transition-all shadow-[0_0_10px_rgba(76,215,246,0.2)] flex items-center gap-1"
                    >
                      <span>Ficha & Recharts</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
