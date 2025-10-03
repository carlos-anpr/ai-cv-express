/**
 * Prompts para mejora y generación de contenido de CV
 * Estos prompts se usan con Gemini AI para mejorar resúmenes y experiencia laboral
 */

export const summaryEnhancementPrompt = (currentText, jobTitle) => `
Eres un experto en redacción de currículums profesionales. Tu tarea es mejorar el siguiente resumen profesional PRESERVANDO TODA LA INFORMACIÓN FACTUAL del usuario.

CONTEXTO:
- Puesto de trabajo: ${jobTitle}
- Resumen actual del usuario: "${currentText}"

⚠️ REGLAS ESTRICTAS - CUMPLE ESTAS AL PIE DE LA LETRA:
1. **PRESERVA EXACTAMENTE**: 
   - Años de experiencia mencionados (NO los cambies)
   - Nivel de seniority (Junior/Mid/Senior) - NO lo modifiques
   - Tecnologías y herramientas específicas mencionadas
   - Logros y números concretos citados
   
2. **MEJORA SOLO**:
   - La estructura de las frases
   - El vocabulario (usa sinónimos más profesionales)
   - La fluidez y coherencia del texto
   - El impacto de la redacción sin cambiar los hechos

3. **PROHIBIDO ABSOLUTAMENTE**:
   - Cambiar años de experiencia (si dice 1 año, NO pongas 5 o 7)
   - Cambiar el nivel (si dice Junior, NO pongas Senior)
   - Inventar tecnologías no mencionadas
   - Añadir logros ficticios

4. Mantén una longitud similar al original (±20%)
5. Si el texto es muy corto, mejora lo que hay pero NO inventes información

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
Eres un experto en redacción de currículums profesionales. Tu tarea es ampliar el siguiente resumen profesional PRESERVANDO TODA LA INFORMACIÓN FACTUAL del usuario.

CONTEXTO:
- Puesto de trabajo: ${jobTitle}
- Resumen actual del usuario: "${currentText}"

⚠️ REGLAS ESTRICTAS - CUMPLE ESTAS AL PIE DE LA LETRA:
1. **PRESERVA EXACTAMENTE**: 
   - Años de experiencia mencionados (si dice 1 año, mantén 1 año)
   - Nivel de seniority (Junior/Mid/Senior) - NO lo cambies
   - Tecnologías y herramientas específicas mencionadas
   - Logros y números concretos citados

2. **PUEDES AMPLIAR CON**:
   - Habilidades técnicas **coherentes** con el nivel mencionado
   - Habilidades blandas implícitas en el perfil
   - Metodologías de trabajo **apropiadas** para el nivel
   - Contexto general sobre el tipo de proyectos
   - Descripción del impacto del trabajo

3. **PROHIBIDO ABSOLUTAMENTE**:
   - Cambiar años de experiencia
   - Cambiar el nivel de seniority
   - Mencionar liderazgo de equipos si es Junior
   - Inventar métricas específicas (ej: "reducir costos en 40%")

4. Amplía el texto en un 50-80% más que el original
5. Mantén coherencia entre el nivel y las responsabilidades mencionadas

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "expanded": "resumen ampliado aquí",
  "additions": ["lista de elementos añadidos"],
  "length_increase": "porcentaje de aumento"
}

Toda la respuesta debe estar en castellano (español).
`;

export const summaryGenerationPrompt = (jobTitle, currentText = null) => `
Puesto de Trabajo: ${jobTitle}
${currentText ? `Texto de referencia del usuario: "${currentText}"` : ''}

${
  currentText
    ? `
Basándote en el texto de referencia del usuario, detecta su nivel de experiencia mencionado (años, nivel de seniority) y genera 3 VARIACIONES DIFERENTES del resumen profesional MANTENIENDO EL MISMO NIVEL.

⚠️ REGLAS ESTRICTAS:
1. **PRESERVA DEL TEXTO ORIGINAL**:
   - Años de experiencia mencionados (si dice 1 año, las 3 opciones deben ser para 1 año)
   - Nivel de seniority (si dice Junior, las 3 opciones deben ser Junior)
   - Tecnologías específicas mencionadas

