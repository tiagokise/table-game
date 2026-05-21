import { SpecialCell } from './types';

export const BONUS_EXTRA_STEPS = 2;

export const SPECIAL_CELLS: SpecialCell[] = [
  { position: 4, type: 'bonus' },
  { position: 13, type: 'bonus' },
  { position: 26, type: 'bonus' },
  { position: 9, type: 'portal', target: 16 },
  { position: 21, type: 'portal', target: 29 },
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
