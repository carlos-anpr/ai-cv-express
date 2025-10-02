# Especificación de Simulación de Entrevistas

## Metodología de Generación

### Análisis del Candidato

```javascript
const analyzeCandidateLevel = (resumeInfo) => {
  // Factores para determinar nivel
  const factors = {
    experience: calculateExperienceYears(resumeInfo.experience),
    education: evaluateEducationLevel(resumeInfo.education),
    skills: analyzeSkillComplexity(resumeInfo.skills),
    responsibilities: evaluateLeadershipExperience(resumeInfo.experience),
  };

  // Algoritmo de clasificación
  if (factors.experience >= 5 || factors.responsibilities.isLead)
    return 'senior';
  if (factors.experience >= 2 && factors.skills.advanced > 3) return 'mid';
  return 'junior';
};
```

### Categorías de Preguntas

#### 1. Technical (Técnicas) - 40%

**Junior (16 preguntas):**

- Conceptos básicos del stack tecnológico
- Resolución de problemas simples
- Mejores prácticas fundamentales

**Mid (16 preguntas):**

- Arquitectura de aplicaciones
- Optimización y performance
- Patrones de diseño

**Senior (16 preguntas):**

- Decisiones arquitectónicas
- Escalabilidad y sistemas distribuidos
- Liderazgo técnico

#### 2. Behavioral (Comportamentales) - 30%

**Todas las niveles (12 preguntas):**

- Trabajo en equipo
- Resolución de conflictos
- Gestión del tiempo
- Adaptabilidad

#### 3. Company (Empresa específica) - 20%

**Todas las niveles (8 preguntas):**

- Conocimiento de la empresa
- Motivación para el puesto
- Cultura fit
- Valores alineados

#### 4. Missing Skills (Habilidades faltantes) - 10%

**Todas las niveles (4 preguntas):**

- Cómo abordar tecnologías no conocidas
- Plan de aprendizaje
- Experiencias de aprendizaje pasadas

## Prompt Master para Entrevistas

```javascript
const generateInterviewPrompt = (
  resumeInfo,
  applicationData,
  candidateLevel
) => {
  return `
Genera una simulación de entrevista de trabajo profesional en español con 40 preguntas distribuidas según las categorías especificadas.

INFORMACIÓN DEL CANDIDATO:
- Nombre: ${resumeInfo.firstName} ${resumeInfo.lastName}
- Nivel detectado: ${candidateLevel}
- Experiencia: ${formatExperience(resumeInfo.experience)}
- Habilidades técnicas: ${formatSkills(resumeInfo.skills)}
- Formación: ${formatEducation(resumeInfo.education)}

INFORMACIÓN DEL PUESTO:
- Empresa: ${applicationData.companyName}
- Puesto: ${applicationData.jobTitle}
- Requisitos: ${applicationData.requirements}
- Responsabilidades: ${applicationData.responsibilities}

DISTRIBUCIÓN DE PREGUNTAS:
1. TÉCNICAS (16 preguntas) - Nivel ${candidateLevel}
2. COMPORTAMENTALES (12 preguntas)
3. EMPRESA ESPECÍFICA (8 preguntas)
4. HABILIDADES FALTANTES (4 preguntas)

INSTRUCCIONES PARA RESPUESTAS HUMANAS:
- Las respuestas deben sonar naturales y humanas
- Incluir dudas o pausas ocasionales ("Hmm, buena pregunta...")
- Admitir limitaciones cuando sea apropiado
- Mostrar proceso de pensamiento real
- Evitar respuestas perfectas o robóticas
- Usar ejemplos personales creíbles
- Lenguaje conversacional pero profesional
- Incluir emociones apropiadas (entusiasmo, nerviosismo normal)

FORMATO DE SALIDA:
Para cada pregunta generar:
{
  "category": "technical|behavioral|company|missing_skill",
  "question": "La pregunta del entrevistador",
  "suggestedAnswer": "Respuesta modelo en tono humano",
  "tips": ["Consejo 1", "Consejo 2", "Consejo 3"]
}

