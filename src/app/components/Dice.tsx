'use client';

interface DiceProps {
  onRoll: (value: number) => void;
  disabled: boolean;
  currentRoll: number | null;
  currentPlayer: any;
  isMyTurn: boolean;
}

export default function Dice({ onRoll, disabled, currentRoll, currentPlayer, isMyTurn }: DiceProps) {
  const rollDice = () => {
    const newValue = Math.floor(Math.random() * 6) + 1;
    onRoll(newValue);
  };

  if (!isMyTurn) {
    return <div className="dice not-my-turn" style={{ backgroundColor: "#ccc", color: 'black' }}>Aguarde sua vez</div>;
  }

  return (
    <button onClick={rollDice} className="dice" disabled={disabled} style={{ backgroundColor: "lightGray", color: 'black' }}>
      {currentRoll === null ? (
        'Rolar Dado'
      ) : (
        <img src={`/dice-${currentRoll}.png`} alt={`Dado: ${currentRoll}`} className="dice-image" style={{ backgroundColor: `${currentRoll !== null ? 'white' : currentPlayer.color}` }} />
      )}
    </ button>
  );
}
