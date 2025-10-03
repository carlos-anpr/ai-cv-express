// src/services/prompts/interviewTestGenerator.js

/**
 * Generador de prompts para tests de preparación de entrevistas
 * Basado EXCLUSIVAMENTE en los datos de la candidatura (no del CV)
 */
export class InterviewTestGenerator {
  /**
   * Valida que la candidatura tenga los datos mínimos necesarios
   * para generar un test de entrevista relevante
   *
   * @param {Object} jobApplication - Datos de la candidatura
   * @returns {Object} { isValid, errors, hasWarnings }
   */
  static validateJobApplicationData(jobApplication) {
    const errors = [];
    const MIN_TEXT_LENGTH = 50; // Mínimo 50 caracteres para descripciones

    // 1. Validar empresa
    if (!jobApplication?.companyName?.trim()) {
      errors.push('El nombre de la empresa es obligatorio');
    }

    // 2. Validar puesto
    if (!jobApplication?.jobTitle?.trim()) {
      errors.push('El título del puesto es obligatorio');
    }

    // 3. Validar requisitos (CRÍTICO - de aquí se extraen las skills técnicas)
    // Manejar requirements como string o array
    let requirementsText = '';
    if (Array.isArray(jobApplication?.requirements)) {
      requirementsText = jobApplication.requirements.join(' ');
    } else if (typeof jobApplication?.requirements === 'string') {
      requirementsText = jobApplication.requirements;
    }

    if (!requirementsText.trim()) {
      errors.push('Los Requisitos Específicos son obligatorios');
    } else if (requirementsText.trim().length < MIN_TEXT_LENGTH) {
      errors.push(
        `Los Requisitos Específicos deben tener al menos ${MIN_TEXT_LENGTH} caracteres ` +
          `(actualmente: ${requirementsText.trim().length}). ` +
          `Describe las habilidades técnicas, herramientas y experiencia requerida.`
      );
    }

    // 4. Validar descripción del puesto (CRÍTICO - de aquí se detecta el nivel)
    if (!jobApplication?.jobDescription?.trim()) {
      errors.push('La Descripción del Puesto es obligatoria');
    } else if (jobApplication.jobDescription.trim().length < MIN_TEXT_LENGTH) {
      errors.push(
        `La Descripción del Puesto debe tener al menos ${MIN_TEXT_LENGTH} caracteres ` +
          `(actualmente: ${jobApplication.jobDescription.trim().length}). ` +
          `Describe las responsabilidades, nivel de experiencia y contexto del rol.`
      );
    }

    // 5. Warning si faltan responsabilidades (no bloqueante, pero recomendado)
    const warnings = [];
    if (!jobApplication?.responsibilities?.trim()) {
      warnings.push(
        '⚠️ Las Responsabilidades del Puesto no están definidas (recomendado pero no obligatorio)'
      );
    }

    return {
      isValid: errors.length === 0,
      errors: [...errors, ...warnings],
      hasWarnings: warnings.length > 0,
      criticalErrors: errors.length,
    };
  }

  /**
   * Retorna un mensaje de ayuda para el usuario sobre qué información incluir
   *
   * @returns {Object} Mensaje de ayuda estructurado
   */
  static getValidationHelpMessage() {
    return {
      title: '¿Qué información debo incluir?',
      tips: [
        {
          field: 'Requisitos Específicos',
          description:
            'Lista detallada de habilidades técnicas, tecnologías, frameworks, años de experiencia y conocimientos necesarios.',
          example:
            'Ejemplo: "3+ años en Node.js, Express.js, MongoDB, conocimiento de Docker y CI/CD, experiencia con API REST"',
        },
        {
          field: 'Descripción del Puesto',
          description:
            'Descripción del rol, responsabilidades principales, tipo de proyectos, metodologías de trabajo y nivel de autonomía esperado.',
          example:
            'Ejemplo: "Desarrollarás APIs REST para aplicaciones web, trabajarás en equipo ágil con sprints de 2 semanas, mentoría a juniors..."',
        },
        {
          field: 'Responsabilidades',
          description:
            'Listado de tareas y responsabilidades específicas del día a día (opcional pero recomendado).',
          example:
            'Ejemplo: "Desarrollo de nuevas funcionalidades, code review, optimización de queries, documentación técnica"',
        },
      ],
    };
  }

