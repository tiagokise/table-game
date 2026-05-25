// src/app/game/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Difficulty, Question } from './types';

const DIFFICULTY_VALUES: readonly Difficulty[] = ['facil', 'medio', 'dificil'] as const;

const genAI = new GoogleGenerativeAI(process.env.NEXT_GEMINI_API_KEY || '');

function parseJsonArray(raw: string): unknown[] {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    console.warn('Nenhum JSON array encontrado na resposta:', raw);
    return [];
  }
  const slice = raw.substring(start, end + 1);

  try {
    const parsed = JSON.parse(slice);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    try {
      const cleaned = slice.replace(/,(\s*[\]}])/g, '$1');
      const parsed = JSON.parse(cleaned);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Falha ao parsear JSON da IA:', raw, error);
      return [];
    }
  }
}

function normalizeDifficulty(value: unknown): Difficulty | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  if (DIFFICULTY_VALUES.includes(normalized as Difficulty)) {
    return normalized as Difficulty;
  }
  if (normalized === 'easy') return 'facil';
  if (normalized === 'medium') return 'medio';
  if (normalized === 'hard' || normalized === 'difficult') return 'dificil';
  return undefined;
}

function isValidQuestion(value: unknown): value is Question {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.question !== 'string' || obj.question.trim().length === 0) return false;
  if (!Array.isArray(obj.options) || obj.options.length < 2) return false;
  if (!obj.options.every((o) => typeof o === 'string' && o.trim().length > 0)) return false;
  if (typeof obj.answer !== 'string') return false;
  if (!(obj.options as string[]).includes(obj.answer)) return false;
  const normalizedDifficulty = normalizeDifficulty(obj.difficulty);
  if (normalizedDifficulty) {
    obj.difficulty = normalizedDifficulty;
  } else {
    delete obj.difficulty;
  }
  return true;
}

function validateQuestions(items: unknown[]): Question[] {
  const valid = items.filter(isValidQuestion);
  const dropped = items.length - valid.length;
  if (dropped > 0) {
    console.warn(`Descartadas ${dropped} pergunta(s) malformada(s) de ${items.length} recebidas da IA.`);
  }
  return valid;
}

export async function extractQuestionsFromText(text: string): Promise<Question[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    Extraia perguntas e respostas do texto a seguir e formate-as como um array de objetos JSON.
    Cada objeto deve ter as seguintes propriedades:
      - "question": o enunciado.
      - "options": um array de 4 strings.
      - "answer": uma das opções (texto exato).
      - "difficulty": nível de dificuldade da pergunta, exatamente um destes valores: "facil", "medio" ou "dificil".
        Use "facil" para perguntas de conhecimento básico, "medio" para perguntas de conhecimento intermediário
        e "dificil" para perguntas que exigem domínio aprofundado ou raciocínio mais complexo.
    Distribua as dificuldades de forma equilibrada quando possível.
    O texto é: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return validateQuestions(parseJsonArray(response.text()));
  } catch (error) {
    console.error('Erro ao extrair perguntas:', error);
    return [];
  }
}

export async function extractQuestionsFromImage(base64Image: string, mimeType: string): Promise<Question[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    Extraia perguntas e respostas da imagem a seguir e formate-as como um array de objetos JSON.
    Cada objeto deve ter as seguintes propriedades:
      - "question": o enunciado.
      - "options": um array de 4 strings.
      - "answer": uma das opções (texto exato).
      - "difficulty": nível de dificuldade da pergunta, exatamente um destes valores: "facil", "medio" ou "dificil".
        Use "facil" para perguntas de conhecimento básico, "medio" para perguntas de conhecimento intermediário
        e "dificil" para perguntas que exigem domínio aprofundado ou raciocínio mais complexo.
    Distribua as dificuldades de forma equilibrada quando possível.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return validateQuestions(parseJsonArray(response.text()));
  } catch (error) {
    console.error('Erro ao extrair perguntas da imagem:', error);
    return [];
  }
}

export async function generateTitleFromText(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    Gere um título conciso e informativo para o seguinte texto. O título deve ter no máximo 5 palavras.
    Texto: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Erro ao gerar título:', error);
    return 'Título não gerado';
  }
}
