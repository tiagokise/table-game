// src/app/game/types.ts

export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface Player {
  id: string;
  position: number;
  score: number;
  color: string;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  isQuizVisible: boolean;
  currentQuestion: Question | null;
  diceValue: number | null;
  lastAnswerResult: { playerId: string; isCorrect: boolean } | null;
}
