'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import PlayerComponent from './components/Player';
import Dice from './components/Dice';
import Quiz from './components/Quiz';
import { initialGameState } from './game/game-state';
import { questions } from './game/questions';
import { GameState, Question } from './game/types';

const Board = dynamic(() => import('./components/Board'), { ssr: false });
const PdfUploaderDynamic = dynamic(() => import('./components/PdfUploader'), { ssr: false });

const WINNING_POSITION = 35;

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [winner, setWinner] = useState(false);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

  const handleSetCustomQuestions = (newQuestions: Question[]) => {
    setCustomQuestions(newQuestions);
  };

  const handleRoll = (diceValue: number) => {
    if (winner || gameState.isQuizVisible) return;

    setDiceRoll(diceValue);
    const questionSource = customQuestions || questions;
    const randomQuestion = questionSource[Math.floor(Math.random() * questionSource.length)];

    setGameState((prev) => ({
      ...prev,
      diceValue,
      currentQuestion: randomQuestion,
      isQuizVisible: false,
    }));
  };

  const handleShowQuestion = () => {
    setGameState((prev) => ({ ...prev, isQuizVisible: true }));
  };

  const handleAnswer = (isCorrect: boolean) => {
    setGameState((prev) => {
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      let newPosition = currentPlayer.position;
      const diceValue = prev.diceValue || 0;

      if (isCorrect) {
        newPosition += diceValue;
        if (newPosition >= WINNING_POSITION) {
          newPosition = WINNING_POSITION;
          setWinner(true);
        }
        setFeedback({ message: 'Você respondeu corretamente!', isCorrect: true });
      } else {
        newPosition -= diceValue;
        if (newPosition < 0) {
          newPosition = 0;
        }
        setFeedback({ message: 'Você respondeu incorretamente!', isCorrect: false });
      }

      const newPlayers = [...prev.players];
      newPlayers[prev.currentPlayerIndex] = { ...currentPlayer, position: newPosition, score: newPosition };

      setTimeout(() => setFeedback(null), 2000);

      return {
        ...prev,
        players: newPlayers,
        isQuizVisible: false,
        diceValue: null,
      };
    });
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setWinner(false);
    setDiceRoll(null);
    setCustomQuestions(null);
    setFeedback(null);
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const hasRolled = gameState.diceValue !== null;

  return (
    <main className="game-container">
      <aside className="game-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Table Game</h1>
          <p className="sidebar-subtitle">Role o dado e responda para avançar</p>
        </div>

        <section className="score-card" style={{ borderColor: currentPlayer.color }}>
          <div className="score-card-main">
            <span className="score-label">Pontuação</span>
            <span className="score-value" style={{ color: currentPlayer.color }}>
              {currentPlayer.score}
            </span>
          </div>
          <div className="score-card-meta">
            <span className="score-meta">Casa {currentPlayer.position} de {WINNING_POSITION}</span>
            <div className="score-progress">
              <div
                className="score-progress-fill"
                style={{
                  width: `${Math.min(100, (currentPlayer.position / WINNING_POSITION) * 100)}%`,
                  backgroundColor: currentPlayer.color,
                }}
              />
            </div>
          </div>
        </section>

        <details className="uploader-details">
          <summary className="uploader-summary">
            <span>Perguntas Personalizadas</span>
            <span className="chevron" aria-hidden>▾</span>
          </summary>
          <PdfUploaderDynamic
            onQuestionsExtracted={handleSetCustomQuestions}
          />
        </details>

        <button onClick={resetGame} className="restart-button">
          Reiniciar Jogo
        </button>
      </aside>

      <Board>
        <PlayerComponent player={currentPlayer} />
        <Dice onRoll={handleRoll} disabled={hasRolled || gameState.isQuizVisible} currentRoll={diceRoll} />
        {hasRolled && !gameState.isQuizVisible && gameState.currentQuestion && (
          <button onClick={handleShowQuestion} className="show-question-button">
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
            <h2>Você Venceu!</h2>
            <button onClick={resetGame} className="restart-button">
              Jogar Novamente
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