2. **GENERA 3 VARIACIONES** que:
   - Sean diferentes en redacción y enfoque
   - Mantengan el mismo nivel de experiencia
   - Varíen en las habilidades soft mencionadas
   - Varíen en el énfasis (ej: una enfocada en aprendizaje, otra en resultados, otra en colaboración)

3. **PROHIBIDO**:
   - Cambiar años de experiencia
   - Cambiar nivel de seniority
   - Inventar logros con métricas específicas
`
    : `
Según el puesto de trabajo, genera 3 resúmenes profesionales para diferentes niveles de experiencia:
- Senior (7+ años): 6-7 líneas - liderazgo, arquitectura, mentoría
- Nivel Medio (3-6 años): 5-6 líneas - autonomía, optimización, colaboración
- Junior/Principiante (0-2 años): 4-5 líneas - aprendizaje, desarrollo, apoyo

INSTRUCCIONES:
1. Cada resumen debe ser apropiado para su nivel
2. Usa verbos de acción coherentes con la seniority
3. Menciona tecnologías y metodologías relevantes
4. Enfoca en logros realistas para cada nivel
5. Mantén tono profesional pero accesible
`
}

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
Eres un experto en redacción de experiencia laboral para currículums. Tu tarea es mejorar los siguientes puntos de experiencia PRESERVANDO TODA LA INFORMACIÓN del usuario.

CONTEXTO:
- Puesto: ${jobTitle}
- Empresa: ${companyName}
- Puntos actuales:
${points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

⚠️ REGLAS ESTRICTAS - CUMPLE ESTAS AL PIE DE LA LETRA:
1. **PRESERVA EXACTAMENTE**:
   - Todas las tecnologías y herramientas mencionadas
   - Responsabilidades específicas descritas
   - Logros y números concretos citados
   - El alcance del trabajo (no añadas "liderazgo de equipos" si no se menciona)

2. **MEJORA SOLO**:
   - La estructura gramatical de las frases
   - Usa verbos de acción más fuertes al inicio
   - Aplica metodología CAR (Contexto, Acción, Resultado) cuando sea posible
   - Mejora la fluidez sin cambiar los hechos

3. ${
  reorganize
    ? 'Reorganiza los puntos por orden de impacto/relevancia'
    : 'Mantén el orden original'
}

4. **PROHIBIDO**:
   - Inventar tecnologías no mencionadas
   - Añadir responsabilidades que no están en el texto
   - Crear métricas ficticias
   - Exagerar el nivel de responsabilidad

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "points": ["punto 1 mejorado", "punto 2 mejorado", ...],
  "improvements": ["lista de mejoras aplicadas a cada punto"]
}

Toda la respuesta debe estar en castellano (español).
`;

export const experienceExpansionPrompt = (points, jobTitle, companyName) => `
Eres un experto en redacción de experiencia laboral para currículums. Tu tarea es ampliar los siguientes puntos de experiencia PRESERVANDO TODA LA INFORMACIÓN del usuario.

CONTEXTO:
- Puesto: ${jobTitle}
- Empresa: ${companyName}
- Puntos actuales:
${points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

⚠️ REGLAS ESTRICTAS - CUMPLE ESTAS AL PIE DE LA LETRA:
1. **PRESERVA EXACTAMENTE**:
   - Todas las tecnologías y herramientas mencionadas
   - Responsabilidades específicas descritas
   - Logros y números concretos citados
   - El alcance y nivel de responsabilidad

2. **PUEDES AMPLIAR CON**:
   - Contexto adicional sobre el proyecto/tarea
   - Metodologías de trabajo coherentes con lo descrito
   - Tecnologías relacionadas a las ya mencionadas
   - Descripción del impacto del trabajo
   - Detalles técnicos coherentes con las responsabilidades

3. **PROHIBIDO**:
   - Inventar métricas específicas (NO digas "aumentó en 40%" si no se menciona)
   - Añadir responsabilidades completamente nuevas
   - Exagerar el nivel de impacto o responsabilidad
   - Mencionar liderazgo si no está implícito en el texto original

4. Expande el contenido en un 50-70% más
5. Mantén coherencia entre todos los puntos

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
