/**
 * Express Cover Letter Generator Prompt
 *
 * Genera cartas de presentación personalizadas, cortas y persuasivas
 * adaptadas al nivel del candidato.
 */

export const expressCoverLetterGeneratorPrompt = (
  profileData,
  jobOfferData,
  resumeData
) => {
  // Determinar el estilo según el nivel
  const level = profileData.level || 'mid';
  const styleGuide = getCoverLetterStyleGuide(level);

  return {
    systemInstruction: `Eres un experto en redacción de cartas de presentación que ayudan a candidatos a conseguir entrevistas. Tu especialidad es crear cartas persuasivas, genuinas y adaptadas al nivel profesional del candidato.

PRINCIPIOS:
1. Brevedad: 250-350 palabras máximo (formato corto)
2. Personalización: Menciona la empresa y el puesto específico
3. Conexión: Muestra entusiasmo genuino por la oportunidad
4. Valor: Enfoca en qué aportas, no solo en qué buscas
5. Call-to-Action: Termina invitando a la conversación

ESTRUCTURA:
- Párrafo 1: Presentación + Por qué te interesa este puesto específico
- Párrafo 2: Qué te hace ideal (2-3 puntos clave con ejemplos breves)
- Párrafo 3: Por qué esta empresa + Llamada a la acción

${styleGuide}`,

    prompt: `Genera una carta de presentación profesional y personalizada basándote en:

PERFIL DEL CANDIDATO:
${JSON.stringify(profileData, null, 2)}

OFERTA DE TRABAJO:
${JSON.stringify(jobOfferData, null, 2)}

CV GENERADO (para contexto):
${JSON.stringify(
  {
    summary: resumeData.summary,
    experience: resumeData.experience?.slice(0, 2), // Solo últimas 2 experiencias
    skills: resumeData.skills?.slice(0, 8), // Top 8 skills
  },
  null,
  2
)}

Genera una carta en el siguiente formato JSON:

{
  "greeting": "Estimado/a [Nombre si está] equipo de [Empresa]:",
  "opening": "Párrafo de apertura (2-3 líneas) que:
    - Mencione el puesto específico
    - Muestre conocimiento de la empresa (si hay info)
    - Exprese interés genuino
    - Mencione cómo encontraste la oferta si es relevante",
  
  "body": [
    {
      "type": "value-proposition",
      "content": "Párrafo 2 (3-4 líneas) sobre tu valor:
        - 'Mi experiencia en [X] me ha permitido...'
        - Menciona 1-2 logros concretos del CV
        - Conecta tus skills con requisitos de la oferta
        - Usa ejemplos específicos pero breves"
    },
    {
      "type": "company-fit",
      "content": "Párrafo 3 (2-3 líneas) sobre fit con la empresa:
        - Por qué esta empresa específicamente
        - Qué te atrae de su misión/cultura/proyectos
        - Cómo tus valores se alinean
        - Menciona algo específico de la empresa si hay info"
    }
  ],
  
  "closing": "Párrafo de cierre (2 líneas):
    - Reafirma interés
    - Llama a la acción (entrevista, conversación)
    - Agradece el tiempo
    - Tono positivo y confiado pero no arrogante",
  
  "signature": "Atentamente,\\n[Nombre del candidato]",
  
  "metadata": {
    "tone": "profesional|amigable|formal (según nivel y empresa)",
    "wordCount": "número aproximado de palabras (250-350)",
    "keyPoints": [
      "Punto clave 1 mencionado",
      "Punto clave 2 mencionado",
      "Punto clave 3 mencionado"
    ]
  }
}

INSTRUCCIONES ESPECÍFICAS POR NIVEL:

${
  level === 'junior'
    ? `
**NIVEL JUNIOR:**
- Tono: Entusiasta pero profesional
- Enfoque: Potencial, ganas de aprender, proyectos relevantes
- Evita: Sonar inseguro o excesivamente humilde
- Ejemplo apertura: "Como recién graduado en [carrera] con experiencia práctica en [tecnología], me entusiasma la oportunidad de..."
- Menciona: Proyectos académicos/personales como experiencia práctica
`
    : level === 'senior'
    ? `
**NIVEL SENIOR:**
- Tono: Confiado, consultor, estratégico
- Enfoque: Impacto medible, liderazgo, visión a largo plazo
- Evita: Sonar arrogante o listar solo responsabilidades
- Ejemplo apertura: "Con más de [X] años liderando [área], he ayudado a organizaciones a..."
- Menciona: Resultados cuantificables, equipos liderados
`
    : `
**NIVEL MID:**
- Tono: Profesional equilibrado, colaborativo
- Enfoque: Experiencia comprobada, autonomía, contribuciones tangibles
- Evita: Sonar demasiado junior o demasiado senior
- Ejemplo apertura: "Mi experiencia de [X] años en [área] me ha permitido desarrollar..."
- Menciona: Proyectos exitosos, habilidades aplicadas
`
}

PERSONALIZACIÓN POR INDUSTRIA:
${getIndustryGuidance(jobOfferData.industry)}

KEYWORDS A INCLUIR (naturalmente):
- Título exacto del puesto: "${jobOfferData.jobTitle}"
- Empresa: "${jobOfferData.companyName}"
- 3-5 habilidades clave de la oferta: ${jobOfferData.technicalSkills
      ?.slice(0, 5)
      .join(', ')}

REGLAS DE TONO:
- Si la empresa es startup/tech: Más casual, innovador
- Si es corporativa/financiera: Más formal, estructurado
- Si es creativa/agencia: Más personal, storytelling

EVITAR:
- Clichés ("soy una persona proactiva", "trabajo bien en equipo")
- Repetir exactamente el CV
- Ser demasiado genérico
- Excesiva adulación a la empresa
- Párrafos muy largos

Responde ÚNICAMENTE con el JSON, sin texto adicional.`,

    responseFormat: 'application/json',
  };
};

