import type { BoardConfig } from '../game/board-config';

interface BoardSilhouetteProps {
  boardConfig: BoardConfig;
  accentColor: string;
}

const BoardSilhouette = ({ boardConfig, accentColor }: BoardSilhouetteProps) => {
  const { cols, rows, path } = boardConfig;
  const cellSize = 10;
  const padding = cellSize / 2;
  const width = cols * cellSize;
  const height = rows * cellSize;

  const points = path
    .map((cell) => {
      const cx = (cell.col - 1) * cellSize + cellSize / 2;
      const cy = (cell.row - 1) * cellSize + cellSize / 2;
      return `${cx},${cy}`;
    })
    .join(' ');

  const start = path[0];
  const end = path[path.length - 1];
  const startX = (start.col - 1) * cellSize + cellSize / 2;
  const startY = (start.row - 1) * cellSize + cellSize / 2;
  const endX = (end.col - 1) * cellSize + cellSize / 2;
  const endY = (end.row - 1) * cellSize + cellSize / 2;

  return (
    <svg
      className="board-silhouette"
      viewBox={`${-padding} ${-padding} ${width + padding * 2} ${height + padding * 2}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={accentColor}
        strokeWidth={cellSize * 0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
      <circle cx={startX} cy={startY} r={cellSize * 0.5} fill={accentColor} />
      <circle
        cx={endX}
        cy={endY}
        r={cellSize * 0.7}
        fill="white"
        stroke={accentColor}
        strokeWidth={cellSize * 0.25}
      />
      <text
        x={endX}
        y={endY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={cellSize * 0.9}
      >
        🏁
      </text>
    </svg>
  );
};

export default BoardSilhouette;
