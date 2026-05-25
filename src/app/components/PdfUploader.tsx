// components/PdfUploader.tsx
'use client';

import React, { useState } from 'react';
import { pdfjs } from 'react-pdf';
import { TextItem } from 'pdfjs-dist/types/src/display/api'; // Import TextItem
import { extractQuestionsFromText, generateTitleFromText, extractQuestionsFromImage } from '../game/gemini';
import { Question } from '../game/types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfUploaderProps {
  onQuestionsExtracted: (questions: Question[], title?: string) => void;
}

type ImageProgress = { kind: 'image'; current: number; total: number };
type PdfProgress = { kind: 'pdf'; current: number; total: number };
type Progress = ImageProgress | PdfProgress;

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

const PdfUploader = ({ onQuestionsExtracted }: PdfUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(Array.from(event.target.files));
      setError(null);
    }
  };

  const allImages = files.length > 0 && files.every((f) => f.type.startsWith('image/'));
  const isSinglePdf = files.length === 1 && files[0].type === 'application/pdf';

  const handleExtractQuestions = async () => {
    if (files.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(null);

    if (allImages) {
      try {
        const allQuestions: Question[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setProgress({ kind: 'image', current: i + 1, total: files.length });
          const dataUrl = await readFileAsDataUrl(file);
          const base64Image = dataUrl.split(',')[1];
          const questions = await extractQuestionsFromImage(base64Image, file.type);
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

        const title = files.length === 1 ? files[0].name : undefined;
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

        let extractedTitle: string | undefined;

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum += CHUNK_SIZE) {
          let textChunk = '';
          const endPage = Math.min(pageNum + CHUNK_SIZE - 1, pdfDoc.numPages);
          setProgress({ kind: 'pdf', current: endPage, total: pdfDoc.numPages });

          for (let i = pageNum; i <= endPage; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            textChunk += content.items.map((item) => {
              if ('str' in item) { // Check if 'str' property exists
                return item.str;
              }
              return '';
            }).join(' ');
          }

          if (textChunk.trim().length > 0) {
            if (extractedTitle === undefined) {
              extractedTitle = await generateTitleFromText(textChunk);
            }
            const questions = await extractQuestionsFromText(textChunk);
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
      ? 'Escolher PDF ou imagens'
      : files.length === 1
        ? files[0].name
        : `${files.length} imagens selecionadas`;

  const progressLabel = (() => {
    if (!progress) return null;
    if (progress.kind === 'image') {
      return `Imagem ${progress.current} de ${progress.total}…`;
    }
    return `Página ${progress.current} de ${progress.total}…`;
  })();

  return (
    <div className="pdf-uploader">
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
        <span className={`file-picker-text ${files.length > 0 ? 'has-file' : ''}`}>
          {fileLabel}
        </span>
      </label>
      <button
        onClick={handleExtractQuestions}
        disabled={files.length === 0 || loading}
        className="extract-button"
      >
        {loading
          ? progressLabel ?? 'Extraindo…'
          : 'Extrair Perguntas'}
      </button>
      {loading && progress && (
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
