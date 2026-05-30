'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SUBJECTS } from '../game/subjects';
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

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; emoji: string; time: number; boardLabel: string }[] = [
  { id: 'facil', label: 'Fácil', emoji: '🟢', time: 30, boardLabel: 'Pequeno' },
  { id: 'medio', label: 'Médio', emoji: '🟡', time: 20, boardLabel: 'Médio' },
  { id: 'dificil', label: 'Difícil', emoji: '🔴', time: 10, boardLabel: 'Grande' },
];

export default function SubjectSelector({ onStart, onStartCustom }: SubjectSelectorProps) {
  const [selected, setSelected] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medio');
  const [mode, setMode] = useState<'select' | 'custom' | 'confirm'>('select');
  const [extracted, setExtracted] = useState<ExtractedSet | null>(null);

  const handleExtracted = (questions: Question[], title?: string) => {
    setExtracted({ questions, title: title ?? null });
    setMode('confirm');
  };

  if (mode === 'confirm' && extracted) {
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
              onClick={() => setMode('select')}
            >
              ← Voltar aos assuntos
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

        <section className="difficulty-section" aria-label="Nível de dificuldade">
          <span className="difficulty-section-label">Nível de dificuldade · define tamanho do tabuleiro e tempo por pergunta</span>
          <div className="difficulty-options">
            {DIFFICULTY_OPTIONS.map((opt) => {
              const isActive = difficulty === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`difficulty-option difficulty-${opt.id} ${isActive ? 'active' : ''}`}
                  onClick={() => setDifficulty(opt.id)}
                  aria-pressed={isActive}
                >
                  <span className="difficulty-option-emoji" aria-hidden>{opt.emoji}</span>
                  <span className="difficulty-option-label">{opt.label}</span>
                  <span className="difficulty-option-board">{opt.boardLabel}</span>
                  <span className="difficulty-option-time">{opt.time}s</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="subject-actions">
          <button
            type="button"
            className="subject-start subject-start--all"
            onClick={() => onStart(null, difficulty)}
          >
            Jogar com todos os assuntos
          </button>
          <button
            type="button"
            className="subject-start"
            disabled={selected === null}
            onClick={() => onStart(selected, difficulty)}
          >
            Começar Jogo
          </button>
        </div>
      </div>
    </div>
  );
}