  /**
   * Genera el prompt completo para Gemini AI
   *
   * @param {Object} resumeData - Datos del CV (contexto adicional)
   * @param {Object} jobApplication - Datos de la candidatura (PRINCIPAL)
   * @returns {string} Prompt formateado para Gemini
   */
  static generatePrompt(resumeData, jobApplication) {
    // Formatear contexto del candidato
    const candidateContext = this.formatCandidateContext(resumeData);

    const prompt = `
Eres un experto reclutador técnico especializado en preparación de entrevistas.

PASO 1: ANALIZA LA OFERTA DE TRABAJO
=======================================

INFORMACIÓN DE LA CANDIDATURA:
- Empresa: ${jobApplication.companyName}
- Puesto: ${jobApplication.jobTitle}
${jobApplication.location ? `- Ubicación: ${jobApplication.location}` : ''}

REQUISITOS ESPECÍFICOS DEL PUESTO:
${
  Array.isArray(jobApplication.requirements)
    ? jobApplication.requirements.join(', ')
    : jobApplication.requirements
}

DESCRIPCIÓN COMPLETA DEL PUESTO:
${jobApplication.jobDescription}

${
  jobApplication.responsibilities
    ? `RESPONSABILIDADES:\n${jobApplication.responsibilities}\n`
    : ''
}

CONTEXTO ADICIONAL DEL CANDIDATO:
${candidateContext}

PASO 2: DETECTA Y EXTRAE INFORMACIÓN CLAVE
============================================

Analiza los requisitos y descripción para determinar:

1. **NIVEL PROFESIONAL** (Basado en años de experiencia y complejidad):
   - "junior" → 0-3 años, tareas supervisadas, aprendizaje, conceptos básicos
   - "mid" → 3-6 años, autonomía, proyectos completos, decisiones técnicas
   - "senior" → 6+ años, liderazgo, arquitectura, mentoría, decisiones estratégicas

2. **HABILIDADES TÉCNICAS PRINCIPALES**:
   - Lenguajes de programación (ej: "Node.js", "Java", "Python", "JavaScript")
   - Frameworks y librerías (ej: "Express.js", "Spring Boot", "React", "Angular")
   - Herramientas (ej: "Docker", "Git", "Jenkins", "Kubernetes")
   - Bases de datos (ej: "MongoDB", "PostgreSQL", "MySQL", "Redis")
   - Metodologías (ej: "Agile", "Scrum", "TDD", "CI/CD")

3. **TIPO DE ROL**:
   - Backend, Frontend, Full Stack, DevOps, Data Engineer, QA, etc.

PASO 3: GENERA 5 PREGUNTAS PERSONALIZADAS
==========================================

IMPORTANTE: Las preguntas deben ser ESPECÍFICAS a las tecnologías y requisitos mencionados.

DISTRIBUCIÓN OBLIGATORIA:
- 2 preguntas TÉCNICAS sobre las habilidades específicas del puesto
- 2 preguntas COMPORTAMENTALES usando metodología STAR
- 1 pregunta sobre CONOCIMIENTO de la empresa/industria

REQUISITOS DE LAS PREGUNTAS:
✅ Mencionar tecnologías ESPECÍFICAS de los requisitos
✅ Ajustar dificultad al nivel detectado (junior/mid/senior)
✅ TODO en castellano
✅ Respuestas realistas y profesionales (no teóricas, sino prácticas)
✅ Explicaciones educativas (por qué esa respuesta es efectiva)
✅ Las preguntas técnicas deben evaluar conocimiento aplicado, no definiciones

EJEMPLO DE PREGUNTA TÉCNICA BUENA:
❌ MAL: "¿Qué es una base de datos?"
✅ BIEN: "Explica cómo implementarías un índice compuesto en MongoDB para optimizar 
          consultas de búsqueda por usuario y fecha en una aplicación con 1M+ registros"

❌ MAL: "¿Qué es Node.js?"
✅ BIEN: "Describe cómo manejarías el procesamiento asíncrono de archivos grandes en Node.js 
          sin bloquear el event loop"

EJEMPLO DE PREGUNTA COMPORTAMENTAL BUENA:
✅ "Cuéntame sobre una situación donde tuviste que optimizar una API que tenía problemas 
    de rendimiento. ¿Qué pasos seguiste y cuál fue el resultado?"

EJEMPLO DE PREGUNTA SOBRE EMPRESA:
✅ "¿Qué sabes sobre ${
      jobApplication.companyName
    } y por qué te interesa trabajar específicamente 
    como ${jobApplication.jobTitle} en esta empresa?"

FORMATO JSON ESTRICTO:
{
  "candidateLevel": "junior|mid|senior",
  "detectedSkills": ["skill1", "skill2", "skill3", "..."],
  "roleType": "Backend|Frontend|FullStack|DevOps|Data|QA|etc",
  "questions": [
    {
      "question": "Pregunta en castellano específica a las tecnologías mencionadas",
      "correctAnswer": "Respuesta sugerida profesional y práctica (no teórica)",
      "explanation": "Explicación de por qué esta respuesta es efectiva (2-3 líneas)",
      "category": "técnica|comportamental|empresa",
      "difficulty": "básica|intermedia|avanzada"
    }
  ]
}

VALIDACIÓN FINAL:
- Verifica que mencionas al menos 2 tecnologías específicas de los requisitos en las preguntas técnicas
- Verifica que el nivel de dificultad coincide con el nivel detectado
- Verifica que las preguntas NO sean genéricas tipo "¿Qué es X?"
- Verifica que hay exactamente 2 técnicas, 2 comportamentales, 1 empresa
- Verifica que todo está en castellano
`.trim();

    return prompt;
  }

