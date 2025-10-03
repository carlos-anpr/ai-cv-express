# Diseño Detallado: Mejora de Generación de Contenido con IA

## 📐 Arquitectura de la Solución

### Diagrama de Flujo General

```
Usuario Ingresa/Edita Contenido
           ↓
    [Detectar Estado del Campo]
           ↓
    ┌──────┴──────┐
    ↓             ↓
[Vacío]      [Con Contenido]
    ↓             ↓
[Generar]    [Mejorar/Ampliar]
    ↓             ↓
[Llamada IA]  [Llamada IA con Contexto]
    ↓             ↓
[Sugerencias] [Versión Mejorada]
    ↓             ↓
[Usuario Selecciona/Aplica]
```

---

## 🎨 Diseño de Interfaz de Usuario

### 1. Summary (Resumen Profesional)

#### UI Actual

```
┌─────────────────────────────────────┐
│ Resumen Profesional                 │
│ Añade un resumen para tu puesto     │
│                                      │
│ [Añadir Resumen]   [🪄 Generar con IA]│
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │    [Campo de texto vacío]       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                          [Guardar]  │
└─────────────────────────────────────┘
```

#### UI Propuesta - Campo Vacío

```
┌─────────────────────────────────────┐
│ Resumen Profesional                 │
│ Añade un resumen para tu puesto     │
│                                      │
│ [Añadir Resumen]   [🪄 Generar con IA]│
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │    [Campo de texto vacío]       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                          [Guardar]  │
└─────────────────────────────────────┘

Al hacer clic en "Generar con IA":
→ Genera 3 opciones (Junior, Medio, Senior)
→ Usuario selecciona una
```

#### UI Propuesta - Con Contenido

```
┌─────────────────────────────────────┐
│ Resumen Profesional                 │
│ Añade un resumen para tu puesto     │
│                                      │
│ [Añadir Resumen]   [🪄 Mejorar con IA]│
│ ┌─────────────────────────────────┐ │
│ │ Desarrollador con experiencia   │ │
│ │ en JavaScript y React...        │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                          [Guardar]  │
└─────────────────────────────────────┘

Al hacer clic en "Mejorar con IA":
┌─────────────────────────────────────┐
│ 🎯 ¿Qué deseas hacer?               │
│ ○ Mejorar mi texto actual           │
│ ○ Ampliar y hacer más profesional   │
│ ○ Generar nuevas opciones            │
│          [Aplicar] [Cancelar]        │
└─────────────────────────────────────┘

Resultado:
┌─────────────────────────────────────┐
│ ✨ Versión Mejorada                  │
│ ┌─────────────────────────────────┐ │
│ │ Desarrollador Full Stack con    │ │
│ │ sólida experiencia en JavaScript│ │
│ │ y React. Especializado en...    │ │
│ └─────────────────────────────────┘ │
│  [✅ Aplicar] [🔄 Regenerar] [❌ Cancelar]│
└─────────────────────────────────────┘
```

### 2. Experience (Experiencia Profesional - RichTextEditor)

#### UI Actual

```
┌─────────────────────────────────────┐
│ [Resumen]          [🪄 Generar con IA]│
│ ┌─────────────────────────────────┐ │
│ │ [Bold] [Italic] [List]          │ │
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │    [Editor de texto rico]       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### UI Propuesta - Campo Vacío

```
┌─────────────────────────────────────┐
│ [Resumen]          [🪄 Generar con IA]│
│ ┌─────────────────────────────────┐ │
│ │ [Bold] [Italic] [List]          │ │
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │    [Editor vacío]               │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Al hacer clic en "Generar con IA":
→ Genera 5-7 puntos clave basados en el puesto
→ Se insertan como lista con formato
```

#### UI Propuesta - Con Contenido

```
┌─────────────────────────────────────┐
│ [Resumen]          [🪄 Mejorar con IA]│
│ ┌─────────────────────────────────┐ │
│ │ [Bold] [Italic] [List]          │ │
│ ├─────────────────────────────────┤ │
│ │ • Desarrollé aplicaciones web   │ │
│ │ • Trabajé con React y Node      │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Al hacer clic en "Mejorar con IA":
┌─────────────────────────────────────┐
│ 🎯 Opciones de Mejora               │
│ ○ Mejorar puntos actuales           │
│ ○ Ampliar con más detalles          │
│ ○ Reorganizar profesionalmente      │
│          [Aplicar] [Cancelar]        │
└─────────────────────────────────────┘

