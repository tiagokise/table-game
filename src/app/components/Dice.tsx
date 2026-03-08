'use client';

import { useState } from 'react';

interface DiceProps {
  onRoll: (value: number) => void;
}

export default function Dice({ onRoll }: DiceProps) {
  const [diceValue, setDiceValue] = useState<number | null>(null);

  const rollDice = () => {
    const newValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(newValue);
    onRoll(newValue);
  };

  return (
    <button onClick={rollDice} className="dice">
      {diceValue === null ? (
        'Roll Dice'
      ) : (
        <img src={`/dice-${diceValue}.png`} alt={`Dice roll: ${diceValue}`} className="dice-image" />
      )}
    </button>
  );
}
