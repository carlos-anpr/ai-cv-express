// src/services/prompts/stylePrompts.js

export const STYLE_PROMPTS = {
  formal: {
    name: 'Formal',
    description: 'Lenguaje profesional y estructurado con fórmulas de cortesía',
    prompt: `
ESTILO FORMAL:
- Usa un lenguaje profesional y respetuoso
- Mantén estructura tradicional de carta comercial
- Incluye fórmulas de cortesía estándar ("Estimado/a", "Le saluda atentamente")
- Evita contracciones y jerga
- Tono serio pero accesible
- Usa tercera persona ocasionalmente mezclada con primera
- Términos técnicos apropiados al sector
- Estructura clara con párrafos bien definidos
`,
  },

  friendly: {
    name: 'Amigable',
    description: 'Tono cálido pero profesional, mostrando entusiasmo',
    prompt: `
ESTILO AMIGABLE:
- Usa un tono cálido y accesible
- Muestra entusiasmo genuino por la oportunidad
- Incluye razones personales de interés en la empresa
- Lenguaje conversacional pero profesional
- Conecta con la cultura de la empresa
- Expresiones de entusiasmo controlado
- Menciona valores compartidos con la empresa
- Tono cercano pero manteniendo respeto profesional
`,
  },

  humanized: {
    name: 'Humanizada',
    description:
      'Honesta sobre fortalezas y crecimiento, evita perfección artificial',
    prompt: `
ESTILO HUMANIZADO:
- Sé honesto sobre fortalezas y áreas de crecimiento
- Menciona el aprendizaje como un proceso continuo
- Usa frases como "he aprendido que", "en mi experiencia"
- Admite cuando algo es nuevo pero muestras ganas de aprender
- Evita sonar como un candidato "perfecto"
- Incluye motivaciones reales y personales
- Muestra vulnerabilidad profesional apropiada
- Enfatiza la mejora continua y adaptabilidad
- Comparte experiencias de crecimiento personal
`,
  },

  informal: {
    name: 'Informal',
    description: 'Tono relajado para startups y culturas empresariales jóvenes',
    prompt: `
ESTILO INFORMAL:
- Tono relajado y conversacional
- Usa contracciones naturalmente
- Muestra más personalidad
- Lenguaje directo y sin rodeos
- Apropiado para empresas con cultura joven
- Mantén el respeto profesional
- Evita ser demasiado casual
- Incluye expresiones más modernas
- Conecta con valores de innovación y agilidad
`,
  },
};

export const getStylePrompt = (style) => {
  return STYLE_PROMPTS[style] || STYLE_PROMPTS.friendly;
};
