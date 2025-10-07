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
      "level": "básico|intermedio|avanzado|nativo",
      "levelCode": "A1|A2|B1|B2|C1|C2 (opcional)"
    }
  ]
}

INSTRUCCIONES CRÍTICAS PARA DETECCIÓN DE IDIOMAS:
- DEBES encontrar TODOS los idiomas listados, especialmente bajo una sección llamada "Idiomas" o "Languages".
- PRIORIDAD ABSOLUTA: Si un código CEFR (A1, A2, B1, B2, C1, C2) aparece explícitamente junto al nombre del idioma, DEBES usar ese código. Este dato explícito anula cualquier inferencia basada en texto descriptivo.
- IGNORA caracteres extraños o invisibles (como saltos de línea o símbolos unicode) que puedan aparecer junto a las palabras.

FORMATO DE EXTRACCIÓN:
- Cuando un idioma incluye un código CEFR y un descriptor (ej: "Avanzado"), "levelCode" DEBE contener el código (ej: "C1") y "level" DEBE contener el descriptor (ej: "Avanzado").
- Si solo se encuentra un código CEFR, úsalo tanto para "level" como para "levelCode".
- Si solo se encuentra un descriptor (ej: "Nativo", "Básico"), úsalo para "level" y deja "levelCode" como null.
- Si no se menciona ningún idioma, y solo en ese caso, devuelve un array vacío.

EJEMPLOS DE INPUT -> OUTPUT ESPERADO:

1. Input:
   Idiomas
   Español: Nativo.
   Inglés: Nivel C1 (Avanzado).
   Francés: Nivel A2 (Básico).

   Output Esperado:
   [
     { "name": "Español", "level": "Nativo", "levelCode": null },
     { "name": "Inglés", "level": "Avanzado", "levelCode": "C1" },
     { "name": "Francés", "level": "Básico", "levelCode": "A2" }
   ]

2. Input:
   Capacidad para liderar reuniones técnicas en inglés (nivel C1).

   Output Esperado:
   [
     { "name": "Inglés", "level": "Avanzado", "levelCode": "C1" }
   ]

3. Input:
   Idiomas: Español (nativo), Inglés fluido.

   Output Esperado:
   [
     { "name": "Español", "level": "Nativo", "levelCode": null },
     { "name": "Inglés", "level": "Fluido", "levelCode": "C1" }
   ]

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

  /*
    ADICIONAL - INSTRUCCIONES ESPECÍFICAS PARA DETECCIÓN DE IDIOMAS

    - Detecta idiomas mencionados explícitamente en el texto (ej: "Inglés: C1", "Francés (A2)", "Español - nativo").
    - Cuando sea posible devuelve BOTH: un descriptor humano en "level" (ej: "avanzado", "nativo") y un código CEFR en "levelCode" (ej: "C1", "A2").
      Ejemplo de item esperado: { "name": "Inglés", "level": "Avanzado", "levelCode": "C1" }
    - Detecta formatos comunes: "C1", "Nivel C1", "C1 (Advanced)", "Advanced (C1)", "Inglés: Nivel C1", "English - C1".
    - Si sólo aparece un descriptor (ej: "avanzado", "nativo", "básico"), devuelve ese descriptor en "level" y deja "levelCode" como null.
    - Si no se menciona nivel explícito pero hay pistas que permiten inferirlo (ej: "Capacidad para liderar reuniones técnicas" -> mínimo C1; "participación en equipos internacionales" -> normalmente B2/C1), trata de inferir conservadoramente el nivel y llena ambos campos con la inferencia (ej: "level": "Avanzado", "levelCode": "C1"). No inventes niveles más altos de lo que el texto sugiere.
    - Mapea sinónimos en español/inglés automáticamente (ej: "native" -> "Nativo", "advanced" -> "Avanzado", "good level" -> "B2" si procede).
    - Si no aparece mención alguna de idiomas, devuelve un array vacío.

    EJEMPLOS (INPUT -> OUTPUT esperado):
    "Inglés: Nivel C1 (Avanzado)" -> { name: "Inglés", level: "C1", levelCode: "C1" }
    "Francés: A2" -> { name: "Francés", level: "A2", levelCode: "A2" }
    "Español nativo, Inglés C1" -> two items: Español (Nativo), Inglés (C1)
    "Capacidad para liderar reuniones técnicas en inglés" -> infer: Inglés (C1)

    Estas instrucciones son parte del mismo prompt: responde el JSON final con los objetos de idiomas normalizados.
  */
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
    // Normalizar languages: extraer CEFR del texto si es necesario, mapear descriptores
    languages: Array.isArray(data.languages)
      ? data.languages.map((lang) => {
          const name = (lang.name || '').trim();
          const rawLevel = lang.level ? String(lang.level).trim() : '';
          const explicitLevelCode = lang.levelCode
            ? String(lang.levelCode).trim()
            : '';

          // Helper: extraer código CEFR desde texto libre si aparece (A1..C2)
          const extractCEFR = (text) => {
            if (!text) return '';
            const m = text.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
            return m ? m[1].toUpperCase() : '';
          };

          // Helper: mapear descriptores humanos a etiquetas consistentes
          const mapDescriptor = (text) => {
            if (!text) return '';
            const s = text.toLowerCase();
            if (/native|nativo|lengua materna/.test(s)) return 'Nativo';
            if (/avanzado|advanced|fluido|fluente/.test(s)) return 'Avanzado';
            if (/intermedio|intermediate|medio/.test(s)) return 'Intermedio';
            if (/b[aá]sico|basic|principiante|beginner/.test(s))
              return 'Básico';
            return '';
          };

          const detectedCode = explicitLevelCode || extractCEFR(rawLevel);
          const detectedDescriptor = mapDescriptor(rawLevel);

          // Regla de prioridad:
          // - Si existe BOTH (código + descriptor), level => descriptor, levelCode => código
          // - Si existe solo código, usar código tanto en level como en levelCode (según prompt)
          // - Si existe solo descriptor, devolver descriptor y levelCode=null
          if (detectedCode && detectedDescriptor) {
            return {
              name,
              level: detectedDescriptor,
              levelCode: detectedCode,
            };
          }

          if (detectedCode && !detectedDescriptor) {
            return {
              name,
              level: detectedCode,
              levelCode: detectedCode,
            };
          }

          if (!detectedCode && detectedDescriptor) {
            return {
              name,
              level: detectedDescriptor,
              levelCode: null,
            };
          }

          // Nada detectado
          return {
            name,
            level: rawLevel || '',
            levelCode: null,
          };
        })
      : [],
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
