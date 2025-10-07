#!/usr/bin/env node
/* eslint-env node */
/* global process */
import {
  expressProfileParserPrompt,
  normalizeProfileData,
} from '../src/services/prompts/expressProfileParser.js';

// Sample user text (from the user)
const userText = `Alexandre Dubois
Desarrollador PHP Senior

Desarrollador backend con más de 8 años de experiencia especializado en la creación de aplicaciones web robustas y escalables con PHP. Poseo un profundo conocimiento en el diseño, implementación y optimización de bases de datos tanto relacionales (MySQL, PostgreSQL) como NoSQL (MongoDB, Redis), lo que me permite seleccionar la tecnología más adecuada para cada proyecto. Apasionado por el código limpio, las buenas prácticas de desarrollo y la mejora continua del rendimiento.

Experiencia Clave
Desarrollo y mantenimiento de aplicaciones web complejas utilizando frameworks como Laravel y Symfony.

Diseño e implementación de APIs RESTful seguras y eficientes para la comunicación entre servicios.

Modelado y administración de bases de datos relacionales, incluyendo optimización de consultas y normalización.

Implementación de soluciones con bases de datos NoSQL para gestionar grandes volúmenes de datos no estructurados y mejorar la velocidad de respuesta.

Integración de cachés en memoria como Redis para acelerar el rendimiento de las aplicaciones.

Uso de herramientas de control de versiones como Git y participación en flujos de trabajo ágiles (Scrum).

Experiencia con contenedores (Docker) para la creación de entornos de desarrollo y despliegue consistentes.

Conocimientos Técnicos
Lenguajes: PHP, JavaScript, SQL.

Frameworks y Librerías: Laravel, Symfony, CodeIgniter, jQuery.

Bases de Datos Relacionales: MySQL, PostgreSQL, MariaDB.

Bases de Datos No Relacionales: MongoDB, Redis, Cassandra.

Herramientas y DevOps: Git, Docker, PHPUnit, Composer, Nginx.

Otros: APIs RESTful, Arquitectura de microservicios, Patrones de diseño.

Idiomas
Español
: Nativo.

Inglés
: Nivel C1 (Avanzado).

Francés
: Nivel A2 (Básico).
`;

console.log('Running express profile parser prompt test...');

// 1) Build the prompt
const promptObj = expressProfileParserPrompt(userText);

console.log('\n--- Prompt systemInstruction (truncated) ---');
console.log(promptObj.systemInstruction.split('\n').slice(0, 6).join('\n'));

// Check critical instruction is present
const criticalPhrase = 'PRIORIDAD ABSOLUTA';
const hasCritical =
  promptObj.prompt && promptObj.prompt.includes(criticalPhrase);
console.log(
  '\nPrompt includes priority instruction for CEFR codes? ->',
  hasCritical
);

// 2) Simulate model response (what the AI should return) - JSON object
const simulatedModelResponse = {
  education: {
    degree: 'Ingeniería Informática',
    institution: 'Universidad X',
    graduationYear: 2016,
  },
  sector: 'Desarrollo Web',
  yearsOfExperience: 8,
  level: 'senior',
  currentPosition: 'Desarrollador PHP Senior',
  skills: ['PHP', 'Laravel', 'MySQL', 'Redis'],
  strengths: ['Código limpio', 'Optimización de BBDD'],
  careerGoals: 'Seguir especializándome en arquitectura backend',
  languages: [
    { name: 'Español', level: 'Nativo' },
    { name: 'Inglés', level: 'Avanzado', levelCode: 'C1' },
    { name: 'Francés', level: 'Básico', levelCode: 'A2' },
  ],
};

console.log('\n--- Simulated model response (languages) ---');
console.log(JSON.stringify(simulatedModelResponse.languages, null, 2));

// 3) Normalize via normalizeProfileData
const normalized = normalizeProfileData(simulatedModelResponse);

console.log('\n--- Normalized languages ---');
console.log(JSON.stringify(normalized.languages, null, 2));

// Basic checks
let pass = true;
if (!Array.isArray(normalized.languages) || normalized.languages.length < 3) {
  console.error('FAIL: languages not normalized as expected');
  pass = false;
}

const normalizeName = (s = '') =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const eng = normalized.languages.find((l) =>
  /ingl(es|ish)/i.test(normalizeName(l.name))
);
const fr = normalized.languages.find((l) =>
  /franc/i.test(normalizeName(l.name))
);
if (!eng || (eng.level !== 'C1' && eng.level !== 'Avanzado')) {
  console.error('FAIL: English not normalized to C1/Avanzado:', eng);
  pass = false;
}
if (!fr || (fr.level !== 'A2' && fr.level !== 'Básico')) {
  console.error('FAIL: French not normalized to A2/Básico:', fr);
  pass = false;
}

if (pass) {
  console.log(
    '\nTEST PASS: normalizeProfileData handled languages as expected.'
  );
  process.exit(0);
} else {
  console.error('\nTEST FAIL');
  process.exit(1);
}