  /**
   * Formatea el contexto de la candidatura/oferta
   *
   * @param {Object} jobApplication - Datos de la candidatura
   * @returns {string} Contexto formateado
   */
  static formatJobContext(jobApplication) {
    const parts = [
      `Empresa: ${jobApplication.companyName}`,
      `Puesto: ${jobApplication.jobTitle}`,
    ];

    if (jobApplication.location) {
      parts.push(`Ubicación: ${jobApplication.location}`);
    }

    if (jobApplication.requirements) {
      const requirementsText = Array.isArray(jobApplication.requirements)
        ? jobApplication.requirements.join(', ')
        : jobApplication.requirements;
      parts.push(`\nRequisitos:\n${requirementsText}`);
    }

    if (jobApplication.jobDescription) {
      parts.push(`\nDescripción:\n${jobApplication.jobDescription}`);
    }

    if (jobApplication.responsibilities) {
      parts.push(`\nResponsabilidades:\n${jobApplication.responsibilities}`);
    }

    return parts.join('\n');
  }

  /**
   * Formatea el contexto del candidato (información del CV)
   *
   * @param {Object} resumeData - Datos del CV
   * @returns {string} Contexto formateado
   */
  static formatCandidateContext(resumeData) {
    const parts = [];

    // Nombre
    if (resumeData?.firstName || resumeData?.lastName) {
      parts.push(
        `- Nombre: ${resumeData.firstName || ''} ${
          resumeData.lastName || ''
        }`.trim()
      );
    }

    // Experiencia
    if (resumeData?.experience && Array.isArray(resumeData.experience)) {
      const experienceText = this.formatExperience(resumeData.experience);
      if (experienceText) {
        parts.push(`- Experiencia profesional:\n${experienceText}`);
      }
    }

    // Educación
    if (resumeData?.education && Array.isArray(resumeData.education)) {
      const educationText = this.formatEducation(resumeData.education);
      if (educationText) {
        parts.push(`- Educación:\n${educationText}`);
      }
    }

    // Habilidades
    if (resumeData?.skills && Array.isArray(resumeData.skills)) {
      const skillsText = this.formatSkills(resumeData.skills);
      if (skillsText) {
        parts.push(`- Habilidades: ${skillsText}`);
      }
    }

    return parts.length > 0
      ? parts.join('\n')
      : '- No hay información adicional del candidato disponible';
  }

  /**
   * Formatea la experiencia profesional
   *
   * @param {Array} experience - Array de experiencias
   * @returns {string} Experiencia formateada
   */
  static formatExperience(experience) {
    if (!experience || !Array.isArray(experience) || experience.length === 0) {
      return '';
    }

    return experience
      .map((exp) => {
        const title = exp.title || 'Puesto no especificado';
        const company = exp.companyName || 'Empresa no especificada';
        const startDate = exp.startDate || '';
        const endDate = exp.currentlyWorking ? 'Actualidad' : exp.endDate || '';
        const period =
          startDate && endDate ? `(${startDate} - ${endDate})` : '';

        return `  • ${title} en ${company} ${period}`.trim();
      })
      .join('\n');
  }

  /**
   * Formatea la educación
   *
   * @param {Array} education - Array de educación
   * @returns {string} Educación formateada
   */
  static formatEducation(education) {
    if (!education || !Array.isArray(education) || education.length === 0) {
      return '';
    }

    return education
      .map((edu) => {
        const degree = edu.degree || 'Título no especificado';
        const university = edu.universityName || 'Universidad no especificada';
        const startDate = edu.startDate || '';
        const endDate = edu.endDate || '';
        const period =
          startDate && endDate ? `(${startDate} - ${endDate})` : '';

        return `  • ${degree} en ${university} ${period}`.trim();
      })
      .join('\n');
  }

