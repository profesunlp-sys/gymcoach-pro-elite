import React, { useState } from 'react';
import { AlumnoRecord, GymnasticsLevel, MedicalStatus, ApparatusType } from '../types';
import { X, UserPlus, CheckCircle } from 'lucide-react';

interface NewGymnastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGymnast: (gymnast: Omit<AlumnoRecord, 'id'>) => void;
}

export const NewGymnastModal: React.FC<NewGymnastModalProps> = ({
  isOpen,
  onClose,
  onSaveGymnast,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [nivel, setNivel] = useState<GymnasticsLevel>('Escuelita Inicial');
  const [rangoEtario, setRangoEtario] = useState('6 a 8 años');
  const [horarioCompleto, setHorarioCompleto] = useState('17:00 a 18:30');
  const [diasSemana, setDiasSemana] = useState('Lunes y Miércoles');
  const [aparatoFavorito, setAparatoFavorito] = useState<ApparatusType>('Suelo');
  const [contactoTutor, setContactoTutor] = useState('');
  const [telefonoTutor, setTelefonoTutor] = useState('+54 221 ');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !documento.trim()) return;

    const newGymnast: Omit<AlumnoRecord, 'id'> = {
      documento: documento.trim(),
      apellido_nombre: `${nombre.trim()} ${apellido.trim()}`,
      nivel,
      rango_etario: rangoEtario,
      horario_completo: horarioCompleto,
      dias_semana: diasSemana,
      estado_medico: 'En forma',
      contacto_tutor: contactoTutor.trim() || 'Tutor Responsable',
      telefono_tutor: telefonoTutor.trim(),
      asistencia_porcentaje: 100,
      aparato_favorito: aparatoFavorito,
      foto: `https://images.unsplash.com/photo-${1517841905240 + Math.floor(Math.random() * 500)}?w=300&auto=format&fit=crop&q=80`,
      fecha_ingreso: new Date().toISOString().split('T')[0],
      scores: {
        Salto: { apparatus: 'Salto', dScore: 2.0, eScore: 8.5, penalties: 0, total: 10.5, updatedAt: new Date().toISOString().split('T')[0] },
        Paralelas: { apparatus: 'Paralelas', dScore: 2.0, eScore: 8.5, penalties: 0, total: 10.5, updatedAt: new Date().toISOString().split('T')[0] },
        Viga: { apparatus: 'Viga', dScore: 2.0, eScore: 8.5, penalties: 0, total: 10.5, updatedAt: new Date().toISOString().split('T')[0] },
        Suelo: { apparatus: 'Suelo', dScore: 2.0, eScore: 8.5, penalties: 0, total: 10.5, updatedAt: new Date().toISOString().split('T')[0] },
      },
      score_history: [
        { mes: 'Marzo', date: '2026-03-20', Salto: 10.5, Paralelas: 10.0, Viga: 10.2, Suelo: 10.6, total: 41.3 },
        { mes: 'Mayo', date: '2026-05-18', Salto: 10.8, Paralelas: 10.4, Viga: 10.6, Suelo: 10.9, total: 42.7 },
        { mes: 'Noviembre', date: new Date().toISOString().split('T')[0], Salto: 11.0, Paralelas: 10.8, Viga: 11.2, Suelo: 11.4, total: 44.4 },
      ],
    };

    onSaveGymnast(newGymnast);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-lg bg-[#0b1326] border border-[#222a3d] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#131b2e] border-b border-[#222a3d]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#4cd7f6]" />
            <h3 className="text-base font-bold text-white">Inscribir Nueva Gimnasta en Firestore</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#c4c5d5] hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1">Nombre</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Sofía"
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1">Apellido</label>
              <input
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej: Gómez"
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1">Documento (DNI)</label>
              <input
                type="text"
                required
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ej: 51.482.901"
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1">Rango Etario</label>
              <select
                value={rangoEtario}
                onChange={(e) => setRangoEtario(e.target.value)}
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-[#dae2fd] outline-none"
              >
                <option value="6 a 8 años">6 a 8 años</option>
                <option value="9 a 12 años">9 a 12 años</option>
                <option value="13 a 16 años">13 a 16 años</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1">Nivel Gimnástico</label>
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value as GymnasticsLevel)}
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-[#dae2fd] outline-none"
              >
                <option value="Escuelita Inicial">Escuelita Inicial</option>
                <option value="Escuelita Avanzada">Escuelita Avanzada</option>
                <option value="Promocional Pre-Infantil">Promocional Pre-Infantil</option>
                <option value="Federado Nivel C1">Federado Nivel C1</option>
                <option value="Federado Nivel C2">Federado Nivel C2</option>
                <option value="Federado Nivel B">Federado Nivel B</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1">Aparato Favorito</label>
              <select
                value={aparatoFavorito}
                onChange={(e) => setAparatoFavorito(e.target.value as ApparatusType)}
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-[#dae2fd] outline-none"
              >
                <option value="Suelo">Suelo / Pedana</option>
                <option value="Viga">Viga de Equilibrio</option>
                <option value="Paralelas">Barras Asimétricas</option>
                <option value="Salto">Salto de Potro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1">Horario Asignado</label>
              <input
                type="text"
                value={horarioCompleto}
                onChange={(e) => setHorarioCompleto(e.target.value)}
                placeholder="17:00 a 18:30"
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#c4c5d5] mb-1">Días de Semana</label>
              <input
                type="text"
                value={diasSemana}
                onChange={(e) => setDiasSemana(e.target.value)}
                placeholder="Lunes y Miércoles"
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="border-t border-[#222a3d] pt-3">
            <h4 className="text-xs font-bold uppercase text-[#4cd7f6] mb-2">Contacto del Tutor</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#c4c5d5] mb-1">Nombre Tutor</label>
                <input
                  type="text"
                  value={contactoTutor}
                  onChange={(e) => setContactoTutor(e.target.value)}
                  placeholder="Marcelo Gómez"
                  className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#c4c5d5] mb-1">Teléfono</label>
                <input
                  type="text"
                  value={telefonoTutor}
                  onChange={(e) => setTelefonoTutor(e.target.value)}
                  placeholder="+54 221 ..."
                  className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

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
