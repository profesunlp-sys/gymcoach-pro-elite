import React, { useState } from 'react';
import { AlumnoRecord, PagoGimnasiaRecord } from '../types';
import { X, DollarSign, Calendar, CreditCard, UserCheck, CheckCircle } from 'lucide-react';

interface NewPaymentModalProps {
  gymnasts: AlumnoRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSavePayment: (payment: Omit<PagoGimnasiaRecord, 'id'>) => void;
  initialDocumento?: string;
}

const MONTH_OPTIONS = [
  { mes: 'Noviembre', mes_numero: 11 },
  { mes: 'Octubre', mes_numero: 10 },
  { mes: 'Septiembre', mes_numero: 9 },
  { mes: 'Agosto', mes_numero: 8 },
  { mes: 'Julio', mes_numero: 7 },
  { mes: 'Junio', mes_numero: 6 },
  { mes: 'Mayo', mes_numero: 5 },
  { mes: 'Abril', mes_numero: 4 },
  { mes: 'Marzo', mes_numero: 3 },
];

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  gymnasts,
  isOpen,
  onClose,
  onSavePayment,
  initialDocumento,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<string>(
    initialDocumento || (gymnasts[0]?.documento || '')
  );
  const [mesNumero, setMesNumero] = useState<number>(11);
  const [importe, setImporte] = useState<number>(32000);
  const [matricula, setMatricula] = useState<number>(0);
  const [estado, setEstado] = useState<'pagado' | 'pendiente' | 'vencido' | 'beca'>('pagado');
  const [fechaPago, setFechaPago] = useState<string>(new Date().toISOString().split('T')[0]);
  const [medioPago, setMedioPago] = useState<string>('Mercado Pago');

  if (!isOpen) return null;

  const currentGymnast = gymnasts.find((g) => g.documento === selectedDoc) || gymnasts[0];
  const selectedMonthObj = MONTH_OPTIONS.find((m) => m.mes_numero === Number(mesNumero)) || MONTH_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGymnast) return;

    onSavePayment({
      documento: currentGymnast.documento,
      apellido_nombre: currentGymnast.apellido_nombre,
      importe: Number(importe),
      mes: selectedMonthObj.mes,
      mes_numero: Number(mesNumero),
      fecha_pago: estado === 'pagado' || estado === 'beca' ? fechaPago : '',
      matricula: Number(matricula),
      codigo: currentGymnast.nivel.slice(0, 5).toUpperCase(),
      rango_etario: currentGymnast.rango_etario || '9 a 12 años',
      horario_completo: currentGymnast.horario_completo || '17:00 a 18:30',
      dias_semana: currentGymnast.dias_semana || 'Lunes y Miércoles',
      estado,
      medio_pago: estado === 'pagado' ? medioPago : undefined,
      nro_recibo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-lg bg-[#0b1326] border border-[#222a3d] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#131b2e] border-b border-[#222a3d]">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#4cd7f6]" />
            <h3 className="text-base font-bold text-white">Registrar Pago de Cuota</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#c4c5d5] hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Gymnast */}
          <div>
            <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1.5">
              Gimnasta
            </label>
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3.5 py-2.5 text-xs text-[#dae2fd] outline-none"
            >
              {gymnasts.map((g) => (
                <option key={g.documento} value={g.documento}>
                  {g.apellido_nombre} (DNI: {g.documento} - {g.nivel})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Mes */}
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1.5">
                Mes a Imputar
              </label>
              <select
                value={mesNumero}
                onChange={(e) => setMesNumero(Number(e.target.value))}
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2.5 text-xs text-[#dae2fd] outline-none"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.mes_numero} value={m.mes_numero}>
                    {m.mes} (Mes #{m.mes_numero})
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1.5">
                Estado del Cobro
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2.5 text-xs text-[#dae2fd] outline-none"
              >
                <option value="pagado">Pagado (Al día)</option>
                <option value="pendiente">Pendiente</option>
                <option value="vencido">Vencido</option>
                <option value="beca">Beca Deportiva</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Importe cuota */}
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1.5">
                Importe Cuota ($ ARS)
              </label>
              <input
                type="number"
                step="500"
                value={importe}
                onChange={(e) => setImporte(Number(e.target.value))}
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none"
              />
            </div>

            {/* Matrícula */}
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1.5">
                Matrícula Anual ($)
              </label>
              <input
                type="number"
                step="500"
                value={matricula}
                onChange={(e) => setMatricula(Number(e.target.value))}
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none"
              />
            </div>
          </div>

          {estado === 'pagado' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1.5">
                  Fecha de Pago
                </label>
                <input
                  type="date"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1.5">
                  Medio de Pago
                </label>
                <select
                  value={medioPago}
                  onChange={(e) => setMedioPago(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Mercado Pago">Mercado Pago</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Efectivo">Efectivo en Caja</option>
                  <option value="Débito Automático">Débito Automático</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222a3d]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-[#c4c5d5] hover:text-white">
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-xl shadow-[0_0_15px_rgba(76,215,246,0.4)]"
            >
              <CheckCircle className="w-4 h-4" />
              Guardar en Firestore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
