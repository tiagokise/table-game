// components/Board.tsx
import React from 'react';
import PlayerComponent from './Player'; // Import PlayerComponent to use its type
import { getSpecialCell } from '../game/board-config';
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

  const getPerimeterCells = () => {
    const cells = [];
    let pathIndex = 1;

    // Top row
    for (let i = 0; i < 10; i++) {
      cells.push({ path: pathIndex++, row: 1, col: i + 1 });
    }
    // Right column
    for (let i = 1; i < 10; i++) {
      cells.push({ path: pathIndex++, row: i + 1, col: 10 });
    }
    // Bottom row
    for (let i = 8; i >= 0; i--) {
      cells.push({ path: pathIndex++, row: 10, col: i + 1 });
    }
    // Left column
    for (let i = 8; i > 0; i--) {
      cells.push({ path: pathIndex++, row: i + 1, col: 1 });
    }
    return cells;
  };

  const perimeterCells = getPerimeterCells();
  
  // Separate players from other children (like the Dice)
  const players: React.ReactNode[] = [];
  const otherChildren: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && typeof child.type === 'function' && child.type.name === PlayerComponent.name) {
      players.push(child);
    } else {
      otherChildren.push(child);
    }
  });

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
        {perimeterCells.map(({ path, row, col }) => {
          const position = path - 1;
          const isStepped = steppedCells.includes(position);
          const isLanding = landingCell === position;
          const special = getSpecialCell(position);
          const isSpecialTriggered = triggeredSpecial?.position === position;
          const cellClassName = [
            'cell',
            path % 2 === 0 ? 'even' : '',
            isStepped ? 'cell-stepped' : '',
            isStepped && moveDirection === 'forward' ? 'cell-stepped--forward' : '',
            isStepped && moveDirection === 'backward' ? 'cell-stepped--backward' : '',
            isLanding ? 'cell-landing' : '',
            special ? `cell-special cell-special--${special.type}` : '',
            isSpecialTriggered ? 'cell-special--triggered' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={path}
              className={cellClassName}
              style={{ gridRow: row, gridColumn: col }}
            >
              <span className="cell-path">{path}</span>
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
        <div
          className="center-content-container"
          style={{ gridRow: '2 / 10', gridColumn: '2 / 10' }}
        >
          {otherChildren}
        </div>
        {players}
      </div>
    </div>
  );
};

export default Board;
