# 🏗️ Arquitectura Técnica - Generación Express

## 📐 Visión General de la Arquitectura

### Principios de Diseño

1. **Modularidad:** Componentes reutilizables e independientes
2. **Separation of Concerns:** Lógica separada de presentación
3. **Progressive Enhancement:** Funciona sin JS, mejor con él
4. **Offline-First:** IndexedDB para persistencia local
5. **AI-Powered:** Gemini 2.0 Flash como motor de generación
6. **Type Safety:** Validación con Zod

---

## 🗂️ Estructura de Archivos

### Nueva Estructura Propuesta

```
src/
├── dashboard/
│   ├── index.jsx                          # Dashboard principal
│   ├── components/
│   │   ├── AddResume.jsx                  # Botón crear CV
│   │   ├── ExpressGenerationCard.jsx      # ⭐ NUEVO - Card destacada
│   │   └── ResumeCardItem.jsx             # Item de CV existente
│   │
│   └── express-generation/                # ⭐ NUEVA CARPETA
│       ├── index.jsx                      # Container principal
│       │
│       ├── components/
│       │   ├── StepIndicator.jsx          # Indicador de pasos
│       │   ├── Step1Profile.jsx           # Paso 1: Perfil
│       │   ├── Step2JobOffer.jsx          # Paso 2: Oferta
│       │   ├── Step3Generation.jsx        # Paso 3: Generación
│       │   ├── Step4Results.jsx           # Paso 4: Resultados
│       │   ├── ProfileDescriptionInput.jsx # Input rico de perfil
│       │   ├── JobOfferParser.jsx         # Parser de ofertas
│       │   ├── GenerationProgress.jsx     # Progress indicator
│       │   └── ResultsPreview.jsx         # Preview de resultados
│       │
│       ├── hooks/
│       │   ├── useExpressGeneration.js    # Hook principal del flujo
│       │   ├── useProfileParser.js        # Hook para parsear perfil
│       │   └── useJobOfferExtractor.js    # Hook para extraer oferta
│       │
│       └── types/
│           └── expressGeneration.types.js # Tipos TypeScript/PropTypes
│
├── services/
│   ├── AIContentEnhancer.js               # Servicio IA existente
│   ├── LocalDatabase.js                   # DB local existente
│   │
│   ├── ExpressGenerationService.js        # ⭐ NUEVO - Servicio principal
│   │
│   └── prompts/
│       ├── coverLetterGenerator.js        # Existente
│       ├── enhancementPrompts.js          # Existente
│       ├── skillsPrompts.js               # Existente
│       ├── expressProfileParser.js        # ⭐ NUEVO - Parsear perfil
│       ├── expressJobExtractor.js         # ⭐ NUEVO - Extraer oferta
│       ├── expressResumeGenerator.js      # ⭐ NUEVO - Generar CV
│       └── expressCoverLetterGenerator.js # ⭐ NUEVO - Carta express
│
├── main.jsx                               # Router principal (actualizar)
│
└── components/
    └── ui/
        ├── stepper.jsx                    # ⭐ NUEVO - Componente stepper
        ├── skeleton.jsx                   # ⭐ NUEVO - Loading skeleton
        └── ...otros componentes shadcn
```

---

## 🔄 Flujo de Datos

### Diagrama de Flujo

