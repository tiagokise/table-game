'use client';

interface DiceProps {
  onRoll: (value: number) => void;
  disabled: boolean;
  currentRoll: number | null;
  currentPlayer: any;
}

export default function Dice({ onRoll, disabled, currentRoll, currentPlayer }: DiceProps) {
  const rollDice = () => {
    const newValue = Math.floor(Math.random() * 6) + 1;
    onRoll(newValue);
  };

  return (
    <button onClick={rollDice} className="dice" disabled={disabled} style={{ backgroundColor: "lightGray", color: 'black' }}>
      {currentRoll === null ? (
        'Rolar o Dado'
      ) : (
        <img src={`/dice-${currentRoll}.png`} alt={`Dice roll: ${currentRoll}`} className="dice-image" style={{ backgroundColor: `${currentRoll !== null ? 'white' : currentPlayer.color}` }} />
      )}
    </ button>
  );
}
