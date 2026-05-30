// components/PdfUploader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import {
  extractQuestionsFromText,
  generateTitleFromText,
  extractQuestionsFromImage,
  generateQuestionsFromTopic,
  GenerationContext,
} from '../game/gemini';
import {
  Question,
  SchoolLevel,
  SCHOOL_LEVELS,
  Materia,
  MATERIAS,
  getMateriasForLevel,
} from '../game/types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface AppendBannerInfo {
  count: number;
  title: string;
}

interface PdfUploaderProps {
  onQuestionsExtracted: (questions: Question[], title?: string) => void;
  schoolLevel: SchoolLevel;
  onSchoolLevelChange: (next: SchoolLevel) => void;
  materia: Materia | '';
  onMateriaChange: (next: Materia | '') => void;
  subjectFocus: string;
  onSubjectFocusChange: (next: string) => void;
  files: File[];
  onFilesChange: (next: File[]) => void;
  appendBanner?: AppendBannerInfo;
  onLoadingChange?: (loading: boolean) => void;
}

type ImageProgress = { kind: 'image'; current: number; total: number };
type PdfProgress = { kind: 'pdf'; current: number; total: number };
type TopicProgress = { kind: 'topic' };
type Progress = ImageProgress | PdfProgress | TopicProgress;

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Erro ao ler arquivo.'));
    reader.readAsDataURL(file);
  });

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error('Erro ao ler arquivo.'));
    reader.readAsArrayBuffer(file);
  });

const labelForLevel = (id: SchoolLevel): string =>
  SCHOOL_LEVELS.find((l) => l.id === id)?.label ?? id;

const labelForMateria = (id: Materia | ''): string | undefined =>
  id ? MATERIAS.find((m) => m.id === id)?.label : undefined;

