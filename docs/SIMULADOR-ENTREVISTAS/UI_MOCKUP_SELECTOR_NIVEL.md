# 🎨 UI Mock-up: Selector de Nivel de Entrevista

## Vista Desktop (> 768px)

### Estado 1: Test con nivel "Mid" (antes de cambiar)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  ← Volver                                    Test de Preparación para Entrevista│
└────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│  Test de Preparación                                    [↻ Regenerar] [🗑️ Eliminar] │
│  Generado el 3 de octubre de 2025                                             │
│                                                                                │
│  🎯 Nivel de Entrevista:  [ Mid         ▼ ]  📘 Nivel mid                    │
│  💡 Cambia el nivel para regenerar el test con preguntas de diferente dificultad│
└────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│  ┃  técnica    intermedia                                                      │
│  ┃                                                                             │
│  ┃  1. Describe cómo implementarías un sistema de caché con Redis para        │
│  ┃     optimizar consultas frecuentes en una API con 10K requests/hora        │
│  ┃                                                                             │
│  ┃  ✅ Respuesta Sugerida:                                                     │
│  ┃     Implementaría Redis como capa de caché entre la API y MongoDB...       │
│  ┃                                                                             │
│  ┃  💡 Explicación:                                                            │
│  ┃     Esta respuesta demuestra conocimiento práctico de Redis y estrategias  │
│  ┃     de optimización...                                                      │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Estado 2: Dropdown abierto (usuario interactuando)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Test de Preparación                                    [↻ Regenerar] [🗑️ Eliminar] │
│  Generado el 3 de octubre de 2025                                             │
│                                                                                │
│  🎯 Nivel de Entrevista:  ┌──────────────┐  📘 Nivel mid                     │
│  💡 Cambia el nivel...     │  ↗ Junior    │                                   │
│                            │  ✓ Mid       │ ← Seleccionado actualmente       │
│                            │  ↗ Senior    │                                   │
│                            └──────────────┘                                   │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Estado 3: Confirmación (usuario seleccionó "Senior")

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│                    ┌──────────────────────────────────┐                       │
│                    │  ⚠️  Confirmar Cambio de Nivel   │                       │
│                    │                                  │                       │
│                    │  ¿Regenerar el test con nivel    │                       │
│                    │  "SENIOR"? El test actual se     │                       │
│                    │  eliminará permanentemente.       │                       │
│                    │                                  │                       │
│                    │   [  Cancelar  ]  [ ✓ Aceptar ] │                       │
│                    └──────────────────────────────────┘                       │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Estado 4: Regenerando (loading)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│                              ⚡ Loading...                                     │
│                                                                                │
│                    Generando Test Personalizado                               │
│                                                                                │
│        La IA está analizando tu CV y el puesto para crear                     │
│        preguntas relevantes de nivel SENIOR...                                │
│                                                                                │
│                   Esto puede tardar 10-20 segundos                            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Estado 5: Test regenerado con nivel "Senior"

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Test de Preparación                                    [↻ Regenerar] [🗑️ Eliminar] │
│  Generado el 3 de octubre de 2025                                             │
│                                                                                │
│  🎯 Nivel de Entrevista:  [ Senior      ▼ ]  📕 Nivel senior                 │
│  💡 Cambia el nivel para regenerar el test con preguntas de diferente dificultad│
└────────────────────────────────────────────────────────────────────────────────┘

[🎊 Toast Notification]
Test regenerado con nivel senior ✓

┌────────────────────────────────────────────────────────────────────────────────┐
│  ┃  técnica    avanzada                                                        │
│  ┃                                                                             │
│  ┃  1. Diseña la arquitectura de un sistema de procesamiento de pagos que     │
│  ┃     maneje 100K transacciones/día con garantías de consistencia eventual   │
│  ┃                                                                             │
│  ┃  ✅ Respuesta Sugerida:                                                     │
│  ┃     Diseñaría una arquitectura distribuida con microservicios usando       │
│  ┃     Event Sourcing y CQRS para manejar el alto volumen...                  │
│  ┃                                                                             │
│  ┃  💡 Explicación:                                                            │
│  ┃     Esta respuesta demuestra comprensión profunda de arquitecturas         │
│  ┃     distribuidas, patrones avanzados como Event Sourcing...                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Vista Mobile (< 768px)

### Estado: Test con selector de nivel

