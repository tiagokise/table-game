// components/Player.tsx
import React from 'react';
import Image from 'next/image';
import { Player } from '../game/types';

interface PlayerProps {
  player: Player;
}

const PlayerComponent = ({ player }: PlayerProps) => {
  const getPlayerPosition = (pos: number) => {
    let row = 1;
    let col = 1;

    const p = pos;

    if (p >= 0 && p <= 9) {
      row = 1;
      col = p + 1;
    } else if (p >= 10 && p <= 18) {
      row = p - 10 + 2;
      col = 10;
    } else if (p >= 19 && p <= 27) {
      row = 10;
      col = 10 - (p - 18);
    } else if (p >= 28 && p <= 35) {
      row = 10 - (p - 27);
      col = 1;
    }

    return {
      gridRowStart: row,
      gridColumnStart: col,
    };
  };

  const style: React.CSSProperties = {
    ...getPlayerPosition(player.position),
    backgroundColor: player.color,
  };

  return (
    <div
      className={`player ${player.color}`}
      style={style}
    >
      <Image
        src="/aliens-1300-svgrepo-com.png"
        alt="Player"
        fill
        sizes="(max-width: 768px) 7vw, 4.5vmin"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
};

export default PlayerComponent;
