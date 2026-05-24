'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface DiceProps {
  onRoll: (value: number) => void;
  onRollStart?: () => void;
  disabled: boolean;
  currentRoll: number | null;
}

const ROLL_DURATION = 1600;
const FLICKER_INTERVAL = 110;

export default function Dice({ onRoll, onRollStart, disabled, currentRoll }: DiceProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [flickerValue, setFlickerValue] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const rollDice = () => {
    if (isRolling || disabled) return;

    const finalValue = Math.floor(Math.random() * 6) + 1;
    setIsRolling(true);
    setFlickerValue(Math.floor(Math.random() * 6) + 1);
    onRollStart?.();

    intervalRef.current = setInterval(() => {
      setFlickerValue(Math.floor(Math.random() * 6) + 1);
    }, FLICKER_INTERVAL);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      timeoutRef.current = null;
      setIsRolling(false);
      setFlickerValue(null);
      onRoll(finalValue);
    }, ROLL_DURATION);
  };

  const displayValue = isRolling ? flickerValue : currentRoll;

  return (
    <button
      onClick={rollDice}
      className={`dice ${isRolling ? 'dice--rolling' : ''}`}
      disabled={disabled || isRolling}
    >
      {displayValue === null ? (
        <span className="dice-label">Rolar Dado</span>
      ) : (
        <Image
          src={`/dice-${displayValue}.png`}
          alt={`Dado: ${displayValue}`}
          className="dice-image"
          width={50}
          height={50}
        />
      )}
    </button>
  );
}
