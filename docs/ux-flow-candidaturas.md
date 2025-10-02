# Flujo de Experiencia de Usuario - Sistema de Candidaturas

## Navegación Principal

### Punto de Entrada

```
Dashboard → [CV Específico] → [Pestaña "Candidaturas"]
```

**Ubicación sugerida:** Nueva pestaña junto a "Editar CV" en la vista de detalle del currículum.

## Pantalla Principal de Candidaturas

### Layout Sugerido

```
┌─────────────────────────────────────────────────────────┐
│ [< Volver al CV]     Candidaturas - Juan Pérez          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [+ Nueva Candidatura]                    🔍 Buscar      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📋 Google - Frontend Developer          [📊 Draft] │ │
│ │ Aplicado: 15 Oct 2024                              │ │
│ │ [✉️ Carta] [🎯 Entrevista] [✏️ Editar] [🗑️]        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🏢 Microsoft - React Developer      [✅ Applied]   │ │
│ │ Aplicado: 12 Oct 2024                              │ │
│ │ [✉️ Ver Carta] [🎯 Practicar] [📞 Interview]       │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Estados Visuales

- **Draft** (Borrador) - Gris
- **Applied** (Enviada) - Azul
- **Interview** (Entrevista) - Naranja
- **Rejected** (Rechazada) - Rojo claro
- **Accepted** (Aceptada) - Verde

## Flujo de Nueva Candidatura

### Paso 1: Datos de la Empresa

```
┌─────────────────────────────────────────────────────────┐
│ Nueva Candidatura - Paso 1 de 2                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🏢 Información de la Empresa                           │
│                                                         │
│ Empresa *: [Google                            ]         │
│ Puesto *:  [Frontend Developer               ]         │
│ Web:       [https://careers.google.com       ]         │
│ Contacto:  [Ana García - HR Manager          ]         │
│                                                         │
│ 📋 Descripción del Trabajo                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Desarrollar interfaces de usuario modernas usando  │ │
│ │ React, TypeScript y herramientas de Google...      │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 🎯 Requisitos Técnicos                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ - React 18+, TypeScript                            │ │
│ │ - 3+ años experiencia                              │ │
│ │ - Testing con Jest                                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 📝 Responsabilidades                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ - Desarrollar componentes reutilizables            │ │
│ │ - Colaborar con el equipo de UX                     │ │
│ │ - Optimizar rendimiento de aplicaciones            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│           [Cancelar]              [Continuar >]        │
└─────────────────────────────────────────────────────────┘
```

### Paso 2: Herramientas de Candidatura

```
┌─────────────────────────────────────────────────────────┐
│ Nueva Candidatura - Paso 2 de 2                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ✅ Datos guardados: Google - Frontend Developer        │
│                                                         │
│ 🛠️ ¿Qué quieres preparar?                              │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✉️ CARTA DE PRESENTACIÓN                            │ │
│ │                                                     │ │
│ │ Estilo:    ( ) Formal  (•) Amigable                │ │
│ │            ( ) Humanizada ( ) Informal              │ │
│ │                                                     │ │
│ │ Longitud:  ( ) Corta   (•) Media   ( ) Larga       │ │
│ │                                                     │ │
│ │           [Generar Carta de Presentación]           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🎯 SIMULACIÓN DE ENTREVISTA                         │ │
│ │                                                     │ │
│ │ Nivel detectado: 🟡 Mid-level                      │ │
│ │ Se generarán ~40 preguntas personalizadas          │ │
│ │                                                     │ │
│ │           [Generar Simulación de Entrevista]       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│           [< Volver]              [Finalizar]          │
└─────────────────────────────────────────────────────────┘
```

## Carta de Presentación Mejorada

### Interfaz Actualizada

```
┌─────────────────────────────────────────────────────────┐
│ Carta de Presentación - Google Frontend Developer      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📊 Configuración                                       │
│ Estilo: [Amigable ▼]    Longitud: [Media ▼]           │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✨ Vista Previa                                     │ │
│ │                                                     │ │
│ │ Estimado equipo de Google,                          │ │
│ │                                                     │ │
│ │ Mi nombre es Juan Pérez y me emociona la            │ │
│ │ posibilidad de formar parte de su equipo como...    │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [🔄 Regenerar]  [✏️ Editar]  [📋 Copiar]  [💾 Guardar] │
└─────────────────────────────────────────────────────────┘
```

### Opciones de Personalización

- **Regenerar**: Nueva carta con mismos parámetros
- **Cambiar estilo**: Actualiza el prompt automáticamente
- **Cambiar longitud**: Regenera con nueva extensión
- **Edición manual**: Editor de texto enriquecido

## Simulación de Entrevista

### Vista de Simulación

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Simulación de Entrevista - Google Frontend Dev      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📊 Progreso: [████████░░] 8/40                         │
│                                                         │
│ 🏷️ Pregunta Técnica - Nivel Mid                        │
│                                                         │
│ "¿Cómo optimizarías el rendimiento de una aplicación    │
│  React que se está volviendo lenta?"                    │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💡 Respuesta Sugerida                               │ │
│ │                                                     │ │
│ │ "Buena pregunta... En mi experiencia, lo primero   │ │
│ │ que haría sería usar las herramientas de           │ │
│ │ desarrollo de React para identificar qué           │ │
│ │ componentes se están re-renderizando               │ │
│ │ innecesariamente..."                               │ │
│ │                                                     │ │
│ │ ✨ Consejos:                                        │ │
│ │ • Menciona React DevTools específicamente          │ │
│ │ • Habla de useMemo y useCallback con ejemplos      │ │
│ │ • No olvides la importancia de medir primero       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│         [< Anterior]    [Siguiente >]    [📝 Notas]    │
└─────────────────────────────────────────────────────────┘
```

### Categorías Visuales

- 🔧 **Técnicas** (16) - Color azul
- 👥 **Comportamentales** (12) - Color verde
- 🏢 **Empresa** (8) - Color morado
- ❓ **Habilidades faltantes** (4) - Color naranja

## Integración con Componentes Existentes

### FormSection.jsx - Nuevo Botón

```jsx
<Button
  onClick={() => navigate(`/dashboard/resume/${resumeId}/job-applications`)}
  className="w-full"
>
  <Briefcase className="h-4 w-4 mr-2" />
  Candidaturas
</Button>
```

### ResumeCardItem.jsx - Acceso Rápido

```jsx
<Button variant="outline" size="sm">
  <Target className="h-4 w-4 mr-1" />
  Candidaturas ({applicationCount})
</Button>
```

## Consideraciones UX/UI

### Principios de Diseño

1. **Progresión Clara**: Pasos numerados y visuales
2. **Contexto Siempre Visible**: Empresa y puesto en header
3. **Acciones Rápidas**: Botones de acción directa
4. **Estado Visual**: Colores y iconos consistentes
5. **Feedback Inmediato**: Loading states y confirmaciones

### Responsive Design

- **Desktop**: Layout a dos columnas para simulación
- **Tablet**: Colapsar configuraciones en acordeón
- **Mobile**: Vista apilada con navegación de pestañas

### Accesibilidad

- **Navegación por teclado** completa
- **Screen reader** friendly
- **Alto contraste** en estados
- **Focus indicators** claros

---

_Este diseño UX optimiza el flujo completo desde la candidatura hasta la preparación de entrevista._