```
┌──────────────────────────────────────────────────────────────────┐
│                         USUARIO                                   │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (index.jsx)                          │
│  ┌──────────────────────────────────────────────────┐           │
│  │  ExpressGenerationCard                            │           │
│  │  onClick → navigate('/dashboard/express')        │           │
│  └──────────────────────────────────────────────────┘           │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│         EXPRESS GENERATION CONTAINER (index.jsx)                  │
│  ┌────────────────────────────────────────────────┐             │
│  │  Estado:                                        │             │
│  │  - currentStep (1-4)                           │             │
│  │  - profileData                                 │             │
│  │  - jobOfferData                                │             │
│  │  - generatedResults                            │             │
│  │  - isGenerating                                │             │
│  └────────────────────────────────────────────────┘             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      PASO 1: PERFIL                               │
│  ┌────────────────────────────────────────────────┐             │
│  │  ProfileDescriptionInput                       │             │
│  │  - Textarea enriquecido                        │             │
│  │  - Sugerencias en tiempo real                 │             │
│  │  - Validación                                  │             │
│  └────────────────┬───────────────────────────────┘             │
│                   │ onNext()                                      │
└───────────────────┼───────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│              useProfileParser Hook                                │
│  ┌────────────────────────────────────────────────┐             │
│  │  Analiza descripción y extrae:                │             │
│  │  - Nivel educativo                             │             │
│  │  - Sector/Industria                           │             │
│  │  - Años de experiencia                        │             │
│  │  - Skills principales                         │             │
│  │  - Nivel profesional (junior/mid/senior)     │             │
│  └────────────────┬───────────────────────────────┘             │
│                   │ Parsea con Gemini                            │
└───────────────────┼───────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│              ExpressGenerationService                             │
│              .parseUserProfile(description)                       │
│  ┌────────────────────────────────────────────────┐             │
│  │  Prompt: expressProfileParser                  │             │
│  │  Input: Texto libre del usuario                │             │
│  │  Output: JSON estructurado                     │             │
│  │  {                                             │             │
│  │    education: "Ingeniería Informática"        │             │
│  │    sector: "Desarrollo Web"                   │             │
│  │    yearsOfExperience: 3                       │             │
│  │    skills: ["React", "Node.js", ...]          │             │
│  │    level: "mid"                               │             │
│  │  }                                             │             │
│  └────────────────┬───────────────────────────────┘             │
└───────────────────┼───────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PASO 2: OFERTA                                 │
│  ┌────────────────────────────────────────────────┐             │
│  │  JobOfferParser                                │             │
│  │  - Textarea grande                             │             │
│  │  - Pegar información completa                  │             │
│  │  - Auto-detección de formato                  │             │
│  └────────────────┬───────────────────────────────┘             │
│                   │ onNext()                                      │
└───────────────────┼───────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│              useJobOfferExtractor Hook                            │
│  ┌────────────────────────────────────────────────┐             │
│  │  Extrae información estructurada:              │             │
│  │  - Nombre de la empresa                        │             │
│  │  - Título del puesto                           │             │
│  │  - Ubicación                                   │             │
│  │  - Modalidad (remoto/híbrido/presencial)     │             │
│  │  - Requisitos técnicos                        │             │
│  │  - Responsabilidades                          │             │
│  │  - Beneficios                                  │             │
│  │  - Rango salarial                             │             │
│  └────────────────┬───────────────────────────────┘             │
└───────────────────┼───────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│              ExpressGenerationService                             │
│              .extractJobOffer(rawText)                            │
│  ┌────────────────────────────────────────────────┐             │
│  │  Prompt: expressJobExtractor                   │             │
│  │  Input: Texto pegado por usuario               │             │
│  │  Output: JSON estructurado                     │             │
│  │  {                                             │             │
│  │    companyName: "Tech Corp"                   │             │
│  │    jobTitle: "Senior React Developer"         │             │
│  │    location: "Madrid"                         │             │
│  │    workMode: "híbrido"                        │             │
│  │    requirements: [...],                       │             │
│  │    responsibilities: [...],                   │             │
│  │    benefits: [...],                           │             │
│  │    salaryRange: "45k-55k"                     │             │
│  │  }                                             │             │
│  └────────────────┬───────────────────────────────┘             │
└───────────────────┼───────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                  PASO 3: GENERACIÓN                               │
│  ┌────────────────────────────────────────────────┐             │
│  │  GenerationProgress                            │             │
│  │  ┌──────────────────────────────────────┐     │             │
│  │  │ ⚡ Analizando perfil...        ✓    │     │             │
│  │  │ 📊 Categorizando candidatura... ✓    │     │             │
│  │  │ 📝 Generando CV...             ⏳   │     │             │
│  │  │ ✉️  Creando carta...            ⏳   │     │             │
│  │  └──────────────────────────────────────┘     │             │
│  └────────────────────────────────────────────────┘             │
└───────────────────┼───────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│              ExpressGenerationService                             │
│              .generateComplete(profileData, jobOfferData)         │
│  ┌────────────────────────────────────────────────┐             │
│  │  Genera en paralelo:                           │             │
│  │                                                │             │
│  │  1. generateResume()                          │             │
│  │     - Usa profileData + jobOfferData          │             │
│  │     - Genera secciones: experience, education, │             │
│  │       summary, skills                          │             │
│  │     - Adapta al nivel detectado               │             │
│  │                                                │             │
│  │  2. generateCoverLetter()                     │             │
│  │     - Estilo: según nivel profesional         │             │
│  │     - Longitud: short (250-300 palabras)      │             │
│  │     - Personalizada a empresa y puesto        │             │
│  │                                                │             │
│  │  3. createJobApplication()                    │             │
│  │     - Todos los campos categorizados          │             │
│  │     - Metadata completa                        │             │
│  │     - Estado: 'draft'                         │             │
│  └────────────────┬───────────────────────────────┘             │
└───────────────────┼───────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│              LocalDatabase                                        │
│  ┌────────────────────────────────────────────────┐             │
│  │  1. CreateNewResume(resumeData)                │             │
│  │     → Guarda en IndexedDB                      │             │
│  │                                                │             │
│  │  2. CreateJobApplication(applicationData)      │             │
│  │     → Vincula con resumeId                     │             │
│  │                                                │             │
│  │  3. CreateCoverLetter(coverLetterData)         │             │
│  │     → Vincula con applicationId                │             │
│  └────────────────┬───────────────────────────────┘             │
└───────────────────┼───────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                  PASO 4: RESULTADOS                               │
│  ┌────────────────────────────────────────────────┐             │
│  │  ResultsPreview                                │             │
│  │  ┌──────────────────┐  ┌──────────────────┐  │             │
│  │  │   Vista CV       │  │   Vista Carta    │  │             │
│  │  │   Previsualizar  │  │   Previsualizar  │  │             │
│  │  └──────────────────┘  └──────────────────┘  │             │
│  │                                                │             │
│  │  Acciones:                                     │             │
│  │  [Editar CV] [Ver Candidatura]                │             │
│  │  [Volver al Dashboard]                         │             │
│  └────────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Integración con Código Existente

### 1. Dashboard Principal

**Archivo:** `src/dashboard/index.jsx`

**Cambios Mínimos:**

```jsx
// Importar nuevo componente
import ExpressGenerationCard from './components/ExpressGenerationCard';

