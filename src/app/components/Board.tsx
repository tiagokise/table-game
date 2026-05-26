// components/Board.tsx
import React from 'react';
import { PATH, getSpecialCell, GOAL_POSITION } from '../game/board-config';
import type { SpecialCellType } from '../game/types';

interface BoardProps {
  children: React.ReactNode;
  isMoving?: boolean;
  moveDirection?: 'forward' | 'backward' | null;
  steppedCells?: number[];
  landingCell?: number | null;
  focusX?: number;
  focusY?: number;
  triggeredSpecial?: { position: number; type: SpecialCellType } | null;
}

const Board = ({
  children,
  isMoving = false,
  moveDirection = null,
  steppedCells = [],
  landingCell = null,
  focusX = 50,
  focusY = 50,
  triggeredSpecial = null,
}: BoardProps) => {
  const burstColor = moveDirection === 'backward' ? '#fca5a5' : '#86efac';
  const boardClassName = [
    'board',
    isMoving ? 'moving' : '',
    landingCell !== null ? 'shake' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const boardStyle = {
    ['--focus-x' as string]: focusX,
    ['--focus-y' as string]: focusY,
  } as React.CSSProperties;

  return (
    <div className="board-container">
      <div className={boardClassName} style={boardStyle}>
        {PATH.map((cell, i) => {
          const position = i;
          const pathNumber = i + 1;
          const isStepped = steppedCells.includes(position);
          const isLanding = landingCell === position;
          const special = getSpecialCell(position);
          const isSpecialTriggered = triggeredSpecial?.position === position;
          const isGoal = position === GOAL_POSITION;
          const cellClassName = [
            'cell',
            pathNumber % 2 === 0 ? 'even' : '',
            isStepped ? 'cell-stepped' : '',
            isStepped && moveDirection === 'forward' ? 'cell-stepped--forward' : '',
            isStepped && moveDirection === 'backward' ? 'cell-stepped--backward' : '',
            isLanding ? 'cell-landing' : '',
            special ? `cell-special cell-special--${special.type}` : '',
            isSpecialTriggered ? 'cell-special--triggered' : '',
            isGoal ? 'cell-goal' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={pathNumber}
              className={cellClassName}
              style={{ gridRow: cell.row, gridColumn: cell.col }}
            >
              {isGoal ? (
                <span className="cell-goal-flag" aria-label="Linha de chegada">🏁</span>
              ) : (
                <span className="cell-path">{pathNumber}</span>
              )}
              {special && (
                <span className="cell-special-icon" aria-hidden>
                  {special.type === 'bonus' ? '⭐' : special.type === 'portal' ? '🌀' : '🎴'}
                </span>
              )}
              {isLanding && (
                <span
                  className="landing-burst"
                  style={{ ['--burst-color' as string]: burstColor }}
                />
              )}
            </div>
          );
        })}
        {children}
      </div>
    </div>
  );
};

export default Board;
