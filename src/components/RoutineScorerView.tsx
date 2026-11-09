import React, { useState } from 'react';
import { AlumnoRecord, ApparatusType, RoutineSkill, ApparatusScore } from '../types';
import { FIG_SKILLS_CATALOG } from '../data/mockData';
import { ApparatusIcon } from './GymnastIcon';
import {
  Target,
  Plus,
  Minus,
  CheckCircle2,
  Trash2,
  Award,
  Sparkles,
  Info,
  Save,
} from 'lucide-react';

interface RoutineScorerViewProps {
  gymnasts: AlumnoRecord[];
  initialGymnastId?: string;
  initialApparatus?: ApparatusType;
  onSaveScore: (gymnastId: string, score: ApparatusScore) => void;
}

export const RoutineScorerView: React.FC<RoutineScorerViewProps> = ({
  gymnasts,
  initialGymnastId,
  initialApparatus = 'Viga',
  onSaveScore,
}) => {
  const [gymnastId, setGymnastId] = useState<string>(initialGymnastId || (gymnasts[0]?.id || ''));
  const [apparatus, setApparatus] = useState<ApparatusType>(initialApparatus);
  const [dScore, setDScore] = useState<number>(3.8);
  const [deductions, setDeductions] = useState<number>(1.2);
  const [penalties, setPenalties] = useState<number>(0.0);
  const [routineNotes, setRoutineNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [selectedSkills, setSelectedSkills] = useState<RoutineSkill[]>([]);

  const selectedGymnast = gymnasts.find((g) => g.id === gymnastId);

  const availableSkills = FIG_SKILLS_CATALOG.filter((s) => s.apparatus === apparatus);

  const handleAddSkill = (skill: RoutineSkill) => {
    setSelectedSkills([...selectedSkills, skill]);
    setDScore((prev) => Number((prev + skill.difficultyValue).toFixed(2)));
  };

  const handleRemoveSkill = (index: number) => {
    const skill = selectedSkills[index];
    setSelectedSkills(selectedSkills.filter((_, i) => i !== index));
    if (skill) {
      setDScore((prev) => Math.max(1.0, Number((prev - skill.difficultyValue).toFixed(2))));
    }
  };

  const handleApplyDeduction = (amount: number) => {
    setDeductions((prev) => Number((prev + amount).toFixed(2)));
  };

  const eScore = Math.max(0, Number((10.0 - deductions).toFixed(2)));
  const finalTotal = Math.max(0, Number((dScore + eScore - penalties).toFixed(2)));

  const handleSave = () => {
    if (!selectedGymnast) return;

    const scoreData: ApparatusScore = {
      apparatus,
      dScore,
      eScore,
      penalties,
      total: finalTotal,
      updatedAt: new Date().toISOString().split('T')[0],
      notes: routineNotes.trim() || undefined,
    };

    onSaveScore(selectedGymnast.id, scoreData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#003640] border border-[#4cd7f6]/40 flex items-center justify-center text-[#4cd7f6]">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Calificador de Rutinas & Código FIG
            </h2>
          </div>
          <p className="text-xs text-[#c4c5d5] mt-1">
            Cálculo oficial de Dificultad (D) + Ejecución (E) con deducciones y guardado en Firestore.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>¡Puntaje guardado en la ficha de la atleta!</span>
          </div>
        )}
      </div>

      {/* Main Scoring Workbench */}
      {gymnasts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#131b2e] border border-[#222a3d]">
          <Target className="w-12 h-12 text-[#8e909f] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-white">No hay gimnastas en la base de datos</h3>
          <p className="text-xs text-[#8e909f] mt-1">
            Primero inscribí atletas en la sección de Atletas para comenzar a evaluar rutinas FIG.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Athlete & Apparatus Selectors */}
          <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8e909f] mb-1.5">
                Seleccionar Gimnasta
              </label>
              <select
                value={gymnastId}
                onChange={(e) => setGymnastId(e.target.value)}
                className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold outline-none"
              >
                {gymnasts.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.apellido_nombre} — {g.nivel} (DNI: {g.documento})
                  </option>
                ))}
              </select>
            </div>

            {/* Apparatus Tabs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8e909f] mb-2">
                Aparato a Evaluar
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Salto', 'Paralelas', 'Viga', 'Suelo'] as ApparatusType[]).map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => {
                      setApparatus(app);
                      setSelectedSkills([]);
                      if (selectedGymnast && selectedGymnast.scores?.[app]) {
                        const existing = selectedGymnast.scores[app];
                        setDScore(existing.dScore);
                        setDeductions(Number((10 - existing.eScore).toFixed(2)));
                        setPenalties(existing.penalties);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                      apparatus === app
                        ? 'border-[#4cd7f6] bg-[#003640]/60 text-[#4cd7f6] shadow-[0_0_12px_rgba(76,215,246,0.25)]'
                        : 'border-[#222a3d] bg-[#171f33] text-[#c4c5d5] hover:bg-[#222a3d]'
                    }`}
                  >
                    <ApparatusIcon apparatus={app} className="w-4 h-4" />
                    <span>{app}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dificultad (D-Score) Elements Catalog */}
          <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4cd7f6]" />
                  Composición de Dificultad (Nota D)
                </h3>
                <p className="text-[11px] text-[#8e909f]">
                  Sumá elementos técnicos del código de puntuación FIG
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8e909f]">Valor D:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={dScore}
                  onChange={(e) => setDScore(Number(e.target.value))}
                  className="w-16 bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-lg px-2 py-1 text-xs text-white font-bold text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#8e909f] block">
                Elementos Disponibles en {apparatus}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableSkills.map((sk) => (
                  <button
                    key={sk.id}
                    onClick={() => handleAddSkill(sk)}
                    className="p-2.5 rounded-xl bg-[#0b1326] border border-[#222a3d] hover:border-[#4cd7f6]/50 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#1e40af] text-white">
                          Dif. {sk.difficultyLetter}
                        </span>
                        <p className="text-xs font-bold text-white truncate">{sk.name}</p>
                      </div>
                      <p className="text-[10px] text-[#8e909f] truncate mt-0.5">{sk.description}</p>
                    </div>
                    <span className="text-xs font-bold text-[#4cd7f6] shrink-0 group-hover:scale-110 transition-transform">
                      +{sk.difficultyValue}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedSkills.length > 0 && (
              <div className="pt-2 border-t border-[#222a3d]">
                <span className="text-[10px] uppercase font-bold text-[#8e909f] block mb-2">
                  Elementos en la Serie ({selectedSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-[#171f33] border border-[#4cd7f6]/30 text-[#dae2fd]"
                    >
                      <span>{sk.name}</span>
                      <span className="text-[#4cd7f6] font-mono font-bold">(+{sk.difficultyValue})</span>
                      <button
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-rose-400 hover:text-rose-300 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ejecución (E-Score) & Deducciones */}
          <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Deducciones de Ejecución & Faltas Técnicas (Nota E)
                </h3>
                <p className="text-[11px] text-[#8e909f]">
                  Base 10.00 pts - deducciones aplicadas durante la rutina
                </p>
              </div>
              <button
                onClick={() => setDeductions(0)}
                className="text-xs text-[#8e909f] hover:text-white"
              >
                Limpiar faltas
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleApplyDeduction(0.1)}
                className="p-2.5 rounded-xl bg-[#0b1326] border border-[#222a3d] hover:border-amber-400 text-left transition-colors"
              >
                <span className="text-xs font-bold text-amber-300 block">-0.10 pts</span>
                <span className="text-[10px] text-[#8e909f] block">Paso leve / pierna flexionada</span>
              </button>
              <button
                onClick={() => handleApplyDeduction(0.3)}
                className="p-2.5 rounded-xl bg-[#0b1326] border border-[#222a3d] hover:border-amber-500 text-left transition-colors"
              >
                <span className="text-xs font-bold text-amber-400 block">-0.30 pts</span>
                <span className="text-[10px] text-[#8e909f] block">Desequilibrio notable / flexión</span>
              </button>
              <button
                onClick={() => handleApplyDeduction(0.5)}
                className="p-2.5 rounded-xl bg-[#0b1326] border border-[#222a3d] hover:border-rose-400 text-left transition-colors"
              >
                <span className="text-xs font-bold text-rose-400 block">-0.50 pts</span>
                <span className="text-[10px] text-[#8e909f] block">Gran paso / apoyo con mano</span>
              </button>
              <button
                onClick={() => handleApplyDeduction(1.0)}
                className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/50 text-left transition-colors"
              >
                <span className="text-xs font-bold text-rose-400 block">-1.00 pts</span>
                <span className="text-[10px] text-rose-200 block">Caída del aparato</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-[#8e909f] block mb-1">
                  Total Deducciones Acumuladas
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  value={deductions}
                  onChange={(e) => setDeductions(Number(e.target.value))}
                  className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-rose-400 font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#8e909f] block mb-1">
                  Penalización Neutra (Línea / Tiempo)
                </label>
                <select
                  value={penalties}
                  onChange={(e) => setPenalties(Number(e.target.value))}
                  className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
                >
                  <option value={0}>Sin penalización (0.0 pts)</option>
                  <option value={0.1}>-0.1 pts (1 pie fuera de línea)</option>
                  <option value={0.3}>-0.3 pts (2 pies fuera / tiempo)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#8e909f] block mb-1">
                Comentarios y Recomendaciones del Entrenador
              </label>
              <input
                type="text"
                value={routineNotes}
                onChange={(e) => setRoutineNotes(e.target.value)}
                placeholder="Ej: Excelente altura en el flic-flac, corregir punta de pies en la salida..."
                className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8e909f] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Score Result Card */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#131b2e] to-[#171f33] border-2 border-[#4cd7f6]/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4cd7f6]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center pb-5 border-b border-[#222a3d]">
              <div className="w-14 h-14 rounded-2xl bg-[#003640] border border-[#4cd7f6]/50 flex items-center justify-center text-[#4cd7f6] mx-auto mb-2 shadow-[0_0_20px_rgba(76,215,246,0.3)]">
                <ApparatusIcon apparatus={apparatus} className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Nota Oficial FIG · {apparatus}
              </h3>
              <p className="text-xs text-[#4cd7f6] font-semibold mt-0.5">
                {selectedGymnast ? selectedGymnast.apellido_nombre : 'Atleta'}
              </p>
            </div>

            {/* Big Total */}
            <div className="py-6 text-center">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#8e909f] block">
                Puntaje Total Final
              </span>
              <div className="text-5xl font-black text-white tracking-tight mt-1 flex items-center justify-center gap-1">
                <span className="text-[#4cd7f6]">{finalTotal.toFixed(2)}</span>
                <span className="text-xs text-[#8e909f] font-normal self-end mb-2">pts</span>
              </div>
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold bg-[#1e40af] text-white">
                Reglamento FIG
              </span>
            </div>

            {/* Formula Breakdown */}
            <div className="space-y-2.5 p-3 rounded-xl bg-[#0b1326] border border-[#222a3d] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8e909f]">Dificultad (Nota D)</span>
                <span className="font-bold text-white">+{dScore.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8e909f]">Ejecución (Nota E: 10 - {deductions})</span>
                <span className="font-bold text-white">+{eScore.toFixed(2)}</span>
              </div>
              {penalties > 0 && (
                <div className="flex items-center justify-between text-rose-400">
                  <span>Penalizaciones Neutras</span>
                  <span className="font-bold">-{penalties.toFixed(1)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#222a3d] flex items-center justify-between font-bold text-sm text-[#4cd7f6]">
                <span>Total Calculado</span>
                <span>{finalTotal.toFixed(2)} pts</span>
              </div>
            </div>

            {/* Action Save Button */}
            <button
              onClick={handleSave}
              className="mt-6 w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(76,215,246,0.4)] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar en Ficha de Atleta</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
