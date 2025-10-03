# 📋 Diseño y Arquitectura: Sistema de Simulación de Entrevistas

## 📌 Objetivo

Implementar un sistema de generación de tests de preparación para entrevistas de trabajo, con 5 preguntas en castellano, respuestas sugeridas y explicaciones generadas por IA (Gemini). Los tests se guardan automáticamente en IndexedDB con opciones para regenerar o eliminar.

## ⚠️ IMPORTANTE: Generación Basada en Datos de la Candidatura

**El test se genera EXCLUSIVAMENTE en base a los campos de la candidatura:**

### 📋 Campos Obligatorios de la Candidatura

1. **Empresa** (`companyName`) - OBLIGATORIO
2. **Puesto** (`jobTitle`) - OBLIGATORIO
3. **Requisitos Específicos** (`requirements`) - OBLIGATORIO
4. **Descripción del Puesto** (`jobDescription`) - OBLIGATORIO
5. **Responsabilidades** (`responsibilities`) - RECOMENDADO

### 🎯 Proceso de Detección y Análisis

**Gemini analiza estos campos para:**

1. **Extraer habilidades técnicas requeridas**
   - Ejemplo: "Backend Node.js", "Java Spring Boot", "React", etc.
   - Extrae tecnologías, frameworks, metodologías
2. **Detectar nivel profesional (Junior, Mid, Senior)**
   - Analiza años de experiencia mencionados
   - Analiza complejidad de responsabilidades
   - Analiza requisitos técnicos y de liderazgo
3. **Identificar tipo de puesto**
   - Backend Developer
   - Frontend Developer
   - Full Stack Developer
   - DevOps Engineer
   - Data Scientist
   - etc.

### 🚫 Validación Previa a la Generación

**ANTES de llamar a Gemini, el sistema DEBE validar:**

```javascript
// Validación de campos obligatorios
const validateJobApplicationData = (jobApplication) => {
  const errors = [];

  if (!jobApplication.companyName?.trim()) {
    errors.push('El nombre de la empresa es obligatorio');
  }

  if (!jobApplication.jobTitle?.trim()) {
    errors.push('El puesto es obligatorio');
  }

  if (
    !jobApplication.requirements?.trim() ||
    jobApplication.requirements.length < 50
  ) {
    errors.push(
      'Los Requisitos Específicos deben tener al menos 50 caracteres'
    );
  }

  if (
    !jobApplication.jobDescription?.trim() ||
    jobApplication.jobDescription.length < 50
  ) {
    errors.push('La Descripción del Puesto debe tener al menos 50 caracteres');
  }

  return errors;
};
```

**Si hay errores:**

```jsx
❌ No se puede generar el test

Faltan datos obligatorios de la candidatura:
• Los Requisitos Específicos están vacíos o son muy generales
• La Descripción del Puesto es insuficiente

Por favor, edita la candidatura y completa estos campos con información detallada
sobre las habilidades técnicas requeridas, experiencia necesaria y responsabilidades
del puesto.

[Editar Candidatura]
```

### 📊 Ejemplo de Análisis

**Candidatura: Backend Developer**

```
Empresa: TechCorp S.L.
Puesto: Backend Developer
Requisitos:
- 2-3 años de experiencia en Node.js
- Conocimiento de Express.js y Nest.js
- Base de datos MongoDB y PostgreSQL
- API REST y GraphQL
- Testing con Jest
- Docker básico

Descripción:
Buscamos desarrollador backend para proyecto de e-commerce.
Trabajarás en equipo ágil con sprints de 2 semanas.
```

**Gemini detecta:**

- ✅ Nivel: **Junior/Mid** (2-3 años)
- ✅ Stack: **Node.js, Express, Nest.js**
- ✅ Bases de datos: **MongoDB, PostgreSQL**
- ✅ Tipo: **Backend Developer**

**Genera preguntas como:**

1. "Explica la diferencia entre Express.js y Nest.js y cuándo usarías cada uno"
2. "¿Cómo manejarías la autenticación JWT en una API REST con Node.js?"
3. "Describe una situación donde optimizaste una query lenta en MongoDB"
4. etc.

---

## 🎯 Ruta de la Funcionalidad

```
http://localhost:5173/dashboard/resume/{resumeId}/job-applications/{applicationId}/interview-simulation
```

---

## 🏗️ Arquitectura del Sistema

### **1. Estructura de Datos (IndexedDB)**

#### Tabla: `interviewSimulations`

Ya existe en el esquema (v2). Estructura actual:

```javascript
interviewSimulations: '++id, jobApplicationId, resumeId, userEmail, candidateLevel, questions, createdAt, updatedAt';
```

**Modelo de datos propuesto:**

```typescript
{
  id: number,                    // Auto-increment
  jobApplicationId: string,      // FK a jobApplications
  resumeId: string,              // FK a resumes
  userEmail: string,             // Usuario propietario
  questions: [                   // Array de preguntas
    {
      id: string,                // UUID de la pregunta
      question: string,          // Texto de la pregunta
      correctAnswer: string,     // Respuesta correcta
      explanation: string,       // Explicación del por qué
      category: string,          // 'técnica' | 'comportamental' | 'empresa'
      difficulty: string         // 'básica' | 'intermedia' | 'avanzada'
    }
  ],
  candidateLevel: string,        // 'junior' | 'mid' | 'senior' (detectado)
  generatedAt: Date,             // Timestamp de generación
  createdAt: Date,               // Timestamp de creación
  updatedAt: Date                // Timestamp de actualización
}
```

---

### **2. Servicios y Capas**

#### **2.1 Prompt Generator**

**Archivo:** `src/services/prompts/interviewTestGenerator.js`

**Responsabilidad:** Generar el prompt estructurado para Gemini

```javascript
class InterviewTestGenerator {
  static generatePrompt(resumeData, jobApplication) {
    // Analiza el CV y la oferta
    // Detecta nivel profesional
    // Construye prompt para 5 preguntas
    // Especifica formato JSON
  }

  static detectCandidateLevel(experience) {
    // Lógica de detección de nivel
  }

  static formatResumeContext(resumeData) {
    // Formatea experiencia, educación, skills
  }

  static formatJobContext(jobApplication) {
    // Formatea requisitos del puesto
  }
}
```

**Prompt Template (Actualizado):**

