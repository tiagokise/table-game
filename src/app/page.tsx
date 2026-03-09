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
      score: prevState.score,
    }));
  };

  const handleAnswer = (isCorrect: boolean) => {
    setGameState((prevState) => {
      if (diceRoll === null) return prevState;

      if (isCorrect) {
        const newPosition = prevState.playerPosition + diceRoll;
        const newScore = prevState.score + diceRoll;
        if (newPosition >= WINNING_POSITION) {
          setWinner(true);
          return {
            ...prevState,
            isQuizVisible: false,
            currentQuestion: null,
            playerPosition: WINNING_POSITION,
            score: newScore,
          };
        }
        return {
          ...prevState,
          isQuizVisible: false,
          currentQuestion: null,
          playerPosition: newPosition,
          score: newScore,
        };
      } else {
        const newPosition = Math.max(0, prevState.playerPosition - diceRoll);
        const newScore = prevState.score - diceRoll;
        return {
          ...prevState,
          isQuizVisible: false,
          currentQuestion: null,
          playerPosition: newPosition,
          score: newScore,
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
      <h2>Score: {gameState.score}</h2>
      <button onClick={resetGame} className="restart-button">
        Restart Game
      </button>
      <Board>
        <>
          <Dice onRoll={handleRoll} disabled={gameState.isQuizVisible} currentRoll={diceRoll} />
          <Player position={gameState.playerPosition} />
        </>
      </Board>
      {winner ? (
        <div>
          <h2>You Win!</h2>
          <button onClick={resetGame}>Play Again</button>
        </div>
      ) : (
        <>
          {gameState.isQuizVisible && gameState.currentQuestion && (
            <Quiz question={gameState.currentQuestion} onAnswer={handleAnswer} />
          )}
        </>
      )}
    </main>
  );
}
