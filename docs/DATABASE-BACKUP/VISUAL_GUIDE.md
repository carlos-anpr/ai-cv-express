# 📸 Guía Visual - Copias de Seguridad

## 🎯 Acceso Rápido

### Desde el Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Mis Currículums              [🗄️ Copias de Seguridad] │
├─────────────────────────────────────────────────────────┤
│  📊 Estadísticas                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐               │
│  │  5   │  │  12  │  │  8   │  │  0   │               │
│  │ CVs  │  │Candid│  │Cartas│  │Limpia│               │
│  └──────┘  └──────┘  └──────┘  └──────┘               │
└─────────────────────────────────────────────────────────┘
```

**URL**: `/dashboard/backup`

---

## 📤 Exportar Datos

### Panel de Exportación

```
┌─────────────────────────────────────────────────┐
│  ⚡ Exportar Datos                              │
│                                                 │
│  Descarga una copia de seguridad completa      │
│  de todos tus CVs, candidaturas y cartas       │
│  de presentación. Se eliminan automáticamente  │
│  los datos huérfanos.                          │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │     [📥] Exportar Base de Datos          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ✅ ¡Exportación exitosa!                      │
│     ✓ 5 CVs exportados                         │
│     ✓ 12 candidaturas exportadas               │
│     ✓ 8 cartas exportadas                      │
│     ⚠ 2 candidaturas huérfanas eliminadas      │
└─────────────────────────────────────────────────┘
```

### Archivo Generado

```
📄 resume-backup-usuario-2025-10-08.json
   Tamaño: ~500 KB
   Formato: JSON
```

---

## 📥 Importar Datos

### Panel de Importación

```
┌─────────────────────────────────────────────────┐
│  ⚡ Importar Datos                              │
│                                                 │
│  Restaura una copia de seguridad anterior.     │
│  Se detectan automáticamente los duplicados    │
│  y puedes elegir cómo gestionarlos.            │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │     [📤] Seleccionar Archivo             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [▓▓▓▓▓▓▓▓▓░░░░░] 70%                          │
│  Procesando archivo... 70%                     │
└─────────────────────────────────────────────────┘
```

### Diálogo de Duplicados

```
┌─────────────────────────────────────────────────┐
│  ⚠️ Duplicados Detectados                       │
├─────────────────────────────────────────────────┤
│  Se encontraron elementos que ya existen en tu │
│  base de datos. Elige cómo deseas proceder:    │
│                                                 │
│  📊 Resumen de duplicados:                     │
│     • 2 CVs duplicados                         │
│     • 3 candidaturas duplicadas                │
│     • 1 cartas duplicadas                      │
│                                                 │
│  📄 CVs duplicados:                            │
│  ┌───────────────────────────────────────────┐ │
│  │  Desarrollador Full Stack                 │ │
│  │  ID: abc-123-def                          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │  Cancelar  │ │  Omitir    │ │ Nuevos IDs │ │
│  │            │ │ Duplicados │ │  ✅        │ │
│  └────────────┘ └────────────┘ └────────────┘ │
└─────────────────────────────────────────────────┘
```

### Resultado de Importación

```
┌─────────────────────────────────────────────────┐
│  ✅ ¡Importación completada!                    │
│                                                 │
│     ✓ 3 CVs importados (2 omitidos)            │
│     ✓ 8 candidaturas importadas (3 omitidas)   │
│     ✓ 5 cartas importadas (1 omitida)          │
└─────────────────────────────────────────────────┘
```

---

## 🧹 Limpiar Datos Huérfanos

### Panel de Limpieza

```
┌─────────────────────────────────────────────────┐
│  🗑️ Limpiar Datos Huérfanos                     │
│                                                 │
│  Elimina candidaturas y cartas de presentación │
│  que no están asociadas a ningún CV.           │
│  Esta operación es irreversible, se            │
│  recomienda hacer una exportación antes.       │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │     [🗑️] Limpiar Ahora                    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ⚠️ Limpieza completada                        │
│     🗑️ 2 candidaturas huérfanas eliminadas     │
│     🗑️ 1 cartas huérfanas eliminadas           │
│     🗑️ 0 simulaciones huérfanas eliminadas     │
└─────────────────────────────────────────────────┘
```

---

## 📊 Widget de Estadísticas

### Vista en Dashboard

```
┌──────────────────────────────────────────────────────────┐
│  📊 📊 📊 📊                                              │
├──────────┬──────────┬──────────┬──────────────────────────┤
│  📝 5   │  💼 12  │  ✉️ 8   │  ⚠️ 2                      │
│  CVs    │  Candid │  Cartas  │  Datos huérfanos          │
└──────────┴──────────┴──────────┴──────────────────────────┘
```

### Estados

#### Base Limpia ✅

```
┌──────────┐
│  ✅ 0   │
│  Limpia  │
└──────────┘
```

#### Con Datos Huérfanos ⚠️

```
┌──────────┐
│  ⚠️ 3   │
│  Huérfanos│
└──────────┘
```

---

## 🔄 Flujo de Trabajo Recomendado

### 1. Exportación Regular

```
📅 Semanal o antes de cambios importantes
    ↓