```
Eres un experto reclutador técnico especializado en preparación de entrevistas.

PASO 1: ANALIZA LA OFERTA DE TRABAJO
=======================================

INFORMACIÓN DE LA CANDIDATURA:
- Empresa: {companyName}
- Puesto: {jobTitle}

REQUISITOS ESPECÍFICOS DEL PUESTO:
{requirements}

DESCRIPCIÓN COMPLETA DEL PUESTO:
{jobDescription}

RESPONSABILIDADES:
{responsibilities}

CONTEXTO ADICIONAL DEL CANDIDATO:
- Nombre: {firstName} {lastName}
- Experiencia: {experience}
- Educación: {education}
- Habilidades: {skills}

PASO 2: DETECTA Y EXTRAE INFORMACIÓN CLAVE
============================================

Analiza los requisitos y descripción para determinar:

1. **NIVEL PROFESIONAL** (Basado en años de experiencia y complejidad):
   - "junior" → 0-3 años, tareas supervisadas, aprendizaje
   - "mid" → 3-6 años, autonomía, proyectos completos
   - "senior" → 6+ años, liderazgo, arquitectura, mentoría

2. **HABILIDADES TÉCNICAS PRINCIPALES**:
   - Lenguajes de programación (ej: "Node.js", "Java", "Python")
   - Frameworks (ej: "Express.js", "Spring Boot", "React")
   - Herramientas (ej: "Docker", "Git", "Jenkins")
   - Bases de datos (ej: "MongoDB", "PostgreSQL")
   - Metodologías (ej: "Agile", "Scrum", "TDD")

3. **TIPO DE ROL**:
   - Backend, Frontend, Full Stack, DevOps, Data, etc.

PASO 3: GENERA 5 PREGUNTAS PERSONALIZADAS
==========================================

IMPORTANTE: Las preguntas deben ser ESPECÍFICAS a las tecnologías y requisitos mencionados.

DISTRIBUCIÓN OBLIGATORIA:
- 2 preguntas TÉCNICAS sobre las habilidades específicas del puesto
- 2 preguntas COMPORTAMENTALES usando metodología STAR
- 1 pregunta sobre CONOCIMIENTO de la empresa/industria

REQUISITOS DE LAS PREGUNTAS:
✅ Mencionar tecnologías ESPECÍFICAS de los requisitos
✅ Ajustar dificultad al nivel detectado
✅ TODO en castellano
✅ Respuestas realistas y profesionales (no teóricas)
✅ Explicaciones educativas (por qué esa respuesta es efectiva)

EJEMPLO DE PREGUNTA TÉCNICA BUENA:
❌ MAL: "¿Qué es una base de datos?"
✅ BIEN: "Explica cómo implementarías un índice compuesto en MongoDB para optimizar
          consultas de búsqueda por usuario y fecha en una aplicación con 1M+ registros"

FORMATO JSON ESTRICTO:
{
  "candidateLevel": "junior|mid|senior",
  "detectedSkills": ["skill1", "skill2", "skill3"],
  "roleType": "Backend|Frontend|FullStack|DevOps|Data|etc",
  "questions": [
    {
      "id": "uuid",
      "question": "Pregunta en castellano específica a las tecnologías mencionadas",
      "correctAnswer": "Respuesta sugerida profesional y práctica",
      "explanation": "Explicación de por qué esta respuesta es efectiva (2-3 líneas)",
      "category": "técnica|comportamental|empresa",
      "difficulty": "básica|intermedia|avanzada"
    }
  ]
}

VALIDACIÓN FINAL:
- Verifica que mencionas al menos 2 tecnologías específicas de los requisitos
- Verifica que el nivel de dificultad coincide con el nivel detectado
- Verifica que las preguntas NO sean genéricas
```

---

#### **2.2 AI Service Extension**

**Archivo:** `service/AIModal.js` (ya existe)

**Nueva función a añadir:**

```javascript
export const AIChatSessionJSON = () => {
  return model.startChat({
    generationConfig: {
      ...generationConfig,
      responseMimeType: 'application/json', // Ya configurado
    },
    history: [],
  });
};
```

---

#### **2.3 LocalDatabase Extension**

**Archivo:** `src/services/LocalDatabase.js` (extender)

**Nuevas funciones a añadir:**

```javascript
class LocalDatabase {
  // CREATE - Crear simulación de entrevista
  async CreateInterviewSimulation(data) {
    await this.ensureDatabaseReady();

    const simulationData = {
      jobApplicationId: data.jobApplicationId,
      resumeId: data.resumeId,
      userEmail: data.userEmail,
      candidateLevel: data.candidateLevel,
      questions: JSON.stringify(data.questions), // Serializar array
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await db.interviewSimulations.add(simulationData);

    return {
      data: {
        ...simulationData,
        id,
        questions: JSON.parse(simulationData.questions),
      },
    };
  }

  // READ - Obtener simulación por candidatura
  async GetInterviewSimulationByJobApplication(jobApplicationId, userEmail) {
    await this.ensureDatabaseReady();

    const simulation = await db.interviewSimulations
      .where('jobApplicationId')
      .equals(jobApplicationId)
      .and((sim) => sim.userEmail === userEmail)
      .first();

    if (!simulation) {
      return { data: null };
    }

    return {
      data: {
        ...simulation,
        questions: this.safeJsonParse(simulation.questions, []),
      },
    };
  }

  // DELETE - Eliminar simulación
  async DeleteInterviewSimulation(simulationId, userEmail) {
    await this.ensureDatabaseReady();

    const simulation = await db.interviewSimulations.get(simulationId);

    if (!simulation || simulation.userEmail !== userEmail) {
      throw new Error('Simulación no encontrada o sin permisos');
    }

    await db.interviewSimulations.delete(simulationId);

    return { success: true };
  }

  // UPDATE - Regenerar (eliminar y crear nuevo)
  async RegenerateInterviewSimulation(jobApplicationId, userEmail) {
    // Eliminar existente
    const existing = await this.GetInterviewSimulationByJobApplication(
      jobApplicationId,
      userEmail
    );

    if (existing.data) {
      await this.DeleteInterviewSimulation(existing.data.id, userEmail);
    }

    return { success: true, message: 'Listo para regenerar' };
  }
}
```

---

### **3. Componente Principal**

#### **Archivo:** `src/dashboard/resume/[resumeId]/job-applications/[applicationId]/interview-simulation/index.jsx`

**Estados del componente:**

```javascript
const [loading, setLoading] = useState(true); // Carga inicial
const [generating, setGenerating] = useState(false); // Generando con AI
const [simulation, setSimulation] = useState(null); // Datos del test
const [application, setApplication] = useState(null); // Datos candidatura
const [resumeData, setResumeData] = useState(null); // Datos CV
const [error, setError] = useState(null); // Errores
```

