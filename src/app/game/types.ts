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

export const DIFFICULTY_TIME_LIMITS: Record<Difficulty, number> = {
  facil: 30,
  medio: 20,
  dificil: 10,
};

export const DEFAULT_DIFFICULTY: Difficulty = 'medio';

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

export type SpecialCellType = 'bonus' | 'portal' | 'cards';

export type SpecialCell =
  | { position: number; type: 'bonus' }
  | { position: number; type: 'portal'; target: number }
  | { position: number; type: 'cards' };