const PdfUploader = ({
  onQuestionsExtracted,
  schoolLevel,
  onSchoolLevelChange,
  materia,
  onMateriaChange,
  subjectFocus,
  onSubjectFocusChange,
  files,
  onFilesChange,
  appendBanner,
  onLoadingChange,
}: PdfUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFilesChange(Array.from(event.target.files));
      setError(null);
    }
  };

  const availableMaterias = getMateriasForLevel(schoolLevel);
  const hasFile = files.length > 0;
  const trimmedFocus = subjectFocus.trim();
  const hasFocus = trimmedFocus.length > 0;
  const hasMateria = materia !== '' && availableMaterias.some((m) => m.id === materia);
  const allImages = hasFile && files.every((f) => f.type.startsWith('image/'));
  const isSinglePdf = files.length === 1 && files[0].type === 'application/pdf';
  const canSubmit = hasFile || hasFocus || hasMateria;
  const materiaLabel = hasMateria ? labelForMateria(materia) : undefined;
  const isAppending = !!appendBanner;

  const handleLevelChange = (nextLevel: SchoolLevel) => {
    onSchoolLevelChange(nextLevel);
    const stillValid = getMateriasForLevel(nextLevel).some((m) => m.id === materia);
    if (!stillValid && materia !== '') {
      onMateriaChange('');
    }
  };

  const handleGenerate = async () => {
    if (!canSubmit) {
      setError('Selecione um arquivo, escolha uma matéria ou descreva um assunto para gerar perguntas.');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(null);

    const context: GenerationContext = {
      schoolLevel: labelForLevel(schoolLevel),
      materia: materiaLabel,
      subjectFocus: trimmedFocus || undefined,
    };

    if (!hasFile && (hasFocus || hasMateria)) {
      try {
        setProgress({ kind: 'topic' });
        const questions = await generateQuestionsFromTopic(context);
        if (questions.length === 0) {
          setError('Não consegui gerar perguntas para esse assunto. Tente reformular.');
          return;
        }
        const title = trimmedFocus || materiaLabel;
        onQuestionsExtracted(questions, title);
      } catch (e) {
        setError('Erro ao gerar perguntas pelo assunto.');
        console.error(e);
      } finally {
        setLoading(false);
        setProgress(null);
      }
      return;
    }

    if (allImages) {
      try {
        const allQuestions: Question[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setProgress({ kind: 'image', current: i + 1, total: files.length });
          const dataUrl = await readFileAsDataUrl(file);
          const base64Image = dataUrl.split(',')[1];
          const questions = await extractQuestionsFromImage(base64Image, file.type, context);
          allQuestions.push(...questions);
        }

        if (allQuestions.length === 0) {
          setError(
            files.length > 1
              ? 'Nenhuma pergunta válida foi encontrada nas imagens. Tente outros arquivos.'
              : 'Nenhuma pergunta válida foi encontrada na imagem. Tente outro arquivo.',
          );
          return;
        }

        const title = trimmedFocus || materiaLabel || (files.length === 1 ? files[0].name : undefined);
        onQuestionsExtracted(allQuestions, title);
      } catch (e) {
        setError('Erro ao extrair perguntas das imagens.');
        console.error(e);
      } finally {
        setLoading(false);
        setProgress(null);
      }
      return;
    }

    if (isSinglePdf) {
      const file = files[0];
      try {
        const buffer = await readFileAsArrayBuffer(file);
        const typedArray = new Uint8Array(buffer);
        const pdfDoc = await pdfjs.getDocument(typedArray).promise;
        const allQuestions: Question[] = [];
        const CHUNK_SIZE = 5;

        let extractedTitle: string | undefined = trimmedFocus || materiaLabel;

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum += CHUNK_SIZE) {
          let textChunk = '';
          const endPage = Math.min(pageNum + CHUNK_SIZE - 1, pdfDoc.numPages);
          setProgress({ kind: 'pdf', current: endPage, total: pdfDoc.numPages });

          for (let i = pageNum; i <= endPage; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            textChunk += content.items
              .map((item) => ('str' in item ? item.str : ''))
              .join(' ');
          }

          if (textChunk.trim().length > 0) {
            if (extractedTitle === undefined) {
              extractedTitle = await generateTitleFromText(textChunk);
            }
            const questions = await extractQuestionsFromText(textChunk, context);
            allQuestions.push(...questions);
          }
        }

        if (allQuestions.length === 0) {
          setError('Nenhuma pergunta válida foi encontrada no PDF. Tente outro arquivo.');
          return;
        }
        onQuestionsExtracted(allQuestions, extractedTitle);
      } catch (e) {
        setError('Erro ao extrair perguntas do PDF.');
        console.error(e);
      } finally {
        setLoading(false);
        setProgress(null);
      }
      return;
    }

    setError('Selecione um PDF ou uma ou mais imagens (não é possível misturar os dois).');
    setLoading(false);
  };

  const fileLabel =
    files.length === 0
      ? 'Anexar PDF ou imagens (opcional)'
      : files.length === 1
        ? files[0].name
        : `${files.length} imagens selecionadas`;

  const progressLabel = (() => {
    if (!progress) return null;
    if (progress.kind === 'image') {
      return `Imagem ${progress.current} de ${progress.total}…`;
    }
    if (progress.kind === 'pdf') {
      return `Página ${progress.current} de ${progress.total}…`;
    }
    return 'Gerando perguntas…';
  })();

  const generateButtonLabel = loading
    ? progressLabel ?? 'Gerando…'
    : isAppending
      ? 'Gerar mais perguntas'
      : 'Gerar Perguntas';

  return (
    <div className="pdf-uploader">
      {appendBanner && (
        <div className="append-banner" role="status">
          <span className="append-banner-icon" aria-hidden>➕</span>
          <span className="append-banner-text">
            Adicionando ao quiz <strong>{appendBanner.title}</strong> ({appendBanner.count}{' '}
            pergunta{appendBanner.count === 1 ? '' : 's'} já criada{appendBanner.count === 1 ? '' : 's'})
          </span>
        </div>
      )}

      <div className="custom-form-field">
        <label className="custom-form-label" htmlFor="custom-school-level">
          Nível escolar
        </label>
        <select
          id="custom-school-level"
          className="custom-form-select"
          value={schoolLevel}
          onChange={(e) => handleLevelChange(e.target.value as SchoolLevel)}
          disabled={loading}
        >
          {SCHOOL_LEVELS.map((level) => (
            <option key={level.id} value={level.id}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div className="custom-form-field">
        <label className="custom-form-label" htmlFor="custom-materia">
          Matéria
        </label>
        <select
          id="custom-materia"
          className="custom-form-select"
          value={materia}
          onChange={(e) => {
            onMateriaChange(e.target.value as Materia | '');
            if (error) setError(null);
          }}
          disabled={loading}
        >
          <option value="">Selecione…</option>
          {availableMaterias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="custom-form-field">
        <label className="custom-form-label" htmlFor="custom-subject-focus">
          Assunto a estudar (opcional)
        </label>
        <input
          id="custom-subject-focus"
          type="text"
          className="custom-form-input"
          placeholder="Ex.: Equações do 2º grau, Revolução Francesa…"
          value={subjectFocus}
          onChange={(e) => {
            onSubjectFocusChange(e.target.value);
            if (error) setError(null);
          }}
          disabled={loading}
          maxLength={140}
        />
      </div>

      <div className="extract-divider" aria-hidden>
        <span>ou anexe um arquivo</span>
      </div>

      <div className={`extract-source ${hasFile ? 'has-file' : ''}`}>
        <div className="extract-source-heading">
          <span className="extract-source-title">Extrair de PDF ou imagem</span>
          <span className="extract-source-hint">
            Envie um arquivo e a IA gera perguntas direto do conteúdo.
          </span>
        </div>
        <label className="file-picker">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            className="file-picker-input"
            disabled={loading}
          />
          <span className="file-picker-icon" aria-hidden>📄</span>
          <span className={`file-picker-text ${hasFile ? 'has-file' : ''}`}>
            {fileLabel}
          </span>
        </label>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!canSubmit || loading}
        className="extract-button"
      >
        {generateButtonLabel}
      </button>

      {loading && progress && progress.kind !== 'topic' && (
        <div className="upload-progress" aria-hidden>
          <div
            className="upload-progress-fill"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      )}
      {error && <p className="uploader-error">{error}</p>}
    </div>
  );
};

export default PdfUploader;