  /**
   * Formatea las habilidades
   *
   * @param {Array} skills - Array de habilidades
   * @returns {string} Habilidades formateadas
   */
  static formatSkills(skills) {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return '';
    }

    return skills
      .map((skill) => {
        if (typeof skill === 'string') {
          return skill;
        }
        return skill.name || skill.skill || '';
      })
      .filter((s) => s.trim())
      .join(', ');
  }

  /**
   * Detecta el nivel profesional basándose en la descripción y requisitos
   * (Método auxiliar - Gemini hace la detección real, esto es solo para referencia)
   *
   * @param {string} jobDescription - Descripción del puesto
   * @param {string|Array} requirements - Requisitos del puesto
   * @returns {string} 'junior' | 'mid' | 'senior'
   */
  static detectCandidateLevel(jobDescription = '', requirements = '') {
    const requirementsText = Array.isArray(requirements)
      ? requirements.join(' ')
      : requirements;
    const text = `${jobDescription} ${requirementsText}`.toLowerCase();

    // Indicadores de nivel senior
    const seniorIndicators = [
      'senior',
      'líder',
      'lead',
      'arquitecto',
      'architect',
      'mentor',
      'gestión de equipo',
      'team management',
      '10+ años',
      '8+ años',
      '7+ años',
      'estrategia',
      'strategy',
    ];

    // Indicadores de nivel mid
    const midIndicators = [
      'mid',
      'intermedio',
      '3-6 años',
      '4-7 años',
      '3+ años',
      '4+ años',
      '5+ años',
      'autonomía',
      'autonomous',
      'proyectos completos',
    ];

    // Indicadores de nivel junior
    const juniorIndicators = [
      'junior',
      'entry',
      '0-2 años',
      '1-3 años',
      'recién graduado',
      'graduate',
      'aprendizaje',
      'learning',
      'supervisado',
      'supervised',
    ];

    // Contar coincidencias
    let seniorCount = seniorIndicators.filter((indicator) =>
      text.includes(indicator)
    ).length;
    let midCount = midIndicators.filter((indicator) =>
      text.includes(indicator)
    ).length;
    let juniorCount = juniorIndicators.filter((indicator) =>
      text.includes(indicator)
    ).length;

    // Determinar nivel
    if (
      seniorCount > 0 &&
      seniorCount >= midCount &&
      seniorCount >= juniorCount
    ) {
      return 'senior';
    } else if (midCount > 0 && midCount >= juniorCount) {
      return 'mid';
    } else if (juniorCount > 0) {
      return 'junior';
    }

    // Por defecto, mid si no hay indicadores claros
    return 'mid';
  }

  /**
   * Extrae habilidades técnicas mencionadas en los requisitos
   * (Método auxiliar - Gemini hace la extracción real, esto es solo para referencia)
   *
   * @param {string|Array} requirements - Requisitos del puesto
   * @returns {Array<string>} Array de habilidades detectadas
   */
  static extractTechnicalSkills(requirements = '') {
    if (!requirements) return [];

    const requirementsText = Array.isArray(requirements)
      ? requirements.join(' ')
      : requirements;
    const text = requirementsText.toLowerCase();
    const detectedSkills = [];

    // Lista de tecnologías comunes a buscar
    const techKeywords = [
      // Lenguajes
      'javascript',
      'typescript',
      'python',
      'java',
      'c#',
      'php',
      'ruby',
      'go',
      'rust',
      'swift',
      'kotlin',
      // Frontend
      'react',
      'vue',
      'angular',
      'svelte',
      'next.js',
      'nuxt',
      // Backend
      'node.js',
      'express',
      'nest.js',
      'django',
      'flask',
      'spring boot',
      'laravel',
      // Bases de datos
      'mongodb',
      'postgresql',
      'mysql',
      'redis',
      'elasticsearch',
      'dynamodb',
      // DevOps/Tools
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'gcp',
      'jenkins',
      'gitlab ci',
      'github actions',
      'terraform',
      // Metodologías
      'agile',
      'scrum',
      'tdd',
      'ci/cd',
    ];

    techKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        // Capitalizar correctamente
        detectedSkills.push(
          keyword
            .split(/[\s.]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        );
      }
    });

    return [...new Set(detectedSkills)]; // Eliminar duplicados
  }
}

export default InterviewTestGenerator;
