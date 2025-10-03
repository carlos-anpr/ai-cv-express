/**
 * Express Resume Generator Prompt
 *
 * Genera un CV completo basado en el perfil del usuario y la oferta de trabajo.
 */

export const expressResumeGeneratorPrompt = (profileData, jobOfferData) => {
  return {
    systemInstruction: `Eres un experto redactor de CVs profesionales con 15 años de experiencia ayudando a candidatos a conseguir entrevistas. Tu especialidad es crear CVs ATS-friendly (Applicant Tracking System) que destacan las competencias relevantes para cada puesto.

PRINCIPIOS CLAVE:
1. Personalización: Adapta el contenido al puesto específico
2. Palabras clave: Incluye términos de la oferta para superar ATS
3. Logros cuantificables: Usa números y métricas cuando sea posible
4. Claridad: Lenguaje profesional pero accesible
5. Relevancia: Prioriza experiencia relacionada con el puesto

REGLAS DE FORMATO:
- Resumen: 3-4 líneas, enfocado en el puesto objetivo
- Experiencia: 2-4 posiciones, con 3-5 bullets por posición
- Educación: 1-2 entradas principales
- Habilidades: 8-12 skills priorizadas por relevancia`,

    prompt: `Genera un CV profesional completo en formato JSON basándote en la siguiente información:

PERFIL DEL CANDIDATO:
${JSON.stringify(profileData, null, 2)}

OFERTA DE TRABAJO:
${JSON.stringify(jobOfferData, null, 2)}

Genera un CV estructurado en el siguiente formato JSON:

{
  "personalInfo": {
    "firstName": "Nombre (extrae del perfil si está, sino usa 'Tu Nombre')",
    "lastName": "Apellido (extrae del perfil si está, sino usa 'Tu Apellido')",
    "jobTitle": "Título profesional adaptado a la oferta",
    "email": "tuemail@ejemplo.com",
    "phone": "+34 600 000 000",
    "address": "Ciudad del puesto, País"
  },
  "summary": "Resumen profesional de 3-4 líneas que:
    - Mencione años de experiencia y sector
    - Destaque 2-3 habilidades clave de la oferta
    - Mencione logro o valor diferencial
    - Termine con objetivo alineado al puesto
    Ejemplo: 'Desarrollador Full Stack con 5 años de experiencia en tecnologías web modernas...'",
  
  "experience": [
    {
      "title": "Título del puesto (relacionado con experiencia del candidato)",
      "company": "Nombre de empresa (puede ser genérico si no se especifica)",
      "location": "Ciudad, País",
      "startDate": "MM/YYYY (calcula basándote en años de experiencia)",
      "endDate": "Presente" o "MM/YYYY",
      "current": true o false,
      "description": "Breve descripción de 1 línea del rol",
      "achievements": [
        "Logro 1 con métrica si es posible (ej: 'Desarrollé 3 aplicaciones web que incrementaron la eficiencia en 30%')",
        "Logro 2 relacionado con requisitos de la oferta",
        "Logro 3 que demuestre habilidades técnicas solicitadas",
        "Logro 4 opcional si el candidato es senior"
      ]
    }
    // Genera 2-4 experiencias según el nivel:
    // - Junior (0-2 años): 1-2 posiciones
    // - Mid (3-5 años): 2-3 posiciones
    // - Senior (6+ años): 3-4 posiciones
  ],
  
  "education": [
    {
      "degree": "Título exacto del perfil del candidato",
      "institution": "Institución del perfil o 'Universidad [Nombre Ciudad]' si no se especifica",
      "location": "Ciudad, País",
      "graduationYear": "Año (calcula: actualYear - yearsOfExperience - 4)",
      "description": "Descripción opcional si es relevante (especialización, proyecto final, etc.)"
    }
    // Añade una segunda entrada solo si el candidato menciona estudios adicionales
  ],
  
  "skills": [
    {
      "name": "Habilidad 1 (prioriza las de la oferta)",
      "rating": 5,
      "category": "technical"
    },
    {
      "name": "Habilidad 2",
      "rating": 4,
      "category": "technical"
    }
    // Genera 8-12 skills total:
    // - 60% de las habilidades de la oferta (rating 4-5)
    // - 40% de las habilidades del candidato (rating 3-5)
    // - Categorías: "technical", "soft", "language", "tool"
  ]
}

INSTRUCCIONES ESPECÍFICAS:

1. **Resumen Profesional:**
   - Primera frase: "[Título profesional] con [X años] de experiencia en [sector]"
   - Segunda frase: "Especializado en [2-3 skills clave de la oferta]"
   - Tercera frase: Logro destacable o valor diferencial
   - Cuarta frase: "Busco aportar [habilidad] en [tipo de empresa/rol]"

2. **Experiencia Laboral:**
   - Títulos de puestos: Evolución profesional lógica
   - Fechas: Coherentes y sin gaps sospechosos
   - Achievements: Empiezan con verbos de acción (Desarrollé, Lideré, Implementé, Optimicé)
   - Incluye keywords de la oferta naturalmente
   - Si el candidato es junior, enfoca en proyectos académicos o personales como experiencia

3. **Educación:**
   - Grado del candidato como entrada principal
   - Año de graduación coherente con experiencia
   - Si el puesto requiere certificaciones, añádelas como segunda entrada

4. **Habilidades:**
   - Prioriza habilidades técnicas de la oferta (rating 4-5)
   - Incluye habilidades del candidato aunque no estén en la oferta (rating 3-4)
   - Añade 2-3 soft skills relevantes (comunicación, trabajo en equipo, etc.)
   - Si hay idiomas mencionados, inclúyelos

5. **Coherencia:**
   - El nivel de experiencia debe ser consistente en todo el CV
   - Los logros deben ser realistas para el nivel del candidato
   - Las fechas deben tener sentido cronológicamente
   - El tono debe ser profesional y confiado

6. **Personalización al Puesto:**
   - Usa la terminología exacta de la oferta cuando sea posible
   - Si la oferta menciona "React", usa "React" (no "framework de JavaScript")
   - Enfatiza experiencia relevante al puesto
   - Si el candidato viene de otro sector, haz bridge de skills transferibles

Responde ÚNICAMENTE con el JSON, sin texto adicional.`,

    responseFormat: 'application/json',
  };
};

