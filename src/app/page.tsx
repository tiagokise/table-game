'use client';

import { useState } from 'react';
import Board from './components/Board';
import PlayerComponent from './components/Player';
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

      const currentPlayer = prevState.players[prevState.currentPlayerIndex];
      let newPosition = currentPlayer.position;
      let newScore = currentPlayer.score;

      if (isCorrect) {
        newPosition = currentPlayer.position + diceRoll;
        newScore = currentPlayer.score + diceRoll;
        if (newPosition >= WINNING_POSITION) {
          setWinner(true);
          newPosition = WINNING_POSITION;
        }
      } else {
        newPosition = Math.max(0, currentPlayer.position - diceRoll);
        newScore = currentPlayer.score - diceRoll;
      }

      const newPlayers = [...prevState.players];
      newPlayers[prevState.currentPlayerIndex] = {
        ...currentPlayer,
        position: newPosition,
        score: newScore,
      };

      const nextPlayerIndex = (prevState.currentPlayerIndex + 1) % prevState.players.length;

      return {
        ...prevState,
        players: newPlayers,
        isQuizVisible: false,
        currentQuestion: null,
        currentPlayerIndex: nextPlayerIndex,
      };
    });
    setDiceRoll(null);
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setWinner(false);
    setDiceRoll(null);
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <main>
      {/* <h1>Table Game</h1> */}
      <h2 style={{ fontSize: '24px', position: 'absolute', top: '20px', right: '20px', backgroundColor: `${currentPlayer.color}`, padding: '8px', borderRadius: '4px', color: 'white' }}>
        Jogador da vez: {currentPlayer.id}
      </h2>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'baseline',
          // justifyContent: 'center',
          gap: '4px',
          // position: 'absolute',

        }}
      >
        {gameState.players.map((player) => (
          <li
            key={player.id}
            className={player.color}
            style={{
              // color: 'white',
              // padding: '10px',
              marginBottom: '5px',
              borderRadius: '5px',
            }}
          >
            Jogador {player.id}: {player.score}
          </li>
        ))}
      </ul>
      <button onClick={resetGame} className="restart-button">
        Restart Game
      </button>
      <Board>
        <>
          <Dice onRoll={handleRoll} disabled={gameState.isQuizVisible} currentRoll={diceRoll} currentPlayer={currentPlayer} />
          {gameState.players.map((player) => (
            <PlayerComponent key={player.id} player={player} />
          ))}
        </>
      </Board>
      {winner ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          <h2 style={{ fontSize: '36px', color: 'green' }}>
            Player {currentPlayer.id} Wins!
          </h2>
          <button
            onClick={resetGame}
            className="restart-button"
            style={{ marginTop: '10px' }}
          >
            Play Again
          </button>
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
