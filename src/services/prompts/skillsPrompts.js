/**
 * Prompts y utilidades para generación y clasificación de habilidades
 * Permiten parsear descripciones en lenguaje natural y convertirlas en skills estructuradas
 */

export const skillsParserPrompt = (description, jobTitle) => `
Eres un experto en análisis de habilidades técnicas y profesionales. Tu tarea es extraer y clasificar habilidades de una descripción en lenguaje natural.

CONTEXTO:
- Puesto de trabajo: ${jobTitle}
- Descripción del usuario: "${description}"

INSTRUCCIONES:
1. Identifica todas las habilidades técnicas mencionadas
2. Normaliza los nombres de tecnologías/herramientas a su forma estándar
   - Ejemplos: "nodejs" → "Node.js", "react js" → "React", "javascript" → "JavaScript"
3. Detecta el nivel de dominio basado en keywords:
   - Experto/Avanzado/Domino: nivel "experto"
   - Intermedio/Medio/Sólido: nivel "intermedio"
   - Básico/Principiante/Conocimientos: nivel "básico"
4. Si no se menciona nivel explícito, asume "intermedio"
5. Incluye solo habilidades técnicas relevantes para el puesto
6. Ordena por relevancia para el puesto

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "skills": [
    {
      "name": "nombre normalizado de la skill",
      "level": "experto|intermedio|básico",
      "detected_from": "texto donde se detectó"
    }
  ],
  "unrecognized": ["términos que no se pudieron clasificar"],
  "suggestions": ["sugerencias de skills relacionadas al puesto"]
}

EJEMPLOS:
Input: "Domino Node.js a nivel experto, React conocimientos básicos"
Output: {
  "skills": [
    { "name": "Node.js", "level": "experto", "detected_from": "Domino Node.js a nivel experto" },
    { "name": "React", "level": "básico", "detected_from": "React conocimientos básicos" }
  ]
}

Toda la respuesta debe estar en castellano (español).
`;

/**
 * Mapa de normalización de nombres de tecnologías
 * Convierte variaciones comunes a nombres estándar
 */
export const skillsNormalizationMap = {
  // JavaScript Ecosystem
  js: 'JavaScript',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  react: 'React',
  reactjs: 'React',
  'react.js': 'React',
  vue: 'Vue.js',
  vuejs: 'Vue.js',
  angular: 'Angular',
  next: 'Next.js',
  nextjs: 'Next.js',

  // Python Ecosystem
  python: 'Python',
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',

  // Databases
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mongo: 'MongoDB',
  mongodb: 'MongoDB',

  // DevOps
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud',

  // Others
  git: 'Git',
  github: 'GitHub',
  gitlab: 'GitLab',
  jira: 'Jira',
  agile: 'Agile',
  scrum: 'Scrum',
};

/**
 * Normaliza el nombre de una skill usando el mapa
 * @param {string} skillName - Nombre de la skill a normalizar
 * @returns {string} - Nombre normalizado
 */
export const normalizeSkillName = (skillName) => {
  const normalized = skillName.toLowerCase().trim();
  return (
    skillsNormalizationMap[normalized] ||
    skillName.charAt(0).toUpperCase() + skillName.slice(1)
  );
};
