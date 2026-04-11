'use client';

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
    <button onClick={rollDice} className="dice" disabled={disabled} style={{ backgroundColor: "lightGray", color: 'black' }}>
      {currentRoll === null ? (
        'Rolar Dado'
      ) : (
        <img src={`/dice-${currentRoll}.png`} alt={`Dado: ${currentRoll}`} className="dice-image" />
      )}
    </ button>
  );
}
