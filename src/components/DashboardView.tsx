import React from 'react';
import { AlumnoRecord, PagoGimnasiaRecord, AlertaPagoRecord, AppUser, ApparatusType } from '../types';
import { ApparatusIcon } from './GymnastIcon';
import { RecentPaymentAlertsPanel } from './RecentPaymentAlertsPanel';
import {
  Users,
  CreditCard,
  Calendar,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Plus,
  Clock,
  ChevronRight,
  Activity,
  DollarSign,
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: AppUser;
  gymnasts: AlumnoRecord[];
  payments: PagoGimnasiaRecord[];
  paymentAlerts?: AlertaPagoRecord[];
  onNavigate: (tab: string) => void;
  onOpenPaymentModal: () => void;
  onOpenGymnastModal: () => void;
  onOpenScorer: (gymnastId?: string, apparatus?: ApparatusType) => void;
  onSelectGymnast: (gymnast: AlumnoRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  gymnasts,
  payments,
  paymentAlerts = [],
  onNavigate,
  onOpenPaymentModal,
  onOpenGymnastModal,
  onOpenScorer,
  onSelectGymnast,
}) => {
  const isCoordinador = currentUser.role === 'coordinador';

  const handleSelectByDni = (dni: string) => {
    const cleanDni = dni.replace(/\D/g, '');
    const found = gymnasts.find(
      (g) => g.documento.replace(/\D/g, '') === cleanDni || g.documento.trim() === dni.trim()
    );
    if (found) {
      onSelectGymnast(found);
    }
  };

  // Financial stats
  const currentMonthPayments = payments.filter((p) => p.mes === 'Noviembre' || p.mes_numero === 11);
  const collectedAmount = currentMonthPayments
    .filter((p) => p.fecha_pago || p.estado === 'pagado')
    .reduce((sum, p) => sum + (Number(p.importe) || 0), 0);

  const pendingAmount = currentMonthPayments
    .filter((p) => !p.fecha_pago && p.estado !== 'pagado')
    .reduce((sum, p) => sum + (Number(p.importe) || 0), 0);

  const totalExpected = collectedAmount + pendingAmount;
  const collectionRate = totalExpected > 0 ? Math.round((collectedAmount / totalExpected) * 100) : 0;
  const unpaidCount = currentMonthPayments.filter((p) => !p.fecha_pago && p.estado !== 'pagado').length;

  const apparatusStats: { type: ApparatusType; label: string; avg: number; count: number }[] = [
    { type: 'Salto', label: 'Mesa de Salto', avg: 12.18, count: gymnasts.length },
    { type: 'Paralelas', label: 'Barras Asimétricas', avg: 12.12, count: gymnasts.length },
    { type: 'Viga', label: 'Viga de Equilibrio', avg: 12.31, count: gymnasts.length },
    { type: 'Suelo', label: 'Suelo / Pedana', avg: 12.44, count: gymnasts.length },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#131b2e] via-[#171f33] to-[#1e40af]/30 border border-[#222a3d] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4cd7f6]/10 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Gimnasio Activo · UNLP
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ¡Hola, {currentUser.displayName}!
          </h2>
          <p className="text-xs text-[#c4c5d5] mt-0.5">
            {isCoordinador
              ? 'Panel de Coordinación General: Recaudación, Matriz de Cuotas y Rendimiento Deportivo.'
              : 'Panel de Entrenador: Seguimiento de Atletas y Calificación FIG.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isCoordinador && (
            <button
              onClick={onOpenPaymentModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] transition-all shadow-[0_0_15px_rgba(76,215,246,0.3)] active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              <span>+ Registrar Cobro</span>
            </button>
          )}

          <button
            onClick={() => onOpenScorer()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#1e40af] hover:bg-[#2563eb] border border-white/10 transition-all shadow-md active:scale-95"
          >
            <Activity className="w-4 h-4 text-[#4cd7f6]" />
            <span>Evaluar Rutina FIG</span>
          </button>

          <button
            onClick={onOpenGymnastModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#dae2fd] bg-[#222a3d] hover:bg-[#2d3449] border border-white/5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Gimnasta</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className={`grid ${isCoordinador ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'} gap-3 sm:gap-4`}>
        {/* KPI 1: Gimnastas */}
        <div
          onClick={() => onNavigate('gimnastas')}
          className="p-4 sm:p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] hover:border-[#4cd7f6]/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e909f]">
              Atletas Activas
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#171f33] text-[#4cd7f6] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{gymnasts.length}</span>
            <span className="text-xs font-bold text-emerald-400">En padrón</span>
          </div>
          <p className="text-[11px] text-[#8e909f] mt-1">Colección alumnos en Firestore</p>
        </div>

        {/* KPI 2: Recaudación (Only for Coordinator) */}
        {isCoordinador && (
          <div
            onClick={() => onNavigate('pagos')}
            className="p-4 sm:p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] hover:border-[#4cd7f6]/40 transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e909f]">
                Cobranza Noviembre
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#171f33] text-[#4cd7f6] flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">
                ${collectedAmount.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="w-full bg-[#0b1326] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#4cd7f6] h-full rounded-full transition-all"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* KPI 3: Asistencia */}
        <div
          onClick={() => onNavigate('asistencia')}
          className="p-4 sm:p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] hover:border-[#4cd7f6]/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e909f]">
              Asistencia Gimnasio
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#171f33] text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">95.4%</span>
            <span className="text-xs text-emerald-400 font-semibold">Óptima</span>
          </div>
          <p className="text-[11px] text-[#8e909f] mt-1">Pase de lista al día</p>
        </div>

        {/* KPI 4: Torneo FIG */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] hover:border-[#4cd7f6]/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e909f]">
              Próximo Torneo FIG
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#171f33] text-amber-300 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-300">14</span>
            <span className="text-xs text-[#c4c5d5]">días</span>
          </div>
          <p className="text-[11px] text-[#8e909f] mt-1 truncate">Provincial Bonaerense FBA</p>
        </div>
      </div>

      {/* Aparatos & Gymnasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#4cd7f6]" />
                Rendimiento por Aparatos FIG
              </h3>
              <p className="text-xs text-[#8e909f]">
                Evaluación técnica de rutinas: Salto, Barras, Viga y Suelo
              </p>
            </div>
            <button
              onClick={() => onOpenScorer()}
              className="text-xs font-bold text-[#4cd7f6] hover:underline flex items-center gap-1"
            >
              <span>Calificar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {apparatusStats.map((app) => (
              <div
                key={app.type}
                onClick={() => onOpenScorer(undefined, app.type)}
                className="p-4 rounded-xl bg-[#131b2e] border border-[#222a3d] hover:border-[#4cd7f6]/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#171f33] border border-[#222a3d] group-hover:border-[#4cd7f6]/40 flex items-center justify-center text-[#4cd7f6] transition-colors">
                      <ApparatusIcon apparatus={app.type} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#4cd7f6] transition-colors">
                        {app.label}
                      </h4>
                      <span className="text-[10px] text-[#8e909f]">
                        {app.count} gimnastas registradas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#4cd7f6]">{app.avg}</span>
                    <span className="text-[10px] text-[#8e909f] block">Promedio pts</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#222a3d] flex items-center justify-between text-xs text-[#c4c5d5]">
                  <span className="text-[11px] text-[#8e909f]">Dificultad + Ejecución</span>
                  <span className="text-[11px] font-bold text-[#4cd7f6]">
                    Evaluar rutina →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Atletas destacadas */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#dae2fd]">
                Atletas en Ficha Técnica
              </h4>
              <button
                onClick={() => onNavigate('gimnastas')}
                className="text-xs text-[#4cd7f6] hover:underline"
              >
                Ver todas ({gymnasts.length})
              </button>
            </div>

            <div className="divide-y divide-[#222a3d]">
              {gymnasts.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8e909f]">
                  No hay atletas registradas en Firestore todavía. Podés dar de alta nuevas gimnastas desde el botón "+ Nueva Gimnasta".
                </div>
              ) : (
                gymnasts.slice(0, 4).map((g) => (
                  <div
                    key={g.id}
                    onClick={() => onSelectGymnast(g)}
                    className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#171f33]/40 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          g.foto ||
                          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300'
                        }
                        alt={g.apellido_nombre}
                        className="w-9 h-9 rounded-xl object-cover border border-[#4cd7f6]/30"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{g.apellido_nombre}</p>
                        <span className="text-[11px] text-[#4cd7f6]">{g.nivel}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        g.estado_medico === 'En forma'
                          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                          : 'text-amber-300 bg-amber-950/40 border-amber-500/30'
                      }`}
                    >
                      {g.estado_medico}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pagos Recientes (Staff & Coord), Control de Cobranzas (Coord), Turnos */}
        <div className="space-y-4">
          {/* Panel Pagos Recientes (Visible para todos los roles: coordinador y profesor) */}
          <RecentPaymentAlertsPanel
            alerts={paymentAlerts}
            alumnos={gymnasts}
            onSelectGymnastByDni={handleSelectByDni}
          />

          {isCoordinador && (
            <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#4cd7f6]" />
                  Control de Cobranzas
                </h4>
                <span className="text-[11px] font-mono text-[#4cd7f6]">Nov 2026</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8e909f]">Cobrado:</span>
                  <span className="font-bold text-emerald-400">${collectedAmount.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8e909f]">Pendiente:</span>
                  <span className="font-bold text-amber-300">${pendingAmount.toLocaleString('es-AR')}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('pagos')}
                className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] transition-colors text-center block"
              >
                Abrir Módulo de Pagos (6 pestañas)
              </button>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4cd7f6]" />
              Grupos & Turnos UNLP
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0b1326] border border-[#222a3d]">
                <p className="font-bold text-white">Federadas B (08:30 a 11:30)</p>
                <p className="text-[10px] text-[#8e909f]">Lun, Mié y Vie · Prof. Valeria Rossi</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1326] border border-[#222a3d]">
                <p className="font-bold text-white">Competitivas C1/C2 (16:30 a 19:30)</p>
                <p className="text-[10px] text-[#8e909f]">Mar y Jue · Prof. Lucas Peralta</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1326] border border-[#222a3d]">
                <p className="font-bold text-white">Escuelita Inicial (17:30 a 18:45)</p>
                <p className="text-[10px] text-[#8e909f]">Mar y Jue · Prof. Camila Solís</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
