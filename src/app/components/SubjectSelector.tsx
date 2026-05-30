'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import BoardSilhouette from './BoardSilhouette';
import { SUBJECTS } from '../game/subjects';
import { getBoardConfig } from '../game/board-config';
import {
  DEFAULT_SCHOOL_LEVEL,
  MATERIAS,
  SCHOOL_LEVELS,
  type Difficulty,
  type Materia,
  type Question,
  type SchoolLevel,
  type Subject,
} from '../game/types';
import {
  deleteSavedQuiz,
  loadSavedQuizzes,
  newQuizId,
  upsertSavedQuiz,
  type SavedQuiz,
  type SavedQuizContext,
} from '../game/quiz-storage';

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

const labelForSchoolLevel = (id: SchoolLevel): string =>
  SCHOOL_LEVELS.find((l) => l.id === id)?.label ?? id;

const labelForMateria = (id: Materia | ''): string | undefined =>
  id ? MATERIAS.find((m) => m.id === id)?.label : undefined;

const findMateriaId = (label?: string): Materia | '' => {
  if (!label) return '';
  return MATERIAS.find((m) => m.label === label)?.id ?? '';
};

const findSchoolLevelId = (label?: string): SchoolLevel => {
  if (!label) return DEFAULT_SCHOOL_LEVEL;
  return SCHOOL_LEVELS.find((l) => l.label === label)?.id ?? DEFAULT_SCHOOL_LEVEL;
};

type Mode = 'difficulty' | 'subject' | 'custom' | 'confirm';

