# Especificación de Prompts IA - Cartas Personalizables

## Configuraciones de Estilo

### 1. Formal

**Características:**

- Lenguaje profesional y estructurado
- Tercera persona ocasional mezclada con primera
- Términos técnicos apropiados
- Estructura clásica de carta comercial

**Prompt Adicional:**

```
ESTILO FORMAL:
- Usa un lenguaje profesional y respetuoso
- Mantén estructura tradicional de carta comercial
- Incluye fórmulas de cortesía estándar
- Evita contracciones y jerga
- Tono serio pero accesible
```

### 2. Friendly (Amigable)

**Características:**

- Tono cálido pero profesional
- Lenguaje más cercano y personal
- Expresiones de entusiasmo controlado
- Conexión emocional con la empresa

**Prompt Adicional:**

```
ESTILO AMIGABLE:
- Usa un tono cálido y accesible
- Muestra entusiasmo genuino por la oportunidad
- Incluye razones personales de interés en la empresa
- Lenguaje conversacional pero profesional
- Conecta con la cultura de la empresa
```

### 3. Humanized (Humanizado)

**Características:**

- Admite limitaciones de forma constructiva
- Muestra proceso de crecimiento personal
- Lenguaje natural y honesto
- Evita perfección artificial

**Prompt Adicional:**

```
ESTILO HUMANIZADO:
- Sé honesto sobre fortalezas y áreas de crecimiento
- Menciona el aprendizaje como un proceso continuo
- Usa frases como "he aprendido que", "en mi experiencia"
- Admite cuando algo es nuevo pero muestras ganas de aprender
- Evita sonar como un candidato "perfecto"
- Incluye motivaciones reales y personales
```

### 4. Informal

**Características:**

- Tono relajado pero respetuoso
- Lenguaje cotidiano adaptado al contexto profesional
- Personalidad más visible
- Apropiado para startups o culturas empresariales jóvenes

**Prompt Adicional:**

```
ESTILO INFORMAL:
- Tono relajado y conversacional
- Usa contracciones naturalmente
- Muestra más personalidad
- Lenguaje directo y sin rodeos
- Apropiado para empresas con cultura joven
- Mantén el respeto profesional
```

## Configuraciones de Longitud

### Short (Corta) - 200-300 palabras

**Estructura:**

- Introducción directa (1 párrafo)
- Experiencia relevante condensada (1 párrafo)
- Cierre con llamada a la acción (1 párrafo)

**Prompt Adicional:**

```
LONGITUD CORTA (200-300 palabras):
- Sé directo y conciso
- Enfócate solo en los puntos más relevantes
- Máximo 3 párrafos
- Cada párrafo máximo 4-5 líneas
- Elimina información secundaria
- Impacto inmediato
```

### Medium (Media) - 350-450 palabras

**Estructura:**

- Introducción con motivación (1 párrafo)
- Experiencia técnica (1 párrafo)
- Soft skills y cultura fit (1 párrafo)
- Cierre profesional (1 párrafo)

**Prompt Adicional:**

```
LONGITUD MEDIA (350-450 palabras):
- Estructura balanceada de 4 párrafos
- Desarrollo adecuado de cada punto
- Incluye tanto aspectos técnicos como personales
- Equilibrio entre brevedad y detalle
- Espacio para ejemplos específicos
```

### Long (Larga) - 500-650 palabras

**Estructura:**

- Introducción detallada con investigación de empresa
- Experiencia técnica con ejemplos
- Proyectos específicos o logros
- Soft skills y motivaciones
- Valor añadido que puedo aportar
- Cierre con seguimiento

**Prompt Adicional:**

```
LONGITUD LARGA (500-650 palabras):
- Máximo 6 párrafos bien desarrollados
- Incluye ejemplos específicos y logros cuantificables
- Menciona investigación sobre la empresa
- Detalla proyectos relevantes
- Explica el valor específico que aportas
- Incluye plan de seguimiento
```

## Prompt Base Unificado

```javascript
const generateCoverLetterPrompt = (
  resumeInfo,
  applicationData,
  style,
  length
) => {
  return `
Escribe una carta de presentación profesional en primera persona en español con tono humano y honesto.

INFORMACIÓN DE LA CANDIDATURA:
- Mi nombre: ${resumeInfo.firstName} ${resumeInfo.lastName}
- Empresa: ${applicationData.companyName}
- Puesto: ${applicationData.jobTitle}
- Descripción del trabajo: ${applicationData.jobDescription}
- Requisitos: ${applicationData.requirements}
- Responsabilidades: ${applicationData.responsibilities}

MI PERFIL:
[... perfil del candidato ...]

${getStylePrompt(style)}
${getLengthPrompt(length)}

TONO HUMANO OBLIGATORIO:
- Evita sonar como IA o superhéroe
- Usa lenguaje natural y conversacional
- Sé honesto sobre habilidades reales
- Incluye humildad y ganas de aprender
- Personalidad auténtica pero profesional

Escribe la carta completa ahora:
`;
};
```

## Ejemplos de Combinaciones

### Formal + Short

> "Estimado equipo de Recursos Humanos, mi nombre es Juan Pérez y escribo para expresar mi interés en el puesto de Desarrollador Frontend. Con 3 años de experiencia en React y JavaScript, considero que mis habilidades técnicas se alinean bien con sus requisitos..."

### Humanized + Medium

> "Hola equipo de [Empresa], soy María García y me emociona la posibilidad de formar parte de su equipo como UX Designer. Debo admitir que cuando vi su oferta, me llamó mucho la atención porque coincide con el tipo de proyectos en los que realmente disfruto trabajar..."

### Informal + Long

> "¡Hola! Soy Carlos López y he estado siguiendo el trabajo que hacen en [Startup] desde hace tiempo. Cuando vi que están buscando un Backend Developer, no pude resistir la tentación de postularme porque creo que podríamos hacer un buen equipo..."

---

_Estos prompts garantizan cartas auténticas y personalizadas según las preferencias del usuario._
