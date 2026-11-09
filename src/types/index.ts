export type AppUserRole = 'coordinador' | 'profesor';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: AppUserRole;
}

export type GymnasticsLevel = 
  | 'Escuelita Inicial' 
  | 'Escuelita Avanzada' 
  | 'Promocional Pre-Infantil' 
  | 'Federado Nivel C1' 
  | 'Federado Nivel C2' 
  | 'Federado Nivel B';

export type MedicalStatus = 'En forma' | 'En recuperación' | 'En descanso' | 'Lesionado';

export type ApparatusType = 'Salto' | 'Paralelas' | 'Viga' | 'Suelo';

export interface ApparatusScore {
  apparatus: ApparatusType;
  dScore: number; // Difficulty score
  eScore: number; // Execution score
  penalties: number;
  total: number;
  updatedAt: string;
  notes?: string;
}

export interface ScoreHistoryEntry {
  date: string;
  mes: string;
  Salto: number;
  Paralelas: number;
  Viga: number;
  Suelo: number;
  total: number;
}

export interface AlumnoRecord {
  id: string;
  documento: string;
  apellido_nombre: string;
  nivel: GymnasticsLevel;
  rango_etario: string;
  horario_completo: string;
  dias_semana: string;
  estado_medico: MedicalStatus;
  contacto_tutor: string;
  telefono_tutor: string;
  asistencia_porcentaje: number;
  aparato_favorito: ApparatusType;
  scores: Record<ApparatusType, ApparatusScore>;
  score_history: ScoreHistoryEntry[];
  foto?: string;
  fecha_ingreso?: string;
}

export interface AlertaPagoRecord {
  id: string;
  apellido_nombre: string;
  mes: string;
  documento: string; // DNI
  createdAt?: string;
}

export interface PagoGimnasiaRecord {
  id: string;
  documento: string;
  apellido_nombre: string;
  importe: number;
  mes: string;
  mes_numero: number; // 3 (Marzo) to 11 (Noviembre)
  fecha_pago: string;
  matricula?: number;
  codigo: string;
  rango_etario?: string;
  horario_completo?: string;
  dias_semana?: string;
  estado?: 'pagado' | 'pendiente' | 'vencido' | 'beca';
  medio_pago?: string;
  nro_recibo?: string;
  cuotas?: number | string;
  observacion?: string;
  tramite?: string;
}

export interface AsistenciaRecord {
  id: string;
  fecha: string;
  grupo: string;
  horario: string;
  profesorEmail: string;
  registros: Record<string, 'presente' | 'ausente' | 'tarde' | 'justificado'>;
  presentes: number;
  ausentes: number;
  tardes: number;
  justificados: number;
}

export interface ProfesorGimnasiaRecord {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  especialidad: string;
  gruposAsignados?: string[];
}

export interface AsignacionGimnasiaRecord {
  id: string;
  profesorEmail: string;
  profesorNombre: string;
  grupo: string;
  horario_completo: string;
  dias_semana: string;
  rango_etario: string;
}

export interface RoutineSkill {
  id: string;
  name: string;
  apparatus: ApparatusType;
  difficultyValue: number;
  difficultyLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  description: string;
}