```
┌──────────────────────────────┐
│  ← Volver          Test      │
└──────────────────────────────┘

┌──────────────────────────────┐
│  Test de Preparación         │
│  Generado: 3 oct 2025        │
│                              │
│  🎯 Nivel de Entrevista:     │
│  [ Mid         ▼ ]           │
│  📘 Nivel mid                │
│                              │
│  💡 Cambia el nivel para     │
│     regenerar con diferente  │
│     dificultad               │
│                              │
│  [ ↻ Regenerar ]             │
│  [ 🗑️ Eliminar  ]            │
└──────────────────────────────┘

┌──────────────────────────────┐
│  ┃ técnica  intermedia       │
│  ┃                           │
│  ┃ 1. Describe cómo...       │
│  ┃                           │
│  ┃ ✅ Respuesta Sugerida:    │
│  ┃    Implementaría...       │
│  ┃                           │
│  ┃ 💡 Explicación:           │
│  ┃    Esta respuesta...      │
└──────────────────────────────┘
```

---

## Componentes UI

### Selector (Select Component)

```
Trigger (cerrado):
┌──────────────────┐
│  Mid          ▼  │
└──────────────────┘

Trigger (abierto):
┌──────────────────┐
│  Mid          ▲  │
└──────────────────┘
  ┌──────────────┐
  │  ↗ Junior    │
  │  ✓ Mid       │ ← con checkmark
  │  ↗ Senior    │
  └──────────────┘
```

---

### Badge por Nivel

```
Junior:
┌──────────────────┐
│ 📗 Nivel junior  │ ← Verde claro
└──────────────────┘

Mid:
┌──────────────────┐
│ 📘 Nivel mid     │ ← Azul claro
└──────────────────┘

Senior:
┌──────────────────┐
│ 📕 Nivel senior  │ ← Púrpura claro
└──────────────────┘
```

---

## Flujo Visual Completo

```
┌─────────────┐
│  Test Mid   │
│  generado   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     Usuario abre dropdown
│  Selector   │─────────────────────────────┐
│  [Mid ▼]    │                             │
└──────┬──────┘                             ▼
       │                            ┌──────────────┐
       │                            │  Junior      │
       │                            │  ✓ Mid       │
       │                            │  Senior  ←───┤ Usuario selecciona
       │                            └──────────────┘
       │
       ▼
┌─────────────┐
│ Confirmación│
│ "¿Regenerar?│ ───[Cancelar]──> Vuelve al selector
│             │
│  [Aceptar]  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Loading    │  (10-20 seg)
│  Spinner ⚡ │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Test Senior │
│  generado   │
│ 📕 Badge    │
│ Toast ✓     │
└─────────────┘
```

---

## Estados del Selector

| Estado       | Visual                  | Descripción                |
| ------------ | ----------------------- | -------------------------- |
| **Default**  | `[ Mid ▼ ]`             | Muestra nivel actual       |
| **Hover**    | `[ Mid ▼ ]` (resaltado) | Indica interacción posible |
| **Abierto**  | `[ Mid ▲ ]` + opciones  | Muestra dropdown           |
| **Disabled** | `[ Mid ▼ ]` (gris)      | Durante generación         |

---

## Colores Exactos (Tailwind)

### Junior (Verde)

```css
Fondo: bg-green-50
Texto: text-green-700
Borde: border-green-300
```

### Mid (Azul)

```css
Fondo: bg-blue-50
Texto: text-blue-700
Borde: border-blue-300
```

### Senior (Púrpura)

```css
Fondo: bg-purple-50
Texto: text-purple-700
Borde: border-purple-300
```

---

## Iconos Usados

| Icono            | Componente   | Uso                         |
| ---------------- | ------------ | --------------------------- |
| `<Target />`     | lucide-react | Label "Nivel de Entrevista" |
| `<TrendingUp />` | lucide-react | Opciones del dropdown       |
| 📗               | Emoji        | Badge nivel Junior          |
| 📘               | Emoji        | Badge nivel Mid             |
| 📕               | Emoji        | Badge nivel Senior          |
| 💡               | Emoji        | Tooltip explicativo         |

---

## Animaciones

### Dropdown

```
Estado cerrado → Estado abierto:
- Fade in (opacity 0 → 1)
- Slide down (translateY -10px → 0)
- Duración: 200ms
```

### Badge al cambiar

```
Nivel mid → Nivel senior:
- Color transition (blue → purple)
- Emoji swap (📘 → 📕)
- Duración: 300ms
```

---

**Documento de referencia visual** 🎨  
**Fecha:** 3 de Octubre, 2025
