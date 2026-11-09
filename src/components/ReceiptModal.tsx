import React from 'react';
import { X, Printer, Share2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { GymnastLogoIcon } from './GymnastIcon';

interface ReceiptModalProps {
  payment: any;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const gymnastName = payment.apellido_nombre || payment.gymnastName || 'Atleta Gimnasia';
  const importe = payment.importe || payment.amount || 32000;
  const mes = payment.mes || payment.month || 'Noviembre 2026';
  const receiptNum = payment.nro_recibo || payment.receiptNumber || `REC-2026-${payment.id?.slice(-4) || '1101'}`;
  const fecha = payment.fecha_pago || payment.paidDate || new Date().toISOString().split('T')[0];
  const method = payment.medio_pago || payment.method || 'Transferencia Bancaria';

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🧾 *GymCoach Pro Elite - Comprobante de Pago*\n` +
      `Gimnasta: ${gymnastName}\n` +
      `Concepto: Cuota ${mes}\n` +
      `Monto: $${Number(importe).toLocaleString('es-AR')}\n` +
      `Estado: PAGADO\n` +
      `Comprobante N°: ${receiptNum}\n` +
      `¡Muchas gracias por acompañar el desarrollo deportivo en UNLP!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-lg bg-[#0b1326] border border-[#222a3d] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#131b2e] border-b border-[#222a3d]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#4cd7f6]" />
            <span className="text-sm font-semibold tracking-wide uppercase text-[#dae2fd]">
              Comprobante Oficial Digital
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#c4c5d5] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between border-b border-[#222a3d] pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#171f33] border border-[#4cd7f6]/30 flex items-center justify-center shadow-lg">
                <GymnastLogoIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  GymCoach <span className="text-[#4cd7f6]">PRO ELITE</span>
                </h3>
                <p className="text-xs text-[#c4c5d5]">
                  Escuela de Gimnasia Artística Femenina & Masculina
                </p>
                <p className="text-[11px] text-[#8e909f]">Sede Central La Plata · UNLP</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold tracking-wider text-[#4cd7f6] bg-[#003640]/50 border border-[#4cd7f6]/40 rounded-md">
                {receiptNum}
              </span>
              <p className="text-[11px] text-[#c4c5d5] mt-1">Fecha: {fecha}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#131b2e] border border-[#222a3d]">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8e909f] block">
                Atleta / Gimnasta
              </span>
              <p className="text-base font-bold text-[#dae2fd] mt-0.5">{gymnastName}</p>
              <span className="text-xs text-[#4cd7f6] font-medium font-mono">{payment.documento || ''}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8e909f] block">
                Concepto
              </span>
              <p className="text-base font-bold text-[#dae2fd] mt-0.5">Cuota {mes}</p>
              <span className="text-xs text-[#c4c5d5]">{payment.horario_completo || 'Entrenamiento Gimnasia'}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8e909f] block">
                Medio de Pago
              </span>
              <p className="text-sm font-semibold text-[#dae2fd] mt-0.5">{method}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8e909f] block">
                Registro Sistema
              </span>
              <p className="text-sm font-semibold text-[#dae2fd] mt-0.5">Coordinación UNLP</p>
            </div>
          </div>

          {/* Amount and Stamped Badge */}
          <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-[#171f33] to-[#1e40af]/30 border border-[#4cd7f6]/30">
            <div>
              <span className="text-xs uppercase font-semibold text-[#c4c5d5] block">
                Total Percibido
              </span>
              <div className="text-3xl font-extrabold text-white tracking-tight mt-1 flex items-baseline gap-1">
                <span className="text-xl text-[#4cd7f6] font-medium">$</span>
                {Number(importe).toLocaleString('es-AR')}
                <span className="text-xs text-[#c4c5d5] font-normal">ARS</span>
              </div>
            </div>

            <div className="relative border-2 border-emerald-400/80 rounded-lg px-4 py-2 rotate-[-4deg] bg-emerald-950/40 shadow-inner">
              <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold tracking-widest text-sm uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>PAGADO</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 block text-center">
                VAL-GYM-{receiptNum.slice(-4)}
              </span>
            </div>
          </div>

          <div className="text-center text-[11px] text-[#8e909f] pt-2">
            Comprobante digital administrativo GymCoach Pro Elite · UNLP.
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-end gap-3 p-4 bg-[#131b2e] border-t border-[#222a3d]">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#dae2fd] bg-[#222a3d] hover:bg-[#2d3449] border border-white/10 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-lg transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
