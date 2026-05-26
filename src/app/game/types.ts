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
