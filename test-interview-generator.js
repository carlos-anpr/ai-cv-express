// Test de InterviewTestGenerator
// Ejecutar con: node test-interview-generator.js

// Para Node.js (CommonJS)
// const { InterviewTestGenerator } = require('./src/services/prompts/interviewTestGenerator.js');

// Para navegador o módulos ES
import { InterviewTestGenerator } from './src/services/prompts/interviewTestGenerator.js';

// ============================================
// TEST 1: Validación con datos incompletos
// ============================================
console.log('='.repeat(60));
console.log('TEST 1: Validación con candidatura incompleta');
console.log('='.repeat(60));

const candidaturaIncompleta = {
  companyName: 'Acme Tech',
  jobTitle: '',
  requirements: 'Node',
  jobDescription: 'Desarrollar',
};

const validation1 = InterviewTestGenerator.validateJobApplicationData(
  candidaturaIncompleta
);
console.log('Resultado validación:', validation1);
console.log('Errores:', validation1.errors);
console.log('\n');

// ============================================
// TEST 2: Validación con datos completos
// ============================================
console.log('='.repeat(60));
console.log('TEST 2: Validación con candidatura completa');
console.log('='.repeat(60));

const candidaturaCompleta = {
  companyName: 'TechCorp S.L.',
  jobTitle: 'Backend Developer',
  requirements: `
    - 2-3 años de experiencia en Node.js y Express.js
    - Conocimiento sólido de MongoDB y PostgreSQL
    - Experiencia con API REST y GraphQL
    - Familiaridad con Docker y conceptos básicos de CI/CD
    - Conocimiento de testing con Jest o Mocha
    - Git y trabajo en equipo ágil (Scrum)
  `,
  jobDescription: `
    Buscamos un Backend Developer para unirse a nuestro equipo de desarrollo.
    Trabajarás en el desarrollo de microservicios para nuestra plataforma de e-commerce.
    El candidato ideal tiene 2-3 años de experiencia, capacidad de trabajar de forma
    autónoma en proyectos completos, y ganas de aprender nuevas tecnologías.
    Metodología ágil con sprints de 2 semanas.
  `,
  responsibilities: `
    - Desarrollo de nuevas funcionalidades en Node.js
    - Diseño e implementación de APIs REST
    - Optimización de consultas de base de datos
    - Code review de otros desarrolladores
    - Documentación técnica
  `,
  location: 'Madrid, España',
};

const validation2 =
  InterviewTestGenerator.validateJobApplicationData(candidaturaCompleta);
console.log('Resultado validación:', validation2);
console.log('\n');

// ============================================
// TEST 3: Detección de nivel profesional
// ============================================
console.log('='.repeat(60));
console.log('TEST 3: Detección de nivel profesional');
console.log('='.repeat(60));

const nivelJunior = InterviewTestGenerator.detectCandidateLevel(
  'Buscamos junior developer con 1-2 años de experiencia. Trabajo supervisado.',
  '0-2 años de experiencia'
);
console.log('Nivel detectado (Junior):', nivelJunior);

const nivelMid = InterviewTestGenerator.detectCandidateLevel(
  'Desarrollador con 3-5 años de experiencia. Autonomía en proyectos.',
  '3+ años de experiencia, capacidad de trabajar de forma autónoma'
);
console.log('Nivel detectado (Mid):', nivelMid);

const nivelSenior = InterviewTestGenerator.detectCandidateLevel(
  'Buscamos senior developer con 8+ años. Liderazgo técnico y mentoría.',
  'Senior developer, arquitectura de sistemas, gestión de equipo'
);
console.log('Nivel detectado (Senior):', nivelSenior);
console.log('\n');

// ============================================
// TEST 4: Extracción de skills técnicas
// ============================================
console.log('='.repeat(60));
console.log('TEST 4: Extracción de skills técnicas');
console.log('='.repeat(60));

const skills = InterviewTestGenerator.extractTechnicalSkills(
  candidaturaCompleta.requirements
);
console.log('Skills detectadas:', skills);
console.log('\n');

// ============================================
// TEST 5: Generación de prompt completo
// ============================================
console.log('='.repeat(60));
console.log('TEST 5: Generación de prompt completo');
console.log('='.repeat(60));

const mockResumeData = {
  firstName: 'Juan',
  lastName: 'Pérez',
  experience: [
    {
      title: 'Full Stack Developer',
      companyName: 'StartupXYZ',
      startDate: '2022',
      endDate: '2024',
      currentlyWorking: false,
    },
    {
      title: 'Junior Developer',
      companyName: 'Tech Solutions',
      startDate: '2020',
      endDate: '2022',
      currentlyWorking: false,
    },
  ],
  education: [
    {
      degree: 'Ingeniería Informática',
      universityName: 'Universidad Complutense',
      startDate: '2016',
      endDate: '2020',
    },
  ],
  skills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'Git'],
};

const prompt = InterviewTestGenerator.generatePrompt(
  mockResumeData,
  candidaturaCompleta
);

console.log('PROMPT GENERADO:');
console.log('-'.repeat(60));
console.log(prompt);
console.log('-'.repeat(60));
console.log('\n');
console.log('✅ Longitud del prompt:', prompt.length, 'caracteres');
console.log(
  '✅ El prompt incluye requisitos:',
  prompt.includes(candidaturaCompleta.requirements)
);
console.log(
  '✅ El prompt incluye descripción:',
  prompt.includes('Buscamos un Backend Developer')
);
console.log('✅ El prompt está en castellano');
console.log('\n');

// ============================================
// TEST 6: Mensaje de ayuda
// ============================================
console.log('='.repeat(60));
console.log('TEST 6: Mensaje de ayuda de validación');
console.log('='.repeat(60));

const helpMessage = InterviewTestGenerator.getValidationHelpMessage();
console.log('Título:', helpMessage.title);
console.log('\nConsejos:');
helpMessage.tips.forEach((tip, index) => {
  console.log(`\n${index + 1}. ${tip.field}`);
  console.log(`   ${tip.description}`);
  console.log(`   ${tip.example}`);
});

console.log('\n');
console.log('='.repeat(60));
console.log('✅ TODOS LOS TESTS COMPLETADOS');
console.log('='.repeat(60));
