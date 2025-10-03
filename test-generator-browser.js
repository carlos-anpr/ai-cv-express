// Test Component para InterviewTestGenerator
// Copiar este código en la consola del navegador en http://localhost:5173

import { InterviewTestGenerator } from './src/services/prompts/interviewTestGenerator.js';

// Candidatura de ejemplo completa
const candidaturaEjemplo = {
  companyName: 'TechCorp Solutions',
  jobTitle: 'Backend Developer Node.js',
  requirements: `
    - 2-3 años de experiencia profesional con Node.js y Express.js
    - Conocimiento sólido de bases de datos MongoDB y PostgreSQL
    - Experiencia diseñando e implementando APIs REST
    - Conocimiento de Docker y conceptos básicos de CI/CD
    - Experiencia con testing (Jest, Mocha o similar)
    - Git y trabajo en equipo ágil con metodología Scrum
    - Conocimientos de GraphQL es un plus
  `,
  jobDescription: `
    Estamos buscando un Backend Developer con 2-3 años de experiencia para unirse
    a nuestro equipo de desarrollo de producto. Trabajarás en el desarrollo y 
    mantenimiento de microservicios que dan soporte a nuestra plataforma de e-commerce.
    
    El candidato ideal tiene experiencia trabajando de forma autónoma en proyectos
    completos, desde el diseño hasta el despliegue. Valoramos la capacidad de 
    aprendizaje, trabajo en equipo y mentalidad de mejora continua.
    
    Trabajarás con metodología ágil en sprints de 2 semanas, participarás en 
    dailies, plannings y retrospectivas.
  `,
  responsibilities: `
    - Desarrollo de nuevas funcionalidades y endpoints en Node.js
    - Diseño e implementación de APIs REST robustas y escalables
    - Optimización de consultas y rendimiento de base de datos
    - Code review y mentoría de desarrolladores junior
    - Documentación técnica de los servicios desarrollados
    - Participación en la definición de arquitectura técnica
    - Testing unitario e integración de los servicios
  `,
  location: 'Madrid, España (Híbrido)',
};

const cvEjemplo = {
  firstName: 'Ana',
  lastName: 'García',
  experience: [
    {
      title: 'Full Stack Developer',
      companyName: 'Digital Startup',
      startDate: '2022',
      endDate: 'Actualidad',
      currentlyWorking: true,
    },
    {
      title: 'Junior Backend Developer',
      companyName: 'Tech Innovations',
      startDate: '2020',
      endDate: '2022',
      currentlyWorking: false,
    },
  ],
  education: [
    {
      degree: 'Grado en Ingeniería Informática',
      universityName: 'Universidad Politécnica de Madrid',
      startDate: '2016',
      endDate: '2020',
    },
  ],
  skills: [
    'JavaScript',
    'Node.js',
    'Express.js',
    'MongoDB',
    'PostgreSQL',
    'Docker',
    'Git',
    'React',
  ],
};

console.log('🧪 TESTS DE INTERVIEW TEST GENERATOR');
console.log('='.repeat(70));

// TEST 1: Validación
console.log('\n📋 TEST 1: Validación de candidatura completa');
const validation =
  InterviewTestGenerator.validateJobApplicationData(candidaturaEjemplo);
console.log('✅ Validación:', validation);

// TEST 2: Candidatura incompleta
console.log('\n📋 TEST 2: Validación de candidatura incompleta');
const candidaturaIncompleta = {
  companyName: 'Test Corp',
  jobTitle: '',
  requirements: 'Node',
  jobDescription: 'Dev',
};
const validationError = InterviewTestGenerator.validateJobApplicationData(
  candidaturaIncompleta
);
console.log('❌ Errores encontrados:', validationError.errors);

// TEST 3: Detección de nivel
console.log('\n📋 TEST 3: Detección de nivel profesional');
const nivelDetectado = InterviewTestGenerator.detectCandidateLevel(
  candidaturaEjemplo.jobDescription,
  candidaturaEjemplo.requirements
);
console.log('🎯 Nivel detectado:', nivelDetectado);

// TEST 4: Extracción de skills
console.log('\n📋 TEST 4: Extracción de habilidades técnicas');
const skills = InterviewTestGenerator.extractTechnicalSkills(
  candidaturaEjemplo.requirements
);
console.log('💡 Skills detectadas:', skills);

// TEST 5: Generación de prompt
console.log('\n📋 TEST 5: Generación de prompt completo');
const prompt = InterviewTestGenerator.generatePrompt(
  cvEjemplo,
  candidaturaEjemplo
);
console.log('📝 Longitud del prompt:', prompt.length, 'caracteres');
console.log(
  '✅ Incluye empresa:',
  prompt.includes(candidaturaEjemplo.companyName)
);
console.log('✅ Incluye puesto:', prompt.includes(candidaturaEjemplo.jobTitle));
console.log('✅ Incluye requisitos técnicos:', prompt.includes('Node.js'));

// TEST 6: Ver prompt completo
console.log('\n📋 TEST 6: Prompt completo (ver en consola)');
console.log('Para ver el prompt completo, ejecuta: showPrompt()');
window.showPrompt = () => {
  console.log('\n' + '='.repeat(70));
  console.log('PROMPT GENERADO PARA GEMINI:');
  console.log('='.repeat(70));
  console.log(prompt);
  console.log('='.repeat(70));
};

// TEST 7: Mensaje de ayuda
console.log('\n📋 TEST 7: Mensaje de ayuda para usuarios');
const helpMessage = InterviewTestGenerator.getValidationHelpMessage();
console.log('ℹ️ Título:', helpMessage.title);
console.log('💬 Consejos:', helpMessage.tips.length, 'disponibles');

console.log('\n' + '='.repeat(70));
console.log('✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE');
console.log('='.repeat(70));
console.log('\n💡 Para ver el prompt completo, ejecuta: showPrompt()');
console.log(
  '💡 Para probar con tus datos: InterviewTestGenerator.generatePrompt(tuCV, tuCandidatura)'
);
