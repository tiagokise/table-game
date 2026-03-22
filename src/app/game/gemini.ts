// src/app/game/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function extractQuestionsFromText(text: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    Extraia perguntas e respostas do texto a seguir e formate-as como um array de objetos JSON.
    Cada objeto deve ter as seguintes propriedades: "question", "options" (um array de 4 strings) e "answer" (uma das opções).
    O texto é: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    const jsonStartIndex = jsonText.indexOf('[');
    const jsonEndIndex = jsonText.lastIndexOf(']');

    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      const jsonString = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
      const questions = JSON.parse(jsonString);
      return questions;
    } else {
      console.error("Nenhum JSON válido encontrado na resposta da IA:", jsonText);
      return [];
    }
  } catch (error) {
    console.error('Erro ao extrair perguntas:', error);
    return [];
  }
}

export async function extractQuestionsFromImage(base64Image: string, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    Extraia perguntas e respostas da imagem a seguir e formate-as como um array de objetos JSON.
    Cada objeto deve ter as seguintes propriedades: "question", "options" (um array de 4 strings) e "answer" (uma das opções).
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
    const jsonText = response.text();

    const jsonStartIndex = jsonText.indexOf('[');
    const jsonEndIndex = jsonText.lastIndexOf(']');

    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      const jsonString = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
      const questions = JSON.parse(jsonString);
      return questions;
    } else {
      console.error("Nenhum JSON válido encontrado na resposta da IA:", jsonText);
      return [];
    }
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
