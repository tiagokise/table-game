// src/app/game/types.ts

export type Subject =
  | 'geografia'
  | 'historia'
  | 'ciencias'
  | 'cultura'
  | 'matematica'
  | 'esportes'
  | 'portugues'
  | 'cinema';

export type Difficulty = 'facil' | 'medio' | 'dificil';

export type SchoolLevel = 'fundamental1' | 'fundamental2' | 'medio';

export const SCHOOL_LEVELS: { id: SchoolLevel; label: string }[] = [
  { id: 'fundamental1', label: 'Fundamental I (1º–5º ano)' },
  { id: 'fundamental2', label: 'Fundamental II (6º–9º ano)' },
  { id: 'medio', label: 'Ensino Médio' },
];

export const DEFAULT_SCHOOL_LEVEL: SchoolLevel = 'medio';

export type Materia =
  | 'portugues'
  | 'matematica'
  | 'ciencias'
  | 'biologia'
  | 'fisica'
  | 'quimica'
  | 'historia'
  | 'geografia'
  | 'arte'
  | 'educacao-fisica'
  | 'ingles'
  | 'filosofia'
  | 'sociologia';

const FUND_LEVELS: SchoolLevel[] = ['fundamental1', 'fundamental2'];
const MEDIO_LEVELS: SchoolLevel[] = ['medio'];
const ALL_LEVELS: SchoolLevel[] = [...FUND_LEVELS, ...MEDIO_LEVELS];

export const MATERIAS: { id: Materia; label: string; levels: SchoolLevel[] }[] = [
  { id: 'arte', label: 'Arte', levels: ALL_LEVELS },
  { id: 'biologia', label: 'Biologia', levels: MEDIO_LEVELS },
  { id: 'ciencias', label: 'Ciências', levels: FUND_LEVELS },
  { id: 'educacao-fisica', label: 'Educação Física', levels: ALL_LEVELS },
  { id: 'filosofia', label: 'Filosofia', levels: MEDIO_LEVELS },
  { id: 'fisica', label: 'Física', levels: MEDIO_LEVELS },
  { id: 'geografia', label: 'Geografia', levels: ALL_LEVELS },
  { id: 'historia', label: 'História', levels: ALL_LEVELS },
  { id: 'ingles', label: 'Inglês', levels: ALL_LEVELS },
  { id: 'portugues', label: 'Língua Portuguesa', levels: ALL_LEVELS },
  { id: 'matematica', label: 'Matemática', levels: ALL_LEVELS },
  { id: 'quimica', label: 'Química', levels: MEDIO_LEVELS },
  { id: 'sociologia', label: 'Sociologia', levels: MEDIO_LEVELS },
];

export const getMateriasForLevel = (level: SchoolLevel) =>
  MATERIAS.filter((m) => m.levels.includes(level));

export const DIFFICULTY_TIME_LIMITS: Record<Difficulty, number> = {
  facil: 30,
  medio: 20,
  dificil: 10,
};

export const DEFAULT_DIFFICULTY: Difficulty = 'medio';

export const getDifficultyPenalty = (difficulty: Difficulty, diceValue: number): number => {
  if (difficulty === 'facil') return 0;
  if (difficulty === 'medio') return Math.floor(diceValue / 2);
  return diceValue;
};

export interface Question {
  question: string;
  options: string[];
  answer: string;
  subject?: Subject;
  difficulty?: Difficulty;
}

export interface Player {
  id: string;
  position: number;
  score: number;
  color: string;
  hasSecondChance: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  isQuizVisible: boolean;
  currentQuestion: Question | null;
  diceValue: number | null;
}

export type SpecialCellType = 'bonus' | 'portal' | 'cards' | 'penalty';

export type SpecialCell =
  | { position: number; type: 'bonus' }
  | { position: number; type: 'portal'; target: number }
  | { position: number; type: 'cards' }
  | { position: number; type: 'penalty' };
