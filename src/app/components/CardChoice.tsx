'use client';

import { useMemo, useState } from 'react';

interface CardChoiceProps {
  onDone: (won: boolean) => void;
}

const CARD_COUNT = 3;

export default function CardChoice({ onDone }: CardChoiceProps) {
  const winningIndex = useMemo(() => Math.floor(Math.random() * CARD_COUNT), []);
  const [picked, setPicked] = useState<number | null>(null);

  const revealed = picked !== null;
  const won = picked === winningIndex;

  const handlePick = (index: number) => {
    if (revealed) return;
    setPicked(index);
  };

  return (
    <div className="card-choice">
      <div className="card-choice-header">
        <h2>🎴 Carta da Sorte</h2>
        <p>
          {revealed
            ? won
              ? 'Você ganhou uma chance extra! No próximo erro, recebe uma nova pergunta.'
              : 'Sem prêmio dessa vez. Boa sorte na próxima!'
            : 'Escolha uma das três cartas. Uma delas dá uma chance extra de resposta.'}
        </p>
      </div>

      <div className="card-choice-grid">
        {Array.from({ length: CARD_COUNT }).map((_, index) => {
          const isWinner = index === winningIndex;
          const isPicked = index === picked;
          const classes = [
            'card',
            revealed ? 'revealed' : '',
            isPicked ? 'picked' : '',
            revealed && isWinner ? 'winner' : '',
            revealed && !isWinner ? 'blank' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={index}
              type="button"
              className={classes}
              onClick={() => handlePick(index)}
              disabled={revealed}
              aria-label={`Carta ${index + 1}`}
            >
              <span className="card-inner">
                <span className="card-face card-back" aria-hidden>
                  <span className="card-back-mark">?</span>
                </span>
                <span className="card-face card-front" aria-hidden>
                  {isWinner ? '🎁' : '💨'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <button
          type="button"
          className="card-choice-continue"
          onClick={() => onDone(won)}
        >
          Continuar
        </button>
      )}
    </div>
  );
}