export default function SubjectSelector({ onStart, onStartCustom }: SubjectSelectorProps) {
  const [selected, setSelected] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [mode, setMode] = useState<Mode>('difficulty');
  const [extracted, setExtracted] = useState<ExtractedSet | null>(null);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [isAppending, setIsAppending] = useState(false);
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);

  // Lifted form state (controls PdfUploader)
  const [formSchoolLevel, setFormSchoolLevel] = useState<SchoolLevel>(DEFAULT_SCHOOL_LEVEL);
  const [formMateria, setFormMateria] = useState<Materia | ''>('');
  const [formSubjectFocus, setFormSubjectFocus] = useState('');
  const [formFiles, setFormFiles] = useState<File[]>([]);

  useEffect(() => {
    setSavedQuizzes(loadSavedQuizzes());
  }, []);

  const activeDifficulty = DIFFICULTY_OPTIONS.find((opt) => opt.id === difficulty);

  const resetCustomFlow = () => {
    setExtracted(null);
    setCurrentQuizId(null);
    setIsAppending(false);
    setFormMateria('');
    setFormSubjectFocus('');
    setFormFiles([]);
  };

  const handleExtracted = (questions: Question[], title?: string) => {
    const now = Date.now();
    const isAppend = isAppending && extracted && currentQuizId;
    const mergedQuestions = isAppend ? [...extracted!.questions, ...questions] : questions;
    const mergedTitle = isAppend ? extracted!.title || title || null : title ?? null;
    const quizId = currentQuizId ?? newQuizId();

    const context: SavedQuizContext = {
      schoolLevel: labelForSchoolLevel(formSchoolLevel),
      materia: labelForMateria(formMateria),
      subjectFocus: formSubjectFocus.trim() || undefined,
    };

    const previous = savedQuizzes.find((q) => q.id === quizId);
    const saved: SavedQuiz = {
      id: quizId,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
      title: mergedTitle ?? 'Quiz personalizado',
      questions: mergedQuestions,
      context,
    };

    upsertSavedQuiz(saved);
    setSavedQuizzes(loadSavedQuizzes());
    setCurrentQuizId(quizId);
    setExtracted({ questions: mergedQuestions, title: mergedTitle });
    setIsAppending(false);
    setMode('confirm');
  };

  const handleGenerateMore = () => {
    if (!extracted) return;
    setIsAppending(true);
    setFormFiles([]); // user pode anexar arquivo diferente; contexto textual preservado
    setMode('custom');
  };

  const handleLoadSaved = (quiz: SavedQuiz) => {
    setCurrentQuizId(quiz.id);
    setExtracted({ questions: quiz.questions, title: quiz.title });
    setFormSchoolLevel(findSchoolLevelId(quiz.context.schoolLevel));
    setFormMateria(findMateriaId(quiz.context.materia));
    setFormSubjectFocus(quiz.context.subjectFocus ?? '');
    setFormFiles([]);
    setIsAppending(false);
    setMode('confirm');
  };

  const handleDeleteSaved = (quiz: SavedQuiz) => {
    const confirmed = window.confirm(`Apagar o quiz "${quiz.title}"?`);
    if (!confirmed) return;
    deleteSavedQuiz(quiz.id);
    setSavedQuizzes(loadSavedQuizzes());
    if (currentQuizId === quiz.id) {
      resetCustomFlow();
    }
  };

  const handlePickDifficulty = (id: Difficulty) => {
    setDifficulty(id);
    setMode('subject');
  };

  if (mode === 'confirm' && extracted && difficulty) {
    const count = extracted.questions.length;
    const contextChips: string[] = [];
    const levelLabel = labelForSchoolLevel(formSchoolLevel);
    if (levelLabel) contextChips.push(levelLabel);
    const materiaLabel = labelForMateria(formMateria);
    if (materiaLabel) contextChips.push(materiaLabel);

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

          {contextChips.length > 0 && (
            <div className="confirm-context-chips">
              {contextChips.map((chip) => (
                <span key={chip} className="confirm-context-chip">
                  {chip}
                </span>
              ))}
            </div>
          )}

          <div className="subject-actions subject-actions--stack">
            <button
              type="button"
              className="subject-start subject-start--ghost"
              onClick={handleGenerateMore}
            >
              ➕ Gerar mais perguntas
            </button>
            <button
              type="button"
              className="subject-start subject-start--all"
              onClick={() => {
                resetCustomFlow();
                setMode('custom');
              }}
            >
              ← Começar um quiz novo
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
    const appendBanner =
      isAppending && extracted
        ? {
            count: extracted.questions.length,
            title: extracted.title ?? 'Quiz personalizado',
          }
        : undefined;

    return (
      <div className="subject-overlay">
        <div className="subject-modal">
          <header className="subject-header">
            <h2>Perguntas Personalizadas</h2>
            <p>Envie um PDF/imagem ou descreva o assunto — a IA cria as perguntas.</p>
          </header>

          {savedQuizzes.length > 0 && !isAppending && (
            <section className="saved-quiz-list" aria-label="Quizzes salvos">
              <h3 className="saved-quiz-list-title">Quizzes salvos</h3>
              <ul className="saved-quiz-items">
                {savedQuizzes.map((quiz) => {
                  const meta = [
                    `${quiz.questions.length} pergunta${quiz.questions.length === 1 ? '' : 's'}`,
                    quiz.context.schoolLevel,
                    quiz.context.materia,
                  ]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <li key={quiz.id} className="saved-quiz-card">
                      <button
                        type="button"
                        className="saved-quiz-card-main"
                        onClick={() => handleLoadSaved(quiz)}
                      >
                        <span className="saved-quiz-card-icon" aria-hidden>📚</span>
                        <span className="saved-quiz-card-body">
                          <span className="saved-quiz-card-title">{quiz.title}</span>
                          <span className="saved-quiz-card-meta">{meta}</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className="saved-quiz-delete"
                        aria-label={`Apagar quiz ${quiz.title}`}
                        onClick={() => handleDeleteSaved(quiz)}
                      >
                        🗑
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <PdfUploader
            onQuestionsExtracted={handleExtracted}
            schoolLevel={formSchoolLevel}
            onSchoolLevelChange={setFormSchoolLevel}
            materia={formMateria}
            onMateriaChange={setFormMateria}
            subjectFocus={formSubjectFocus}
            onSubjectFocusChange={setFormSubjectFocus}
            files={formFiles}
            onFilesChange={setFormFiles}
            appendBanner={appendBanner}
          />

          <div className="subject-actions">
            <button
              type="button"
              className="subject-start subject-start--all"
              onClick={() => {
                if (isAppending) {
                  setIsAppending(false);
                  setMode('confirm');
                } else {
                  setMode('subject');
                }
              }}
            >
              {isAppending ? '← Cancelar' : '← Voltar aos assuntos'}
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
