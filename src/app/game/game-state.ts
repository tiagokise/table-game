import { GameState } from './types';

export const initialGameState: GameState = {
  players: [{ id: '1', position: 0, score: 0, color: 'red' }],
  currentPlayerIndex: 0,
  isQuizVisible: false,
  currentQuestion: null,
  diceValue: null,
};