/**
 * Obtiene guía de estilo según el nivel del candidato
 */
const getCoverLetterStyleGuide = (level) => {
  const guides = {
    junior: `
ESTILO JUNIOR:
- Energía y entusiasmo sin ser naive
- Enfatiza disposición a aprender y contribuir
- Menciona proyectos/prácticas como experiencia válida
- Muestra conocimiento técnico a pesar de poca experiencia
- Ejemplo: "Aunque inicio mi carrera profesional, mis proyectos en [X] demuestran..."`,

    mid: `
ESTILO MID-LEVEL:
- Balance entre humildad y confianza
- Enfatiza experiencia práctica y resultados
- Muestra autonomía y capacidad de contribuir desde día 1
- Menciona colaboración y crecimiento mutuo
- Ejemplo: "En mis [X] años en [sector], he contribuido a..."`,

    senior: `
ESTILO SENIOR:
- Autoridad sin arrogancia
- Enfatiza liderazgo, mentoría, impacto estratégico
- Habla de visión y resultados de negocio
- Muestra capacidad de transformar equipos/procesos
- Ejemplo: "A lo largo de mi trayectoria liderando [área], he impulsado..."`,

    expert: `
ESTILO EXPERT:
- Tono de consultor/asesor estratégico
- Enfatiza transformación organizacional
- Habla de industria, tendencias, visión
- Muestra track record comprobado
- Ejemplo: "Con más de una década transformando [área] en organizaciones..."`,
  };

  return guides[level] || guides.mid;
};

/**
 * Obtiene orientación según la industria
 */
const getIndustryGuidance = (industry) => {
  const industryGuides = {
    Tecnología:
      'Menciona tecnologías específicas, metodologías ágiles, innovación',
    Consultoría:
      'Enfatiza resolución de problemas, client-facing, resultados medibles',
    Financiero: 'Tono más formal, menciona compliance, análisis, rigor',
    Creativo: 'Más storytelling, portfolio, proceso creativo',
    Educación: 'Pasión por enseñar, impacto social, metodologías pedagógicas',
    Salud: 'Empatía, regulaciones, mejora de outcomes para pacientes',
    default: 'Adapta el tono a la información disponible de la empresa',
  };

  return industryGuides[industry] || industryGuides.default;
};

/**
 * Valida la carta generada
 */
