import { GameState } from './types';

export const initialGameState: GameState = {
  players: [
    { id: '1', position: 0, score: 0, color: 'red' },
    { id: '2', position: 0, score: 0, color: 'blue' },
  ],
  currentPlayerIndex: 0,
  isQuizVisible: false,
  currentQuestion: null,
  diceValue: null,
  lastAnswerResult: null,
};
