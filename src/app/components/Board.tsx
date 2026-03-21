// components/Board.tsx
import React from 'react';

interface BoardProps {
  children: React.ReactNode;
}

const Board = ({ children }: BoardProps) => {

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
    if (React.isValidElement(child) && (child.type as any).name === 'PlayerComponent') {
      players.push(child);
    } else {
      otherChildren.push(child);
    }
  });

  return (
    <div className="board-container">
      <div className="board" style={{ backgroundImage: 'url("/bg-table-board.png")', backgroundSize: 'cover' }}>
        {perimeterCells.map(({ path, row, col }) => (
          <div
            key={path}
            className={`cell ${path % 2 === 0 ? 'even' : ''}`}
            style={{ gridRow: row, gridColumn: col }}
          >
            {path}
          </div>
        ))}
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
