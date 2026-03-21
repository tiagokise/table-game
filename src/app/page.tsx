'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PlayerComponent from './components/Player';
import Dice from './components/Dice';
import Quiz from './components/Quiz';
import PdfUploader from './components/PdfUploader';
import { initialGameState } from './game/game-state';
import { questions } from './game/questions';
import { GameState, Question } from './game/types';
import useWebSocket from './hooks/useWebSocket';

const Board = dynamic(() => import('./components/Board'), { ssr: false });
const PdfUploaderDynamic = dynamic(() => import('./components/PdfUploader'), { ssr: false });

const WINNING_POSITION = 35;

export default function Home() {
  const [room, setRoom] = useState<string | null>(null);
  const [roomInput, setRoomInput] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const { messages, sendMessage } = useWebSocket(room);
  const [winner, setWinner] = useState(false);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'gameState') {
        setGameState(lastMessage.payload);
        setDiceRoll(lastMessage.payload.diceValue);
      } else if (lastMessage.type === 'playerAssignment') {
        setPlayerId(lastMessage.payload.playerId);
      }
    }
  }, [messages]);

  const handleSetCustomQuestions = (newQuestions: Question[]) => {
    setCustomQuestions(newQuestions);
  };

  const handleRoll = (diceValue: number) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (winner || gameState.isQuizVisible || gameState.players.length < 2 || !currentPlayer || currentPlayer.id !== playerId) return;

    setDiceRoll(diceValue);
    const questionSource = customQuestions || questions;
    const randomQuestion = questionSource[Math.floor(Math.random() * questionSource.length)];

    sendMessage({
      type: 'rollDice',
      payload: {
        diceValue,
        question: randomQuestion,
        playerId,
      },
    });
  };

  const handleShowQuestion = () => {
    sendMessage({
      type: 'showQuestion',
      payload: { playerId },
    });
  };

  const handleAnswer = (isCorrect: boolean) => {
    sendMessage({
      type: 'answerQuestion',
      payload: {
        isCorrect,
        playerId,
      },
    });
  };

  const resetGame = () => {
    sendMessage({ type: 'resetGame', payload: { playerId } });
    setWinner(false);
    setCustomQuestions(null);
  };

  const handleJoinRoom = () => {
    if (roomInput.trim()) {
      setRoom(roomInput.trim());
    }
  };

  if (!room) {
    return (
      <div className="room-selection">
        <input
          type="text"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
          placeholder="Enter room name"
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer && currentPlayer.id === playerId;
  const hasRolled = gameState.diceValue !== null;

  return (
    <main className="game-container">
      <aside className="game-sidebar">
        <h2>Room: {room}</h2>
        {playerId && <h3>You are Player {playerId}</h3>}
        
        <div className="turn-indicator" style={{ backgroundColor: currentPlayer?.color || '#ccc' }}>
          Turn: Player {currentPlayer?.id || '-'}
        </div>
        
        <h3>Players & Scores</h3>
        <ul className="scores-list">
          {gameState.players.map((player) => (
            <li key={player.id} style={{ color: player.color, fontWeight: player.id === playerId ? 'bold' : 'normal' }}>
              Player {player.id}: {player.score} points
            </li>
          ))}
        </ul>
        
        {gameState.players.length < 2 && <p>Waiting for more players...</p>}
        
        {isMyTurn && hasRolled && !gameState.isQuizVisible && (
          <button onClick={handleShowQuestion} className="restart-button" style={{backgroundColor: '#35a1d2'}}>
            Show Question
          </button>
        )}

        <button onClick={resetGame} className="restart-button">
          Restart Game
        </button>

        <PdfUploaderDynamic onQuestionsExtracted={handleSetCustomQuestions} />
      </aside>

      <Board>
        {gameState.players.map((player) => (
          <PlayerComponent key={player.id} player={player} allPlayers={gameState.players} />
        ))}
        <Dice onRoll={handleRoll} disabled={!isMyTurn || hasRolled || gameState.isQuizVisible || gameState.players.length < 2} currentRoll={diceRoll} currentPlayer={currentPlayer} />
      </Board>

      {winner && (
        <div className="quiz-overlay">
          <div className="quiz">
            <h2>Player {currentPlayer.id} Wins!</h2>
            <button onClick={resetGame} className="restart-button">
              Play Again
            </button>
          </div>
        </div>
      )}

      {gameState.isQuizVisible && gameState.currentQuestion && (
        <div className="quiz-overlay">
          <Quiz question={gameState.currentQuestion} onAnswer={handleAnswer} />
        </div>
      )}
    </main>
  );
}
