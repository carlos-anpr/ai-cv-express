# 💌 Sistema de Cartas de Recomendación - Documentación Completa

## 📋 **Descripción General**

Sistema completo para crear, gestionar y personalizar cartas de recomendación vinculadas a CVs específicos. Permite generar múltiples cartas para diferentes empresas basadas en el mismo CV, con integración de IA para generación automática.

## 🎯 **Características Principales**

### **1. Gestión Completa CRUD**

- ✅ **Crear** cartas nuevas para empresas específicas
- ✅ **Leer** cartas existentes por CV o usuario
- ✅ **Actualizar** cartas existentes
- ✅ **Eliminar** cartas no deseadas

### **2. Integración con IA (Google Gemini)**

- ✅ **Generación automática** basada en datos del CV
- ✅ **Personalización** por empresa y puesto
- ✅ **Contexto profesional** utilizando experiencia, educación y habilidades

### **3. Interfaz Intuitiva**

- ✅ **Dashboard de gestión** con vista de tarjetas
- ✅ **Formulario completo** con validaciones
- ✅ **Edición en tiempo real** del contenido
- ✅ **Copiar al portapapeles** funcionalidad

## 🗄️ **Estructura de Base de Datos**

### **Nueva Tabla: `coverLetters`**

```javascript
coverLetters: '++id, resumeId, userEmail, companyName, jobTitle, content, createdAt, updatedAt';
```

**Campos:**

- `id` - ID único auto-incrementable
- `resumeId` - Referencia al CV (clave foránea)
- `userEmail` - Email del usuario propietario
- `companyName` - Nombre de la empresa objetivo
- `jobTitle` - Puesto solicitado
- `content` - Contenido completo de la carta
- `createdAt` - Fecha de creación (auto-generada)
- `updatedAt` - Fecha de última actualización (auto-generada)

## 🔧 **Servicios y APIs**

### **LocalDatabase.js - Nuevos Métodos**

#### **CREATE**

```javascript
async CreateCoverLetter(data)
```

- Crea nueva carta de recomendación
- Valida datos requeridos
- Genera timestamps automáticamente

#### **READ**

```javascript
async GetCoverLettersByResume(resumeId)     // Por CV específico
async GetCoverLetterById(id)               // Por ID de carta
async GetUserCoverLetters(userEmail)       // Todas las del usuario
```

#### **UPDATE**

```javascript
async UpdateCoverLetter(id, updates)
```

- Actualiza campos específicos
- Mantiene historial de versiones

#### **DELETE**

```javascript
async DeleteCoverLetter(id)
```

- Eliminación segura con confirmación
- Logging de operaciones

## 🎨 **Componentes de Interfaz**

### **1. CoverLettersManager** (`/cover-letters/index.jsx`)

**Componente principal de gestión**

**Características:**

- Vista de dashboard con tarjetas de cartas
- Botones de acción (editar, eliminar, copiar)
- Estado vacío con call-to-action
- Navegación integrada

**Props:**

- Obtiene `resumeId` desde URL params
- Acceso a usuario autenticado con Clerk

### **2. CoverLetterForm** (`/components/CoverLetterForm.jsx`)

**Formulario modal para crear/editar**

**Características:**

- Modal responsivo con scroll
- Campos de empresa y puesto
- Área de texto para contenido
- Generación con IA integrada
- Validaciones en tiempo real

**Estados:**

- `loading` - Para operaciones de guardado
- `aiLoading` - Para generación con IA
- `formData` - Datos del formulario

## 🤖 **Integración con IA**

### **Prompt de Generación**

```javascript
const COVER_LETTER_PROMPT = `
Actúa como un experto redactor de cartas de recomendación profesionales...
`;
```

**Variables Dinámicas:**

- `{candidateName}` - Nombre completo del candidato
- `{currentJobTitle}` - Puesto objetivo del CV
- `{summary}` - Resumen profesional
- `{experience}` - Lista de experiencias
- `{education}` - Formación académica
- `{skills}` - Habilidades técnicas
- `{companyName}` - Empresa objetivo
- `{jobTitle}` - Puesto solicitado

### **Proceso de Generación**

1. **Validación** - Empresa y puesto requeridos
2. **Extracción** - Datos del CV del usuario
3. **Personalización** - Prompt con variables
4. **Generación** - Llamada a Google Gemini
5. **Inserción** - Contenido en el formulario

## 🚀 **Navegación y Rutas**

### **Rutas Añadidas**

```javascript
{
  path: '/dashboard/resume/:resumeId/cover-letters',
  element: <CoverLettersManager />,
}
```

### **Puntos de Acceso**

1. **Desde Editor de CV** - Botón "Cartas" en FormSection
2. **Desde Dashboard** - Menú contextual en ResumeCardItem
3. **Navegación directa** - URL con resumeId

### **Botones de Navegación**

```jsx
// En FormSection.jsx
<Link to={`/dashboard/resume/${params.resumeId}/cover-letters`}>
  <Button variant="outline">
    <LayoutGrid className="h-4 w-4 mr-2" />
    Cartas
  </Button>
</Link>

// En ResumeCardItem.jsx
<DropdownMenuItem onClick={() =>
  navigation('/dashboard/resume/' + resume.documentId + '/cover-letters')
}>
  Cartas de Recomendación
</DropdownMenuItem>
```