// Añadir en el grid, antes de AddResume
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10">
  <ExpressGenerationCard /> {/* NUEVO */}
  <AddResume />
  {/* ... resto de CVs ... */}
</div>;
```

### 2. Router

**Archivo:** `src/main.jsx`

**Cambios:**

```jsx
import ExpressGeneration from './dashboard/express-generation';

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/dashboard/express', // NUEVA RUTA
        element: <ExpressGeneration />,
      },
      // ... rutas existentes ...
    ],
  },
]);
```

### 3. Servicios Existentes Reutilizados

**AIModal.js** ✅ Se usa tal cual

```javascript
import { AIChatSession } from '../../service/AIModal';
// Ya existe, perfecto para nuestros prompts
```

**LocalDatabase.js** ✅ Se usa tal cual

```javascript
import LocalDatabase from '@/services/LocalDatabase';
// Métodos existentes:
// - CreateNewResume()
// - CreateJobApplication()
// - CreateCoverLetter() (si existe)
```

**AIContentEnhancer.js** ✅ Parcialmente reutilizado

```javascript
import AIContentEnhancer from '@/services/AIContentEnhancer';
// Reutilizamos métodos como:
// - normalizeSkillRating()
// - pointsToHTML()
```

### 4. Componentes UI Reutilizados

**De shadcn/ui:**

- `<Button>` ✅
- `<Input>` ✅
- `<Textarea>` ✅
- `<Card>` ✅
- `<Progress>` ✅
- `<Badge>` ✅
- `<Alert>` ✅

**Nuevos necesarios:**

- `<Stepper>` ⚠️ Crear
- `<Skeleton>` ⚠️ Crear

---

## 🧩 Componentes Principales

### 1. ExpressGenerationCard

**Ubicación:** `src/dashboard/components/ExpressGenerationCard.jsx`

**Responsabilidad:** Card destacada en Dashboard para acceder a Generación Express

**Props:** Ninguna

**Estado:** Ninguno

**Dependencias:**

- `react-router-dom` (useNavigate)
- `lucide-react` (Iconos)
- `@/components/ui/card`

**Código Simplificado:**

```jsx
function ExpressGenerationCard() {
  const navigate = useNavigate();

  return (
    <Card className="col-span-2 bg-gradient-to-br from-primary/20 to-primary/5">
      <CardContent className="p-6">
        <Zap className="w-12 h-12 mb-4" />
        <h3 className="text-2xl font-bold mb-2">Generación Express</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Crea tu CV completo en 5 minutos
        </p>
        <Button onClick={() => navigate('/dashboard/express')}>
          Comenzar <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

### 2. ExpressGeneration Container

**Ubicación:** `src/dashboard/express-generation/index.jsx`

**Responsabilidad:** Orquestar el flujo completo de 4 pasos

**Estado:**

```javascript
{
  currentStep: 1,
  profileData: null,
  jobOfferData: null,
  generatedResults: null,
  isGenerating: false,
  error: null
}
```

**Métodos:**

- `handleProfileSubmit(data)`
- `handleJobOfferSubmit(data)`
- `handleGeneration()`
- `handleNext()`
- `handleBack()`
- `handleFinish()`

**Hooks Personalizados:**

- `useExpressGeneration()` - Lógica principal

---

### 3. StepIndicator

**Ubicación:** `src/dashboard/express-generation/components/StepIndicator.jsx`

**Responsabilidad:** Mostrar progreso visual del proceso

**Props:**

```typescript
{
  currentStep: number,
  totalSteps: number,
  steps: Array<{
    label: string,
    icon: ReactNode
  }>
}
```

**Visual:**

```
1. Perfil  →  2. Oferta  →  3. Generación  →  4. Resultados
   (✓)         (•)           ( )              ( )
```

---

### 4. Step1Profile

**Ubicación:** `src/dashboard/express-generation/components/Step1Profile.jsx`

**Responsabilidad:** Capturar descripción del perfil profesional

**Props:**

```typescript
{
  onNext: (data: ProfileData) => void,
  initialData?: ProfileData
}
```

**Componentes Internos:**

- `ProfileDescriptionInput` - Textarea enriquecido con sugerencias

**Validación:**

- Mínimo 50 caracteres
- Máximo 1000 caracteres
- Debe incluir información de estudios o experiencia

---

### 5. Step2JobOffer

**Ubicación:** `src/dashboard/express-generation/components/Step2JobOffer.jsx`

**Responsabilidad:** Capturar información de la oferta de trabajo

**Props:**

```typescript
{
  onNext: (data: JobOfferData) => void,
  onBack: () => void,
  profileData: ProfileData,
  initialData?: JobOfferData
}
```

**Componentes Internos:**

- `JobOfferParser` - Textarea grande con placeholder inteligente

**Validación:**

- Mínimo 100 caracteres
- Debe mencionar empresa o puesto

---

### 6. Step3Generation

**Ubicación:** `src/dashboard/express-generation/components/Step3Generation.jsx`

**Responsabilidad:** Mostrar progreso de generación con IA

**Props:**

```typescript
{
  profileData: ProfileData,
  jobOfferData: JobOfferData,
  onComplete: (results: GeneratedResults) => void,
  onError: (error: Error) => void
}
```

**Componentes Internos:**

- `GenerationProgress` - Progress bar animado con steps

**Estados de Progreso:**

1. Analizando perfil (10%)
2. Extrayendo información de oferta (25%)
3. Categorizando candidatura (40%)
4. Generando CV (60%)
5. Creando carta de presentación (80%)
6. Guardando en base de datos (95%)
7. ¡Completado! (100%)

---

### 7. Step4Results

**Ubicación:** `src/dashboard/express-generation/components/Step4Results.jsx`

**Responsabilidad:** Mostrar resultados y opciones de acción

**Props:**

```typescript
{
  generatedResults: {
    resumeId: string,
    applicationId: string,
    coverLetterId: string
  },
  profileData: ProfileData,
  jobOfferData: JobOfferData
}
```

**Componentes Internos:**

- `ResultsPreview` - Vista previa de CV y carta

**Acciones:**

```
[Editar CV] [Ver Candidatura] [Descargar PDF] [Nueva Generación]
```

---

## 🧠 Servicios y Lógica de Negocio

### ExpressGenerationService

**Ubicación:** `src/services/ExpressGenerationService.js`

**Clase Principal:**

```javascript
class ExpressGenerationService {
  /**
   * Parsea descripción de perfil en formato libre
   * @param {string} description - Descripción del usuario
   * @returns {Promise<ProfileData>}
   */
  async parseUserProfile(description) {
    // Usa Gemini con expressProfileParser prompt
    // Extrae: education, sector, yearsOfExperience, skills, level
  }

  /**
   * Extrae información estructurada de oferta de trabajo
   * @param {string} rawText - Texto pegado por usuario
   * @returns {Promise<JobOfferData>}
   */
  async extractJobOffer(rawText) {
    // Usa Gemini con expressJobExtractor prompt
    // Extrae: companyName, jobTitle, requirements, etc.
  }

  /**
   * Genera CV completo basado en perfil y oferta
   * @param {ProfileData} profile
   * @param {JobOfferData} jobOffer
   * @returns {Promise<ResumeData>}
   */
  async generateResume(profile, jobOffer) {
    // Usa Gemini con expressResumeGenerator prompt
    // Genera secciones completas del CV
  }

  /**
   * Genera carta de presentación personalizada
   * @param {ProfileData} profile
   * @param {JobOfferData} jobOffer
   * @returns {Promise<string>}
   */
  async generateCoverLetter(profile, jobOffer) {
    // Usa Gemini con expressCoverLetterGenerator prompt
    // Estilo según nivel, longitud short
  }

  /**
   * Proceso completo de generación
   * @param {ProfileData} profile
   * @param {JobOfferData} jobOffer
   * @param {string} userEmail
   * @returns {Promise<GeneratedResults>}
   */
  async generateComplete(profile, jobOffer, userEmail) {
    // 1. Generar CV
    const resumeData = await this.generateResume(profile, jobOffer);

    // 2. Crear CV en DB
    const resume = await LocalDatabase.CreateNewResume({
      ...resumeData,
      userEmail,
    });

    // 3. Crear candidatura
    const application = await LocalDatabase.CreateJobApplication({
      resumeId: resume.data.documentId,
      ...jobOffer,
      userEmail,
    });

    // 4. Generar y guardar carta
    const coverLetterContent = await this.generateCoverLetter(
      profile,
      jobOffer
    );

    const coverLetter = await LocalDatabase.CreateCoverLetter({
      applicationId: application.data.documentId,
      resumeId: resume.data.documentId,
      content: coverLetterContent,
      userEmail,
    });

    return {
      resumeId: resume.data.documentId,
      applicationId: application.data.documentId,
      coverLetterId: coverLetter.data.documentId,
    };
  }
}

export default new ExpressGenerationService();
```

---

## 📝 Prompts de IA

### 1. expressProfileParser.js

**Propósito:** Extraer información estructurada de descripción libre

**Input Example:**

```
"Soy graduado en Ingeniería Informática con 3 años de experiencia en desarrollo web. He trabajado principalmente con React, Node.js y MongoDB. También tengo conocimientos de Docker y CI/CD."
```

**Output Example:**

```json
{
  "education": "Ingeniería Informática",
  "educationLevel": "Grado",
  "sector": "Desarrollo Web",
  "yearsOfExperience": 3,
  "skills": [
    { "name": "React", "level": "avanzado" },
    { "name": "Node.js", "level": "avanzado" },
    { "name": "MongoDB", "level": "intermedio" },
    { "name": "Docker", "level": "básico" },
    { "name": "CI/CD", "level": "básico" }
  ],
  "professionalLevel": "mid",
  "industries": ["Tecnología", "Desarrollo de Software"]
}
```

**Prompt:**

```javascript
export const expressProfileParserPrompt = (description) => `
Eres un experto analizador de perfiles profesionales.

DESCRIPCIÓN DEL USUARIO:
"${description}"

Extrae y estructura la siguiente información en formato JSON:

1. EDUCACIÓN:
   - Nivel máximo alcanzado (Secundaria, FP, Grado, Máster, Doctorado)
   - Campo de estudio principal

2. EXPERIENCIA:
   - Años de experiencia (estimar si no es exacto)
   - Sector/Industria principal
   - Nivel profesional: "junior" (0-2 años), "mid" (3-5 años), "senior" (6+ años)

3. HABILIDADES:
   - Lista de skills técnicas mencionadas
   - Nivel estimado para cada una: "básico", "intermedio", "avanzado", "experto"

4. CONTEXTO ADICIONAL:
   - Industrias relevantes
   - Especialización

Responde SOLO con JSON válido siguiendo esta estructura:
{
  "education": "string",
  "educationLevel": "string",
  "sector": "string",
  "yearsOfExperience": number,
  "skills": [{ "name": "string", "level": "string" }],
  "professionalLevel": "junior" | "mid" | "senior",
  "industries": ["string"]
}
`;
```

---

### 2. expressJobExtractor.js

**Propósito:** Extraer información de oferta pegada en formato libre

**Input Example:**

```
Senior React Developer - Tech Corp

Location: Madrid (Hybrid)
Salary: 45.000€ - 55.000€

About us:
Tech Corp is a leading...

Requirements:
- 5+ years with React
- Experience with TypeScript
- Knowledge of GraphQL
...

Responsibilities:
- Lead frontend development
- Mentor junior developers
...

Benefits:
- Flexible schedule
- Remote work
- Health insurance
```

**Output Example:**

```json
{
  "companyName": "Tech Corp",
  "jobTitle": "Senior React Developer",
  "location": "Madrid",
  "workMode": "híbrido",
  "salaryRange": "45.000€ - 55.000€",
  "requirements": [
    "5+ años de experiencia con React",
    "Experiencia con TypeScript",
    "Conocimientos de GraphQL"
  ],
  "responsibilities": [
    "Liderar desarrollo frontend",
    "Mentoría de desarrolladores junior"
  ],
  "benefits": ["Horario flexible", "Trabajo remoto", "Seguro médico"],
  "jobDescription": "Resumen extraído...",
  "requiredLevel": "senior"
}
```

**Prompt:**

```javascript
export const expressJobExtractorPrompt = (rawText) => `
Eres un experto extractor de información de ofertas de trabajo.

TEXTO DE LA OFERTA:
"""
${rawText}
"""

Extrae toda la información relevante y estructúrala en JSON:

1. INFORMACIÓN BÁSICA:
   - Nombre de la empresa (si se menciona)
   - Título del puesto
   - Ubicación
   - Modalidad: "presencial", "remoto", "híbrido"
   - Rango salarial (si se menciona)

2. REQUISITOS:
   - Lista de requisitos técnicos y experiencia necesaria
   - Años de experiencia requeridos

3. RESPONSABILIDADES:
   - Lista de responsabilidades del puesto

4. BENEFICIOS:
   - Lista de beneficios ofrecidos

5. NIVEL REQUERIDO:
   - Estima el nivel: "junior", "mid", "senior"

Responde SOLO con JSON válido siguiendo esta estructura:
{
  "companyName": "string",
  "jobTitle": "string",
  "location": "string",
  "workMode": "string",
  "salaryRange": "string | null",
  "requirements": ["string"],
  "responsibilities": ["string"],
  "benefits": ["string"],
  "jobDescription": "string",
  "requiredLevel": "junior" | "mid" | "senior"
}
`;
```

---

### 3. expressResumeGenerator.js

**Propósito:** Generar CV completo adaptado a la oferta

**Prompt:**

```javascript
export const expressResumeGeneratorPrompt = (profile, jobOffer) => `
Eres un experto en creación de currículums profesionales.

PERFIL DEL CANDIDATO:
${JSON.stringify(profile, null, 2)}

INFORMACIÓN DEL PUESTO:
${JSON.stringify(jobOffer, null, 2)}

Genera un CV completo y profesional que:

1. RESUMEN PROFESIONAL (summery):
   - 3-4 líneas destacando experiencia relevante
   - Nivel apropiado (${profile.professionalLevel})
   - Conecta con requisitos del puesto

2. EXPERIENCIA PROFESIONAL (experience):
   - Genera 2-4 experiencias realistas basadas en el perfil
   - Para cada experiencia:
     * title: Título del puesto coherente con su nivel
     * companyName: Nombre genérico de empresa
     * startDate: Fecha inicio (formato: "MM/YYYY")
     * endDate: "Presente" o fecha fin
     * workSummary: HTML con <ul><li> destacando logros relevantes para el puesto

3. EDUCACIÓN (education):
   - Genera 1-2 entradas educativas
   - Para cada una:
     * degree: Título académico
     * universityName: Universidad/Centro
     * startDate, endDate: Fechas
     * description: Breve descripción

4. HABILIDADES (skills):
   - Lista de skills del perfil + algunas adicionales relevantes al puesto
   - Para cada skill:
     * name: Nombre de la habilidad
     * rating: Número 1-5 según nivel

Responde SOLO con JSON válido siguiendo esta estructura exacta:
{
  "firstName": "Usuario",
  "lastName": "Ejemplo",
  "jobTitle": "string (basado en perfil y puesto)",
  "email": "",
  "phone": "",
  "address": "${jobOffer.location || ''}",
  "themeColor": "#3b82f6",
  "summery": "string (resumen profesional)",
  "experience": [
    {
      "title": "string",
      "companyName": "string",
      "city": "string",
      "state": "string",
      "startDate": "MM/YYYY",
      "endDate": "Presente | MM/YYYY",
      "workSummary": "<ul><li>Logro 1</li><li>Logro 2</li></ul>"
    }
  ],
  "education": [
    {
      "degree": "string",
      "universityName": "string",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "description": "string"
    }
  ],
  "skills": [
    { "name": "string", "rating": number }
  ]
}
`;
```

---

### 4. expressCoverLetterGenerator.js

**Propósito:** Generar carta de presentación corta y personalizada

**Prompt:**

```javascript
export const expressCoverLetterGeneratorPrompt = (profile, jobOffer) => `
Eres un experto en redacción de cartas de presentación.

PERFIL DEL CANDIDATO:
- Nivel: ${profile.professionalLevel}
- Educación: ${profile.education}
- Sector: ${profile.sector}
- Experiencia: ${profile.yearsOfExperience} años
- Skills: ${profile.skills.map((s) => s.name).join(', ')}

PUESTO AL QUE APLICA:
- Empresa: ${jobOffer.companyName}
- Puesto: ${jobOffer.jobTitle}
- Ubicación: ${jobOffer.location}

REQUISITOS DEL PUESTO:
${jobOffer.requirements.join('\n')}

Genera una carta de presentación que:

CONFIGURACIÓN:
- Longitud: CORTA (250-300 palabras máximo)
- Tono: ${
  profile.professionalLevel === 'junior'
    ? 'Entusiasta y motivado'
    : profile.professionalLevel === 'mid'
    ? 'Profesional y confiado'
    : 'Experimentado y estratégico'
}
- Estructura: 3 párrafos

CONTENIDO:
1. PÁRRAFO 1 (Introducción):
   - Por qué te interesa este puesto específico
   - Qué te atrae de la empresa

2. PÁRRAFO 2 (Valor que aportas):
   - Cómo tu experiencia encaja con los requisitos
   - 2-3 logros o skills más relevantes
   - Conecta directamente con las responsabilidades

3. PÁRRAFO 3 (Cierre):
   - Entusiasmo por contribuir
   - Disponibilidad para entrevista
   - Llamada a la acción apropiada

IMPORTANTE:
- NO incluir dirección, teléfono, email en la carta
- NO usar "Estimado Sr./Sra." genérico
- SÍ mencionar el nombre de la empresa
- SÍ ser específico sobre el puesto
- SÍ mostrar conocimiento de la oferta

Responde SOLO con el texto de la carta, sin explicaciones adicionales.
`;
```

---

## 🔐 Validación y Manejo de Errores

### Validación de Datos

**Archivo:** `src/services/types.js` (Extender el existente)

```javascript
// Validación para perfil express
export const validateExpressProfile = (data) => {
  const required = ['description'];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Campos requeridos: ${missing.join(', ')}`);
  }

  if (data.description.length < 50) {
    throw new Error('La descripción debe tener al menos 50 caracteres');
  }

  if (data.description.length > 1000) {
    throw new Error('La descripción no puede exceder 1000 caracteres');
  }

  return true;
};

