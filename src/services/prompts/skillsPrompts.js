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
7. IMPORTANTE: Categoriza automáticamente cada habilidad

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "skills": [
    {
      "name": "nombre normalizado de la skill",
      "level": "experto|intermedio|básico",
      "category": "categoría técnica apropiada",
      "detected_from": "texto donde se detectó"
    }
  ],
  "unrecognized": ["términos que no se pudieron clasificar"],
  "suggestions": ["sugerencias de skills relacionadas al puesto"]
}

CATEGORÍAS ESTÁNDAR A USAR:
- "Backend Development" - Node.js, Python, Java, APIs REST, GraphQL, etc.
- "Frontend Development" - React, Vue, Angular, HTML, CSS, TypeScript, etc.
- "Bases de Datos" - MongoDB, PostgreSQL, MySQL, Redis, etc.
- "DevOps & Herramientas" - Docker, Kubernetes, Git, CI/CD, AWS, etc.
- "Mobile Development" - React Native, Flutter, iOS, Android, etc.
- "Testing & Quality" - Jest, Cypress, Testing, QA, etc.
- "Otros" - Para habilidades que no encajan claramente

EJEMPLOS:
Input: "Domino Node.js a nivel experto, React conocimientos básicos"
Output: {
  "skills": [
    { "name": "Node.js", "level": "experto", "category": "Backend Development", "detected_from": "Domino Node.js a nivel experto" },
    { "name": "React", "level": "básico", "category": "Frontend Development", "detected_from": "React conocimientos básicos" }
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

/**
 * Prompt para categorizar automáticamente una lista de habilidades existentes
 */
export const skillsCategorizationPrompt = (skills, jobTitle) => `
Eres un experto en clasificación de habilidades técnicas. Tu tarea es categorizar una lista de habilidades para un CV profesional.

CONTEXTO:
- Puesto de trabajo: ${jobTitle}
- Habilidades a categorizar: ${JSON.stringify(
  skills.map((s) => ({ name: s.name, rating: s.rating }))
)}

INSTRUCCIONES:
1. Analiza cada habilidad y asígnala a la categoría más apropiada
2. Las categorías deben ser profesionales y relevantes para el puesto
3. Agrupa habilidades relacionadas en la misma categoría
4. Usa nombres de categorías en español, claros y profesionales
5. Mantén los nombres y ratings originales sin modificar

CATEGORÍAS ESTÁNDAR RECOMENDADAS (usa estas cuando sean apropiadas):
- "Backend Development" - Tecnologías de servidor, APIs, frameworks backend
- "Frontend Development" - Tecnologías de cliente, frameworks frontend, UI/UX
- "Bases de Datos" - Motores de base de datos, modelado, gestión de datos
- "DevOps & Herramientas" - Contenedores, CI/CD, cloud, automatización
- "Mobile Development" - Desarrollo móvil, frameworks nativos/híbridos
- "Testing & Quality" - Testing, QA, herramientas de pruebas
- "Metodologías" - Agile, Scrum, metodologías de trabajo
- "Soft Skills" - Habilidades blandas, liderazgo, comunicación

FORMATO DE RESPUESTA:
Devuelve un JSON con esta estructura exacta:
{
  "categorizedSkills": [
    {
      "name": "nombre original",
      "rating": rating_original,
      "category": "categoría asignada"
    }
  ],
  "categories": ["lista de categorías únicas usadas"]
}

EJEMPLO:
Input: [{"name": "Node.js", "rating": 5}, {"name": "React", "rating": 4}]
Output: {
  "categorizedSkills": [
    {"name": "Node.js", "rating": 5, "category": "Backend Development"},
    {"name": "React", "rating": 4, "category": "Frontend Development"}
  ],
  "categories": ["Backend Development", "Frontend Development"]
}

IMPORTANTE:
- NO modifiques los nombres de las habilidades
- NO modifiques los ratings
- Solo añade el campo "category"
- Toda la respuesta debe estar en castellano (español)
`;
