# 🎨 Diseño Detallado UX/UI - Generación Express

## 🎯 Principios de Diseño

### 1. **Claridad sobre Complejidad**

- Cada paso debe ser autoexplicativo
- Mensajes claros y concisos
- Feedback visual inmediato

### 2. **Progresión Natural**

- Flujo lineal sin distracciones
- Indicadores de progreso visibles
- Posibilidad de retroceder

### 3. **Confianza y Seguridad**

- Guardado automático de borradores
- Confirmaciones antes de acciones irreversibles
- Mensajes de error constructivos

### 4. **Delight** (Momentos "wow")

- Animaciones sutiles pero impactantes
- Feedback positivo al completar pasos
- Celebración del éxito final

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--mobile: 320px - 639px;
--tablet: 640px - 1023px;
--desktop: 1024px+;
--wide: 1440px+;
```

### Layout por Dispositivo

#### Mobile (< 640px)

- Stepper vertical compacto
- Un campo a la vez
- Botones full-width
- Modal para previews

#### Tablet (640px - 1023px)

- Stepper horizontal
- Formularios a 1 columna
- Preview en modal

#### Desktop (1024px+)

- Layout de 2 columnas (form + preview)
- Stepper horizontal expandido
- Preview en tiempo real al lado

---

## 🎨 Paleta de Colores

### Colores Principales

```css
/* Express Brand */
--express-primary: #6366f1; /* Indigo vibrante */
--express-primary-dark: #4f46e5;
--express-primary-light: #818cf8;

/* Status Colors */
--express-success: #10b981; /* Verde éxito */
--express-warning: #f59e0b; /* Ámbar advertencia */
--express-error: #ef4444; /* Rojo error */
--express-info: #3b82f6; /* Azul información */

/* Gradients */
--express-gradient: linear-gradient(
  135deg,
  rgba(99, 102, 241, 0.1) 0%,
  rgba(139, 92, 246, 0.05) 100%
);

--express-gradient-hover: linear-gradient(
  135deg,
  rgba(99, 102, 241, 0.15) 0%,
  rgba(139, 92, 246, 0.08) 100%
);

/* Neutral */
--express-bg: hsl(var(--background));
--express-surface: hsl(var(--card));
--express-text: hsl(var(--foreground));
--express-text-muted: hsl(var(--muted-foreground));
```

### Uso Semántico

| Color   | Uso                               | Ejemplo                          |
| ------- | --------------------------------- | -------------------------------- |
| Primary | Acciones principales, CTA         | Botón "Siguiente", "Generar"     |
| Success | Pasos completados, confirmaciones | Checkmark en stepper             |
| Warning | Advertencias, validaciones        | "Faltan campos opcionales"       |
| Error   | Errores, validaciones fallidas    | "Campo requerido"                |
| Info    | Información contextual, tips      | "Consejo: menciona años de exp." |

---

## 🖼️ Wireframes y Mockups

### Dashboard - ExpressGenerationCard

```
┌────────────────────────────────────────────────────────────┐
│ Dashboard                                            [User] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Mis Currículums                                           │
│  Comienza a crear tu currículum con IA                     │
│                                                             │
│  ┌──────────────────────────────────┬──────────┬─────────┐│
│  │  ⚡ GENERACIÓN EXPRESS            │ + Nuevo  │  CV #1  ││
│  │                                   │   CV     │         ││
│  │  🎯 Crea tu CV completo en       │          │  [...]  ││
│  │     5 minutos                     │          │         ││
│  │                                   │          ├─────────┤│
│  │  ✓ CV personalizado              │          │  CV #2  ││
│  │  ✓ Carta de presentación         │          │         ││
│  │  ✓ Candidatura guardada          │          │  [...]  ││
│  │                                   │          │         ││
│  │  [Comenzar →]                    │          ├─────────┤│
│  │                                   │          │  CV #3  ││
│  └──────────────────────────────────┴──────────┴─────────┘│
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Especificaciones:**

- **Tamaño:** 2 columnas de ancho (col-span-2)
- **Fondo:** Gradiente primary con blur
- **Icono:** Zap (⚡) - 48x48px
- **Título:** text-2xl font-bold
- **Características:** Lista con checkmarks
- **CTA:** Botón primary con icono ArrowRight