Resultado:
┌─────────────────────────────────────┐
│ ✨ Versión Mejorada                  │
│ • Desarrollé aplicaciones web       │
│   full-stack utilizando arquitectura│
│   moderna y mejores prácticas       │
│ • Lideré implementación de proyectos│
│   con React y Node.js, optimizando  │
│   rendimiento en un 40%             │
│  [✅ Aplicar] [🔄 Regenerar] [❌ Cancelar]│
└─────────────────────────────────────┘
```

### 3. Skills (Habilidades)

#### UI Actual

```
┌─────────────────────────────────────┐
│ Habilidades                          │
│ Añade tus principales habilidades    │
│                                      │
│ [Nombre]              [⭐⭐⭐⭐☆]      │
│ ┌──────────────┐                    │
│ │ JavaScript   │                    │
│ └──────────────┘                    │
│                                      │
│ [+ Añadir] [- Eliminar]   [Guardar] │
└─────────────────────────────────────┘
```

#### UI Propuesta - Modo Manual (Actual)

```
┌─────────────────────────────────────┐
│ Habilidades                          │
│ Añade tus principales habilidades    │
│                                      │
│ 🎯 Modo: ○ Manual  ● Generar con IA │
│                                      │
│ [Nombre]              [⭐⭐⭐⭐☆]      │
│ ┌──────────────┐                    │
│ │ JavaScript   │                    │
│ └──────────────┘                    │
│                                      │
│ [+ Añadir] [- Eliminar]   [Guardar] │
└─────────────────────────────────────┘
```

#### UI Propuesta - Modo IA (Nuevo)

```
┌─────────────────────────────────────┐
│ Habilidades                          │
│ Añade tus principales habilidades    │
│                                      │
│ 🎯 Modo: ● Manual  ○ Generar con IA │
│                                      │
│ 💡 Describe tus habilidades          │
│ ┌─────────────────────────────────┐ │
│ │ Domino Node.js a nivel experto, │ │
│ │ React con conocimientos básicos,│ │
│ │ TypeScript nivel intermedio,    │ │
│ │ Docker y Kubernetes para deploy │ │
│ └─────────────────────────────────┘ │
│                                      │
│         [🪄 Generar Skills con IA]   │
└─────────────────────────────────────┘

Al hacer clic en "Generar Skills con IA":
┌─────────────────────────────────────┐
│ ✨ Skills Generadas                  │
│ ┌─────────────────────────────────┐ │
│ │ Node.js          [⭐⭐⭐⭐⭐]      │ │
│ │ React            [⭐⭐☆☆☆]        │ │
│ │ TypeScript       [⭐⭐⭐☆☆]        │ │
│ │ Docker           [⭐⭐⭐⭐☆]        │ │
│ │ Kubernetes       [⭐⭐⭐⭐☆]        │ │
│ └─────────────────────────────────┘ │
│  [✅ Aplicar Todas] [✏️ Editar] [❌ Cancelar]│
└─────────────────────────────────────┘
```

---

## 🔄 Flujos de Usuario Detallados

### Flujo 1: Mejorar Resumen Existente

```
1. Usuario tiene texto en el campo de resumen
   ↓
2. Botón muestra "Mejorar con IA" (en vez de "Generar con IA")
   ↓
3. Usuario hace clic en "Mejorar con IA"
   ↓
4. Aparece diálogo con opciones:
   - Mejorar mi texto actual
   - Ampliar y hacer más profesional
   - Generar nuevas opciones
   ↓
5. Usuario selecciona una opción
   ↓
6. Sistema envía a IA:
   - Texto original
   - Título del puesto
   - Opción seleccionada
   ↓
7. IA procesa y devuelve versión mejorada
   ↓
8. Sistema muestra preview con botones:
   - Aplicar (reemplaza el texto)
   - Regenerar (nueva versión)
   - Cancelar (mantiene original)
   ↓
9. Usuario aplica o cancela
```

### Flujo 2: Generar Skills desde Descripción

```
1. Usuario cambia modo a "Generar con IA"
   ↓
