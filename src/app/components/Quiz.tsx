interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface QuizProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
}

export default function Quiz({ question, onAnswer }: QuizProps) {
  return (
    <div className="quiz">
      <h2>{question.question}</h2>
      <div className="options">
        {question.options.map((option) => (
          <button key={option} onClick={() => onAnswer(option === question.answer)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
