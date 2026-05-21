// components/Player.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Player } from '../game/types';

interface PlayerProps {
  player: Player;
}

const HOP_DURATION = 460;

const PlayerComponent = ({ player }: PlayerProps) => {
  const [hopping, setHopping] = useState(false);
  const prevPosRef = useRef(player.position);

  useEffect(() => {
    if (prevPosRef.current === player.position) return;
    prevPosRef.current = player.position;
    setHopping(true);
    const timer = setTimeout(() => setHopping(false), HOP_DURATION);
    return () => clearTimeout(timer);
  }, [player.position]);

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
    ['--player-color' as string]: player.color,
  };

  return (
    <div
      className={`player ${hopping ? 'hopping' : ''}`}
      style={style}
      aria-label={`Jogador na casa ${player.position}`}
    >
      <span className="player-marble" />
    </div>
  );
};

export default PlayerComponent;
