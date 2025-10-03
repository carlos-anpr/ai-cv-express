/**
 * Prompts para mejora y generación de contenido de CV
 * Estos prompts se usan con Gemini AI para mejorar resúmenes y experiencia laboral
 */

export const summaryEnhancementPrompt = (currentText, jobTitle) => `
Eres un experto en redacción de currículums profesionales. Tu tarea es mejorar el siguiente resumen profesional manteniendo la esencia y experiencias específicas del usuario.

CONTEXTO:
- Puesto de trabajo: ${jobTitle}
- Resumen actual del usuario: "${currentText}"

INSTRUCCIONES:
1. Mantén todas las experiencias y logros específicos mencionados por el usuario
2. Mejora la redacción haciéndola más profesional y atractiva
3. Asegúrate de que el tono sea apropiado para el puesto
4. Mantén una longitud similar al original (±20%)
5. Usa verbos de acción y lenguaje impactante
6. NO inventes experiencias que no estén en el texto original

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "improved": "resumen mejorado aquí",
  "original_length": número de palabras del original,
  "improved_length": número de palabras de la mejora,
  "changes_made": ["lista de mejoras aplicadas"]
}

Toda la respuesta debe estar en castellano (español).
`;

export const summaryExpansionPrompt = (currentText, jobTitle) => `
Eres un experto en redacción de currículums profesionales. Tu tarea es ampliar y hacer más atractivo el siguiente resumen profesional.

CONTEXTO:
- Puesto de trabajo: ${jobTitle}
- Resumen actual del usuario: "${currentText}"

INSTRUCCIONES:
1. Mantén todas las experiencias mencionadas por el usuario
2. Amplía cada punto con más detalles profesionales
3. Añade elementos que hagan el perfil más atractivo:
   - Menciona posibles metodologías o frameworks relevantes
   - Destaca habilidades blandas implícitas
   - Añade contexto sobre el impacto del trabajo
4. Amplía el texto en un 50-80% más que el original
5. Mantén coherencia y fluidez
6. NO inventes logros específicos o números

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "expanded": "resumen ampliado aquí",
  "additions": ["lista de elementos añadidos"],
  "length_increase": "porcentaje de aumento"
}

Toda la respuesta debe estar en castellano (español).
`;

export const summaryGenerationPrompt = (jobTitle) => `
Puesto de Trabajo: ${jobTitle}. 

Según el puesto de trabajo, genera 3 resúmenes profesionales para diferentes niveles de experiencia:
- Senior (7+ años): 6-7 líneas
- Nivel Medio (3-6 años): 5-6 líneas  
- Junior/Principiante (0-2 años): 4-5 líneas

INSTRUCCIONES:
1. Cada resumen debe ser único y específico para el nivel
2. Usa verbos de acción y lenguaje impactante
3. Menciona tecnologías y metodologías relevantes para el puesto
4. Enfoca en logros y valor aportado
5. Mantén tono profesional pero accesible

FORMATO DE RESPUESTA:
Devuelve un JSON array con la siguiente estructura:
[
  {
    "summary": "texto del resumen",
    "experience_level": "Senior|Nivel Medio|Junior"
  }
]

Toda la respuesta debe estar en castellano (español).
`;

export const experienceEnhancementPrompt = (
  points,
  jobTitle,
  companyName,
  reorganize = false
) => `
Eres un experto en redacción de experiencia laboral para currículums. Tu tarea es mejorar los siguientes puntos de experiencia.

CONTEXTO:
- Puesto: ${jobTitle}
- Empresa: ${companyName}
- Puntos actuales:
${points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

INSTRUCCIONES:
1. Mejora la redacción de cada punto haciéndola más profesional
2. Usa la metodología CAR (Contexto, Acción, Resultado) cuando sea posible
3. Añade verbos de acción fuertes al inicio de cada punto
4. Mantén las experiencias específicas del usuario
5. ${reorganize ? 'Reorganiza los puntos por orden de impacto/relevancia' : 'Mantén el orden original'}
6. Si un punto puede mejorarse con métricas sugeridas, indícalo entre [paréntesis]
7. NO inventes logros o responsabilidades que no estén implícitas en el texto

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "points": ["punto 1 mejorado", "punto 2 mejorado", ...],
  "improvements": ["lista de mejoras aplicadas a cada punto"]
}

Toda la respuesta debe estar en castellano (español).
`;

export const experienceExpansionPrompt = (points, jobTitle, companyName) => `
Eres un experto en redacción de experiencia laboral para currículums. Tu tarea es ampliar y enriquecer los siguientes puntos de experiencia.

CONTEXTO:
- Puesto: ${jobTitle}
- Empresa: ${companyName}
- Puntos actuales:
${points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

INSTRUCCIONES:
1. Amplía cada punto con más detalles y contexto
2. Añade sub-puntos específicos cuando sea apropiado
3. Incluye metodologías, tecnologías o frameworks relevantes
4. Sugiere métricas cuantificables entre [paréntesis] como: [ej: "aumentando productividad en X%"]
5. Menciona impacto y resultados del trabajo
6. Expande el contenido en un 50-70% más
7. Mantén coherencia entre todos los puntos
8. NO inventes responsabilidades completamente nuevas

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "points": ["punto 1 expandido", "punto 2 expandido", ...],
  "expansions_made": ["lista de expansiones aplicadas"]
}

Toda la respuesta debe estar en castellano (español).
`;

export const experienceGenerationPrompt = (jobTitle) => `
Puesto de Trabajo: ${jobTitle}. 

Según el título del puesto, genera entre 5-7 puntos clave para describir experiencia profesional en un currículum.

INSTRUCCIONES:
1. Usa verbos de acción al inicio de cada punto
2. Enfoca en responsabilidades típicas del puesto
3. Incluye tecnologías y metodologías relevantes
4. Menciona resultados e impacto cuando sea apropiado
5. Haz los puntos específicos pero aplicables
6. NO uses formato JSON array

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "jobTitle": "${jobTitle}",
  "points": ["punto 1", "punto 2", ...]
}

Toda la respuesta debe estar en castellano (español).
`;
