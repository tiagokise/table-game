'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import BoardSilhouette from './BoardSilhouette';
import { SUBJECTS } from '../game/subjects';
import { getBoardConfig } from '../game/board-config';
import type { Difficulty, Subject, Question } from '../game/types';

const PdfUploader = dynamic(() => import('./PdfUploader'), { ssr: false });

interface SubjectSelectorProps {
  onStart: (subject: Subject | null, difficulty: Difficulty) => void;
  onStartCustom: (questions: Question[], difficulty: Difficulty) => void;
}

interface ExtractedSet {
  questions: Question[];
  title: string | null;
}

interface DifficultyOption {
  id: Difficulty;
  label: string;
  emoji: string;
  time: number;
  accentColor: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { id: 'facil', label: 'Fácil', emoji: '🟢', time: 30, accentColor: '#34d399' },
  { id: 'medio', label: 'Médio', emoji: '🟡', time: 20, accentColor: '#fbbf24' },
  { id: 'dificil', label: 'Difícil', emoji: '🔴', time: 10, accentColor: '#f87171' },
];

type Mode = 'difficulty' | 'subject' | 'custom' | 'confirm';

export default function SubjectSelector({ onStart, onStartCustom }: SubjectSelectorProps) {
  const [selected, setSelected] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [mode, setMode] = useState<Mode>('difficulty');
  const [extracted, setExtracted] = useState<ExtractedSet | null>(null);

  const handleExtracted = (questions: Question[], title?: string) => {
    setExtracted({ questions, title: title ?? null });
    setMode('confirm');
  };

  const handlePickDifficulty = (id: Difficulty) => {
    setDifficulty(id);
    setMode('subject');
  };

  const activeDifficulty = DIFFICULTY_OPTIONS.find((opt) => opt.id === difficulty);

  if (mode === 'confirm' && extracted && difficulty) {
    const count = extracted.questions.length;
    return (
      <div className="subject-overlay">
        <div className="subject-modal">
          <header className="subject-header">
            <h2>Pronto!</h2>
            <p>
              {count} pergunta{count === 1 ? '' : 's'} pronta{count === 1 ? '' : 's'} pra jogar.
            </p>
          </header>

          {extracted.title && (
            <div className="extracted-title">
              <strong>Tema</strong>
              <span>{extracted.title}</span>
            </div>
          )}

          <div className="subject-actions">
            <button
              type="button"
              className="subject-start subject-start--all"
              onClick={() => {
                setExtracted(null);
                setMode('custom');
              }}
            >
              ← Tentar outro arquivo
            </button>
            <button
              type="button"
              className="subject-start"
              onClick={() => onStartCustom(extracted.questions, difficulty)}
            >
              Começar Jogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'custom') {
    return (
      <div className="subject-overlay">
        <div className="subject-modal">
          <header className="subject-header">
            <h2>Perguntas Personalizadas</h2>
            <p>Envie um PDF ou imagem e a IA cria as perguntas pra você.</p>
          </header>

          <PdfUploader onQuestionsExtracted={handleExtracted} />

          <div className="subject-actions">
            <button
              type="button"
              className="subject-start subject-start--all"
              onClick={() => setMode('subject')}
            >
              ← Voltar aos assuntos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'subject' && activeDifficulty) {
    return (
      <div className="subject-overlay">
        <div className="subject-modal">
          <div className="subject-step-bar">
            <button
              type="button"
              className="subject-step-back"
              onClick={() => setMode('difficulty')}
            >
              ← Voltar
            </button>
            <span
              className={`subject-step-badge difficulty-${activeDifficulty.id}`}
              style={{ ['--chip-color' as string]: activeDifficulty.accentColor }}
            >
              <span aria-hidden>{activeDifficulty.emoji}</span>
              {activeDifficulty.label}
            </span>
          </div>

          <header className="subject-header">
            <h2>Escolha um assunto</h2>
            <p>Selecione um tema para as perguntas — ou jogue com todos.</p>
          </header>

          <div className="subject-grid">
            {SUBJECTS.map((s) => {
              const isActive = selected === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`subject-chip ${isActive ? 'active' : ''}`}
                  style={{ ['--chip-color' as string]: s.color }}
                  onClick={() => setSelected(isActive ? null : s.id)}
                >
                  <span className="subject-chip-emoji" aria-hidden>
                    {s.emoji}
                  </span>
                  <span className="subject-chip-label">{s.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              className="subject-chip subject-chip--custom"
              style={{ ['--chip-color' as string]: '#8b5cf6' }}
              onClick={() => setMode('custom')}
            >
              <span className="subject-chip-emoji" aria-hidden>📄</span>
              <span className="subject-chip-label">Perguntas Personalizadas</span>
            </button>
          </div>

          <div className="subject-actions">
            <button
              type="button"
              className="subject-start subject-start--all"
              onClick={() => onStart(null, activeDifficulty.id)}
            >
              Jogar com todos os assuntos
            </button>
            <button
              type="button"
              className="subject-start"
              disabled={selected === null}
              onClick={() => onStart(selected, activeDifficulty.id)}
            >
              Começar Jogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subject-overlay">
      <div className="subject-modal">
        <header className="subject-header">
          <h2>Escolha a dificuldade</h2>
          <p>Define o tamanho do tabuleiro e o tempo por pergunta.</p>
        </header>

        <div className="difficulty-cards">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const config = getBoardConfig(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                className={`difficulty-card difficulty-${opt.id}`}
                onClick={() => handlePickDifficulty(opt.id)}
              >
                <span className="difficulty-card-title">
                  <span className="difficulty-card-emoji" aria-hidden>{opt.emoji}</span>
                  {opt.label}
                </span>
                <span className="difficulty-card-svg">
                  <BoardSilhouette boardConfig={config} accentColor={opt.accentColor} />
                </span>
                <span className="difficulty-card-meta">
                  <span>{config.cols}×{config.rows}</span>
                  <span>·</span>
                  <span>{opt.time}s/pergunta</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
