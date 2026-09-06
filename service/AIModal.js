// const {
//     GoogleGenerativeAI,
//     HarmCategory,
//     HarmBlockThreshold,
//   } = require("@google/generative-ai");

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY?.trim();
if (!apiKey) {
  throw new Error('Falta configurar VITE_GOOGLE_GEMINI_AI_API_KEY en el .env');
}

const genAI = new GoogleGenerativeAI(apiKey);

const geminiModel =
  import.meta.env.VITE_GOOGLE_GEMINI_MODEL?.trim() ||
  'gemini-flash-lite-latest';

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