---

### Paso 1: Tu Perfil Profesional

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← Volver al Dashboard                                   [Cerrar X]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  (1) Tu Perfil  →  (2) Oferta  →  (3) Generación  →  (4) ✓   │  │
│  │   [●●●●●●●]       [○○○○○○]       [○○○○○○]       [○○○○○○]      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─────────────────────────────────┬──────────────────────────────┐ │
│  │ FORMULARIO                      │ PREVIEW                      │ │
│  │                                 │                              │ │
│  │ Cuéntanos sobre ti              │ 👤 Vista Previa             │ │
│  │ ─────────────────────           │                              │ │
│  │                                 │ Basándose en tu descripción, │ │
│  │ ┌────────────────────────────┐ │ generaremos un CV que        │ │
│  │ │ Describe tu perfil:        │ │ incluya:                     │ │
│  │ │                            │ │                              │ │
│  │ │ Ej: "Soy graduado en      │ │ ✓ Resumen profesional        │ │
│  │ │ Ingeniería Informática     │ │ ✓ Experiencia laboral        │ │
│  │ │ con 3 años de experiencia  │ │ ✓ Formación académica        │ │
│  │ │ en desarrollo web. He      │ │ ✓ Habilidades técnicas       │ │
│  │ │ trabajado principalmente   │ │                              │ │
│  │ │ con React, Node.js..."     │ │ 💡 Consejo:                 │ │
│  │ │                            │ │ Menciona tu formación,       │ │
│  │ │                            │ │ sector y años de exp.        │ │
│  │ │ [250/1000 caracteres]      │ │                              │ │
│  │ └────────────────────────────┘ │                              │ │
│  │                                 │                              │ │
│  │ 💬 Sugerencias:                │                              │ │
│  │ • Menciona tu formación        │                              │ │
│  │ • Indica sector/industria      │                              │ │
│  │ • Años de experiencia          │                              │ │
│  │ • Principales tecnologías      │                              │ │
│  │                                 │                              │ │
│  │ [Cancelar]         [Siguiente →│                              │ │
│  │                                 │                              │ │
│  └─────────────────────────────────┴──────────────────────────────┘ │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout

```
┌────────────────────────────┐
│ ← Generación Express   [X] │
├────────────────────────────┤
│                            │
│ ● ─ ─ ─ ─ ─ ─ ─            │
│ 1   2   3   4              │
│                            │
│ Tu Perfil Profesional      │
│ ════════════════           │
│                            │
│ Cuéntanos sobre ti para    │
│ crear tu CV personalizado  │
│                            │
│ ┌────────────────────────┐ │
│ │                        │ │
│ │ Describe tu perfil     │ │
│ │ profesional...         │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │ [250/1000]             │ │
│ └────────────────────────┘ │
│                            │
│ 💡 Incluye:               │
│ • Formación               │
│ • Sector                  │
│ • Años de experiencia     │
│ • Tecnologías principales │
│                            │
│ [Siguiente →]             │
│                            │
└────────────────────────────┘
```

**Componentes UI:**

- **Stepper:** Custom component con animación
- **Textarea:** Auto-resize, contador de caracteres
- **Preview Panel:** Card con iconos y tips
- **Validación:** Real-time con mensajes debajo

**Interacciones:**

- Autoguardado cada 10 segundos
- Validación al salir del campo
- Sugerencias contextuales
- Botón "Siguiente" disabled si < 50 caracteres

---

### Paso 2: Información de la Oferta

#### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← Atrás                                                   [Cerrar X] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  (1) ✓  →  (2) Oferta  →  (3) Generación  →  (4) Resultados  │  │
│  │   [✓✓✓✓✓✓]   [●●●●●●●]       [○○○○○○]       [○○○○○○]         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─────────────────────────────────┬──────────────────────────────┐ │
│  │ FORMULARIO                      │ DETECCIÓN AUTOMÁTICA         │ │
│  │                                 │                              │ │
│  │ Información de la Oferta        │ 🔍 Detectaremos:            │ │
│  │ ─────────────────────────       │                              │ │
│  │                                 │ ⚡ En tiempo real mientras   │ │
│  │ Pega aquí toda la información   │    pegas la información     │ │
│  │ de la oferta de trabajo:        │                              │ │
│  │                                 │ ╔════════════════════════╗  │ │
│  │ ┌────────────────────────────┐ │ ║ 🏢 Empresa: ...        ║  │ │
│  │ │                            │ │ ║                        ║  │ │
│  │ │ Senior React Developer     │ │ ║ 💼 Puesto: ...         ║  │ │
│  │ │ Tech Corp - Madrid         │ │ ║                        ║  │ │
│  │ │                            │ │ ║ 📍 Ubicación: ...      ║  │ │
│  │ │ Requirements:              │ │ ║                        ║  │ │
│  │ │ - 5+ years React           │ │ ║ 💰 Salario: ...        ║  │ │
│  │ │ - TypeScript               │ │ ║                        ║  │ │
│  │ │ ...                        │ │ ║ 📋 Requisitos: (3)     ║  │ │
│  │ │                            │ │ ╚════════════════════════╝  │ │
│  │ │                            │ │                              │ │
│  │ │                            │ │ ✅ Información detectada     │ │
│  │ │ [1250/5000 caracteres]     │ │    correctamente             │ │
│  │ └────────────────────────────┘ │                              │ │
│  │                                 │ 💡 Tip:                     │ │
│  │ 📌 Puedes pegar desde:         │ Incluye toda la información  │ │
│  │ • LinkedIn                     │ para mejores resultados      │ │
│  │ • InfoJobs                     │                              │ │
│  │ • Indeed                       │                              │ │
│  │ • Email de reclutador          │                              │ │
│  │                                 │                              │ │
│  │ [← Atrás]          [Generar →] │                              │ │
│  │                                 │                              │ │
│  └─────────────────────────────────┴──────────────────────────────┘ │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Características Especiales:**

1. **Detección en Tiempo Real:**

   - Mientras el usuario pega/escribe
   - Preview de campos detectados
   - Feedback visual de calidad de datos

2. **Sugerencias de Fuentes:**

   - Iconos de plataformas conocidas
   - Ejemplos de formato

3. **Validación Inteligente:**
   - Detecta si falta información crítica
   - Sugiere qué añadir si es insuficiente

---

### Paso 3: Generación con IA

#### Desktop Layout - Estado de Carga

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                         [Cerrar X]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  (1) ✓  →  (2) ✓  →  (3) Generando...  →  (4) Resultados    │  │
│  │   [✓✓✓✓✓]  [✓✓✓✓✓]    [●●●●●●●●●]         [○○○○○○]          │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│                 ⚡ Generando tu Candidatura Completa                 │
│                 ════════════════════════════════                      │
│                                                                       │
│              Esto tomará aproximadamente 30-45 segundos               │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  ✅ Analizando tu perfil profesional                         │    │
│  │     └─ Completado en 2.3s                                   │    │
│  │                                                              │    │
│  │  ✅ Extrayendo información de la oferta                      │    │
│  │     └─ Completado en 3.1s                                   │    │
│  │                                                              │    │
│  │  ✅ Categorizando información de candidatura                 │    │
│  │     └─ Completado en 1.8s                                   │    │
│  │                                                              │    │
│  │  ⏳ Generando curriculum vitae personalizado...              │    │
│  │     [████████████████░░░░░░░░] 65%                          │    │
│  │     └─ Creando experiencia profesional...                   │    │
│  │                                                              │    │
│  │  ⏳ Creando carta de presentación...                         │    │
│  │     [████████░░░░░░░░░░░░░░░░] 30%                          │    │
│  │     └─ Esperando...                                         │    │
│  │                                                              │    │
│  │  ⏱️ Guardando en base de datos...                            │    │
│  │     └─ Pendiente                                            │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│                      Progreso Total: 48%                              │
│                      [████████████░░░░░░░░░░░░]                      │
│                                                                       │
│                    💡 Sabías que...                                  │
│           Las cartas personalizadas aumentan un 40%                   │
│              las posibilidades de conseguir entrevista                │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Animaciones:**

- Checkmarks aparecen con bounce
- Progress bars se llenan suavemente
- Texto de "Completado en X.Xs" fade-in
- Tips rotan cada 5 segundos

**Estados de Cada Tarea:**

- ⏱️ Pendiente (gris)
- ⏳ En progreso (azul pulsante)
- ✅ Completado (verde con checkmark)
- ❌ Error (rojo con alert)

---

#### Desktop Layout - Error Handling

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                         [Cerrar X]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  (1) ✓  →  (2) ✓  →  (3) Error  →  (4) Resultados           │  │
│  │   [✓✓✓✓✓]  [✓✓✓✓✓]    [!!!!!!!]     [○○○○○○]                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│                          ⚠️ Ups, algo salió mal                      │
│                          ═══════════════════                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  ❌ Error al generar curriculum vitae                        │    │
│  │                                                              │    │
│  │  No pudimos conectar con el servicio de IA.                 │    │
│  │  Por favor, verifica tu conexión a internet e intenta       │    │
│  │  nuevamente.                                                 │    │
│  │                                                              │    │
│  │  Detalles técnicos (para soporte):                          │    │
│  │  Error Code: AI_CONNECTION_TIMEOUT                          │    │
│  │  Timestamp: 2025-10-03 14:32:15                             │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│                    ¿Qué puedes hacer?                                │
│                                                                       │
│        [Reintentar Generación]    [Guardar Borrador]                │
│                                                                       │
│              [← Volver Atrás]    [Contactar Soporte]                │
│                                                                       │
│  💡 Tus datos están guardados. Puedes continuar cuando quieras.     │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Paso 4: Resultados

#### Desktop Layout - Success

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                         [Cerrar X]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  (1) ✓  →  (2) ✓  →  (3) ✓  →  (4) ✓ ¡Completado!          │  │
│  │   [✓✓✓✓✓]  [✓✓✓✓✓]  [✓✓✓✓✓]  [✓✓✓✓✓✓✓]                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│                  🎉 ¡Tu Candidatura Está Lista!                      │
│                  ════════════════════════════                         │
│                                                                       │
│                Creada exitosamente en 38 segundos                     │
│                                                                       │
│  ┌──────────────────────────────┬──────────────────────────────┐    │
│  │ 📄 Curriculum Vitae          │ ✉️ Carta de Presentación     │    │
│  │                              │                              │    │
│  │ ┌──────────────────────────┐│ ┌──────────────────────────┐ │    │
│  │ │ [Preview del CV]         ││ │ [Preview de la Carta]    │ │    │
│  │ │                          ││ │                          │ │    │
│  │ │ USUARIO EJEMPLO          ││ │ Estimados [Empresa],     │ │    │
│  │ │ Desarrollador Full Stack ││ │                          │ │    │
│  │ │                          ││ │ Me dirijo a ustedes...   │ │    │
│  │ │ ════════════             ││ │                          │ │    │
│  │ │ Resumen Profesional      ││ │ Con X años de            │ │    │
│  │ │ Desarrollador...         ││ │ experiencia...           │ │    │
│  │ │                          ││ │                          │ │    │
│  │ │ Experiencia              ││ │ Mis habilidades en...    │ │    │
│  │ │ • Senior Developer...    ││ │                          │ │    │
│  │ │ • ...                    ││ │ Espero poder...          │ │    │
│  │ │                          ││ │                          │ │    │
│  │ └──────────────────────────┘│ └──────────────────────────┘ │    │
│  │                              │                              │    │
│  │ [Ver Completo] [Editar CV]  │ [Ver Completa] [Editar]     │    │
│  │                              │                              │    │
│  └──────────────────────────────┴──────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 📋 Candidatura Guardada                                      │    │
│  │                                                              │    │
│  │ Empresa: Tech Corp                                           │    │
│  │ Puesto: Senior React Developer                               │    │
│  │ Estado: Borrador                                             │    │
│  │                                                              │    │
│  │ [Ver Detalles de Candidatura]                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│              ¿Qué quieres hacer ahora?                               │
│                                                                       │
│     [Editar CV]  [Ver Candidatura]  [Descargar PDF]                 │
│                                                                       │
│          [Crear Otra Generación]  [Volver al Dashboard]             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Animaciones de Éxito:**

- Confetti animation al cargar
- Fade-in de las cards de preview
- Pulse en el botón principal

**Acciones Disponibles:**

1. **Editar CV:** Navega a `/dashboard/resume/:resumeId/edit`
2. **Ver Candidatura:** Navega a `/dashboard/resume/:resumeId/job-applications/:applicationId`
3. **Descargar PDF:** Genera y descarga CV en PDF
4. **Crear Otra:** Reinicia el flujo limpiando datos
5. **Volver al Dashboard:** Navega a `/dashboard`

---

## 🎭 Componentes UI Detallados

### StepIndicator Component

```jsx
// Visual representation
Step 1: Tu Perfil
●────────────────
[Azul brillante]

Step 2: Oferta
      ●─────────
      [Azul brillante]

Step 3: Generación
            ●─────
            [Azul pulsante con spinner]

Step Completado:
✓
[Verde con checkmark]
```

**Props:**

```typescript
interface StepIndicatorProps {
  steps: Array<{
    label: string;
    icon: ReactNode;
    status: 'pending' | 'active' | 'completed' | 'error';
  }>;
  currentStep: number;
}
```

**Estados Visuales:**

- **Pending:** Círculo gris vacío
- **Active:** Círculo azul lleno con spinner
- **Completed:** Checkmark verde
- **Error:** X rojo

---

### ProfileDescriptionInput Component

```jsx
// Visual representation
┌─────────────────────────────────────────────────┐
│ Describe tu perfil profesional                  │
│                                                  │
│ Soy graduado en Ingeniería Informática con 3   │
│ años de experiencia en desarrollo web...        │
│                                                  │
│                                                  │
│                                       [250/1000] │
└─────────────────────────────────────────────────┘
  ├─ ✓ Formación mencionada
  ├─ ✓ Experiencia mencionada
  └─ ⚠️ Añade tecnologías específicas
```

**Features:**

- Auto-resize basado en contenido
- Contador de caracteres dinámico
- Validación en tiempo real con iconos
- Sugerencias contextuales debajo

---

### GenerationProgress Component

```jsx
// Visual representation durante generación
┌─────────────────────────────────────────────────┐
│ ⚡ Generando tu Candidatura Completa            │
│                                                  │
│ ✅ Analizando perfil                     2.3s   │
│ ✅ Extrayendo información oferta        3.1s   │
│ ✅ Categorizando candidatura            1.8s   │
│ ⏳ Generando CV...                              │
│    [████████████████░░░░░░░░] 65%              │
│ ⏱️ Creando carta...                             │
│ ⏱️ Guardando...                                 │
│                                                  │
│ Progreso Total: [████████░░░░] 48%             │
│                                                  │
│ 💡 Sabías que las cartas personalizadas...     │
└─────────────────────────────────────────────────┘
```

**Animaciones:**

- Progress bar se llena suavemente (CSS transition)
- Checkmarks aparecen con bounce animation
- Spinner en tarea activa
- Tips rotan cada 5 segundos

---

### ResultsPreview Component

```jsx
// Split view con tabs o cards
┌────────────────────┬────────────────────┐
│ 📄 CV              │ ✉️ Carta           │
├────────────────────┼────────────────────┤
│                    │                    │
│ [Renderizado del   │ [Renderizado de    │
│  componente        │  la carta con      │
│  ResumePreview     │  formato]          │
│  existente]        │                    │
│                    │                    │
│                    │                    │
│ [Ver Completo]     │ [Ver Completa]     │
│ [Editar]           │ [Editar]           │
│                    │                    │
└────────────────────┴────────────────────┘
```

**Tabs o Cards:**

- Desktop: Dos columnas side-by-side
- Mobile: Tabs para cambiar entre CV y Carta

---

## 🎬 Animaciones y Transiciones

### 1. Entrada de Pasos

```css
@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-container {
  animation: slideInFromRight 0.3s ease-out;
}
```

### 2. Progress Bar

```css
@keyframes fillProgress {
  from {
    width: 0%;
  }
  to {
    width: var(--target-width);
  }
}

.progress-bar {
  animation: fillProgress 0.5s ease-out forwards;
}
```

### 3. Checkmark Success

```css
@keyframes checkmarkPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.checkmark {
  animation: checkmarkPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### 4. Confetti en Success

```javascript
// Usando canvas o librería como react-confetti
import Confetti from 'react-confetti';

<Confetti
  numberOfPieces={200}
  recycle={false}
  run={showConfetti}
  width={windowWidth}
  height={windowHeight}
/>;
```

### 5. Loading Spinner

```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

### 6. Pulse Effect (Generating)

```css
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.generating-text {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 📐 Espaciado y Tipografía

### Espaciado Consistente

```css
/* Sistema de espaciado basado en 8px */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
```

### Tipografía

```css
/* Headings */
.express-h1 {
  font-size: 2.5rem; /* 40px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.express-h2 {
  font-size: 2rem; /* 32px */
  font-weight: 600;
  line-height: 1.3;
}

.express-h3 {
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  line-height: 1.4;
}

/* Body */
.express-body {
  font-size: 1rem; /* 16px */
  line-height: 1.6;
}

.express-body-large {
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
}

.express-small {
  font-size: 0.875rem; /* 14px */
  line-height: 1.5;
}

.express-caption {
  font-size: 0.75rem; /* 12px */
  line-height: 1.4;
}
```

---

## 🎨 Iconografía

### Iconos Utilizados (lucide-react)

| Uso                | Icono | Nombre        |
| ------------------ | ----- | ------------- |
| Generación Express | ⚡    | Zap           |
| Perfil             | 👤    | User          |
| Oferta             | 💼    | Briefcase     |
| Generación         | ⚙️    | Settings/Cog  |
| Resultados         | ✅    | CheckCircle   |
| CV                 | 📄    | FileText      |
| Carta              | ✉️    | Mail          |
| Candidatura        | 📋    | Clipboard     |
| Siguiente          | →     | ArrowRight    |
| Atrás              | ←     | ArrowLeft     |
| Cerrar             | ✕     | X             |
| Éxito              | ✓     | Check         |
| Error              | ⚠️    | AlertTriangle |
| Info               | ℹ️    | Info          |
| Consejo            | 💡    | Lightbulb     |
| Tiempo             | ⏱️    | Clock         |
| Loading            | ⏳    | Loader        |

---

## 🔔 Feedback y Notificaciones

### Toast Notifications (usando Sonner)

```javascript
// Success
toast.success('¡Candidatura generada exitosamente!', {
  description: 'CV y carta guardados correctamente',
  duration: 5000,
});

// Error
toast.error('Error al generar CV', {
  description: 'Por favor, intenta nuevamente',
  action: {
    label: 'Reintentar',
    onClick: () => retry(),
  },
});

// Loading
const toastId = toast.loading('Generando candidatura...', {
  description: 'Esto puede tomar unos segundos',
});

// Update loading
toast.success('¡Completado!', {
  id: toastId,
});

// Info
toast.info('Tip: Menciona tus años de experiencia', {
  duration: 3000,
});
```

### Inline Validation Messages

```jsx
// Success state
<div className="flex items-center gap-2 text-green-600">
  <CheckCircle className="w-4 h-4" />
  <span className="text-sm">Perfil válido</span>
</div>

// Error state
<div className="flex items-center gap-2 text-red-600">
  <AlertTriangle className="w-4 h-4" />
  <span className="text-sm">Campo requerido</span>
</div>

// Warning state
<div className="flex items-center gap-2 text-yellow-600">
  <Info className="w-4 h-4" />
  <span className="text-sm">Añade más detalles para mejores resultados</span>
</div>
```

---

## ♿ Accesibilidad (A11y)

### Principios Aplicados

1. **Navegación por Teclado:**

   - Tab para navegar entre campos
   - Enter para submitir
   - Escape para cerrar modals
   - Arrow keys en stepper

2. **ARIA Labels:**

```jsx
<button
  aria-label="Siguiente paso"
  aria-describedby="step-description"
>
  Siguiente
</button>

<div id="step-description" className="sr-only">
  Completar perfil y continuar al siguiente paso
</div>
```

3. **Focus Management:**

```javascript
// Auto-focus en primer campo al cambiar de paso
useEffect(() => {
  if (currentStep === 1) {
    profileInputRef.current?.focus();
  }
}, [currentStep]);
```

4. **Color Contrast:**

- Todas las combinaciones de texto/fondo cumplen WCAG AA
- Ratio mínimo 4.5:1 para texto normal
- Ratio mínimo 3:1 para texto grande

5. **Screen Reader Support:**

```jsx
<div role="status" aria-live="polite" aria-atomic="true">
  {generationStatus}
</div>
```

---

## 📱 Responsive Adaptations

### Mobile-Specific Features

1. **Stepper Compacto:**

```
● ─ ─ ─ ─ ─ ─
1  2  3  4
```

Solo números, sin labels (labels abajo)

2. **Inputs Full-Width:**

```jsx
<Textarea
  className="w-full min-h-[200px]"
  // En mobile se expande más
/>
```

3. **Botones Fixed en Bottom:**

```jsx
<div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
  <Button className="w-full">Siguiente</Button>
</div>
```

4. **Preview en Modal (Mobile):**

```jsx
<Dialog>
  <DialogTrigger>Ver Vista Previa</DialogTrigger>
  <DialogContent>{/* Preview content */}</DialogContent>
</Dialog>
```

### Tablet Adaptations

- Layout de 1 columna pero más espacioso
- Stepper horizontal completo
- Botones de mayor tamaño
- Preview inline opcional

---

## 🎯 Microinteracciones

### 1. Hover Effects

```css
.express-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s ease;
}
```

### 2. Active States

```css
.express-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}
```

### 3. Focus Rings

```css
.express-input:focus {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

### 4. Loading States

```jsx
<Button disabled={isLoading}>
  {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
  {isLoading ? 'Generando...' : 'Generar'}
</Button>
```

---

## 🎨 Design Tokens

### Resumen de Tokens

```javascript
const EXPRESS_TOKENS = {
  colors: {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '150ms ease',
    base: '250ms ease',
    slow: '350ms ease',
  },
};
```

---

## 📝 Copy Writing

### Mensajes Clave

| Contexto                | Mensaje                                              |
| ----------------------- | ---------------------------------------------------- |
| Dashboard Card Title    | Generación Express                                   |
| Dashboard Card Subtitle | Crea tu CV completo en 5 minutos                     |
| Step 1 Title            | Tu Perfil Profesional                                |
| Step 1 Subtitle         | Cuéntanos sobre ti para crear tu CV personalizado    |
| Step 2 Title            | Información de la Oferta                             |
| Step 2 Subtitle         | Pega la información completa de la oferta de trabajo |
| Step 3 Title            | Generando tu Candidatura                             |
| Step 3 Subtitle         | Esto tomará aproximadamente 30-45 segundos           |
| Step 4 Title            | ¡Tu Candidatura Está Lista!                          |
| Step 4 Subtitle         | Creada exitosamente en X segundos                    |
| Success Toast           | ¡Candidatura generada exitosamente!                  |
| Error Toast             | Error al generar candidatura                         |
| Loading Button          | Generando...                                         |
| CTA Button              | Comenzar                                             |
| Next Button             | Siguiente                                            |
| Back Button             | Atrás                                                |
| Finish Button           | Ir al Dashboard                                      |

---

## 🎉 Conclusión del Diseño

Este diseño detallado proporciona:

✅ **Claridad Visual:** Cada paso es obvio y autoexplicativo  
✅ **Feedback Constante:** El usuario siempre sabe qué está pasando  
✅ **Confianza:** Guardado automático y mensajes tranquilizadores  
✅ **Delight:** Animaciones sutiles que hacen la experiencia agradable  
✅ **Accesibilidad:** Cumple estándares WCAG y es keyboard-friendly  
✅ **Responsive:** Funciona perfectamente en todos los dispositivos  
✅ **Consistente:** Usa el design system existente de shadcn/ui

**Siguiente paso:** Revisar la [Guía de Implementación](./GUIA_IMPLEMENTACION.md) para comenzar a construir.

---

**Versión:** 1.0  
**Fecha:** 3 de Octubre, 2025  
**Estado:** Aprobado para Implementación
