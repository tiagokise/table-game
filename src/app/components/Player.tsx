// components/Player.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Player } from '../game/types';
import type { PathCell } from '../game/board-config';

interface PlayerProps {
  player: Player;
  path: PathCell[];
  isMoving?: boolean;
}

const HOP_DURATION = 460;

const PlayerComponent = ({ player, path, isMoving = false }: PlayerProps) => {
  const [hopping, setHopping] = useState(false);
  const prevPosRef = useRef(player.position);

  useEffect(() => {
    if (prevPosRef.current === player.position) return;
    prevPosRef.current = player.position;
    setHopping(true);
    const timer = setTimeout(() => setHopping(false), HOP_DURATION);
    return () => clearTimeout(timer);
  }, [player.position]);

  const cell = path[player.position] ?? path[0];

  const style: React.CSSProperties = {
    gridRowStart: cell.row,
    gridColumnStart: cell.col,
    ['--player-color' as string]: player.color,
  };

  return (
    <div
      className={`player ${hopping ? 'hopping' : ''} ${isMoving ? 'player--focus' : ''}`}
      style={style}
      aria-label={`Jogador na casa ${player.position}`}
    >
      <span className="player-marble" />
    </div>
  );
};

export default PlayerComponent;
