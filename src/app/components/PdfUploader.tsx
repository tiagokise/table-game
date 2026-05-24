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
  onQuestionsExtracted: (questions: Question[]) => void;
}

const PdfUploader = ({ onQuestionsExtracted }: PdfUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedTitle, setExtractedTitle] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleExtractQuestions = async () => {
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const base64Image = (event.target.result as string).split(',')[1];
            const questions = await extractQuestionsFromImage(base64Image, file.type);
            if (questions.length === 0) {
              setError('Nenhuma pergunta válida foi encontrada na imagem. Tente outro arquivo.');
              return;
            }
            setExtractedTitle(file.name);
            onQuestionsExtracted(questions);
          } catch (e) {
            setError('Erro ao extrair perguntas da imagem.');
            console.error(e);
          } finally {
            setLoading(false);
          }
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
            const pdfDoc = await pdfjs.getDocument(typedArray).promise;
            const allQuestions: Question[] = [];
            const CHUNK_SIZE = 5;

            let isFirstChunk = true;

            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum += CHUNK_SIZE) {
              let textChunk = '';
              const endPage = Math.min(pageNum + CHUNK_SIZE - 1, pdfDoc.numPages);
              setProgress({ current: endPage, total: pdfDoc.numPages });

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
                if (isFirstChunk) {
                  const title = await generateTitleFromText(textChunk);
                  setExtractedTitle(title);
                  isFirstChunk = false;
                }
                const questions = await extractQuestionsFromText(textChunk);
                allQuestions.push(...questions);
              }
            }

            if (allQuestions.length === 0) {
              setError('Nenhuma pergunta válida foi encontrada no PDF. Tente outro arquivo.');
              return;
            }
            onQuestionsExtracted(allQuestions);
          } catch (e) {
            setError('Erro ao extrair perguntas do PDF.');
            console.error(e);
          } finally {
            setLoading(false);
            setProgress(null);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Tipo de arquivo não suportado.');
      setLoading(false);
    }
  };

  return (
    <div className="pdf-uploader">
      {extractedTitle ? (
        <div className="extracted-title">
          <strong>Tema</strong>
          <span>{extractedTitle}</span>
        </div>
      ) : (
        <>
          <label className="file-picker">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="file-picker-input"
            />
            <span className="file-picker-icon" aria-hidden>📄</span>
            <span className={`file-picker-text ${file ? 'has-file' : ''}`}>
              {file ? file.name : 'Escolher PDF ou imagem'}
            </span>
          </label>
          <button
            onClick={handleExtractQuestions}
            disabled={!file || loading}
            className="extract-button"
          >
            {loading
              ? progress
                ? `Página ${progress.current} de ${progress.total}…`
                : 'Extraindo…'
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
        </>
      )}
      {error && <p className="uploader-error">{error}</p>}
    </div>
  );
};

export default PdfUploader;
