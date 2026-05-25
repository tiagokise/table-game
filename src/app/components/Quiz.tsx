import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTY_TIME_LIMITS,
  type Difficulty,
  type Question,
} from '../game/types';

interface QuizProps {
  question: Question;
  onAnswer: (isCorrect: boolean, timedOut?: boolean) => void;
  hasSecondChance?: boolean;
  difficulty?: Difficulty;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Quiz({
  question,
  onAnswer,
  hasSecondChance = false,
  difficulty: sessionDifficulty,
}: QuizProps) {
  const shuffledOptions = useMemo(() => shuffle(question.options), [question]);
  const difficulty: Difficulty = sessionDifficulty ?? question.difficulty ?? DEFAULT_DIFFICULTY;
  const totalTime = DIFFICULTY_TIME_LIMITS[difficulty];

  const [remaining, setRemaining] = useState(totalTime);
  const answeredRef = useRef(false);

  useEffect(() => {
    answeredRef.current = false;
    setRemaining(totalTime);

    const intervalId = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (!answeredRef.current) {
            answeredRef.current = true;
            onAnswer(false, true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [question, totalTime, onAnswer]);

  const handleClick = (option: string) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    onAnswer(option === question.answer);
  };

  const progress = Math.max(0, (remaining / totalTime) * 100);
  const isLow = remaining <= Math.max(3, Math.floor(totalTime * 0.3));

  return (
    <div className="quiz">
      {hasSecondChance && (
        <div className="quiz-second-chance" aria-label="Chance extra ativa">
          🎴 Se errar essa, você ganha uma nova pergunta
        </div>
      )}
      <div className="quiz-header">
        <div className="quiz-meta">
          <span className={`difficulty-badge difficulty-${difficulty}`}>
            {DIFFICULTY_LABELS[difficulty]}
          </span>
          <span className={`quiz-timer ${isLow ? 'is-low' : ''}`} aria-live="polite">
            ⏱️ {remaining}s
          </span>
        </div>
        <div className="quiz-timer-bar" aria-hidden>
          <div
            className={`quiz-timer-bar-fill ${isLow ? 'is-low' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <h2>{question.question}</h2>
      </div>
      <div className="options">
        {shuffledOptions.map((option) => (
          <button key={option} onClick={() => handleClick(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
