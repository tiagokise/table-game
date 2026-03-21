// components/PdfUploader.tsx
'use client';

import React, { useState } from 'react';
import { pdfjs } from 'react-pdf';
import { extractQuestionsFromText } from '../game/gemini';
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

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        try {
          const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdfDoc = await pdfjs.getDocument(typedArray).promise;
          let text = '';
          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ');
          }
          
          const questions = await extractQuestionsFromText(text);
          onQuestionsExtracted(questions);
        } catch (e) {
          setError('Error extracting questions from PDF.');
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="pdf-uploader">
      <h4>Custom Questions</h4>
      <input type="file" onChange={handleFileChange} accept=".pdf" />
      <button onClick={handleExtractQuestions} disabled={!file || loading}>
        {loading ? 'Extracting...' : 'Extract from PDF'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PdfUploader;
