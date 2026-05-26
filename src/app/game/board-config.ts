import { SpecialCell } from './types';

export const BONUS_EXTRA_STEPS = 2;
export const PENALTY_BACK_STEPS = 2;
export const GRID_COLS = 12;
export const GRID_ROWS = 11;

export interface PathCell {
  row: number;
  col: number;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const PATH: PathCell[] = [
  ...range(12).map((i) => ({ row: 1, col: i + 1 })),
  { row: 2, col: 12 },
  ...range(12).map((i) => ({ row: 3, col: 12 - i })),
  { row: 4, col: 1 },
  ...range(12).map((i) => ({ row: 5, col: i + 1 })),
  { row: 6, col: 12 },
  ...range(12).map((i) => ({ row: 7, col: 12 - i })),
  { row: 8, col: 1 },
  ...range(12).map((i) => ({ row: 9, col: i + 1 })),
  { row: 10, col: 12 },
  ...range(12).map((i) => ({ row: 11, col: 12 - i })),
];

export const GOAL_POSITION = PATH.length - 1;

export const getPathCell = (pos: number): PathCell | undefined => PATH[pos];

export const SPECIAL_CELLS: SpecialCell[] = [
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

export const SPECIAL_BY_POSITION: Record<number, SpecialCell> = SPECIAL_CELLS.reduce(
  (acc, cell) => {
    acc[cell.position] = cell;
    return acc;
  },
  {} as Record<number, SpecialCell>,
);

export const getSpecialCell = (position: number): SpecialCell | undefined =>
  SPECIAL_BY_POSITION[position];
