'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SUBJECTS } from '../game/subjects';
import type { Subject, Question } from '../game/types';

const PdfUploader = dynamic(() => import('./PdfUploader'), { ssr: false });

interface SubjectSelectorProps {
  onStart: (subject: Subject | null) => void;
  onStartCustom: (questions: Question[]) => void;
}

export default function SubjectSelector({ onStart, onStartCustom }: SubjectSelectorProps) {
  const [selected, setSelected] = useState<Subject | null>(null);
  const [mode, setMode] = useState<'select' | 'custom'>('select');

  if (mode === 'custom') {
    return (
      <div className="subject-overlay">
        <div className="subject-modal">
          <header className="subject-header">
            <h2>Perguntas Personalizadas</h2>
            <p>Envie um PDF ou imagem e a IA cria as perguntas pra você.</p>
          </header>

          <PdfUploader onQuestionsExtracted={onStartCustom} />

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

        <div className="subject-actions">
          <button
            type="button"
            className="subject-start subject-start--all"
            onClick={() => onStart(null)}
          >
            Jogar com todos os assuntos
          </button>
          <button
            type="button"
            className="subject-start"
            disabled={selected === null}
            onClick={() => onStart(selected)}
          >
            Começar Jogo
          </button>
        </div>
      </div>
    </div>
  );
}
