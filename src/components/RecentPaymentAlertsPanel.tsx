import React from 'react';
import { AlertaPagoRecord, AlumnoRecord } from '../types';
import { Bell, CheckCircle2, User, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

interface RecentPaymentAlertsPanelProps {
  alerts: AlertaPagoRecord[];
  alumnos?: AlumnoRecord[];
  maxItems?: number;
  onSelectGymnastByDni?: (dni: string) => void;
}

export const RecentPaymentAlertsPanel: React.FC<RecentPaymentAlertsPanelProps> = ({
  alerts,
  alumnos = [],
  maxItems = 10,
  onSelectGymnastByDni,
}) => {
  // Sort newest first
  const sortedAlerts = [...alerts].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  const displayedAlerts = maxItems ? sortedAlerts.slice(0, maxItems) : sortedAlerts;

  // Map students by DNI for quick linkage
  const studentsByDni = React.useMemo(() => {
    const map = new Map<string, AlumnoRecord>();
    alumnos.forEach((a) => {
      if (a.documento) {
        const clean = a.documento.replace(/\D/g, '');
        map.set(clean, a);
        map.set(a.documento.trim(), a);
      }
    });
    return map;
  }, [alumnos]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-3 font-['Plus_Jakarta_Sans',sans-serif] shadow-lg">
      <div className="flex items-center justify-between pb-2 border-b border-[#222a3d]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#003640] border border-[#4cd7f6]/40 flex items-center justify-center text-[#4cd7f6]">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>Pagos Recientes</span>
              <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse" />
            </h3>
            <p className="text-[10px] text-[#8e909f]">
              Notificaciones de cobranza vinculadas por DNI · Staff UNLP
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#4cd7f6] bg-[#0b1326] px-2.5 py-1 rounded-full border border-[#222a3d]">
          {alerts.length} {alerts.length === 1 ? 'aviso' : 'avisos'}
        </span>
      </div>

      {displayedAlerts.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#8e909f] space-y-1">
          <CheckCircle2 className="w-6 h-6 text-[#8e909f] mx-auto opacity-40 mb-1" />
          <p className="font-semibold text-[#c4c5d5]">Sin pagos nuevos notificados</p>
          <p className="text-[11px]">Las alertas se generan automáticamente al ingresar cobros o importar planillas.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#222a3d]/70 max-h-72 overflow-y-auto pr-1">
          {displayedAlerts.map((alert) => {
            const cleanDni = (alert.documento || '').replace(/\D/g, '');
            const matchedStudent = studentsByDni.get(cleanDni) || studentsByDni.get(alert.documento?.trim());

            return (
              <div
                key={alert.id}
                className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-[#171f33]/50 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#0b1326] border border-[#222a3d] group-hover:border-[#4cd7f6]/40 flex items-center justify-center text-[#4cd7f6] shrink-0 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    {/* Format: Nombre Apellido - Mes - DNI */}
                    <p className="text-xs font-bold text-white truncate">
                      {alert.apellido_nombre}{' '}
                      <span className="text-[#8e909f] font-normal">—</span>{' '}
                      <span className="text-[#4cd7f6] font-semibold">{alert.mes}</span>{' '}
                      <span className="text-[#8e909f] font-normal">—</span>{' '}
                      <span className="text-amber-300 font-mono text-[11px]">DNI: {alert.documento}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#8e909f]">
                      {matchedStudent ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Atleta vinculada ({matchedStudent.nivel})</span>
                        </span>
                      ) : (
                        <span className="text-[#8e909f]">Control DNI 2027</span>
                      )}
                      {alert.createdAt && (
                        <span>· {new Date(alert.createdAt).toLocaleDateString('es-AR')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {onSelectGymnastByDni && matchedStudent && (
                  <button
                    onClick={() => onSelectGymnastByDni(alert.documento)}
                    className="shrink-0 text-[10px] font-bold text-[#4cd7f6] hover:text-white bg-[#0b1326] hover:bg-[#1e40af] border border-[#222a3d] px-2 py-1 rounded-lg transition-colors"
                  >
                    Ver Ficha
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
