# Sistema de Candidaturas y Entrevistas - Especificación Técnica

## Resumen Ejecutivo

Este documento especifica el diseño e implementación de un sistema completo de gestión de candidaturas que incluye:

1. **Gestión de Candidaturas** - Datos de empresa y puesto
2. **Cartas de Presentación Personalizables** - Con estilos y longitudes configurables
3. **Simulación de Entrevistas** - Generación de preguntas y respuestas preparatorias

## Arquitectura del Sistema

### Estructura de Datos

#### 1. JobApplication (Candidatura)

```javascript
{
  id: string,
  resumeId: string,
  userEmail: string,
  companyName: string,
  jobTitle: string,
  jobDescription: string,
  requirements: string,
  responsibilities: string,
  companyWebsite: string,
  contactPerson: string,
  applicationDate: Date,
  status: 'draft' | 'applied' | 'interview' | 'rejected' | 'accepted',
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. CoverLetter (actualizada)

```javascript
{
  id: string,
  jobApplicationId: string, // Nueva relación
  resumeId: string,
  userEmail: string,
  style: 'formal' | 'friendly' | 'humanized' | 'informal',
  length: 'short' | 'medium' | 'long',
  content: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. InterviewSimulation (nueva)

```javascript
{
  id: string,
  jobApplicationId: string,
  resumeId: string,
  userEmail: string,
  candidateLevel: 'junior' | 'mid' | 'senior',
  questions: Array<{
    category: 'technical' | 'behavioral' | 'company' | 'missing_skill',
    question: string,
    suggestedAnswer: string,
    tips: string[]
  }>,
  createdAt: Date,
  updatedAt: Date
}
```

## Flujo de Usuario (UX/UI)

### 1. Navegación Principal

```
Dashboard → CV Específico → Candidaturas
```

### 2. Gestión de Candidaturas

- **Listado de candidaturas** por CV
- **Botón "Nueva Candidatura"** prominente
- **Estados visuales** (borrador, enviada, entrevista, etc.)
- **Acciones rápidas** (editar, duplicar, eliminar)

### 3. Flujo de Nueva Candidatura

```
1. Datos de la Empresa
   ├── Información básica (empresa, puesto)
   ├── Descripción del trabajo
   ├── Requisitos técnicos
   └── Responsabilidades

2. Herramientas de Candidatura
   ├── Carta de Presentación
   │   ├── Selección de estilo
   │   ├── Selección de longitud
   │   └── Generación/edición
   └── Simulación de Entrevista
       ├── Detección automática de nivel
       ├── Generación de preguntas
       └── Respuestas sugeridas
```

## Ubicación en la Aplicación

### Estructura de Rutas

```
/dashboard/resume/[resumeId]/
├── edit (actual)
├── cover-letters (actual - se integra)
└── job-applications (NUEVO)
    ├── index.jsx (listado)
    ├── new/
    │   └── index.jsx (nueva candidatura)
    └── [applicationId]/
        ├── index.jsx (detalle)
        ├── cover-letter/
        │   └── index.jsx (carta personalizable)
        └── interview-simulation/
            └── index.jsx (simulación)
```

### Integración con Componentes Existentes

- **FormSection.jsx** - Nuevo botón "Candidaturas"
- **ResumeCardItem.jsx** - Acceso directo a candidaturas
- **CoverLetterForm.jsx** - Integración con candidaturas

## Beneficios para el Usuario

### Experiencia Mejorada

1. **Contexto Unificado** - Toda la información de la candidatura en un lugar
2. **Reutilización de Datos** - No repetir información empresa/puesto
3. **Personalización Avanzada** - Estilos y longitudes de carta
4. **Preparación Completa** - Simulación de entrevista incluida

### Flujo Optimizado

1. **Una sola entrada de datos** de empresa
2. **Herramientas conectadas** (carta + entrevista)
3. **Seguimiento de candidaturas** por estado
4. **Histórico completo** por CV

## Consideraciones Técnicas

### Base de Datos

- **Nueva tabla**: `jobApplications`
- **Actualización**: `coverLetters` con relación a candidaturas
- **Nueva tabla**: `interviewSimulations`

### APIs de IA

- **Cartas personalizables** - Prompts por estilo/longitud
- **Entrevistas inteligentes** - Análisis de nivel y gaps
- **Respuestas humanas** - Tono natural y realista

### Performance

- **Carga diferida** de simulaciones
- **Cache de preguntas** frecuentes por sector
- **Optimización de prompts** IA

---

_Este documento será el punto de referencia para la implementación del sistema completo de candidaturas._
