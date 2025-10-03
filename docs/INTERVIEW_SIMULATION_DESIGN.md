# 📋 Diseño y Arquitectura: Sistema de Simulación de Entrevistas

## 📌 Objetivo

Implementar un sistema de generación de tests de preparación para entrevistas de trabajo, con 5 preguntas en castellano, respuestas sugeridas y explicaciones generadas por IA (Gemini). Los tests se guardan automáticamente en IndexedDB con opciones para regenerar o eliminar.

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

**Prompt Template:**

```
Eres un experto reclutador especializado en preparación de entrevistas.

CONTEXTO DEL CANDIDATO:
- Nombre: {firstName} {lastName}
- Nivel detectado: {level}
- Experiencia: {experience}
- Educación: {education}
- Habilidades: {skills}

CONTEXTO DEL PUESTO:
- Empresa: {companyName}
- Puesto: {jobTitle}
- Requisitos: {requirements}
- Responsabilidades: {responsibilities}

TAREA:
Genera exactamente 5 preguntas de test de preparación para entrevista en CASTELLANO.
Cada pregunta debe tener:
1. Una pregunta relevante basada en el puesto y el perfil del candidato
2. La respuesta más adecuada y profesional
3. Una breve explicación (2-3 líneas) de por qué esa es la mejor respuesta

DISTRIBUCIÓN:
- 2 preguntas técnicas relacionadas con las habilidades requeridas
- 2 preguntas comportamentales (STAR method)
- 1 pregunta sobre conocimiento de la empresa/sector

FORMATO JSON ESTRICTO:
{
  "candidateLevel": "junior|mid|senior",
  "questions": [
    {
      "id": "uuid",
      "question": "Pregunta en castellano",
      "correctAnswer": "Respuesta sugerida profesional",
      "explanation": "Explicación de por qué esta respuesta es efectiva",
      "category": "técnica|comportamental|empresa",
      "difficulty": "básica|intermedia|avanzada"
    }
  ]
}

IMPORTANTE:
- Todo en castellano
- Respuestas profesionales y realistas
- Explicaciones educativas
- Preguntas específicas al puesto, NO genéricas
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

### **PASO 3: Implementar lógica de generación con IA**

**Archivo:** `src/dashboard/resume/[resumeId]/job-applications/[applicationId]/interview-simulation/index.jsx`

✅ **Tareas:**

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

### **PASO 4: Implementar carga de datos inicial**

**Archivo:** Mismo componente

✅ **Tareas:**

- Crear `useEffect` para carga inicial
- Cargar datos de candidatura
- Cargar datos de CV
- Buscar simulación existente
- Manejar estados de carga

**Código:**

```javascript
useEffect(() => {
  const loadData = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setLoading(true);

      // Cargar candidatura
      const appResponse = await LocalDatabase.GetJobApplicationById(
        applicationId,
        user.primaryEmailAddress.emailAddress
      );
      setApplication(appResponse.data);

      // Cargar CV
      const resumeResponse = await LocalDatabase.GetResumeById(resumeId);
      setResumeData(resumeResponse.data);

      // Buscar simulación existente
      const simResponse =
        await LocalDatabase.GetInterviewSimulationByJobApplication(
          applicationId,
          user.primaryEmailAddress.emailAddress
        );
      setSimulation(simResponse.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [applicationId, resumeId, user]);
```

---

### **PASO 5: Implementar acciones (Regenerar y Eliminar)**

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

### **PASO 6: Diseñar e implementar UI completa**

**Archivo:** Mismo componente

✅ **Tareas:**

- Implementar todos los estados de UI
- Añadir iconos (lucide-react)
- Implementar diseño responsivo
- Añadir animaciones de carga
- Probar todos los flujos

---

### **PASO 7: Testing y refinamiento**

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

### **UX:**

1. ✅ Spinner informativo durante generación
2. ✅ Feedback visual inmediato en cada acción
3. ✅ Confirmaciones para acciones destructivas
4. ✅ Toast notifications para feedback
5. ✅ Diseño responsive mobile-friendly

### **AI:**

1. ✅ Timeout de 30 segundos para llamadas a Gemini
2. ✅ Retry logic si falla la primera vez
3. ✅ Validación estricta de respuesta JSON
4. ✅ Prompt engineering optimizado

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

---

## 📋 Checklist de Implementación

### **Backend (LocalDatabase + Prompts)**

- [ ] Crear `InterviewTestGenerator.js`
- [ ] Implementar detección de nivel profesional
- [ ] Implementar generación de prompt
- [ ] Extender `LocalDatabase.js` con métodos CRUD
- [ ] Probar guardado y recuperación en IndexedDB

### **Frontend (Componente)**

- [ ] Implementar estados del componente
- [ ] Implementar carga inicial de datos
- [ ] Implementar función `handleGenerateTest()`
- [ ] Implementar función `handleRegenerate()`
- [ ] Implementar función `handleDelete()`
- [ ] Implementar UI de carga (spinner)
- [ ] Implementar UI de test vacío
- [ ] Implementar UI de test generado
- [ ] Implementar UI de errores
- [ ] Añadir validaciones

### **Testing**

- [ ] Probar con diferentes perfiles de candidatos
- [ ] Probar con diferentes tipos de puestos
- [ ] Verificar que las preguntas son relevantes
- [ ] Verificar que todo está en castellano
- [ ] Probar regeneración múltiple
- [ ] Probar eliminación
- [ ] Probar persistencia (recargar página)
- [ ] Probar en mobile

### **Refinamiento**

- [ ] Ajustar prompts según calidad de respuestas
- [ ] Optimizar tiempos de carga
- [ ] Mejorar mensajes de error
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

✅ Generación de 5 preguntas personalizadas en castellano  
✅ Respuestas sugeridas profesionales  
✅ Explicaciones educativas del por qué  
✅ Guardado automático en IndexedDB  
✅ Carga automática de test guardado  
✅ Opción de regenerar  
✅ Opción de eliminar  
✅ Spinner informativo durante generación  
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

**Documento creado:** 3 de Octubre, 2025  
**Versión:** 1.0  
**Autor:** GitHub Copilot  
**Estado:** Listo para implementación

---