🔽 Exportar Base de Datos
    ↓
💾 Guardar archivo en lugar seguro
    ↓
✅ Archivo: resume-backup-usuario-2025-10-08.json
```

### 2. Antes de Limpiar

```
⚠️ Detectados datos huérfanos
    ↓
🔽 Exportar Base de Datos (por seguridad)
    ↓
🧹 Limpiar Datos Huérfanos
    ↓
✅ Base de datos optimizada
```

### 3. Restauración

```
💾 Tengo un archivo de backup
    ↓
🔼 Seleccionar Archivo
    ↓
🔍 Sistema detecta duplicados
    ↓
⚙️ Elegir: Omitir o Nuevos IDs
    ↓
✅ Datos restaurados
```

---

## 🎨 Esquema de Colores

### Elementos Principales

```css
/* Fondo */
bg-background: Fondo principal
bg-secondary/30: Fondo de tarjetas

/* Bordes */
border-border: Bordes normales
hover:border-black/20: Bordes al hover

/* Botones */
bg-black text-white: Botón principal
hover:bg-black/90: Hover del botón
```

### Estados y Alertas

```css
/* Éxito */
bg-green-50 border-green-200: Fondo de alerta
text-green-600: Iconos y textos

/* Advertencia */
bg-orange-50 border-orange-200: Fondo de alerta
text-orange-600: Iconos y textos

/* Información */
bg-blue-50 border-blue-200: Fondo de alerta
text-blue-600: Iconos y textos
```

---

## 🚦 Indicadores Visuales

### Iconos por Función

| Icono | Función     | Color          |
| ----- | ----------- | -------------- |
| 📥    | Exportar    | Negro          |
| 📤    | Importar    | Negro          |
| 🗑️    | Limpiar     | Naranja        |
| ✅    | Éxito       | Verde          |
| ⚠️    | Advertencia | Naranja        |
| ❌    | Error       | Rojo           |
| 🔄    | Procesando  | Azul (animado) |

### Barras de Progreso

```
Procesando... [▓▓▓▓▓▓▓░░░] 70%
              └────────────┘
              Barra animada con gradiente
```

---

## 📱 Responsive Design

### Desktop (> 1024px)

```
┌─────────────────────────────────────────────┐
│  [Exportar]    [Importar]                   │
│                                              │
│  [Limpiar                 ]                 │
└─────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

```
┌───────────────────────────┐
│  [Exportar]   [Importar]  │
│                            │
│  [Limpiar                 ]│
└───────────────────────────┘
```

### Mobile (< 768px)

```
┌─────────────────┐
│  [Exportar]     │
│                 │
│  [Importar]     │
│                 │
│  [Limpiar]      │
└─────────────────┘
```

---

## ⌨️ Atajos de Teclado (Futuro)

| Atajo      | Acción         |
| ---------- | -------------- |
| `Ctrl + E` | Exportar       |
| `Ctrl + I` | Importar       |
| `Ctrl + L` | Limpiar        |
| `Escape`   | Cerrar diálogo |

---

**Nota**: Esta guía visual está diseñada para ASCII art. Las interfaces reales tienen gráficos modernos y colores profesionales.