export const validateGeneratedCoverLetter = (coverLetter) => {
  const errors = [];
  const warnings = [];

  // Validar campos requeridos
  if (!coverLetter.greeting) {
    errors.push('Falta el saludo (greeting)');
  }

  if (!coverLetter.opening || coverLetter.opening.length < 50) {
    errors.push('El párrafo de apertura es demasiado corto');
  }

  if (!Array.isArray(coverLetter.body) || coverLetter.body.length < 2) {
    errors.push('El cuerpo debe tener al menos 2 párrafos');
  }

  if (!coverLetter.closing) {
    errors.push('Falta el cierre');
  }

  // Calcular longitud total
  const fullText = [
    coverLetter.greeting,
    coverLetter.opening,
    ...(coverLetter.body?.map((p) => p.content) || []),
    coverLetter.closing,
  ].join(' ');

  const wordCount = fullText.split(/\s+/).length;

  if (wordCount < 200) {
    warnings.push('La carta es muy corta (< 200 palabras)');
  } else if (wordCount > 400) {
    warnings.push(
      'La carta es muy larga (> 400 palabras). Considera acortarla.'
    );
  }

  // Validar metadata
  if (
    !coverLetter.metadata?.keyPoints ||
    coverLetter.metadata.keyPoints.length < 2
  ) {
    warnings.push('Deberían mencionarse al menos 2-3 puntos clave');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    wordCount,
  };
};

/**
 * Convierte la carta de JSON a texto plano formateado
 */
export const formatCoverLetterAsText = (coverLetter) => {
  const paragraphs = [
    coverLetter.greeting,
    '',
    coverLetter.opening,
    '',
    ...coverLetter.body.map((p) => p.content),
    '',
    coverLetter.closing,
    '',
    coverLetter.signature,
  ];

  return paragraphs.join('\n');
};

/**
 * Convierte la carta de JSON a HTML formateado
 */
export const formatCoverLetterAsHTML = (coverLetter) => {
  const bodyParagraphs = coverLetter.body
    .map((p) => `<p>${p.content}</p>`)
    .join('\n');

  return `
<div class="cover-letter">
  <p class="greeting">${coverLetter.greeting}</p>
  
  <p class="opening">${coverLetter.opening}</p>
  
  <div class="body">
    ${bodyParagraphs}
  </div>
  
  <p class="closing">${coverLetter.closing}</p>
  
  <p class="signature">${coverLetter.signature.replace('\n', '<br>')}</p>
</div>
  `.trim();
};

/**
 * Calcula la calidad de la carta generada
 */
export const calculateCoverLetterQuality = (coverLetter) => {
  let score = 0;
  const maxScore = 100;
  const feedback = [];

  // Longitud apropiada (25 puntos)
  const wordCount = formatCoverLetterAsText(coverLetter).split(/\s+/).length;
  if (wordCount >= 250 && wordCount <= 350) {
    score += 25;
    feedback.push('✅ Longitud ideal para lectura');
  } else if (wordCount >= 200 && wordCount <= 400) {
    score += 20;
    feedback.push('✅ Longitud apropiada');
  } else {
    score += 10;
    feedback.push('⚠️ Longitud podría ajustarse');
  }

  // Personalización (25 puntos)
  const hasKeyPoints = coverLetter.metadata?.keyPoints?.length >= 2;
  if (hasKeyPoints) {
    score += 25;
    feedback.push('✅ Bien personalizada');
  } else {
    score += 15;
  }

  // Estructura (25 puntos)
  const hasGoodStructure = coverLetter.body?.length >= 2;
  if (hasGoodStructure) {
    score += 25;
    feedback.push('✅ Estructura sólida');
  }

  // Tono apropiado (25 puntos)
  if (coverLetter.metadata?.tone) {
    score += 25;
    feedback.push('✅ Tono apropiado');
  }

  let qualityLevel = 'insuficiente';
  if (score >= 85) qualityLevel = 'excelente';
  else if (score >= 70) qualityLevel = 'muy bueno';
  else if (score >= 55) qualityLevel = 'bueno';

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
    qualityLevel,
    wordCount,
    feedback,
  };
};

export default {
  expressCoverLetterGeneratorPrompt,
  validateGeneratedCoverLetter,
  formatCoverLetterAsText,
  formatCoverLetterAsHTML,
  calculateCoverLetterQuality,
};