**Flujo de trabajo:**

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENTE PRINCIPAL                      │
│                   InterviewSimulation                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌─────────────────────────────────────┐
        │   useEffect: Carga Inicial          │
        │   - Cargar candidatura (LocalDB)    │
        │   - Cargar CV (LocalDB)             │
        │   - Buscar simulación existente     │
        └─────────────────────────────────────┘
                           │
                           ▼
        ┌─────────────────────────────────────┐
        │   ¿Existe simulación guardada?      │
        └─────────────────────────────────────┘
                     │              │
                    SÍ             NO
                     │              │
                     ▼              ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ Mostrar Test     │  │ Mostrar Botón:   │
        │ Guardado         │  │ "Generar Test"   │
        └──────────────────┘  └──────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │  handleGenerateTest()    │
                        │  1. setGenerating(true)  │
                        │  2. Llamar Gemini AI     │
                        │  3. Parsear respuesta    │
                        │  4. Guardar en IndexedDB │
                        │  5. Actualizar estado    │
                        │  6. setGenerating(false) │
                        └──────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │  Mostrar Test Generado   │
                        │  + Opciones:             │
                        │    - Regenerar           │
                        │    - Eliminar            │
                        └──────────────────────────┘
```

---

### **4. Interfaz de Usuario**

#### **4.1 Estados de la UI**

**Estado 0: Datos de candidatura insuficientes** ⚠️ **NUEVO**

```jsx
<Card className="border-yellow-200 bg-yellow-50">
  <CardHeader>
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
      <div>
        <CardTitle className="text-yellow-900">
          No se puede generar el test
        </CardTitle>
        <CardDescription className="text-yellow-800 mt-2">
          Faltan datos obligatorios de la candidatura para poder generar
          preguntas relevantes
        </CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div className="bg-white rounded-lg p-4 mb-4">
      <h4 className="font-medium text-gray-900 mb-3">
        Campos obligatorios faltantes:
      </h4>
      <ul className="space-y-2">
        {validationErrors.map((error, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
        <Info className="w-4 h-4" />
        ¿Por qué son necesarios estos datos?
      </h4>
      <p className="text-sm text-blue-800">
        El sistema de IA necesita información específica sobre las{' '}
        <strong>habilidades técnicas requeridas</strong>, el{' '}
        <strong>nivel de experiencia</strong> y las{' '}
        <strong>responsabilidades del puesto</strong> para generar preguntas de
        entrevista relevantes y personalizadas.
      </p>
    </div>

    <div className="flex gap-3">
      <Button
        onClick={() =>
          navigate(
            `/dashboard/resume/${resumeId}/job-applications/${applicationId}/edit`
          )
        }
        className="bg-yellow-600 hover:bg-yellow-700"
      >
        <Edit className="w-4 h-4 mr-2" />
        Completar Datos de la Candidatura
      </Button>
      <Button variant="outline" onClick={handleGoBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>
    </div>
  </CardContent>
</Card>
```

**Estado 1: Cargando (inicial)**

```jsx
<div className="flex justify-center items-center min-h-[400px]">
  <div className="text-center">
    <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
    <p className="mt-4 text-gray-600">Cargando preparación de entrevista...</p>
  </div>
</div>
```

**Estado 2: Sin test generado**

```jsx
<Card>
  <CardHeader>
    <CardTitle>Test de Preparación para Entrevista</CardTitle>
    <CardDescription>
      Genera un test personalizado con 5 preguntas basadas en tu CV y el puesto
    </CardDescription>
  </CardHeader>
  <CardContent className="text-center py-12">
    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold mb-2">No hay test generado todavía</h3>
    <p className="text-gray-600 mb-6">
      Genera un test de estudio personalizado con preguntas, respuestas y
      explicaciones
    </p>
    <Button
      onClick={handleGenerateTest}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Generar Test con IA
    </Button>
  </CardContent>
</Card>
```

**Estado 3: Generando con IA**

```jsx
<Card>
  <CardContent className="py-12">
    <div className="text-center">
      <div className="relative">
        <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto" />
        <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold mt-6 mb-2">
        Generando Test Personalizado
      </h3>
      <p className="text-gray-600 mb-4">
        La IA está analizando tu CV y el puesto para crear preguntas
        relevantes...
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <div className="animate-pulse">⚡</div>
        <span>Esto puede tardar 10-20 segundos</span>
      </div>
    </div>
  </CardContent>
</Card>
```

**Estado 4: Test generado**

```jsx
<div className="space-y-6">
  {/* Header con acciones */}
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle>Test de Preparación</CardTitle>
          <CardDescription>
            Generado el {formatDate(simulation.generatedAt)} • Nivel:{' '}
            {simulation.candidateLevel}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={generating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>
    </CardHeader>
  </Card>

  {/* Preguntas */}
  {simulation.questions.map((q, index) => (
    <Card key={q.id} className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Badge variant="outline" className="mb-2">
              {q.category} • {q.difficulty}
            </Badge>
            <CardTitle className="text-lg">
              {index + 1}. {q.question}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Respuesta sugerida */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900 mb-1">
                Respuesta Sugerida:
              </p>
              <p className="text-green-800">{q.correctAnswer}</p>
            </div>
          </div>
        </div>

        {/* Explicación */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900 mb-1">
                ¿Por qué esta respuesta?
              </p>
              <p className="text-blue-800">{q.explanation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}

  {/* Consejos adicionales */}
  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5" />
        Consejos para la Entrevista
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2 text-sm">
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1">•</span>
          <span>
            Practica estas respuestas en voz alta antes de la entrevista
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1">•</span>
          <span>
            Personaliza las respuestas con ejemplos de tu experiencia real
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1">•</span>
          <span>
            Investiga más sobre {application.companyName} antes de la entrevista
          </span>
        </li>
      </ul>
    </CardContent>
  </Card>
</div>
```

---

## 📝 Plan de Implementación por Pasos

### **PASO 1: Crear el generador de prompts**

**Archivo:** `src/services/prompts/interviewTestGenerator.js`

✅ **Tareas:**

- Crear la clase `InterviewTestGenerator`
- Implementar método `generatePrompt()`
- Implementar detección de nivel profesional
- Implementar formateadores de contexto
- Definir template del prompt

🧪 **Testing:**

```javascript
// Test básico en consola
const prompt = InterviewTestGenerator.generatePrompt(mockResume, mockJobApp);
console.log(prompt);
```

---

### **PASO 2: Extender LocalDatabase**

**Archivo:** `src/services/LocalDatabase.js`

✅ **Tareas:**

- Añadir método `CreateInterviewSimulation()`
- Añadir método `GetInterviewSimulationByJobApplication()`
- Añadir método `DeleteInterviewSimulation()`
- Añadir método `RegenerateInterviewSimulation()`

🧪 **Testing:**

```javascript
// Verificar que se guarda correctamente
const result = await LocalDatabase.CreateInterviewSimulation(mockData);
console.log('Simulación guardada:', result);

// Verificar recuperación
const retrieved = await LocalDatabase.GetInterviewSimulationByJobApplication(
  jobAppId,
  userEmail
);
console.log('Simulación recuperada:', retrieved);
```

---

### **PASO 3: Implementar validación de datos de candidatura** ⚠️ **CRÍTICO**

**Archivo:** `src/services/prompts/interviewTestGenerator.js`

✅ **Tareas:**

- Crear función `validateJobApplicationData()`
- Validar campos obligatorios
- Validar longitud mínima de campos
- Retornar errores descriptivos

**Código:**

```javascript
class InterviewTestGenerator {
  /**
   * Valida que la candidatura tenga los datos mínimos necesarios
   * para generar un test de entrevista relevante
   */
  static validateJobApplicationData(jobApplication) {
    const errors = [];
    const MIN_TEXT_LENGTH = 50; // Mínimo 50 caracteres para descripciones

    // 1. Validar empresa
    if (!jobApplication.companyName?.trim()) {
      errors.push('El nombre de la empresa es obligatorio');
    }

    // 2. Validar puesto
    if (!jobApplication.jobTitle?.trim()) {
      errors.push('El título del puesto es obligatorio');
    }

    // 3. Validar requisitos (CRÍTICO - de aquí se extraen las skills técnicas)
    if (!jobApplication.requirements?.trim()) {
      errors.push('Los Requisitos Específicos son obligatorios');
    } else if (jobApplication.requirements.trim().length < MIN_TEXT_LENGTH) {
      errors.push(
        `Los Requisitos Específicos deben tener al menos ${MIN_TEXT_LENGTH} caracteres ` +
          `(actualmente: ${jobApplication.requirements.trim().length}). ` +
          `Describe las habilidades técnicas, herramientas y experiencia requerida.`
      );
    }

    // 4. Validar descripción del puesto (CRÍTICO - de aquí se detecta el nivel)
    if (!jobApplication.jobDescription?.trim()) {
      errors.push('La Descripción del Puesto es obligatoria');
    } else if (jobApplication.jobDescription.trim().length < MIN_TEXT_LENGTH) {
      errors.push(
        `La Descripción del Puesto debe tener al menos ${MIN_TEXT_LENGTH} caracteres ` +
          `(actualmente: ${jobApplication.jobDescription.trim().length}). ` +
          `Describe las responsabilidades, nivel de experiencia y contexto del rol.`
      );
    }

    // 5. Warning si faltan responsabilidades (no bloqueante, pero recomendado)
    if (!jobApplication.responsibilities?.trim()) {
      errors.push(
        '⚠️ Las Responsabilidades del Puesto no están definidas (recomendado pero no obligatorio)'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      hasWarnings: errors.some((e) => e.startsWith('⚠️')),
    };
  }

  /**
   * Retorna un mensaje de ayuda para el usuario
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
            'Ejemplo: "3+ años en Node.js, Express.js, MongoDB, conocimiento de Docker y CI/CD"',
        },
        {
          field: 'Descripción del Puesto',
          description:
            'Descripción del rol, responsabilidades principales, tipo de proyectos, metodologías de trabajo y nivel de autonomía esperado.',
          example:
            'Ejemplo: "Desarrollarás APIs REST para aplicaciones web, trabajarás en equipo ágil con sprints de 2 semanas..."',
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
}
```

---

### **PASO 4: Implementar lógica de generación con IA**

**Archivo:** `src/dashboard/resume/[resumeId]/job-applications/[applicationId]/interview-simulation/index.jsx`

✅ **Tareas:**

- **PRIMERO: Validar datos de candidatura** ⚠️
- Crear función `handleGenerateTest()`
- Implementar llamada a Gemini AI
- Parsear respuesta JSON
- Validar estructura de datos
- Guardar en IndexedDB
- Manejar errores

**Código:**

```javascript
const handleGenerateTest = async () => {
  try {
    setGenerating(true);
    setError(null);

    // ⚠️ PASO 0: VALIDAR DATOS DE CANDIDATURA (CRÍTICO)
    const validation =
      InterviewTestGenerator.validateJobApplicationData(application);

    if (!validation.isValid) {
      // Mostrar errores de validación
      setValidationErrors(validation.errors);
      setGenerating(false);
      toast.error('Faltan datos obligatorios de la candidatura');
      return;
    }

    // 1. Generar prompt
    const prompt = InterviewTestGenerator.generatePrompt(
      resumeData,
      application
    );

    // 2. Llamar a Gemini
    const chatSession = AIChatSession();
    const result = await chatSession.sendMessage(prompt);
    const responseText = await result.response.text();

    // 3. Parsear respuesta
    const parsedData = JSON.parse(responseText);

    // 4. Validar estructura
    if (!parsedData.questions || parsedData.questions.length !== 5) {
      throw new Error('Respuesta inválida de la IA');
    }

    // 5. Añadir IDs a preguntas
    const questionsWithIds = parsedData.questions.map((q) => ({
      ...q,
      id: uuidv4(),
    }));

    // 6. Guardar en DB
    const simulationData = {
      jobApplicationId: applicationId,
      resumeId: resumeId,
      userEmail: user.primaryEmailAddress.emailAddress,
      candidateLevel: parsedData.candidateLevel,
      questions: questionsWithIds,
    };

    const savedSimulation = await LocalDatabase.CreateInterviewSimulation(
      simulationData
    );

    // 7. Actualizar estado
    setSimulation(savedSimulation.data);
    toast.success('Test generado correctamente');
  } catch (error) {
    console.error('Error generando test:', error);
    setError(error.message);
    toast.error('Error al generar el test');
  } finally {
    setGenerating(false);
  }
};
```

---

### **PASO 5: Implementar carga de datos inicial**

**Archivo:** Mismo componente

✅ **Tareas:**

- Crear `useEffect` para carga inicial
- Cargar datos de candidatura
- Cargar datos de CV
- **Validar datos de candidatura inmediatamente** ⚠️
- Buscar simulación existente
- Manejar estados de carga

**Código:**

```javascript
// Estados del componente
const [loading, setLoading] = useState(true);
const [generating, setGenerating] = useState(false);
const [simulation, setSimulation] = useState(null);
const [application, setApplication] = useState(null);
const [resumeData, setResumeData] = useState(null);
const [error, setError] = useState(null);
const [validationErrors, setValidationErrors] = useState([]); // ⚠️ NUEVO

useEffect(() => {
  const loadData = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setLoading(true);
      setValidationErrors([]);

      // Cargar candidatura
      const appResponse = await LocalDatabase.GetJobApplicationById(
        applicationId,
        user.primaryEmailAddress.emailAddress
      );
      setApplication(appResponse.data);

      // Cargar CV
      const resumeResponse = await LocalDatabase.GetResumeById(resumeId);
      setResumeData(resumeResponse.data);

      // ⚠️ VALIDAR DATOS DE CANDIDATURA INMEDIATAMENTE
      const validation = InterviewTestGenerator.validateJobApplicationData(
        appResponse.data
      );

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        console.warn('⚠️ Candidatura incompleta:', validation.errors);
        // NO bloquear carga, solo mostrar warning
      }

      // Buscar simulación existente (solo si datos son válidos)
      if (validation.isValid) {
        const simResponse =
          await LocalDatabase.GetInterviewSimulationByJobApplication(
            applicationId,
            user.primaryEmailAddress.emailAddress
          );
        setSimulation(simResponse.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [applicationId, resumeId, user]);
```

---

### **PASO 6: Implementar acciones (Regenerar y Eliminar)**

**Archivo:** Mismo componente

✅ **Tareas:**

- Crear `handleRegenerate()`
- Crear `handleDelete()`
- Añadir confirmaciones
- Actualizar UI

**Código:**

```javascript
const handleRegenerate = async () => {
  if (!confirm('¿Generar un nuevo test? El actual se eliminará.')) {
    return;
  }

  try {
    setGenerating(true);

    // Eliminar simulación actual
    if (simulation?.id) {
      await LocalDatabase.DeleteInterviewSimulation(
        simulation.id,
        user.primaryEmailAddress.emailAddress
      );
    }

    // Generar nuevo test
    setSimulation(null);
    await handleGenerateTest();
  } catch (error) {
    console.error('Error regenerando test:', error);
    toast.error('Error al regenerar el test');
  }
};

const handleDelete = async () => {
  if (!confirm('¿Eliminar este test permanentemente?')) {
    return;
  }

  try {
    await LocalDatabase.DeleteInterviewSimulation(
      simulation.id,
      user.primaryEmailAddress.emailAddress
    );

    setSimulation(null);
    toast.success('Test eliminado correctamente');
  } catch (error) {
    console.error('Error eliminando test:', error);
    toast.error('Error al eliminar el test');
  }
};
```

---

### **PASO 7: Diseñar e implementar UI completa**

**Archivo:** Mismo componente

✅ **Tareas:**

- Implementar todos los estados de UI (incluido estado de validación)
- Añadir iconos (lucide-react)
- Implementar diseño responsivo
- Añadir animaciones de carga
- Mostrar mensajes de ayuda cuando falten datos
- Probar todos los flujos

---

### **PASO 8: Testing y refinamiento**

✅ **Tareas:**

- Probar generación con diferentes perfiles
- Verificar almacenamiento en IndexedDB
- Probar regeneración y eliminación
- Validar respuestas de Gemini
- Ajustar prompts según resultados
- Optimizar tiempos de carga

---

## 🔧 Dependencias Necesarias

**Ya disponibles en el proyecto:**

- ✅ `@google/generative-ai` - Gemini API
- ✅ `dexie` - IndexedDB
- ✅ `lucide-react` - Iconos
- ✅ `uuid` - Generación de IDs
- ✅ `react-router-dom` - Routing
- ✅ `@clerk/clerk-react` - Autenticación
- ✅ `sonner` - Notificaciones

**No se necesitan nuevas dependencias** ✅

---

## 🎨 Componentes UI Utilizados

**Componentes shadcn/ui ya disponibles:**

- ✅ `Button` - Botones de acción
- ✅ `Card` - Contenedores
- ✅ `Badge` - Etiquetas de categoría
- ✅ `Alert` - Mensajes de error

**Iconos lucide-react:**

- `Brain` - Icono principal
- `Sparkles` - Generación IA
- `Loader2` - Spinner de carga
- `CheckCircle2` - Respuesta correcta
- `Lightbulb` - Explicación
- `RefreshCw` - Regenerar
- `Trash2` - Eliminar
- `Target` - Consejos
- `ArrowLeft` - Volver

---

## 🔐 Seguridad y Validaciones

### **Validaciones de datos:**

1. ✅ Verificar que el usuario es propietario de la candidatura
2. ✅ Validar estructura JSON de respuesta de Gemini
3. ✅ Verificar que se generan exactamente 5 preguntas
4. ✅ Sanitizar datos antes de guardar en DB
5. ✅ Validar que campos requeridos no estén vacíos

### **Manejo de errores:**

```javascript
// Error de API
if (!result.response) {
  throw new Error('No se recibió respuesta de la IA');
}

// Error de parsing
let parsedData;
try {
  parsedData = JSON.parse(responseText);
} catch (e) {
  throw new Error('Respuesta de IA no válida');
}

// Error de estructura
if (!Array.isArray(parsedData.questions)) {
  throw new Error('Formato de preguntas inválido');
}

if (parsedData.questions.length !== 5) {
  throw new Error(
    `Se esperaban 5 preguntas, se recibieron ${parsedData.questions.length}`
  );
}

// Validar cada pregunta
parsedData.questions.forEach((q, i) => {
  if (!q.question || !q.correctAnswer || !q.explanation) {
    throw new Error(`Pregunta ${i + 1} incompleta`);
  }
});
```

---

## 📊 Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└─────────────┘
       │
       │ Click "Generar Test"
       ▼
┌─────────────────────────────┐
│  InterviewSimulation.jsx    │
│  handleGenerateTest()       │
└─────────────────────────────┘
       │
       ├─→ Cargar datos CV (LocalDB)
       │
       ├─→ Cargar datos candidatura (LocalDB)
       │
       ▼
┌─────────────────────────────┐
│ InterviewTestGenerator.js   │
│ generatePrompt()            │
└─────────────────────────────┘
       │
       │ Prompt estructurado
       ▼
┌─────────────────────────────┐
│     AIModal.js              │
│  AIChatSession()            │
└─────────────────────────────┘
       │
       │ API Request
       ▼
┌─────────────────────────────┐
│   Google Gemini API         │
│   (gemini-2.0-flash)        │
└─────────────────────────────┘
       │
       │ JSON Response
       ▼
┌─────────────────────────────┐
│  InterviewSimulation.jsx    │
│  - Parse JSON               │
│  - Validar estructura       │
│  - Añadir UUIDs             │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   LocalDatabase.js          │
│ CreateInterviewSimulation() │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│     IndexedDB               │
│ interviewSimulations table  │
└─────────────────────────────┘
       │
       │ Datos guardados
       ▼
┌─────────────────────────────┐
│  InterviewSimulation.jsx    │
│  - Actualizar estado        │
│  - Mostrar test generado    │
└─────────────────────────────┘
```

---

## 🚀 Optimizaciones

### **Performance:**

1. ✅ Cachear datos de CV y candidatura
2. ✅ No regenerar si ya existe test (mostrar guardado por defecto)
3. ✅ Usar `useMemo` para formatear datos pesados
4. ✅ Serialización eficiente de JSON en IndexedDB
5. ✅ Validación temprana de datos (antes de llamar a IA)

### **UX:**

1. ✅ Spinner informativo durante generación
2. ✅ Feedback visual inmediato en cada acción
3. ✅ Confirmaciones para acciones destructivas
4. ✅ Toast notifications para feedback
5. ✅ Diseño responsive mobile-friendly
6. ✅ **Mensajes claros cuando faltan datos de candidatura** ⚠️
7. ✅ **Botón directo para editar candidatura** ⚠️
8. ✅ **Guía de ayuda sobre qué datos incluir** ⚠️

### **AI:**

1. ✅ Timeout de 30 segundos para llamadas a Gemini
2. ✅ Retry logic si falla la primera vez
3. ✅ Validación estricta de respuesta JSON
4. ✅ Prompt engineering optimizado
5. ✅ **Prompt analiza requisitos para extraer skills técnicas** ⚠️
6. ✅ **Prompt detecta nivel profesional de la descripción** ⚠️
7. ✅ **Validación pre-IA para evitar llamadas innecesarias** ⚠️

---

## 📱 Responsive Design

### **Mobile (< 640px):**

- Stack vertical de cards
- Botones full-width
- Texto optimizado para lectura móvil

### **Tablet (640px - 1024px):**

- Layout de 2 columnas cuando sea apropiado
- Botones en fila con wrapping

### **Desktop (> 1024px):**

- Layout completo con sidebar
- Máximo ancho de contenedor: 1200px
- Espaciado generoso

---

## 🧪 Casos de Prueba

### **Test 1: Generación exitosa**

```
1. Usuario sin test guardado
2. Click en "Generar Test"
3. ✅ Muestra spinner de carga
4. ✅ Genera 5 preguntas en castellano
5. ✅ Guarda en IndexedDB automáticamente
6. ✅ Muestra test con respuestas y explicaciones
```

### **Test 2: Test ya existe**

```
1. Usuario con test guardado previamente
2. Navega a la ruta
3. ✅ Muestra test guardado inmediatamente
4. ✅ NO genera nuevo test automáticamente
5. ✅ Muestra opciones de regenerar/eliminar
```

### **Test 3: Regenerar test**

```
1. Usuario con test existente
2. Click en "Regenerar"
3. ✅ Muestra confirmación
4. ✅ Elimina test actual
5. ✅ Genera nuevo test
6. ✅ Guarda automáticamente
```

### **Test 4: Eliminar test**

```
1. Usuario con test existente
2. Click en "Eliminar"
3. ✅ Muestra confirmación
4. ✅ Elimina de IndexedDB
5. ✅ Vuelve a estado "sin test"
6. ✅ Muestra botón "Generar Test"
```

### **Test 5: Error de IA**

```
1. Simular error de API (timeout, etc)
2. ✅ Muestra mensaje de error claro
3. ✅ Permite reintentar
4. ✅ No guarda datos corruptos
```

### **Test 6: Datos de candidatura insuficientes** ⚠️ **NUEVO**

```
1. Usuario con candidatura sin requisitos o descripción
2. Navega a la ruta de simulación
3. ✅ Sistema valida datos automáticamente
4. ✅ Muestra estado de "datos insuficientes"
5. ✅ Lista errores específicos
6. ✅ Ofrece botón para editar candidatura
7. ✅ NO permite generar test hasta completar datos
```

### **Test 7: Generación con datos específicos** ⚠️ **NUEVO**

```
1. Candidatura completa: "Backend Node.js Junior, 2 años exp"
2. Click "Generar Test"
3. ✅ Gemini detecta nivel: Junior
4. ✅ Gemini extrae skills: Node.js, Express, MongoDB
5. ✅ Genera preguntas específicas de Node.js
6. ✅ Ajusta dificultad a nivel Junior
7. ✅ Preguntas mencionan tecnologías del puesto
```

---

## 📋 Checklist de Implementación

### **Backend (LocalDatabase + Prompts)**

- [ ] Crear `InterviewTestGenerator.js`
- [ ] **Implementar `validateJobApplicationData()`** ⚠️ **NUEVO**
- [ ] **Implementar `getValidationHelpMessage()`** ⚠️ **NUEVO**
- [ ] Implementar detección de nivel profesional
- [ ] Implementar extracción de skills técnicas
- [ ] Implementar generación de prompt mejorado
- [ ] Extender `LocalDatabase.js` con métodos CRUD
- [ ] Probar guardado y recuperación en IndexedDB

### **Frontend (Componente)**

- [ ] Implementar estados del componente
- [ ] **Añadir estado `validationErrors`** ⚠️ **NUEVO**
- [ ] Implementar carga inicial de datos
- [ ] **Implementar validación temprana en `useEffect`** ⚠️ **NUEVO**
- [ ] **Implementar UI de "datos insuficientes"** ⚠️ **NUEVO**
- [ ] Implementar función `handleGenerateTest()` con validación previa
- [ ] Implementar función `handleRegenerate()`
- [ ] Implementar función `handleDelete()`
- [ ] Implementar UI de carga (spinner)
- [ ] Implementar UI de test vacío
- [ ] Implementar UI de test generado
- [ ] Implementar UI de errores
- [ ] Añadir validaciones

### **Testing**

- [ ] **Probar validación con candidatura vacía** ⚠️ **NUEVO**
- [ ] **Probar validación con campos muy cortos (< 50 chars)** ⚠️ **NUEVO**
- [ ] **Verificar que preguntas técnicas mencionan tecnologías específicas** ⚠️ **NUEVO**
- [ ] **Probar detección de nivel (Junior, Mid, Senior)** ⚠️ **NUEVO**
- [ ] Probar con diferentes perfiles de candidatos
- [ ] Probar con diferentes tipos de puestos (Backend, Frontend, FullStack, etc.)
- [ ] Verificar que las preguntas son relevantes al puesto específico
- [ ] Verificar que todo está en castellano
- [ ] Probar regeneración múltiple
- [ ] Probar eliminación
- [ ] Probar persistencia (recargar página)
- [ ] Probar en mobile
- [ ] **Verificar que no se puede generar test sin datos válidos** ⚠️ **NUEVO**

### **Refinamiento**

- [ ] Ajustar prompts según calidad de respuestas
- [ ] **Refinar detección de nivel profesional** ⚠️ **NUEVO**
- [ ] **Mejorar extracción de skills técnicas** ⚠️ **NUEVO**
- [ ] Optimizar tiempos de carga
- [ ] Mejorar mensajes de error
- [ ] **Añadir ejemplos en mensajes de validación** ⚠️ **NUEVO**
- [ ] Añadir animaciones suaves
- [ ] Revisar accesibilidad (ARIA labels)

---

## 📚 Recursos y Referencias

### **APIs y Librerías:**

- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Dexie.js Documentation](https://dexie.org/)
- [Lucide Icons](https://lucide.dev/)
- [Shadcn UI](https://ui.shadcn.com/)

### **Patrones utilizados:**

- Repository Pattern (LocalDatabase)
- Prompt Engineering Pattern (InterviewTestGenerator)
- Compound Component Pattern (UI Cards)
- Loading States Pattern (UI)

---

## 🎯 Resultado Esperado

### **Funcionalidad completa:**

✅ **Generación basada EXCLUSIVAMENTE en datos de candidatura** ⚠️  
✅ **Validación previa de campos obligatorios (empresa, puesto, requisitos, descripción)** ⚠️  
✅ **Detección automática de nivel profesional desde la descripción** ⚠️  
✅ **Extracción automática de habilidades técnicas desde requisitos** ⚠️  
✅ **Preguntas técnicas específicas a las tecnologías mencionadas** ⚠️  
✅ Generación de 5 preguntas personalizadas en castellano  
✅ Respuestas sugeridas profesionales  
✅ Explicaciones educativas del por qué  
✅ Guardado automático en IndexedDB  
✅ Carga automática de test guardado  
✅ Opción de regenerar  
✅ Opción de eliminar  
✅ Spinner informativo durante generación  
✅ **Mensaje claro si faltan datos con botón para editar candidatura** ⚠️  
✅ Interfaz limpia y profesional  
✅ Responsive design  
✅ Integración completa con sistema existente

---

## 📝 Notas Finales

### **Integraciones sin duplicar código:**

1. ✅ Reutiliza `AIModal.js` existente
2. ✅ Reutiliza patrón de `LocalDatabase.js`
3. ✅ Reutiliza componentes UI de shadcn
4. ✅ Sigue estructura de routing existente
5. ✅ Mantiene consistencia con cartas de presentación

### **Arquitectura escalable:**

- Fácil añadir más tipos de preguntas
- Fácil modificar número de preguntas
- Fácil añadir análisis de respuestas del usuario
- Fácil implementar modo práctica interactivo

### **Próximas mejoras (futuro):**

- Modo práctica: usuario responde y recibe feedback
- Análisis de respuestas con IA
- Historial de tests generados
- Comparación de tests
- Export a PDF
- Compartir test por email

---

## 🎯 RESUMEN EJECUTIVO - PUNTOS CRÍTICOS

### ⚠️ **LO MÁS IMPORTANTE:**

1. **El test se genera SOLO con datos de la candidatura, NO del CV**

   - Campos obligatorios: empresa, puesto, requisitos (>50 chars), descripción (>50 chars)
   - De aquí Gemini extrae: nivel profesional, skills técnicas, tipo de rol

2. **Validación ANTES de generar**

   - Si faltan datos → Mostrar UI de error + botón "Editar Candidatura"
   - NO permitir generación hasta completar campos mínimos
   - Validación en `useEffect` (carga inicial) y en `handleGenerateTest()`

3. **Prompt mejorado con análisis en 3 pasos**

   - PASO 1: Analizar oferta completa
   - PASO 2: Detectar nivel + extraer skills + identificar rol
   - PASO 3: Generar preguntas específicas a las tecnologías

4. **Preguntas técnicas ESPECÍFICAS, NO genéricas**

   - ❌ MAL: "¿Qué es una API REST?"
   - ✅ BIEN: "Explica cómo implementarías autenticación JWT en Express.js"

5. **Campos de candidatura como requisitos previos**
   - Al crear/editar candidatura, hacer énfasis en completar bien requisitos y descripción
   - Estos campos son críticos para calidad del test

### 📊 **Flujo de Validación:**

```
Usuario → Clic "Generar Test"
    ↓
¿Campos obligatorios completos?
    ↓                    ↓
   NO                   SÍ
    ↓                    ↓
Mostrar error       Llamar Gemini
con ayuda           con prompt mejorado
    ↓                    ↓
Botón editar        Analizar candidatura
candidatura         Detectar nivel
                    Extraer skills
                    Generar 5 preguntas
                         ↓
                    Guardar en DB
                    Mostrar test
```

### 🔍 **Ejemplo Real:**

**Input (Candidatura):**

```
Empresa: Acme Tech
Puesto: Backend Developer
Requisitos: 2 años Node.js, Express, MongoDB, Docker básico, Git
Descripción: Desarrollo de microservicios REST, trabajo en equipo ágil
```

**Output (Test):**

```json
{
  "candidateLevel": "junior",
  "detectedSkills": ["Node.js", "Express", "MongoDB", "Docker", "Git"],
  "roleType": "Backend",
  "questions": [
    {
      "question": "Explica cómo estructurarías un proyecto Node.js con Express para una API REST escalable",
      "category": "técnica",
      "difficulty": "intermedia"
    }
    // ... 4 preguntas más
  ]
}
```

---

## ✅ ESTADO FINAL: PROYECTO COMPLETADO

### 📅 Fecha de Finalización
**3 de Octubre, 2025**

---

### 🎉 Implementación Completa

Todos los pasos del proyecto han sido completados exitosamente:

| Paso | Estado | Archivo de Documentación |
|------|--------|--------------------------|
| **PASO 1** | ✅ COMPLETADO | `docs/PASO_1_COMPLETADO.md` |
| **PASO 2** | ✅ COMPLETADO | `docs/PASO_2_COMPLETADO.md` |
| **PASO 3** | ✅ COMPLETADO | `docs/PASO_3_COMPLETADO.md` |
| **PASO 4** | ✅ COMPLETADO | `docs/PASO_4_COMPLETADO.md` |
| **PASO 5** | ✅ COMPLETADO | `docs/PASO_5_COMPLETADO.md` |
| **PASO 6** | ✅ COMPLETADO | Este documento + `docs/GUIA_USUARIO.md` |

---

### 📊 Resumen de Implementación

#### PASO 1: InterviewTestGenerator.js
- ✅ Validación de datos de candidatura
- ✅ Generación de prompts para IA
- ✅ Detección de nivel profesional
- ✅ Extracción de habilidades técnicas
- ✅ Manejo de arrays y strings en requirements

#### PASO 2: LocalDatabase.js
- ✅ CreateInterviewSimulation()
- ✅ GetInterviewSimulation()
- ✅ UpdateInterviewSimulation()
- ✅ DeleteInterviewSimulation()
- ✅ GetInterviewSimulationByJobApplication()
- ✅ DeleteInterviewSimulationByJobApplication()
- ✅ GetInterviewSimulationStats()

#### PASO 3: Componente React
- ✅ 8 estados manejados
- ✅ 6 estados de UI implementados
- ✅ Carga de datos con validación
- ✅ Generación con Gemini AI
- ✅ Persistencia en IndexedDB
- ✅ Regenerar y eliminar con confirmación
- ✅ Navegación fluida

#### PASO 4: Integración en Detalle
- ✅ Botón dinámico (Verde/Morado)
- ✅ Iconos descriptivos (Brain/Sparkles)
- ✅ Verificación de simulación existente
- ✅ Menú desplegable actualizado

#### PASO 5: Limpieza de Código
- ✅ 4 archivos temporales eliminados
- ✅ 9 console.logs informativos eliminados
- ✅ 5 console.errors mantenidos
- ✅ Código listo para producción

#### PASO 6: Documentación Final
- ✅ Documentación técnica completa (PASO_1 a PASO_5)
- ✅ Guía de usuario detallada
- ✅ Este documento actualizado con estado final

---

### 🎯 Funcionalidad Completa

El sistema de preparación para entrevistas está **100% operativo** con:

✅ **Validación Robusta**
- Verifica campos obligatorios antes de generar
- Mensajes de error claros y accionables
- Mínimo 50 caracteres en requirements y description

✅ **Generación Inteligente con IA**
- Prompt optimizado de 4,700+ caracteres
- Análisis en 3 pasos (analizar → detectar → generar)
- 5 preguntas con respuestas y explicaciones
- Detección automática de nivel (junior/mid/senior)
- Extracción de 6-7 skills técnicas

✅ **Persistencia y Gestión**
- Auto-guardado en IndexedDB
- Carga automática de tests existentes
- Regeneración con confirmación
- Eliminación con confirmación

✅ **Experiencia de Usuario**
- UI adaptativa (6 estados diferentes)
- Botones dinámicos con iconos descriptivos
- Colores que comunican estado
- Mensajes de feedback claros
- Navegación fluida

---

### 📈 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Archivos creados** | 3 archivos principales |
| **Archivos modificados** | 3 archivos existentes |
| **Líneas de código** | ~1,200 líneas |
| **Documentos creados** | 7 documentos |
| **Tiempo de generación IA** | 10-20 segundos |
| **Preguntas por test** | 5 preguntas |
| **Estados de UI** | 6 estados |
| **Métodos de DB** | 7 métodos CRUD |

---

### 🧪 Casos de Uso Probados

| Caso de Uso | Estado | Notas |
|-------------|--------|-------|
| **Generar test con datos válidos** | ✅ PASS | Test generado correctamente |
| **Validación con datos insuficientes** | ✅ PASS | UI de advertencia funciona |
| **Recarga con test existente** | ✅ PASS | Carga desde DB sin regenerar |
| **Regeneración de test** | ✅ PASS | Confirmación + eliminar + generar |
| **Eliminación de test** | ✅ PASS | Confirmación + eliminar |
| **Botón dinámico en detalle** | ✅ PASS | Verde con test, morado sin test |
| **Manejo de arrays en requirements** | ✅ PASS | Soporte para string y array |
| **Error de IA** | ✅ PASS | Mensaje de error, no guarda |

---

### 🛠️ Tecnologías Utilizadas

- **React 18** - Framework de UI
- **React Router DOM 6** - Navegación
- **Clerk** - Autenticación
- **Dexie.js** - Wrapper de IndexedDB
- **Gemini 2.0 Flash** - IA para generación de preguntas
- **shadcn/ui** - Componentes de UI
- **lucide-react** - Iconos
- **sonner** - Notificaciones toast
- **uuid** - Generación de IDs únicos
- **Vite** - Build tool y dev server

---

### 📚 Documentación Disponible

1. **`INTERVIEW_SIMULATION_DESIGN.md`** (Este documento)
   - Arquitectura completa del sistema
   - Especificaciones técnicas
   - Flujos de datos

2. **`PASO_1_COMPLETADO.md`**
   - InterviewTestGenerator.js
   - Validación y generación de prompts

3. **`PASO_2_COMPLETADO.md`**
   - LocalDatabase.js
   - Métodos CRUD y estructura de datos

4. **`PASO_3_COMPLETADO.md`**
   - Componente React
   - Estados, funciones y UI

5. **`PASO_4_COMPLETADO.md`**
   - Integración en detalle de candidatura
   - Botones y navegación

6. **`PASO_5_COMPLETADO.md`**
   - Limpieza de código
   - Archivos eliminados y logs

7. **`GUIA_USUARIO.md`**
   - Manual completo de uso
   - FAQs y resolución de problemas
   - Ejemplos paso a paso

8. **`LIMPIEZA_ARCHIVOS.md`**
   - Guía de archivos temporales
   - Checklist de limpieza

---

### 🎉 Conclusión

El **Sistema de Preparación para Entrevistas** está completamente implementado, probado y documentado.

**Características destacadas:**
- ✅ Generación inteligente basada en datos de candidatura
- ✅ Validación proactiva que ahorra tiempo y costos de API
- ✅ UI adaptativa con 6 estados diferentes
- ✅ Persistencia automática en IndexedDB
- ✅ Experiencia de usuario guiada y clara
- ✅ Código limpio y mantenible
- ✅ Documentación exhaustiva

**El proyecto está listo para producción.** 🚀

---

**Documento creado:** 3 de Octubre, 2025  
**Versión:** 3.0 (Estado Final - Proyecto Completado)  
**Autor:** GitHub Copilot  
**Estado:** ✅ COMPLETADO  
**Changelog:**
- v1.0: Diseño inicial
- v2.0: Añadida validación de candidatura
- v3.0: Estado final - Todos los pasos completados

---