2. Aparece campo de texto grande
   ↓
3. Usuario escribe descripción en lenguaje natural:
   "Domino Node.js a nivel experto, React básico..."
   ↓
4. Usuario hace clic en "Generar Skills con IA"
   ↓
5. Sistema muestra loading
   ↓
6. IA analiza el texto y extrae:
   - Nombres de habilidades
   - Nivel de dominio (keywords: experto, básico, intermedio, etc.)
   ↓
7. Sistema convierte niveles a ratings:
   - Experto/Avanzado → 5 estrellas
   - Intermedio/Medio → 3 estrellas
   - Básico/Junior → 2 estrellas
   - Conocimientos → 1 estrella
   ↓
8. Muestra preview con todas las skills generadas
   ↓
9. Usuario puede:
   - Aplicar todas
   - Editar individualmente
   - Cancelar y volver
   ↓
10. Skills se agregan al listado normal
```

### Flujo 3: Ampliar Experiencia Laboral

```
1. Usuario tiene puntos clave en RichTextEditor
   ↓
2. Botón muestra "Mejorar con IA"
   ↓
3. Usuario hace clic
   ↓
4. Aparece diálogo con opciones:
   - Mejorar puntos actuales
   - Ampliar con más detalles
   - Reorganizar profesionalmente
   ↓
5. Usuario selecciona "Ampliar con más detalles"
   ↓
6. Sistema envía a IA:
   - Puntos actuales (extraídos del HTML)
   - Título del puesto
   - Nombre de la empresa
   - Opción seleccionada
   ↓
7. IA devuelve puntos ampliados con:
   - Métricas cuantificables (cuando sea posible)
   - Tecnologías específicas
   - Impacto y resultados
   ↓
8. Sistema formatea como lista HTML
   ↓
9. Muestra preview
   ↓
10. Usuario aplica o cancela
```

---

## 🎯 Casos de Uso Específicos

### Caso 1: Usuario Nuevo (Sin Contenido)

**Escenario**: Usuario crea su primer CV

**Comportamiento**:

- Summary: Botón = "Generar con IA" → Genera 3 opciones
- Experience: Botón = "Generar con IA" → Genera puntos clave
- Skills: Modo IA disponible desde el inicio

### Caso 2: Usuario Experimentado (Con Contenido)

**Escenario**: Usuario actualiza CV existente

**Comportamiento**:

- Summary: Botón = "Mejorar con IA" → Mejora texto actual
- Experience: Botón = "Mejorar con IA" → Mejora puntos existentes
- Skills: Puede usar descripción para agregar más skills

### Caso 3: Usuario Indeciso

**Escenario**: Usuario no está satisfecho con resultado IA

**Comportamiento**:

- Puede regenerar múltiples veces
- Puede alternar entre generar y mejorar
- Siempre puede cancelar y volver al original
- Puede editar manualmente después de aplicar

### Caso 4: Cambio de Idioma en Skills

**Escenario**: Usuario describe skills en español

**Input**: "Dominio experto de Javascript y conocimientos básicos de Python"

**Output IA**:

```json
[
  { "name": "JavaScript", "rating": 5 },
  { "name": "Python", "rating": 2 }
]
```

---

## 🧩 Componentes UI Nuevos

### 1. AIOptionsDialog

**Propósito**: Modal para seleccionar tipo de mejora

```jsx
<AIOptionsDialog
  isOpen={showOptions}
  onClose={() => setShowOptions(false)}
  onSelect={(option) => handleAIImprovement(option)}
  options={[
    { id: 'improve', label: 'Mejorar mi texto actual', icon: '✨' },
    { id: 'expand', label: 'Ampliar y hacer más profesional', icon: '📈' },
    { id: 'generate', label: 'Generar nuevas opciones', icon: '🎯' },
  ]}
/>
```

### 2. AIPreviewPanel

**Propósito**: Mostrar resultado antes de aplicar

```jsx
<AIPreviewPanel
  title="Versión Mejorada"
  content={improvedContent}
  onApply={() => applyImprovedContent()}
  onRegenerate={() => regenerateContent()}
  onCancel={() => cancelImprovement()}
  isLoading={isRegenerating}
