// src/services/prompts/lengthPrompts.js

export const LENGTH_PROMPTS = {
  short: {
    name: 'Corta',
    description: '200-300 palabras - Directa y concisa',
    wordCount: '200-300',
    structure: [
      'Introducción directa (1 párrafo)',
      'Experiencia relevante condensada (1 párrafo)',
      'Cierre con llamada a la acción (1 párrafo)',
    ],
    prompt: `
LONGITUD CORTA (200-300 palabras):
- Sé directo y conciso
- Enfócate solo en los puntos más relevantes
- Máximo 3 párrafos bien definidos
- Cada párrafo máximo 4-5 líneas
- Elimina información secundaria
- Impacto inmediato y claro
- Ve directo al grano
- Destaca solo las experiencias más relevantes
- Cierre directo con call-to-action
`,
  },

  medium: {
    name: 'Media',
    description: '350-450 palabras - Equilibrio entre detalle y brevedad',
    wordCount: '350-450',
    structure: [
      'Introducción con motivación (1 párrafo)',
      'Experiencia técnica relevante (1 párrafo)',
      'Soft skills y cultura fit (1 párrafo)',
      'Cierre profesional (1 párrafo)',
    ],
    prompt: `
LONGITUD MEDIA (350-450 palabras):
- Estructura balanceada de 4 párrafos
- Desarrollo adecuado de cada punto clave
- Incluye tanto aspectos técnicos como personales
- Equilibrio perfecto entre brevedad y detalle
- Espacio para ejemplos específicos pero concisos
- Permite mostrar tanto skills como personalidad
- Desarrolla motivaciones de forma moderada
- Incluye 1-2 ejemplos concretos de experiencia
`,
  },

  long: {
    name: 'Larga',
    description: '500-650 palabras - Detallada con ejemplos específicos',
    wordCount: '500-650',
    structure: [
      'Introducción detallada con investigación de empresa',
      'Experiencia técnica con ejemplos específicos',
      'Proyectos relevantes o logros cuantificables',
      'Soft skills y motivaciones personales',
      'Valor añadido específico que puedo aportar',
      'Cierre con seguimiento proactivo',
    ],
    prompt: `
LONGITUD LARGA (500-650 palabras):
- Permite desarrollo completo de ideas (5-6 párrafos)
- Incluye investigación específica sobre la empresa
- Ejemplos detallados de proyectos y logros
- Cuantifica resultados cuando sea posible
- Desarrolla completamente las motivaciones
- Espacio para mostrar investigación previa
- Incluye múltiples ejemplos de experiencia
- Detalla el valor específico que aportas
- Cierre con plan de seguimiento concreto
- Permite mostrar conocimiento profundo del sector
`,
  },
};

export const getLengthPrompt = (length) => {
  return LENGTH_PROMPTS[length] || LENGTH_PROMPTS.medium;
};