EJEMPLOS DE TONO HUMANO EN RESPUESTAS:

❌ Evitar: "Soy un experto en React con dominio completo de todas las características avanzadas..."
✅ Usar: "He trabajado bastante con React en los últimos dos años. Me siento cómodo con los hooks y el manejo de estado, aunque todavía estoy aprendiendo sobre algunas optimizaciones más avanzadas..."

❌ Evitar: "Nunca he tenido conflictos en equipos porque manejo perfectamente todas las situaciones..."
✅ Usar: "Bueno, en mi experiencia anterior tuvimos un momento complicado cuando el equipo no se ponía de acuerdo sobre la arquitectura. Lo que hice fue..."

GENERA LAS 40 PREGUNTAS CON SUS RESPUESTAS EN FORMATO JSON:
`;
};
```

## Algoritmo de Detección de Gaps

```javascript
const detectMissingSkills = (resumeSkills, jobRequirements) => {
  const required = parseRequirements(jobRequirements);
  const current = resumeSkills.map((s) => s.name.toLowerCase());

  const missing = required.filter(
    (skill) =>
      !current.some((currentSkill) => similarity(skill, currentSkill) > 0.7)
  );

  return missing.map((skill) => ({
    skill,
    relatedExperience: findRelatedSkills(skill, current),
    learningPath: generateLearningPath(skill),
  }));
};
```

## Ejemplos de Preguntas por Nivel

### Technical - Junior

```
"¿Puedes explicarme qué es el DOM y cómo lo manipularías con JavaScript?"

Respuesta sugerida: "El DOM es como la representación que hace el navegador de la página web, ¿no? Es lo que nos permite cambiar cosas dinámicamente. Por ejemplo, en mi último proyecto usé document.getElementById para cambiar el texto de un botón cuando el usuario hacía clic. También he usado querySelector bastante, aunque aún me cuesta a veces recordar todos los selectores más complejos..."
```

### Technical - Senior

```
"¿Cómo diseñarías la arquitectura de un sistema que necesita manejar 10,000 usuarios concurrentes?"

Respuesta sugerida: "Interesante pregunta... Bueno, primero pensaría en la carga que van a generar esos usuarios. Probablemente empezaría con un load balancer para distribuir las peticiones, tal vez usando nginx. Para la base de datos, dependiendo del tipo de datos, podría considerar sharding o réplicas de lectura. He implementado cache con Redis en proyectos anteriores y funciona muy bien para reducir la carga en la BD. Aunque debo admitir que nunca he manejado exactamente esa escala, pero basándome en lo que he leído y mi experiencia con sistemas más pequeños..."
```

### Missing Skills

```
"Veo que no tienes experiencia con Docker, pero es algo que usamos mucho aquí. ¿Cómo te aproximarías a aprenderlo?"

Respuesta sugerida: "Tienes razón, Docker es algo que tengo pendiente aprender. He oído hablar mucho de contenedores y entiendo el concepto básico, pero no he tenido la oportunidad de implementarlo en proyectos reales. Mi enfoque sería empezar con tutoriales prácticos, tal vez contenarizar una aplicación simple que ya conozco. En mi experiencia anterior con tecnologías nuevas, como cuando aprendí React, me funcionó bien empezar con proyectos pequeños y luego ir escalando la complejidad. ¿Hay algún recurso específico que recomiendan en el equipo para empezar?"
```

## Métricas de Calidad

### Validación de Respuestas Humanas

- **Naturalidad**: ¿Suena como hablaría una persona real?
- **Honestidad**: ¿Admite limitaciones apropiadamente?
- **Relevancia**: ¿Responde a la pregunta específica?
- **Nivel apropiado**: ¿Coincide con el nivel del candidato?

### KPIs del Sistema

- Tiempo de generación < 30 segundos
- 40 preguntas distribuidas correctamente
- 0% preguntas duplicadas
- 100% respuestas en tono humano validado

---

_Esta especificación garantiza entrevistas realistas y preparación efectiva para candidatos reales._
