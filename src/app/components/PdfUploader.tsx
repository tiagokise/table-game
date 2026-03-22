// components/PdfUploader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { extractQuestionsFromText, generateTitleFromText, extractQuestionsFromImage } from '../game/gemini';
import { Question } from '../game/types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfUploaderProps {
  onQuestionsExtracted: (questions: Question[]) => void;
  currentPlayerId: number;
  playerId: number;
  questionsLoaded: boolean;
}

const PdfUploader = ({ onQuestionsExtracted, currentPlayerId, playerId, questionsLoaded }: PdfUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedTitle, setExtractedTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!questionsLoaded) {
      setExtractedTitle(null);
      setFile(null);
    }
  }, [questionsLoaded]);

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

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const base64Image = (event.target.result as string).split(',')[1];
            const questions = await extractQuestionsFromImage(base64Image, file.type);
            onQuestionsExtracted(questions);
            // Since we can't get a title from an image in the same way, we can set a generic title or leave it null
            setExtractedTitle(file.name);
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

              for (let i = pageNum; i <= endPage; i++) {
                const page = await pdfDoc.getPage(i);
                const content = await page.getTextContent();
                textChunk += content.items.map((item: any) => item.str).join(' ');
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

            onQuestionsExtracted(allQuestions);
          } catch (e) {
            setError('Erro ao extrair perguntas do PDF.');
            console.error(e);
          } finally {
            setLoading(false);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Tipo de arquivo não suportado.');
      setLoading(false);
    }
  };

  const isCurrentPlayer = currentPlayerId === playerId;

  return (
    <div className="pdf-uploader">
      <h4>Perguntas Personalizadas</h4>
      {isCurrentPlayer && (
        <>
          {extractedTitle ? (
            <div className="extracted-title">
              <strong>Tema:</strong> {extractedTitle}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexFlow: 'wrap' }}>
              <input style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexFlow: 'wrap', width: '100%' }} type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg" />
              <button onClick={handleExtractQuestions} disabled={!file || loading}>
                {loading ? 'Extraindo...' : 'Extrair do Arquivo'}
              </button>
            </div>
          )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      )}
    </div>
  );
};

export default PdfUploader;