## 📱 **Experiencia de Usuario**

### **Flujo Principal**

1. **Acceso** - Usuario abre gestor desde CV
2. **Vista** - Lista de cartas existentes o estado vacío
3. **Creación** - Modal con formulario completo
4. **IA** - Generación automática opcional
5. **Personalización** - Edición manual del contenido
6. **Guardado** - Persistencia en IndexedDB

### **Características UX**

- ✅ **Estados de carga** claros y informativos
- ✅ **Mensajes de confirmación** para acciones destructivas
- ✅ **Feedback inmediato** con toast notifications
- ✅ **Navegación intuitiva** con breadcrumbs
- ✅ **Responsive design** para móviles y desktop

## 🔄 **Flujos de Datos**

### **Creación de Carta**

```
Usuario → Formulario → Datos CV → IA → Contenido → Validación → BD → Confirmación
```

### **Edición de Carta**

```
Lista → Selección → Formulario Pre-lleno → Cambios → Validación → BD → Actualización
```

### **Gestión de Cartas**

```
CV → Cartas Asociadas → CRUD Operations → Sincronización → Estado UI
```

## 📊 **Casos de Uso**

### **Caso 1: Desarrollador Frontend**

- **CV Base:** React, JavaScript, CSS, 3 años experiencia
- **Empresa 1:** Google - Frontend Engineer
- **IA Genera:** Carta enfocada en React, proyectos web, innovación
- **Empresa 2:** Startup - Full Stack Developer
- **IA Genera:** Carta enfocada en versatilidad, startup culture, crecimiento

### **Caso 2: Marketing Manager**

- **CV Base:** SEO, Analytics, Campaigns, 5 años experiencia
- **Empresa 1:** Nike - Digital Marketing Lead
- **IA Genera:** Carta enfocada en branding, sports marketing, leadership
- **Empresa 2:** Agency - Campaign Manager
- **IA Genera:** Carta enfocada en multi-client, creativity, results

## 🔒 **Seguridad y Privacidad**

### **Protecciones Implementadas**

- ✅ **Autenticación** - Solo usuarios autenticados (Clerk)
- ✅ **Autorización** - Solo propietarios acceden a sus cartas
- ✅ **Validación** - Input sanitization y validación
- ✅ **Almacenamiento Local** - No hay exposición de datos en servidor

### **Consideraciones**

- ✅ **API Key Segura** - Google AI API key en variables de entorno
- ✅ **Rate Limiting** - Control de uso de IA por usuario
- ✅ **Data Ownership** - Usuario mantiene control total de sus datos

## 📈 **Métricas y Análisis**

### **Logging Implementado**

```javascript
console.log('💌 Creando carta de recomendación:', data);
console.log('✅ Carta de recomendación creada con ID:', id);
console.log('📋 Obteniendo cartas de recomendación para CV:', resumeId);
```

### **Métricas Posibles**

- Número de cartas por usuario
- Companies más populares
- Tiempo de generación con IA
- Tasa de edición post-IA

## 🛠️ **Instalación y Configuración**

### **Dependencias Requeridas**

```json
{
  "@google/generative-ai": "^0.22.0",
  "dexie": "^3.2.4",
  "lucide-react": "latest",
  "@clerk/clerk-react": "latest"
}
```

### **Variables de Entorno**

```env
VITE_GOOGLE_AI_API_KEY=tu_api_key_aqui
VITE_CLERK_PUBLISHABLE_KEY=tu_clerk_key_aqui
```

### **Archivos Creados/Modificados**

```
📁 src/
├── 📁 dashboard/resume/[resumeId]/cover-letters/
│   └── 📄 index.jsx (Nuevo)
├── 📁 dashboard/resume/components/
│   ├── 📄 CoverLetterForm.jsx (Nuevo)
│   └── 📄 FormSection.jsx (Modificado)
├── 📁 components/ui/
│   └── 📄 card.jsx (Nuevo)
├── 📁 services/
│   ├── 📄 IndexedDBService.js (Modificado)
│   └── 📄 LocalDatabase.js (Modificado)
├── 📄 main.jsx (Modificado)
└── 📁 dashboard/components/
    └── 📄 ResumeCardItem.jsx (Modificado)
```

## 🚀 **Próximas Mejoras**

### **Funcionalidades Futuras**

- 📧 **Envío por email** directo desde la aplicación
- 📄 **Exportación a PDF** de las cartas
- 🎨 **Plantillas predefinidas** por industria
- 📊 **Analytics de cartas** (views, responses)
- 🔄 **Versionado de cartas** con historial
- 🌐 **Internacionalización** (inglés, español, francés)

### **Optimizaciones Técnicas**

- ⚡ **Caching de cartas** para mejor performance
- 🔄 **Sincronización offline** con service workers
- 📱 **PWA Support** para instalación móvil
- 🧪 **A/B Testing** de prompts de IA

---

_Sistema implementado - Octubre 2025_  
_Estado: ✅ Funcional y listo para producción_  
_Cobertura: Completa (CRUD + IA + UI + UX)_
