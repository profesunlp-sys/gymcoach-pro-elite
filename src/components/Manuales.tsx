
import React from 'react';
import { ViewMode, Source } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { BackButton } from './ui/CommonUI';

interface ManualesProps {
  vista: ViewMode;
  setVista: (vista: ViewMode) => void;
  disciplinas: { id?: string, nombre: string }[];
  niveles: { id?: string, nombre: string }[];
  selectedDisciplina: string;
  setSelectedDisciplina: (val: string) => void;
  selectedNivel: string;
  setSelectedNivel: (val: string) => void;
  SKILL_TREE: any;
  sources: Source[];
  kbMessages: {role: 'user' | 'model', text: string}[];
  isKbLoading: boolean;
  kbInput: string;
  setKbInput: (val: string) => void;
  handleKbQuery: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteSource: (id: string, name: string) => void;
}

export const Manuales: React.FC<ManualesProps> = ({
  vista,
  setVista,
  disciplinas,
  niveles,
  selectedDisciplina,
  setSelectedDisciplina,
  selectedNivel,
  setSelectedNivel,
  SKILL_TREE,
  sources,
  kbMessages,
  isKbLoading,
  kbInput,
  setKbInput,
  handleKbQuery,
  handleFileUpload,
  handleDeleteSource
}) => {
  if (vista !== 'Planes') return null;

  return (
    <div className="px-6 py-8 space-y-8 page-transition pb-24 relative pt-12">
      <BackButton onClick={() => setVista('Dashboard')} />
      <header className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Centro Técnico</h2>
          <p className="text-ios-blue text-[10px] font-black uppercase tracking-widest mt-1">Documentos y Progresiones</p>
        </div>
      </header>

      {/* Sección: Biblioteca de documentos con asistente de IA */}
      <section className="bg-white rounded-3xl p-6 border border-ios-blue/20 space-y-6 shadow-ios">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ios-blue/10 rounded-xl flex items-center justify-center border border-ios-blue/20">
              <span className="material-icons-outlined text-ios-blue text-xl">psychology</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-black uppercase tracking-tight">Asistente Técnico IA</h3>
              <p className="text-ios-blue text-[10px] font-black uppercase tracking-widest">Consulta tus documentos</p>
            </div>
          </div>

          <label className="cursor-pointer group">
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" />
            <div className="flex items-center gap-2 px-4 py-2 bg-ios-gray border border-black/10 rounded-xl group-hover:bg-ios-blue/10 group-hover:border-ios-blue/30 transition-all">
              <span className="material-icons-outlined text-ios-blue text-sm">upload_file</span>
              <span className="text-[10px] font-black text-black uppercase tracking-widest">Subir Documento</span>
            </div>
          </label>
        </div>

        {/* Lista de documentos */}
        {sources.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {sources.map(source => (
              <div key={source.id} className="flex items-center gap-2 px-3 py-1.5 bg-ios-gray border border-black/10 rounded-lg whitespace-nowrap">
                <span className="material-icons-outlined text-ios-blue text-xs">description</span>
                <span className="text-[10px] text-black/80 font-medium">{source.name}</span>
                <button onClick={() => handleDeleteSource(source.id!, source.name)} className="text-ios-red hover:text-ios-red/70 p-0.5">
                  <span className="material-icons-outlined text-xs">close</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chat con la IA sobre los documentos */}
        <div className="space-y-4">
          <div className="bg-ios-gray rounded-2xl border border-black/5 p-4 h-64 overflow-y-auto space-y-4 no-scrollbar">
            {sources.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
                <span className="material-icons-outlined text-secondary/40 text-4xl">cloud_off</span>
                <p className="text-xs text-secondary italic">
                  No hay documentos cargados. Subí manuales, el código de puntuación o ejercicios de federaciones para empezar.
                </p>
              </div>
            ) : kbMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
                <span className="material-icons-outlined text-ios-blue/20 text-4xl">chat_bubble_outline</span>
                <p className="text-xs text-secondary italic">
                  ¡Hola! Soy tu asistente técnico. Preguntame cualquier cosa sobre los documentos cargados.
                </p>
              </div>
            ) : (
              kbMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${msg.role === 'user' ? 'text-ios-blue' : 'text-secondary'}`}>
                    {msg.role === 'user' ? 'Tú' : 'Asistente Técnico'}
                  </span>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-ios-blue text-white font-bold rounded-tr-none'
                      : 'bg-white text-black border border-black/10 rounded-tl-none'
                  }`}>
                    <div className="prose prose-xs max-w-none">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isKbLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2 rounded-2xl border border-black/10 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-ios-blue rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-ios-blue rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-ios-blue rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={kbInput}
              onChange={(e) => setKbInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKbQuery()}
              placeholder={sources.length === 0 ? "Subí un documento para chatear..." : "Preguntá sobre los documentos..."}
              disabled={sources.length === 0 || isKbLoading}
              className="flex-1 bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-ios-blue/50 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleKbQuery}
              disabled={sources.length === 0 || isKbLoading || !kbInput.trim()}
              className="w-12 h-12 bg-ios-blue text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
            >
              <span className="material-icons-outlined">send</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sección: Ejercicios obligatorios / progresiones por disciplina */}
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {disciplinas.map(d => (
            <button
              key={d.id || d.nombre}
              onClick={() => setSelectedDisciplina(d.nombre)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedDisciplina === d.nombre ? 'bg-ios-blue text-white shadow-sm' : 'bg-white text-secondary border border-black/5'}`}
            >
              {d.nombre}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {niveles.map(n => (
            <button
              key={n.id || n.nombre}
              onClick={() => setSelectedNivel(n.nombre)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedNivel === n.nombre ? 'bg-black text-white' : 'bg-white text-secondary border border-black/5'}`}
            >
              {n.nombre}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {Object.entries(SKILL_TREE[selectedDisciplina as keyof typeof SKILL_TREE] || {}).map(([aparato, categorias]: [string, any]) => (
            <div key={aparato} className="bg-white rounded-3xl p-6 border border-black/5 space-y-4 shadow-ios">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ios-blue/10 rounded-xl flex items-center justify-center border border-ios-blue/20">
                  <span className="material-icons-outlined text-ios-blue text-xl">fitness_center</span>
                </div>
                <h3 className="text-lg font-black text-black uppercase tracking-tight">{aparato}</h3>
              </div>

              <div className="space-y-4">
                {Object.entries(categorias).map(([cat, skills]: [string, any]) => (
                  <div key={cat} className="space-y-2">
                    <h4 className="text-[10px] font-black text-ios-blue uppercase tracking-widest px-1">{cat}</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {skills.map((skill: string, idx: number) => (
                        <div key={idx} className="bg-ios-gray p-3 rounded-xl border border-black/5 flex items-center justify-between group hover:bg-ios-blue/5 transition-all">
                          <span className="text-xs text-black">{skill}</span>
                          <span className="material-icons-outlined text-secondary/40 group-hover:text-ios-blue transition-colors text-sm">info</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
