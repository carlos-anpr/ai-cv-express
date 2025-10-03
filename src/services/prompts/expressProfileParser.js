/**
 * Express Profile Parser Prompt
 *
 * Analiza la descripción libre del perfil del usuario y extrae información estructurada
 * para generar un CV personalizado.
 */

export const expressProfileParserPrompt = (userDescription) => {
  return {
    systemInstruction: `Eres un experto analizador de perfiles profesionales. Tu tarea es extraer información estructurada de descripciones libres de usuarios sobre su experiencia profesional.

IMPORTANTE:
- Extrae SOLO la información mencionada explícitamente
- NO inventes datos
- Si algo no está claro, usa valores genéricos apropiados
- Sé preciso con los años de experiencia
- Identifica correctamente el nivel profesional (junior/mid/senior)`,

    prompt: `Analiza la siguiente descripción de perfil profesional y extrae información estructurada en formato JSON:

DESCRIPCIÓN DEL USUARIO:
"""
${userDescription}
"""

Extrae la siguiente información y devuélvela en formato JSON válido:

{
  "education": {
    "degree": "Título o grado obtenido (ej: 'Ingeniería Informática', 'Grado en Marketing')",
    "institution": "Institución educativa si se menciona, sino 'No especificado'",
    "graduationYear": "Año de graduación si se menciona, sino null"
  },
  "sector": "Sector o industria principal (ej: 'Desarrollo Web', 'Marketing Digital', 'Diseño UX/UI')",
  "yearsOfExperience": 0,
  "level": "junior|mid|senior|expert",
  "currentPosition": "Posición actual si se menciona, sino 'No especificado'",
  "skills": [
    "Lista de habilidades técnicas o profesionales mencionadas",
    "Máximo 10 skills más relevantes",
    "Prioriza las más específicas y técnicas"
  ],
  "strengths": [
    "2-3 fortalezas o características destacables",
    "Basadas en lo mencionado en la descripción"
  ],
  "careerGoals": "Objetivo profesional si se menciona o se puede inferir, sino 'Desarrollo profesional continuo'",
  "languages": [
    {
      "name": "Idioma",
      "level": "básico|intermedio|avanzado|nativo"
    }
  ]
}

REGLAS PARA DETERMINAR EL NIVEL:
- junior: 0-2 años de experiencia
- mid: 3-5 años de experiencia
- senior: 6-10 años de experiencia
- expert: 10+ años de experiencia

REGLAS PARA SKILLS:
- Extrae SOLO skills mencionadas explícitamente
- Prioriza tecnologías, herramientas y metodologías específicas
- Si menciona lenguajes de programación, frameworks o herramientas, inclúyelos primero
- Si no se mencionan skills específicas, deja el array vacío

Si algo no está mencionado en la descripción, usa valores por defecto apropiados pero NO inventes información específica.

Responde ÚNICAMENTE con el JSON, sin texto adicional.`,

    responseFormat: 'application/json',
  };
};

/**
 * Valida el resultado del parsing de perfil
 */
export const validateProfileData = (data) => {
  const errors = [];
  const warnings = [];

  // Validaciones requeridas
  if (!data.education?.degree || data.education.degree.length < 3) {
    errors.push(
      'education.degree es requerido y debe tener al menos 3 caracteres'
    );
  }

  if (!data.sector || data.sector.length < 3) {
    errors.push('sector es requerido y debe tener al menos 3 caracteres');
  }

  if (
    typeof data.yearsOfExperience !== 'number' ||
    data.yearsOfExperience < 0
  ) {
    errors.push('yearsOfExperience debe ser un número positivo');
  }

  const validLevels = ['junior', 'mid', 'senior', 'expert'];
  if (!validLevels.includes(data.level)) {
    errors.push(`level debe ser uno de: ${validLevels.join(', ')}`);
  }

  if (!Array.isArray(data.skills)) {
    errors.push('skills debe ser un array');
  }

  // Advertencias
  if (data.skills.length === 0) {
    warnings.push(
      'No se detectaron skills específicas. Considera añadirlas manualmente.'
    );
  }

  if (data.skills.length < 3) {
    warnings.push(
      'Se detectaron pocas skills. Considera añadir más para mejorar el CV.'
    );
  }

  if (!data.currentPosition || data.currentPosition === 'No especificado') {
    warnings.push('No se especificó la posición actual.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Limpia y normaliza los datos parseados
 */
export const normalizeProfileData = (data) => {
  return {
    education: {
      degree: data.education?.degree?.trim() || 'No especificado',
      institution: data.education?.institution?.trim() || 'No especificado',
      graduationYear: data.education?.graduationYear || null,
    },
    sector: data.sector?.trim() || 'No especificado',
    yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
    level: data.level || 'junior',
    currentPosition: data.currentPosition?.trim() || 'No especificado',
    skills: Array.isArray(data.skills)
      ? data.skills.map((s) => s.trim()).filter(Boolean)
      : [],
    strengths: Array.isArray(data.strengths)
      ? data.strengths.map((s) => s.trim()).filter(Boolean)
      : [],
    careerGoals: data.careerGoals?.trim() || 'Desarrollo profesional continuo',
    languages: Array.isArray(data.languages) ? data.languages : [],
  };
};

/**
 * Genera sugerencias basadas en el perfil parseado
 */
export const generateProfileSuggestions = (data) => {
  const suggestions = [];

  if (data.yearsOfExperience === 0) {
    suggestions.push(
      '💡 Si tienes proyectos personales o académicos, menciónalos como experiencia práctica'
    );
  }

  if (data.skills.length < 5) {
    suggestions.push(
      '💡 Añade más habilidades técnicas para fortalecer tu perfil'
    );
  }

  if (!data.languages || data.languages.length === 0) {
    suggestions.push(
      '💡 Menciona los idiomas que dominas para mejorar tus oportunidades'
    );
  }

  if (data.level === 'junior' && data.yearsOfExperience > 2) {
    suggestions.push(
      '⚠️ Con tu experiencia, podrías calificar para posiciones mid-level'
    );
  }

  return suggestions;
};

export default {
  expressProfileParserPrompt,
  validateProfileData,
  normalizeProfileData,
  generateProfileSuggestions,
};
