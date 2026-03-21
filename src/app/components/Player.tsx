// components/Player.tsx
import React from 'react';
import Image from 'next/image';
import { Player } from '../game/types';

interface PlayerProps {
  player: Player;
  allPlayers: Player[];
}

const PlayerComponent = ({ player, allPlayers }: PlayerProps) => {
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

  const playersOnSameSquare = allPlayers.filter(p => p.position === player.position);
  const indexOnSquare = playersOnSameSquare.findIndex(p => p.id === player.id);
  
  const offsets = [
    { transform: 'translate(-25%, -25%)' }, // Top-left
    { transform: 'translate(25%, -25%)' },  // Top-right
    { transform: 'translate(-25%, 25%)' },  // Bottom-left
    { transform: 'translate(25%, 25%)' },   // Bottom-right
  ];

  const style: React.CSSProperties = {
    ...getPlayerPosition(player.position),
    backgroundColor: player.color,
    zIndex: indexOnSquare + 1,
  };

  if (playersOnSameSquare.length > 1) {
    Object.assign(style, offsets[indexOnSquare % 4]);
  }

  return (
    <div
      className={`player ${player.color}`}
      style={style}
    >
      <Image
        src="/aliens-1300-svgrepo-com.png"
        alt="Player"
        layout="fill"
        objectFit="contain"
      />
    </div>
  );
};

export default PlayerComponent;
