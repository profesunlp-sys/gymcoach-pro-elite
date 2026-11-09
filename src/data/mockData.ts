import { RoutineSkill } from '../types';

export const FIG_SKILLS_CATALOG: RoutineSkill[] = [
  // Viga
  { id: 's-v1', apparatus: 'Viga', name: 'Flic-flac a una pierna', difficultyValue: 0.3, difficultyLetter: 'C', description: 'Acrobático hacia atrás con apoyo de manos y recepción limpia.' },
  { id: 's-v2', apparatus: 'Viga', name: 'Mortal atrás agrupado', difficultyValue: 0.4, difficultyLetter: 'D', description: 'Mortal atrás sin manos sobre la superficie de la viga.' },
  { id: 's-v3', apparatus: 'Viga', name: 'Giro completo (360°) en passe', difficultyValue: 0.2, difficultyLetter: 'B', description: 'Giro gimnástico con postura vertical y empeines estirados.' },
  { id: 's-v4', apparatus: 'Viga', name: 'Salto split 180°', difficultyValue: 0.2, difficultyLetter: 'B', description: 'Amplitud completa de piernas en el eje longitudinal.' },
  { id: 's-v5', apparatus: 'Viga', name: 'Salida: Doble giro atrás agrupado', difficultyValue: 0.4, difficultyLetter: 'D', description: 'Salida de alta dificultad con aterrizaje sin paso.' },

  // Paralelas
  { id: 's-p1', apparatus: 'Paralelas', name: 'Vuelta de apoyo a apoyo invertido (Giante)', difficultyValue: 0.3, difficultyLetter: 'C', description: 'Rotación dorsal completa con cuerpo recto.' },
  { id: 's-p2', apparatus: 'Paralelas', name: 'Pase de banda inferior a superior (Pak salto)', difficultyValue: 0.4, difficultyLetter: 'D', description: 'Transición dinámica de barra alta a baja.' },
  { id: 's-p3', apparatus: 'Paralelas', name: 'Despegue Jaeger agrupado', difficultyValue: 0.5, difficultyLetter: 'E', description: 'Vuelo con mortal adelante y retoma de barra superior.' },
  { id: 's-p4', apparatus: 'Paralelas', name: 'Salida: Doble mortal atrás', difficultyValue: 0.4, difficultyLetter: 'D', description: 'Desenganche y doble giro con parada fija.' },

  // Suelo
  { id: 's-s1', apparatus: 'Suelo', name: 'Diagonal 1: Doble mortal atrás carpado', difficultyValue: 0.5, difficultyLetter: 'E', description: 'Primera serie acrobática de máxima potencia.' },
  { id: 's-s2', apparatus: 'Suelo', name: 'Rondada flic-flac mortal con 720° (Doble giro)', difficultyValue: 0.4, difficultyLetter: 'D', description: 'Giro completo longitudinal en suspensión.' },
  { id: 's-s3', apparatus: 'Suelo', name: 'Salto Tour Jeté con medio giro', difficultyValue: 0.3, difficultyLetter: 'C', description: 'Elemento de danza con 180° de split en vuelo.' },
  { id: 's-s4', apparatus: 'Suelo', name: 'Giro séxtuple / Triple giro en passe', difficultyValue: 0.3, difficultyLetter: 'C', description: 'Equilibrio y técnica coreográfica.' },

  // Salto
  { id: 's-j1', apparatus: 'Salto', name: 'Yurchenko con pirueta simple (360°)', difficultyValue: 4.2, difficultyLetter: 'D', description: 'Entrada de rondada sobre botador y mortal con giro.' },
  { id: 's-j2', apparatus: 'Salto', name: 'Tsukahara agrupado', difficultyValue: 3.6, difficultyLetter: 'C', description: 'Entrada de rueda y mortal atrás.' },
  { id: 's-j3', apparatus: 'Salto', name: 'Salto mortal adelante con apoyo de manos', difficultyValue: 2.8, difficultyLetter: 'B', description: 'Entrada directa de carrera y fase de vuelo estirada.' },
];
