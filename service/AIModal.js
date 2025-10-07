// const {
//     GoogleGenerativeAI,
//     HarmCategory,
//     HarmBlockThreshold,
//   } = require("@google/generative-ai");

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const geminiModel = import.meta.env.VITE_GOOGLE_GEMINI_MODEL;
if (!geminiModel) {
  console.error(
    '[AIModal] Falta configurar VITE_GOOGLE_GEMINI_MODEL en el .env'
  );
  throw new Error('Falta configurar VITE_GOOGLE_GEMINI_MODEL en el .env');
}
const model = genAI.getGenerativeModel({
  model: geminiModel,
});

const generationConfig = {
  temperature: 0.5,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

export const AIChatSession = () => {
  return model.startChat({
    generationConfig,
    // safetySettings: Adjust safety settings
    // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [],
  });
};

// Configuración específica para cartas de recomendación (texto plano)
const textGenerationConfig = {
  temperature: 0.6,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

export const AIChatSessionText = () => {
  return model.startChat({
    generationConfig: textGenerationConfig,
    history: [],
  });
};
