'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PlayerComponent from './components/Player';
import Dice from './components/Dice';
import Quiz from './components/Quiz';
import { initialGameState } from './game/game-state';
import { questions } from './game/questions';
import { GameState, Question } from './game/types';
import usePusher from './hooks/usePusher';

const Board = dynamic(() => import('./components/Board'), { ssr: false });
const PdfUploaderDynamic = dynamic(() => import('./components/PdfUploader'), { ssr: false });

const WINNING_POSITION = 35;

export default function Home() {
  const [room, setRoom] = useState<string | null>(null);
  const [roomInput, setRoomInput] = useState<string>('');
  const [localGameState, setLocalGameState] = useState<GameState>(initialGameState);
  const { gameState, playerId, emit } = usePusher(room);
  const [winner, setWinner] = useState(false);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

  useEffect(() => {
    if (gameState) {
      setLocalGameState(gameState);
      setDiceRoll(gameState.diceValue);

      if (gameState.lastAnswerResult) {
        if (gameState.lastAnswerResult.isCorrect) {
          setFeedback({ message: `Jogador ${gameState.lastAnswerResult.playerId} respondeu corretamente!`, isCorrect: true });
        } else {
          setFeedback({ message: `Jogador ${gameState.lastAnswerResult.playerId} respondeu incorretamente!`, isCorrect: false });
        }
        setTimeout(() => setFeedback(null), 2000);
      }
    }
  }, [gameState]);

  const handleSetCustomQuestions = (newQuestions: Question[]) => {
    setCustomQuestions(newQuestions);
  };

  const handleRoll = (diceValue: number) => {
    const currentPlayer = localGameState.players[localGameState.currentPlayerIndex];
    if (winner || localGameState.isQuizVisible || localGameState.players.length < 2 || !currentPlayer || currentPlayer.id !== playerId) return;

    setDiceRoll(diceValue);
    const questionSource = customQuestions || questions;
    const randomQuestion = questionSource[Math.floor(Math.random() * questionSource.length)];

    emit('rollDice', {
      diceValue,
      question: randomQuestion,
      playerId,
    });
  };

  const handleShowQuestion = () => {
    emit('showQuestion', { playerId });
  };

  const handleAnswer = (isCorrect: boolean) => {
    emit('answerQuestion', {
      isCorrect,
      playerId,
    });
  };

  const resetGame = () => {
    emit('resetGame', { playerId });
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
          placeholder="Nome da Sala"
        />
        <button onClick={handleJoinRoom}>Entrar na Sala</button>
      </div>
    );
  }

  const currentPlayer = localGameState.players[localGameState.currentPlayerIndex];
  const isMyTurn = currentPlayer && currentPlayer.id === playerId;
  const hasRolled = localGameState.diceValue !== null;
  const questionsLoaded = customQuestions !== null;

  return (
    <main className="game-container">
      <aside className="game-sidebar">
        <h2>Sala: {room}</h2>
        {playerId && <h3>Você é o Jogador {playerId}</h3>}

        <div className="turn-indicator" style={{ backgroundColor: currentPlayer?.color || '#ccc' }}>
          Vez: Jogador {currentPlayer?.id || '-'}
        </div>

        <h3>Jogadores e Pontuações</h3>
        <ul className="scores-list">
          {localGameState.players.map((player) => (
            <li key={player.id} style={{ color: player.color, fontWeight: player.id === playerId ? 'bold' : 'normal' }}>
              Jogador {player.id}: {player.score} pontos
            </li>
          ))}
        </ul>

        {localGameState.players.length < 2 && <p>Aguardando mais jogadores...</p>}

        <button onClick={resetGame} className="restart-button">
          Reiniciar Jogo
        </button>
        <PdfUploaderDynamic
          onQuestionsExtracted={handleSetCustomQuestions}
          currentPlayerId={currentPlayer?.id || 0}
          playerId={playerId || 0}
          questionsLoaded={questionsLoaded}
        />
        </aside>

        <Board>
        {localGameState.players.map((player) => (
          <PlayerComponent key={player.id} player={player} allPlayers={localGameState.players} />
        ))}
        <Dice onRoll={handleRoll} disabled={hasRolled || localGameState.isQuizVisible || localGameState.players.length < 2} currentRoll={diceRoll} currentPlayer={currentPlayer} isMyTurn={isMyTurn} />
        {isMyTurn && hasRolled && !localGameState.isQuizVisible && (
          <button onClick={handleShowQuestion} className="show-question-button" style={{backgroundColor: currentPlayer?.color || '#35a1d2'}}>
            Ver Pergunta
          </button>
        )}
        </Board>

        {feedback && (
          <div className="quiz-overlay">
            <div className={`quiz feedback-modal ${!feedback.isCorrect ? 'error' : ''}`}>
              <h2>{feedback.message}</h2>
            </div>
          </div>
        )}

        {winner && (
          <div className="quiz-overlay">
            <div className="quiz">
              <h2>Jogador {currentPlayer.id} Venceu!</h2>            <button onClick={resetGame} className="restart-button">
              Jogar Novamente
            </button>
          </div>
        </div>
        )}

        {localGameState.isQuizVisible && localGameState.currentQuestion && (
        <div className="quiz-overlay">
          <Quiz question={localGameState.currentQuestion} onAnswer={handleAnswer} />
        </div>
        )}
        </main>  );
}
