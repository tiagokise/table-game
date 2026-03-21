// src/app/game/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function extractQuestionsFromText(text: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

  const prompt = `
    Extraia perguntas e respostas do texto a seguir e formate-as como um array de objetos JSON.
    Cada objeto deve ter as seguintes propriedades: "question", "options" (um array de 4 strings) e "answer" (uma das opções).
    O texto é: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text();
    
    const jsonStartIndex = jsonText.indexOf('[');
    const jsonEndIndex = jsonText.lastIndexOf(']');

    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      jsonText = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    const questions = JSON.parse(jsonText);
    return questions;
  } catch (error) {
    console.error('Erro ao extrair perguntas:', error);
    return [];
  }
}
