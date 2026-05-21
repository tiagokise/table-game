// src/app/game/subjects.ts
import type { Subject } from './types';

export interface SubjectInfo {
  id: Subject;
  label: string;
  emoji: string;
  color: string;
}

export const SUBJECTS: SubjectInfo[] = [
  { id: 'geografia', label: 'Geografia', emoji: '🌍', color: '#38bdf8' },
  { id: 'historia', label: 'História', emoji: '📜', color: '#a78bfa' },
  { id: 'ciencias', label: 'Ciências', emoji: '🔬', color: '#10b981' },
  { id: 'cultura', label: 'Cultura & Artes', emoji: '🎨', color: '#ec4899' },
  { id: 'matematica', label: 'Matemática', emoji: '🔢', color: '#fbbf24' },
  { id: 'esportes', label: 'Esportes', emoji: '⚽', color: '#f97316' },
  { id: 'portugues', label: 'Português', emoji: '📝', color: '#f43f5e' },
  { id: 'cinema', label: 'Cinema & TV', emoji: '🎬', color: '#6366f1' },
];
