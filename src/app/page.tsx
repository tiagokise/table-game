'use client';

import { useState } from 'react';
import Board from './components/Board';
import Player from './components/Player';
import Dice from './components/Dice';
import Quiz from './components/Quiz';
import { initialGameState } from './game/game-state';
import { questions } from './game/questions';
import { GameState } from './game/types';

const WINNING_POSITION = 35;

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [winner, setWinner] = useState(false);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);

  const handleRoll = (diceValue: number) => {
    if (winner || gameState.isQuizVisible) return;

    setDiceRoll(diceValue);
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setGameState((prevState) => ({
      ...prevState,
      isQuizVisible: true,
      currentQuestion: randomQuestion,
    }));
  };

  const handleAnswer = (isCorrect: boolean) => {
    setGameState((prevState) => {
      if (diceRoll === null) return prevState;

      if (isCorrect) {
        const newPosition = prevState.playerPosition + diceRoll;
        if (newPosition >= WINNING_POSITION) {
          setWinner(true);
          return {
            ...prevState,
            isQuizVisible: false,
            currentQuestion: null,
            playerPosition: WINNING_POSITION,
          };
        }
        return {
          ...prevState,
          isQuizVisible: false,
          currentQuestion: null,
          playerPosition: newPosition,
        };
      } else {
        // Move back by the dice roll amount, not going below 0
        const newPosition = Math.max(0, prevState.playerPosition - diceRoll);
        return {
          ...prevState,
          isQuizVisible: false,
          currentQuestion: null,
          playerPosition: newPosition,
        };
      }
    });
    setDiceRoll(null);
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setWinner(false);
    setDiceRoll(null);
  };

  return (
    <main>
      <h1>Table Game</h1>
      <button onClick={resetGame} className="restart-button">
        Restart Game
      </button>
      <Board>
        <Player position={gameState.playerPosition} />
      </Board>
      {winner ? (
        <div>
          <h2>You Win!</h2>
          <button onClick={resetGame}>Play Again</button>
        </div>
      ) : (
        <>
          <Dice onRoll={handleRoll} />
          {gameState.isQuizVisible && gameState.currentQuestion && (
            <Quiz question={gameState.currentQuestion} onAnswer={handleAnswer} />
          )}
        </>
      )}
    </main>
  );
}
