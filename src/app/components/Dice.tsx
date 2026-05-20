'use client';

import Image from 'next/image';

interface DiceProps {
  onRoll: (value: number) => void;
  disabled: boolean;
  currentRoll: number | null;
}

export default function Dice({ onRoll, disabled, currentRoll }: DiceProps) {
  const rollDice = () => {
    const newValue = Math.floor(Math.random() * 6) + 1;
    onRoll(newValue);
  };

  return (
    <button onClick={rollDice} className="dice" disabled={disabled}>
      {currentRoll === null ? (
        <span className="dice-label">Rolar Dado</span>
      ) : (
        <Image src={`/dice-${currentRoll}.png`} alt={`Dado: ${currentRoll}`} className="dice-image" width={50} height={50} />
      )}
    </button>
  );
}
