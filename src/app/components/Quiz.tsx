import { useMemo } from 'react';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface QuizProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  hasSecondChance?: boolean;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Quiz({ question, onAnswer, hasSecondChance = false }: QuizProps) {
  const shuffledOptions = useMemo(() => shuffle(question.options), [question]);

  return (
    <div className="quiz">
      {hasSecondChance && (
        <div className="quiz-second-chance" aria-label="Chance extra ativa">
          🎴 Se errar essa, você ganha uma nova pergunta
        </div>
      )}
      <div className="quiz-header">
        <h2>{question.question}</h2>
      </div>
      <div className="options">
        {shuffledOptions.map((option) => (
          <button key={option} onClick={() => onAnswer(option === question.answer)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