// Validación para oferta express
export const validateExpressJobOffer = (data) => {
  const required = ['rawText'];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Campos requeridos: ${missing.join(', ')}`);
  }

  if (data.rawText.length < 100) {
    throw new Error(
      'La información de la oferta debe tener al menos 100 caracteres'
    );
  }

  return true;
};
```

### Error Boundaries

**Ubicación:** `src/dashboard/express-generation/components/ErrorBoundary.jsx`

```jsx
class ExpressGenerationErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error en Generación Express:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error en la generación</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'Ha ocurrido un error inesperado'}
          </AlertDescription>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

---

## 📊 Métricas y Analytics

### Eventos a Trackear

```javascript
// Analytics events
const ANALYTICS_EVENTS = {
  EXPRESS_STARTED: 'express_generation_started',
  STEP1_COMPLETED: 'express_step1_completed',
  STEP2_COMPLETED: 'express_step2_completed',
  GENERATION_STARTED: 'express_generation_started',
  GENERATION_COMPLETED: 'express_generation_completed',
  GENERATION_FAILED: 'express_generation_failed',
  RESULTS_VIEWED: 'express_results_viewed',
  CV_EDITED: 'express_cv_edited',
  APPLICATION_VIEWED: 'express_application_viewed',
};

// Función helper para tracking
const trackExpressEvent = (event, properties = {}) => {
  if (window.gtag) {
    window.gtag('event', event, properties);
  }
  console.log('📊 Event:', event, properties);
};
```

---

## 🎨 Consideraciones de Diseño

### Paleta de Colores

```css
/* Colores específicos para Generación Express */
--express-primary: hsl(var(--primary));
--express-gradient-from: hsl(var(--primary) / 0.2);
--express-gradient-to: hsl(var(--primary) / 0.05);
--express-success: hsl(142 76% 36%);
--express-warning: hsl(38 92% 50%);
--express-error: hsl(0 84% 60%);
```

### Animaciones

```css
/* Animación de entrada para pasos */
@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Animación de progreso */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Responsive Design

```
Mobile: 1 columna, pasos verticales
Tablet: 1 columna, navegación mejorada
Desktop: Layout optimizado con previews laterales
```

---

## 🔄 Estado y Persistencia

### LocalStorage para Borradores

```javascript
// Guardar borrador automáticamente
const saveExpressDraft = (step, data) => {
  const draft = {
    step,
    data,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem('express_generation_draft', JSON.stringify(draft));
};

// Recuperar borrador
const loadExpressDraft = () => {
  const draft = localStorage.getItem('express_generation_draft');
  return draft ? JSON.parse(draft) : null;
};

// Limpiar borrador al completar
const clearExpressDraft = () => {
  localStorage.removeItem('express_generation_draft');
};
```

---

## 📚 Dependencias Adicionales

### NPM Packages Necesarios

```json
{
  "dependencies": {
    // Ya existentes ✅
    "react": "^18.2.0",
    "react-router-dom": "^6.x",
    "@clerk/clerk-react": "^4.x",
    "@google/generative-ai": "^0.x",
    "lucide-react": "^0.x",
    "dexie": "^3.x", // Para IndexedDB

    // Posiblemente necesarias ⚠️
    "framer-motion": "^10.x", // Para animaciones suaves
    "zod": "^3.x", // Para validación avanzada
    "react-hook-form": "^7.x" // Para manejo de formularios
  }
}
```

---

## ⚡ Optimización y Performance

### Code Splitting

```javascript
// Lazy load del módulo Express Generation
const ExpressGeneration = React.lazy(() =>
  import('./dashboard/express-generation')
);

// En el router
<Suspense fallback={<LoadingSpinner />}>
  <ExpressGeneration />
</Suspense>;
```

### Memoization

```javascript
// Memoizar componentes pesados
const Step3Generation = React.memo(({ profileData, jobOfferData }) => {
  // ...
});

// Memoizar callbacks
const handleProfileSubmit = useCallback((data) => {
  // ...
}, []);
```

### Debouncing

```javascript
// Debounce para validación en tiempo real
import { useDebouncedCallback } from 'use-debounce';

const debouncedValidate = useDebouncedCallback((value) => {
  validateInput(value);
}, 300);
```

---

## 🧪 Testing

### Tests Unitarios

```javascript
// ExpressGenerationService.test.js
describe('ExpressGenerationService', () => {
  test('parseUserProfile extracts education correctly', async () => {
    const description = 'Graduado en Ingeniería Informática...';
    const result = await ExpressGenerationService.parseUserProfile(description);
    expect(result.education).toBe('Ingeniería Informática');
  });
});
```

### Tests de Integración

```javascript
// ExpressGenerationFlow.test.jsx
describe('Express Generation Flow', () => {
  test('completes full flow successfully', async () => {
    render(<ExpressGeneration />);
    // Paso 1
    fireEvent.change(getByRole('textbox'), { target: { value: 'profile' } });
    fireEvent.click(getByText('Siguiente'));
    // Paso 2
    // ...
  });
});
```

---

## 📖 Conclusión

Esta arquitectura proporciona:

✅ **Modularidad:** Componentes independientes y reutilizables  
✅ **Escalabilidad:** Fácil añadir nuevas features  
✅ **Mantenibilidad:** Código limpio y bien documentado  
✅ **Performance:** Optimizaciones desde el diseño  
✅ **UX Excellence:** Experiencia fluida y sin fricción  
✅ **Robustez:** Manejo de errores completo  
✅ **Integración:** Mínimo impacto en código existente

**Siguiente paso:** Revisar la [Guía de Implementación](./GUIA_IMPLEMENTACION.md) para comenzar el desarrollo.

---

**Versión:** 1.0  
**Fecha:** 3 de Octubre, 2025  
**Estado:** Aprobado
