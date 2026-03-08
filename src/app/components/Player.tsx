// components/Player.tsx
import React from 'react';
import Image from 'next/image';

interface PlayerProps {
  position: number;
}

const Player = ({ position }: PlayerProps) => {
  const getPlayerPosition = (pos: number) => {
    let row = 1;
    let col = 1;

    // Adjust position to be 0-indexed for calculations
    const p = pos;

    if (p >= 0 && p <= 9) {
      // Top row
      row = 1;
      col = p + 1;
    } else if (p >= 10 && p <= 18) {
      // Right column
      row = p - 10 + 2;
      col = 10;
    } else if (p >= 19 && p <= 27) {
      // Bottom row
      row = 10;
      col = 10 - (p - 18);
    } else if (p >= 28 && p <= 35) {
      // Left column
      row = 10 - (p - 27);
      col = 1;
    }

    return {
      gridRowStart: row,
      gridColumnStart: col,
    };
  };

  return (
    <div className="player" style={getPlayerPosition(position)}>
      <Image src="/aliens-1300-svgrepo-com.png" alt="Player" layout="fill" objectFit="contain" />
    </div>
  );
};

export default Player;