/**
 * Valida el CV generado
 */
export const validateGeneratedResume = (resume) => {
  const errors = [];
  const warnings = [];

  // Validar personalInfo
  if (!resume.personalInfo?.jobTitle) {
    errors.push('Falta jobTitle en personalInfo');
  }

  // Validar summary
  if (!resume.summary || resume.summary.length < 100) {
    warnings.push('El resumen profesional es muy corto (< 100 caracteres)');
  }

  if (resume.summary && resume.summary.length > 500) {
    warnings.push('El resumen profesional es muy largo (> 500 caracteres)');
  }

  // Validar experience
  if (!Array.isArray(resume.experience) || resume.experience.length === 0) {
    errors.push('Debe haber al menos 1 experiencia laboral');
  }

  resume.experience?.forEach((exp, index) => {
    if (!exp.title || !exp.company) {
      errors.push(`Experiencia ${index + 1}: falta título o empresa`);
    }
    if (!Array.isArray(exp.achievements) || exp.achievements.length < 2) {
      warnings.push(
        `Experiencia ${index + 1}: debería tener al menos 2 logros`
      );
    }
  });

  // Validar education
  if (!Array.isArray(resume.education) || resume.education.length === 0) {
    errors.push('Debe haber al menos 1 entrada de educación');
  }

  // Validar skills
  if (!Array.isArray(resume.skills) || resume.skills.length < 5) {
    warnings.push('Deberían haber al menos 5 habilidades');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Normaliza el CV generado para que coincida con el formato de la BD
 */
export const normalizeGeneratedResume = (resume, userEmail) => {
  const now = new Date().toISOString();

  return {
    // Campos de BD
    userEmail: userEmail,
    title: `CV Express - ${resume.personalInfo?.jobTitle || 'Sin título'}`,
    firstName: resume.personalInfo?.firstName || 'Tu Nombre',
    lastName: resume.personalInfo?.lastName || 'Tu Apellido',
    jobTitle: resume.personalInfo?.jobTitle || '',
    address: resume.personalInfo?.address || '',
    phone: resume.personalInfo?.phone || '',
    email: resume.personalInfo?.email || userEmail,
    themeColor: '#6366f1', // Color Express por defecto
    summary: resume.summary || '',

    // Arrays como JSON strings (formato de BD)
    experience: JSON.stringify(resume.experience || []),
    education: JSON.stringify(resume.education || []),
    skills: JSON.stringify(resume.skills || []),

    // Metadata
    createdAt: now,
    updatedAt: now,
    version: 1,
    createdVia: 'express', // Marcador para analytics
  };
};

/**
 * Calcula la calidad del CV generado
 */
export const calculateResumeQuality = (resume) => {
  let score = 0;
  const maxScore = 100;
  const feedback = [];

  // Summary (20 puntos)
  if (
    resume.summary &&
    resume.summary.length >= 150 &&
    resume.summary.length <= 400
  ) {
    score += 20;
    feedback.push('✅ Resumen bien estructurado');
  } else if (resume.summary) {
    score += 10;
    feedback.push('⚠️ Resumen podría mejorarse');
  }

  // Experience (30 puntos)
  const expScore = Math.min((resume.experience?.length || 0) * 10, 30);
  score += expScore;

  const totalAchievements =
    resume.experience?.reduce(
      (sum, exp) => sum + (exp.achievements?.length || 0),
      0
    ) || 0;

  if (totalAchievements >= 8) {
    feedback.push('✅ Experiencia bien detallada');
  } else {
    feedback.push('⚠️ Podrías añadir más logros específicos');
  }

  // Education (15 puntos)
  if (resume.education && resume.education.length > 0) {
    score += 15;
    feedback.push('✅ Educación completa');
  }

  // Skills (20 puntos)
  const skillsCount = resume.skills?.length || 0;
  if (skillsCount >= 8) {
    score += 20;
    feedback.push('✅ Buen conjunto de habilidades');
  } else if (skillsCount >= 5) {
    score += 15;
    feedback.push('⚠️ Considera añadir más habilidades');
  } else {
    score += 10;
  }

  // Personal Info (15 puntos)
  const hasAllFields =
    resume.personalInfo?.firstName &&
    resume.personalInfo?.lastName &&
    resume.personalInfo?.jobTitle;
  if (hasAllFields) {
    score += 15;
  }

  // Nivel de calidad
  let qualityLevel = 'insuficiente';
  if (score >= 85) qualityLevel = 'excelente';
  else if (score >= 70) qualityLevel = 'muy bueno';
  else if (score >= 55) qualityLevel = 'bueno';
  else if (score >= 40) qualityLevel = 'aceptable';

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
    qualityLevel,
    feedback,
  };
};

export default {
  expressResumeGeneratorPrompt,
  validateGeneratedResume,
  normalizeGeneratedResume,
  calculateResumeQuality,
};
