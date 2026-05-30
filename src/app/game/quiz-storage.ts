import type { Question } from './types';

const LS_KEY = 'tk-table-game.custom-quizzes.v1';
const MAX_ENTRIES = 20;

export interface SavedQuizContext {
  schoolLevel?: string;
  materia?: string;
  subjectFocus?: string;
}

export interface SavedQuiz {
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  questions: Question[];
  context: SavedQuizContext;
}

const hasStorage = (): boolean => typeof window !== 'undefined' && !!window.localStorage;

const readRaw = (): SavedQuiz[] => {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedQuiz =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        Array.isArray(item.questions),
    );
  } catch {
    return [];
  }
};

const writeRaw = (items: SavedQuiz[]): void => {
  if (!hasStorage()) return;
  try {
    const trimmed = items.slice(0, MAX_ENTRIES);
    window.localStorage.setItem(LS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Falha ao salvar quizzes em localStorage:', error);
  }
};

export const loadSavedQuizzes = (): SavedQuiz[] => {
  const items = readRaw();
  return [...items].sort((a, b) => b.updatedAt - a.updatedAt);
};

export const upsertSavedQuiz = (quiz: SavedQuiz): void => {
  const items = readRaw();
  const idx = items.findIndex((it) => it.id === quiz.id);
  if (idx >= 0) {
    items[idx] = quiz;
  } else {
    items.unshift(quiz);
  }
  const sorted = [...items].sort((a, b) => b.updatedAt - a.updatedAt);
  writeRaw(sorted);
};

export const deleteSavedQuiz = (id: string): void => {
  const items = readRaw();
  writeRaw(items.filter((it) => it.id !== id));
};

export const clearSavedQuizzes = (): void => writeRaw([]);

export const newQuizId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};
