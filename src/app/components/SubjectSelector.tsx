'use client';

import { useState } from 'react';
import { SUBJECTS } from '../game/subjects';
import type { Subject } from '../game/types';

interface SubjectSelectorProps {
  onStart: (subject: Subject | null) => void;
}

export default function SubjectSelector({ onStart }: SubjectSelectorProps) {
  const [selected, setSelected] = useState<Subject | null>(null);

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
