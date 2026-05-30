import { Difficulty, SpecialCell } from './types';

export const BONUS_EXTRA_STEPS = 2;
export const PENALTY_BACK_STEPS = 2;

export interface PathCell {
  row: number;
  col: number;
}

export interface BoardConfig {
  cols: number;
  rows: number;
  path: PathCell[];
  goalPosition: number;
  specialCells: SpecialCell[];
  specialByPosition: Record<number, SpecialCell>;
}

const buildSerpentinePath = (cols: number, lanes: number): PathCell[] => {
  const path: PathCell[] = [];
  for (let lane = 0; lane < lanes; lane++) {
    const row = lane * 2 + 1;
    const leftToRight = lane % 2 === 0;
    for (let i = 0; i < cols; i++) {
      const col = leftToRight ? i + 1 : cols - i;
      path.push({ row, col });
    }
    if (lane < lanes - 1) {
      const connectorRow = row + 1;
      const connectorCol = leftToRight ? cols : 1;
      path.push({ row: connectorRow, col: connectorCol });
    }
  }
  return path;
};

const BASE_LANES = 6;
const BASE_COLS = 12;
const BASE_PATH = buildSerpentinePath(BASE_COLS, BASE_LANES);
const BASE_LEN = BASE_PATH.length;

const BASE_SPECIALS: SpecialCell[] = [
  { position: 9, type: 'bonus' },
  { position: 15, type: 'cards' },
  { position: 20, type: 'portal', target: 35 },
  { position: 29, type: 'bonus' },
  { position: 42, type: 'penalty' },
  { position: 46, type: 'portal', target: 64 },
  { position: 53, type: 'cards' },
  { position: 57, type: 'bonus' },
  { position: 70, type: 'penalty' },
];

const scalePosition = (pos: number, baseLen: number, newLen: number): number => {
  if (baseLen <= 1) return 0;
  return Math.round((pos * (newLen - 1)) / (baseLen - 1));
};

const scaleSpecials = (
  baseSpecials: SpecialCell[],
  baseLen: number,
  newLen: number,
): SpecialCell[] => {
  const used = new Set<number>();
  const result: SpecialCell[] = [];
  const goal = newLen - 1;

  for (const special of baseSpecials) {
    const newPos = scalePosition(special.position, baseLen, newLen);
    if (newPos <= 0 || newPos >= goal) continue;
    if (used.has(newPos)) continue;

    if (special.type === 'portal') {
      const newTarget = scalePosition(special.target, baseLen, newLen);
      if (newTarget <= newPos || newTarget >= goal) continue;
      result.push({ position: newPos, type: 'portal', target: newTarget });
    } else {
      result.push({ ...special, position: newPos });
    }
    used.add(newPos);
  }

  return result;
};

const buildBoardConfig = (cols: number, lanes: number): BoardConfig => {
  const path = buildSerpentinePath(cols, lanes);
  const rows = lanes * 2 - 1;
  const goalPosition = path.length - 1;
  const specialCells = scaleSpecials(BASE_SPECIALS, BASE_LEN, path.length);
  const specialByPosition = specialCells.reduce(
    (acc, cell) => {
      acc[cell.position] = cell;
      return acc;
    },
    {} as Record<number, SpecialCell>,
  );
  return { cols, rows, path, goalPosition, specialCells, specialByPosition };
};

export const BOARD_CONFIGS: Record<Difficulty, BoardConfig> = {
  facil: buildBoardConfig(6, 4),
  medio: buildBoardConfig(8, 5),
  dificil: buildBoardConfig(BASE_COLS, BASE_LANES),
};

export const getBoardConfig = (difficulty: Difficulty): BoardConfig =>
  BOARD_CONFIGS[difficulty];

export const getPathCellFromConfig = (
  config: BoardConfig,
  pos: number,
): PathCell | undefined => config.path[pos];

export const getSpecialCellFromConfig = (
  config: BoardConfig,
  position: number,
): SpecialCell | undefined => config.specialByPosition[position];
