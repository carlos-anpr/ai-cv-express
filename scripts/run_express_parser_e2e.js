#!/usr/bin/env node
/* eslint-env node */
/* global process */
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  expressProfileParserPrompt,
  normalizeProfileData,
} from '../src/services/prompts/expressProfileParser.js';

const apiKey = '';
const modelName = '';

if (!apiKey || !modelName) {
  console.error('Missing environment variables required to call the AI.');
  console.error(
    'Set the following variables in your PowerShell session before running:'
  );
  console.error('$env:VITE_GOOGLE_GEMINI_AI_API_KEY = "<YOUR_API_KEY>"');
  console.error('$env:VITE_GOOGLE_GEMINI_MODEL = "<MODEL_NAME>"');
  console.error('\nOr run in one line:');
  console.error(
    '$env:VITE_GOOGLE_GEMINI_AI_API_KEY="<KEY>"; $env:VITE_GOOGLE_GEMINI_MODEL="<MODEL>"; node ./scripts/run_express_parser_e2e.js'
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: modelName });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

const run = async () => {
  try {
    const userText = `Alexandre Dubois
Desarrollador PHP Senior

Desarrollador backend con más de 8 años de experiencia especializado en la creación de aplicaciones web robustas y escalables con PHP. Poseo un profundo conocimiento en el diseño, implementación y optimización de bases de datos tanto relacionales (MySQL, PostgreSQL) como NoSQL (MongoDB, Redis), lo que me permite seleccionar la tecnología más adecuada para cada proyecto. Apasionado por el código limpio, las buenas prácticas de desarrollo y la mejora continua del rendimiento.

Idiomas
Español: Nativo
Inglés: Nivel C1 (Avanzado)
Francés: Nivel A2 (Básico)
`;

    const promptConfig = expressProfileParserPrompt(userText);

    console.log('Sending prompt to model:', modelName);

    const session = model.startChat({ generationConfig, history: [] });

    // Send the prompt text (the prompt object contains both instructions and the user text)
    const res = await session.sendMessage(promptConfig.prompt);

    // response.text() should return the JSON string as per AIModal usage
    const rawText = res?.response?.text
      ? await res.response.text()
      : typeof res === 'string'
      ? res
      : JSON.stringify(res);

    console.log('\n--- Raw model response text ---\n');
    console.log(rawText);

    // Try parse JSON
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      console.error('Failed to parse model response as JSON:', e.message);
      process.exit(2);
    }

    const normalized = normalizeProfileData(parsed);

    console.log('\n--- Normalized profile (languages) ---\n');
    console.log(JSON.stringify(normalized.languages, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error during E2E run:', err);
    process.exit(3);
  }
};

run();