/>
```

### 3. SkillsGeneratorInput

**Propósito**: Input para descripción de skills en lenguaje natural

```jsx
<SkillsGeneratorInput
  value={skillsDescription}
  onChange={(value) => setSkillsDescription(value)}
  onGenerate={() => generateSkillsFromAI()}
  placeholder="Describe tus habilidades: ej. 'Domino Node.js a nivel experto, React con conocimientos básicos...'"
  isLoading={isGenerating}
/>
```

### 4. GeneratedSkillsPreview

**Propósito**: Preview de skills generadas antes de aplicar

```jsx
<GeneratedSkillsPreview
  skills={generatedSkills}
  onApply={() => applyAllSkills()}
  onEdit={(index) => editSkill(index)}
  onRemove={(index) => removeSkill(index)}
  onCancel={() => cancelGeneration()}
/>
```

---

## 📊 Estados de los Componentes

### Summary Component States

```javascript
{
  summary: string,              // Texto actual
  hasContent: boolean,          // ¿Tiene contenido?
  loading: boolean,             // Cargando IA
  showOptions: boolean,         // Mostrar opciones de mejora
  selectedOption: string,       // Opción seleccionada
  improvedSummary: string,      // Versión mejorada
  showPreview: boolean,         // Mostrar preview
  aiGeneratedList: array        // Lista de sugerencias (modo generar)
}
```

### RichTextEditor Component States

```javascript
{
  value: string,                // HTML actual
  hasContent: boolean,          // ¿Tiene contenido?
  loading: boolean,             // Cargando IA
  showOptions: boolean,         // Mostrar opciones
  selectedOption: string,       // Opción seleccionada
  improvedContent: string,      // HTML mejorado
  showPreview: boolean          // Mostrar preview
}
```

### Skills Component States

```javascript
{
  mode: 'manual' | 'ai',        // Modo actual
  skillsList: array,            // Lista de skills
  skillsDescription: string,    // Descripción en texto
  loading: boolean,             // Cargando IA
  generatedSkills: array,       // Skills generadas
  showPreview: boolean          // Mostrar preview
}
```

---

## 🎨 Estilos y Animaciones

### Transiciones

```css
/* Cambio de botón Generar → Mejorar */
.ai-button {
  transition: all 0.3s ease;
}

/* Aparición de opciones */
.options-dialog {
  animation: slideIn 0.3s ease-out;
}

/* Preview panel */
.preview-panel {
  animation: fadeIn 0.2s ease-in;
}

/* Loading state */
.generating {
  opacity: 0.7;
  pointer-events: none;
}
```

### Feedback Visual

```css
/* Contenido mejorado */
.improved-content {
  border-left: 4px solid #10b981;
  background: #f0fdf4;
  padding: 1rem;
}

/* Contenido original */
.original-content {
  border-left: 4px solid #6b7280;
  opacity: 0.6;
}
```

---

## 📱 Responsive Design

### Mobile (< 640px)

- Diálogos ocupan full screen
- Botones de acción apilados verticalmente
- Preview panel con scroll

### Tablet (640px - 1024px)

- Diálogos centrados con max-width
- Botones en fila
- Preview panel lado a lado con original

### Desktop (> 1024px)

- Diálogos centrados
- Comparación lado a lado
- Más opciones visibles simultáneamente

---

## 🔍 Validaciones y Reglas de Negocio

### Validaciones de Input

1. **Summary**

   - Mínimo 50 caracteres para mejorar
   - Máximo 1000 caracteres
   - Debe tener al menos una palabra

2. **Experience**

   - Debe tener título de puesto para generar
   - Mínimo 20 caracteres para mejorar
   - Máximo 5000 caracteres

3. **Skills Description**
   - Mínimo 10 caracteres
   - Máximo 500 caracteres
   - Debe contener al menos una habilidad reconocible

### Reglas de Detección de Contenido

```javascript
// Detectar si tiene contenido significativo
const hasSignificantContent = (text) => {
  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  return cleanText.length > 10 && cleanText.split(' ').length > 3;
};

// Determinar modo de botón
const getButtonMode = (content) => {
  return hasSignificantContent(content) ? 'improve' : 'generate';
};
```

---

**Próximo Documento**: [ARQUITECTURA_TECNICA.md](./ARQUITECTURA_TECNICA.md)
