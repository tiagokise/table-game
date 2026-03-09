// src/app/game/types.ts

export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface GameState {
  playerPosition: number;
  isQuizVisible: boolean;
  currentQuestion: Question | null;
  score: number;
}
