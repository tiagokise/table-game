'use client';

import { useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import PlayerComponent from './components/Player';
import Dice from './components/Dice';
import Quiz from './components/Quiz';
import SubjectSelector from './components/SubjectSelector';
import { initialGameState } from './game/game-state';
import { questions } from './game/questions';
import { SUBJECTS } from './game/subjects';
import { GameState, Question, Subject } from './game/types';

const Board = dynamic(() => import('./components/Board'), { ssr: false });
// const PdfUploaderDynamic = dynamic(() => import('./components/PdfUploader'), { ssr: false });

const WINNING_POSITION = 35;
const FEEDBACK_DURATION = 1500;
const STEP_DURATION = 480;
const CELL_STEP_DURATION = 520;
const LANDING_DURATION = 720;

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [winner, setWinner] = useState(false);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [moveDirection, setMoveDirection] = useState<'forward' | 'backward' | null>(null);
  const [steppedCells, setSteppedCells] = useState<number[]>([]);
  const [landingCell, setLandingCell] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const auxTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const activeQuestions = useMemo(() => {
    if (customQuestions && customQuestions.length > 0) return customQuestions;
    if (selectedSubject) return questions.filter((q) => q.subject === selectedSubject);
    return questions;
  }, [customQuestions, selectedSubject]);

  const clearAuxTimers = () => {
    auxTimersRef.current.forEach(clearTimeout);
    auxTimersRef.current = [];
  };

  const scheduleAux = (fn: () => void, delay: number) => {
    const t = setTimeout(() => {
      auxTimersRef.current = auxTimersRef.current.filter((x) => x !== t);
      fn();
    }, delay);
    auxTimersRef.current.push(t);
  };

  // const handleSetCustomQuestions = (newQuestions: Question[]) => {
  //   setCustomQuestions(newQuestions);
  // };

  const handleRoll = (diceValue: number) => {
    if (winner || gameState.isQuizVisible) return;

    setDiceRoll(diceValue);
    const randomQuestion = activeQuestions[Math.floor(Math.random() * activeQuestions.length)];

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

  const animatePlayer = (currentPos: number, targetPos: number) => {
    if (currentPos === targetPos) {
      setGameState((prev) => ({ ...prev, diceValue: null, currentQuestion: null }));
      setDiceRoll(null);
      animationTimerRef.current = null;
      setLandingCell(targetPos);
      scheduleAux(() => {
        setLandingCell(null);
        setIsMoving(false);
        setMoveDirection(null);
        if (targetPos >= WINNING_POSITION) {
          setWinner(true);
        }
      }, LANDING_DURATION);
      return;
    }

    const direction = targetPos > currentPos ? 1 : -1;
    const nextPos = currentPos + direction;

    setSteppedCells((prev) => [...prev, nextPos]);
    scheduleAux(() => {
      setSteppedCells((prev) => prev.filter((c) => c !== nextPos));
    }, CELL_STEP_DURATION);

    setGameState((prev) => {
      const newPlayers = [...prev.players];
      newPlayers[prev.currentPlayerIndex] = {
        ...newPlayers[prev.currentPlayerIndex],
        position: nextPos,
        score: nextPos,
      };
      return { ...prev, players: newPlayers };
    });

    animationTimerRef.current = setTimeout(
      () => animatePlayer(nextPos, targetPos),
      STEP_DURATION,
    );
  };

  const handleAnswer = (isCorrect: boolean) => {
    const diceValue = gameState.diceValue ?? 0;
    const currentPosition = gameState.players[gameState.currentPlayerIndex].position;
    const targetPosition = isCorrect
      ? Math.min(currentPosition + diceValue, WINNING_POSITION)
      : Math.max(currentPosition - diceValue, 0);

    setGameState((prev) => ({ ...prev, isQuizVisible: false }));
    setFeedback({
      message: isCorrect ? 'Você respondeu corretamente!' : 'Você respondeu incorretamente!',
      isCorrect,
    });

    animationTimerRef.current = setTimeout(() => {
      setFeedback(null);
      if (targetPosition !== currentPosition) {
        setIsMoving(true);
        setMoveDirection(targetPosition > currentPosition ? 'forward' : 'backward');
      }
      animatePlayer(currentPosition, targetPosition);
    }, FEEDBACK_DURATION);
  };

  const resetGame = () => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    clearAuxTimers();
    setGameState(initialGameState);
    setWinner(false);
    setDiceRoll(null);
    setCustomQuestions(null);
    setFeedback(null);
    setIsMoving(false);
    setMoveDirection(null);
    setSteppedCells([]);
    setLandingCell(null);
    setSelectedSubject(null);
    setHasStarted(false);
  };

  const handleStart = (subject: Subject | null) => {
    setSelectedSubject(subject);
    setHasStarted(true);
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const hasRolled = gameState.diceValue !== null;
  const activeSubjectInfo = selectedSubject
    ? SUBJECTS.find((s) => s.id === selectedSubject)
    : null;

  const cameraFocus = useMemo(() => {
    const pos = currentPlayer.position;
    let row = 1;
    let col = 1;
    if (pos >= 0 && pos <= 9) {
      row = 1;
      col = pos + 1;
    } else if (pos >= 10 && pos <= 18) {
      row = pos - 10 + 2;
      col = 10;
    } else if (pos >= 19 && pos <= 27) {
      row = 10;
      col = 10 - (pos - 18);
    } else if (pos >= 28 && pos <= 35) {
      row = 10 - (pos - 27);
      col = 1;
    }
    return {
      x: (col - 0.5) * 10,
      y: (row - 0.5) * 10,
    };
  }, [currentPlayer.position]);

  return (
    <main className={`game-container ${isMoving ? 'focus-mode' : ''}`}>
      {!hasStarted && <SubjectSelector onStart={handleStart} />}
      <aside className="game-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Table Game</h1>
          <p className="sidebar-subtitle">Role o dado e responda para avançar</p>
          {hasStarted && (
            <span
              className="subject-pill"
              style={
                activeSubjectInfo
                  ? { ['--chip-color' as string]: activeSubjectInfo.color }
                  : undefined
              }
            >
              {activeSubjectInfo
                ? `${activeSubjectInfo.emoji} ${activeSubjectInfo.label}`
                : '🎲 Todos os assuntos'}
            </span>
          )}
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

        {/* <details className="uploader-details">
          <summary className="uploader-summary">
            <span>Perguntas Personalizadas</span>
            <span className="chevron" aria-hidden>▾</span>
          </summary>
          <PdfUploaderDynamic
            onQuestionsExtracted={handleSetCustomQuestions}
          />
        </details> */}

        <button onClick={resetGame} className="restart-button">
          Reiniciar Jogo
        </button>
      </aside>

      <Board
        isMoving={isMoving}
        moveDirection={moveDirection}
        steppedCells={steppedCells}
        landingCell={landingCell}
        focusX={cameraFocus.x}
        focusY={cameraFocus.y}
      >
        <PlayerComponent player={currentPlayer} isMoving={isMoving} />
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
          <div className="quiz simple-modal">
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
