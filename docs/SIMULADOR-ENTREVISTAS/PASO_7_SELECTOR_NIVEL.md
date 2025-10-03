# 📊 PASO 7: Selector de Nivel de Entrevista

**Fecha de Implementación:** 3 de Octubre, 2025  
**Estado:** ✅ COMPLETADO

---

## 🎯 Objetivo

Permitir al usuario cambiar manualmente el nivel de dificultad de la entrevista (Junior, Mid, Senior), regenerando automáticamente el test con preguntas ajustadas al nivel seleccionado.

---

## 🆕 Nueva Funcionalidad

### Características Principales

1. **Selector de Nivel Visual**

   - Dropdown con 3 opciones: Junior, Mid, Senior
   - Badge colorido indicando el nivel actual
   - Iconos distintivos por nivel (📗 Junior, 📘 Mid, 📕 Senior)

2. **Regeneración Automática**

   - Al cambiar el nivel, se regenera el test completo
   - Confirmación antes de eliminar el test actual
   - Loading state durante la regeneración

3. **Persistencia del Nivel**
   - El nivel seleccionado se guarda en la base de datos
   - Se mantiene entre sesiones

---

## 🔧 Cambios Técnicos Realizados

### 1. **InterviewTestGenerator.js** (Modificado)

#### Método `generatePrompt()` actualizado

**Antes:**

```javascript
static generatePrompt(resumeData, jobApplication) {
  // Solo detección automática
}
```

**Después:**

```javascript
static generatePrompt(resumeData, jobApplication, forcedLevel = null) {
  // Acepta nivel forzado por el usuario
  const levelInstruction = forcedLevel
    ? `
⚠️ IMPORTANTE: EL USUARIO HA SELECCIONADO MANUALMENTE EL NIVEL "${forcedLevel.toUpperCase()}"
   Debes generar preguntas específicamente para nivel ${forcedLevel}, ignorando cualquier
   detección automática del nivel. Ajusta la dificultad y complejidad de las preguntas
   a este nivel específico.
`
    : '';
}
```

**Cambios:**

- ✅ Nuevo parámetro `forcedLevel` (opcional)
- ✅ Instrucción especial en el prompt cuando hay nivel forzado
- ✅ Retrocompatible: si no se pasa nivel, funciona como antes

---

### 2. **interview-simulation/index.jsx** (Modificado)

#### Nuevo Estado

```javascript
const [selectedLevel, setSelectedLevel] = useState(null);
```

Almacena temporalmente el nivel seleccionado por el usuario.

---

#### Nueva Función: `handleChangeLevel()`

```javascript
const handleChangeLevel = async (newLevel) => {
  if (!newLevel) return;

  if (
    !confirm(
      `¿Regenerar el test con nivel "${newLevel.toUpperCase()}"? El test actual se eliminará.`
    )
  ) {
    return;
  }

  try {
    setGenerating(true);
    setSelectedLevel(newLevel);

    console.log(`🔄 Regenerando test con nivel: ${newLevel}`);

    // Eliminar simulación actual
    if (simulation?.id) {
      await LocalDatabase.DeleteInterviewSimulation(
        simulation.id,
        user.primaryEmailAddress.emailAddress
      );
      console.log('✅ Simulación anterior eliminada');
    }

    // Generar nuevo test con el nivel seleccionado
    setSimulation(null);
    await handleGenerateTest(newLevel);

    toast.success(`Test regenerado con nivel ${newLevel}`);
  } catch (error) {
    console.error('❌ Error cambiando nivel:', error);
    toast.error('Error al cambiar el nivel del test');
    setGenerating(false);
  }
};
```

**Flujo:**

1. Confirma con el usuario (elimina test actual)
2. Guarda el nuevo nivel en el estado
3. Elimina la simulación actual de la DB
4. Llama a `handleGenerateTest()` pasando el nuevo nivel
5. Muestra notificación de éxito

---

#### Función `handleGenerateTest()` actualizada

**Antes:**

```javascript
const handleGenerateTest = async () => {
  const prompt = InterviewTestGenerator.generatePrompt(resumeData, application);
  // ...
};
```

**Después:**

```javascript
const handleGenerateTest = async (levelOverride = null) => {
  console.log('🤖 Iniciando generación de test con IA...');
  if (levelOverride) {
    console.log(`📊 Nivel forzado por usuario: ${levelOverride}`);
  }

  const prompt = InterviewTestGenerator.generatePrompt(
    resumeData,
    application,
    levelOverride || selectedLevel // ← Usa nivel forzado si existe
  );
  // ...
};
```

**Cambios:**

- ✅ Nuevo parámetro `levelOverride` (opcional)
- ✅ Pasa el nivel a `generatePrompt()`
- ✅ Logging del nivel forzado

---

#### Función `handleDelete()` actualizada

```javascript
const handleDelete = async () => {
  // ...
  setSimulation(null);
  setSelectedLevel(null); // ← Limpia nivel seleccionado
  toast.success('Test eliminado correctamente');
  // ...
};
```

Limpia el estado del nivel seleccionado al eliminar.

---

### 3. **UI: Selector de Nivel** (Nuevo)

#### Imports Agregados

```javascript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
```

---

#### Componente Visual

```jsx
{/* Selector de Nivel */}
<div className="mt-4 flex items-center gap-3">
  <div className="flex items-center gap-2">
    <Target className="w-4 h-4 text-gray-500" />
    <span className="text-sm font-medium text-gray-700">
      Nivel de Entrevista:
    </span>
  </div>

  <Select
    value={simulation.candidateLevel}
    onValueChange={handleChangeLevel}
    disabled={generating}
  >
    <SelectTrigger className="w-[140px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="junior">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Junior
        </div>
      </SelectItem>
      <SelectItem value="mid">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Mid
        </div>
      </SelectItem>
      <SelectItem value="senior">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Senior
        </div>
      </SelectItem>
    </SelectContent>
  </Select>

  <Badge
    variant="outline"
    className={
      simulation.candidateLevel === 'junior'
        ? 'bg-green-50 text-green-700 border-green-300'
        : simulation.candidateLevel === 'mid'
        ? 'bg-blue-50 text-blue-700 border-blue-300'
        : 'bg-purple-50 text-purple-700 border-purple-300'
    }
  >
    {simulation.candidateLevel === 'junior' && '📗'}
    {simulation.candidateLevel === 'mid' && '📘'}
    {simulation.candidateLevel === 'senior' && '📕'}
    {' '}
    Nivel {simulation.candidateLevel}
  </Badge>
</div>

<p className="text-xs text-gray-500 mt-2">
  💡 Cambia el nivel para regenerar el test con preguntas de diferente dificultad
</p>
```

**Características UI:**

- ✅ Selector dropdown con 3 opciones
- ✅ Badge colorido con emoji según nivel
- ✅ Tooltip explicativo
- ✅ Deshabilitado durante generación
- ✅ Iconos visuales (Target, TrendingUp)

---

## 🎨 Paleta de Colores por Nivel

| Nivel      | Color Base | Fondo Badge    | Texto Badge       | Borde Badge         | Emoji |
| ---------- | ---------- | -------------- | ----------------- | ------------------- | ----- |
| **Junior** | Verde      | `bg-green-50`  | `text-green-700`  | `border-green-300`  | 📗    |
| **Mid**    | Azul       | `bg-blue-50`   | `text-blue-700`   | `border-blue-300`   | 📘    |
| **Senior** | Púrpura    | `bg-purple-50` | `text-purple-700` | `border-purple-300` | 📕    |

---

## 🔄 Flujo de Usuario

### Escenario 1: Cambiar de Mid a Senior

```
1. Usuario ve test con nivel "mid"
   ↓
2. Abre selector y selecciona "senior"
   ↓
3. Sistema muestra confirmación:
   "¿Regenerar el test con nivel SENIOR? El test actual se eliminará."
   ↓
4. Usuario confirma (OK)
   ↓
5. Sistema muestra loading spinner
   ↓
6. Sistema elimina test actual de DB
   ↓
7. Sistema genera prompt con instrucción:
   "⚠️ IMPORTANTE: EL USUARIO HA SELECCIONADO MANUALMENTE EL NIVEL SENIOR"
   ↓
8. Gemini genera 5 preguntas de nivel senior
   ↓
9. Sistema guarda nuevo test en DB con candidateLevel="senior"
   ↓
10. Sistema muestra nuevo test
    ↓
11. Toast: "Test regenerado con nivel senior"
```

---

### Escenario 2: Usuario cancela cambio

```
1. Usuario selecciona "junior" en el dropdown
   ↓
2. Sistema muestra confirmación
   ↓
3. Usuario cancela (Cancelar)
   ↓
4. Selector vuelve al nivel anterior
   ↓
5. No se modifica nada
```

---

## 🧪 Casos de Prueba

### Test 1: Cambiar de Mid a Junior ✅

**Setup:**

- Test existente con nivel "mid"

**Pasos:**

1. Abrir selector
2. Seleccionar "junior"
3. Confirmar en el diálogo

**Resultado Esperado:**

- Test eliminado
- Nuevo test generado con preguntas más básicas
- Badge muestra "📗 Nivel junior" en verde
- Toast: "Test regenerado con nivel junior"

---

### Test 2: Cambiar de Junior a Senior ✅

**Setup:**

- Test existente con nivel "junior"

**Pasos:**

1. Abrir selector
2. Seleccionar "senior"
3. Confirmar

**Resultado Esperado:**

- Preguntas más complejas (arquitectura, liderazgo, decisiones estratégicas)
- Badge muestra "📕 Nivel senior" en púrpura
- Prompt incluye: "⚠️ IMPORTANTE: EL USUARIO HA SELECCIONADO MANUALMENTE EL NIVEL SENIOR"

---

### Test 3: Cancelar cambio de nivel ✅

**Setup:**

- Test existente con nivel "mid"

**Pasos:**

1. Abrir selector
2. Seleccionar "senior"
3. Cancelar en el diálogo

**Resultado Esperado:**

- Test NO se modifica
- Selector vuelve a mostrar "mid"
- No hay toast de error

---

### Test 4: Nivel durante generación ✅

**Setup:**

- Test en proceso de generación (loading=true)

**Pasos:**

1. Intentar abrir selector

**Resultado Esperado:**

- Selector está deshabilitado (`disabled={generating}`)
- No se puede cambiar el nivel

---

## 📊 Diferencias entre Niveles

### Junior (0-3 años)

```
Preguntas Técnicas:
- Conceptos básicos de la tecnología
- Sintaxis y APIs fundamentales
- Debugging simple
- Implementaciones guiadas

Ejemplo:
"Explica cómo crearías una ruta GET en Express.js para listar usuarios"
```

### Mid (3-6 años)

```
Preguntas Técnicas:
- Patrones de diseño
- Optimización de rendimiento
- Manejo de errores avanzado
- Decisiones técnicas justificadas

Ejemplo:
"Describe cómo implementarías un sistema de caché con Redis para optimizar
 consultas frecuentes en una API con 10K requests/hora"
```

### Senior (6+ años)

```
Preguntas Técnicas:
- Arquitectura de sistemas
- Escalabilidad y alta disponibilidad
- Trade-offs técnicos
- Liderazgo técnico

Ejemplo:
"Diseña la arquitectura de un sistema de procesamiento de pagos que maneje
 100K transacciones/día con garantías de consistencia eventual"
```

---

## 🔐 Seguridad y Validación

### ✅ Validaciones Implementadas

1. **Confirmación Requerida:**

   - Usuario debe confirmar antes de eliminar test actual
   - Previene pérdidas accidentales

2. **Nivel Válido:**

   - Solo acepta: "junior", "mid", "senior"
   - Selector limita opciones (no hay input libre)

3. **Verificación de Propiedad:**

   - `DeleteInterviewSimulation()` verifica que el test pertenece al usuario
   - Usa `user.primaryEmailAddress.emailAddress`

4. **Estado de Generación:**
   - Selector deshabilitado durante `generating=true`
   - Previene múltiples regeneraciones simultáneas

---

## 📈 Métricas de Implementación

| Métrica                        | Valor                   |
| ------------------------------ | ----------------------- |
| **Archivos modificados**       | 2 archivos              |
| **Líneas de código agregadas** | ~100 líneas             |
| **Nuevas funciones**           | 1 (`handleChangeLevel`) |
| **Nuevos imports**             | 2 (Select, TrendingUp)  |
| **Nuevos estados**             | 1 (`selectedLevel`)     |
| **Casos de prueba**            | 4 escenarios            |

---

## 🎨 Diseño Responsivo

### Desktop (> 768px)

```
[Label] [Selector ▼] [Badge] [Regenerar] [Eliminar]
```

### Mobile (< 768px)

```
[Label]
[Selector ▼]
[Badge]

[Regenerar]
[Eliminar]
```

---

## 🐛 Problemas Conocidos

### ❌ Ninguno detectado

Todos los casos de prueba pasaron exitosamente.

---

## 🚀 Mejoras Futuras (Opcional)

### 1. **Comparación de Niveles**

```jsx
<Button onClick={() => setShowComparison(true)}>
  Ver diferencias entre niveles
</Button>
```

Mostrar ejemplo de pregunta junior vs mid vs senior.

---

### 2. **Historial de Niveles**

```javascript
levelHistory: [
  { level: 'junior', generatedAt: '2025-10-01' },
  { level: 'mid', generatedAt: '2025-10-02' },
  { level: 'senior', generatedAt: '2025-10-03' },
];
```

Permitir volver a un test anterior sin regenerar.

---

### 3. **Nivel Personalizado**

```jsx
<Input
  placeholder="Años de experiencia"
  type="number"
  onChange={(e) => detectCustomLevel(e.target.value)}
/>
```

Detectar nivel basado en años de experiencia ingresados.

---

### 4. **Preview de Preguntas**

```jsx
<Popover>
  <PopoverTrigger>
    <Info className="w-4 h-4" />
  </PopoverTrigger>
  <PopoverContent>
    Ejemplo de pregunta senior: "Diseña la arquitectura de..."
  </PopoverContent>
</Popover>
```

Mostrar ejemplo sin regenerar.

---

## 📚 Documentación de API

### `InterviewTestGenerator.generatePrompt()`

```typescript
/**
 * Genera el prompt completo para Gemini AI
 *
 * @param {Object} resumeData - Datos del CV (contexto adicional)
 * @param {Object} jobApplication - Datos de la candidatura (PRINCIPAL)
 * @param {string|null} forcedLevel - Nivel forzado: "junior"|"mid"|"senior"|null
 * @returns {string} Prompt formateado para Gemini
 *
 * @example
 * // Detección automática
 * const prompt = generatePrompt(cv, application);
 *
 * // Nivel forzado
 * const prompt = generatePrompt(cv, application, "senior");
 */
static generatePrompt(resumeData, jobApplication, forcedLevel = null)
```

---

### `handleChangeLevel()`

```typescript
/**
 * Cambia el nivel del test y regenera con nuevas preguntas
 *
 * @param {string} newLevel - Nuevo nivel: "junior"|"mid"|"senior"
 * @returns {Promise<void>}
 *
 * @throws {Error} Si falla la eliminación o generación
 *
 * @example
 * await handleChangeLevel("senior");
 * // → Elimina test actual
 * // → Genera nuevo test con nivel senior
 * // → Muestra toast de éxito
 */
const handleChangeLevel = async(newLevel);
```

---

## ✅ Checklist de Implementación

- [x] Modificar `generatePrompt()` para aceptar nivel forzado
- [x] Agregar instrucción especial en prompt cuando hay nivel forzado
- [x] Crear estado `selectedLevel`
- [x] Crear función `handleChangeLevel()`
- [x] Modificar `handleGenerateTest()` para usar nivel
- [x] Modificar `handleDelete()` para limpiar nivel
- [x] Importar componentes Select
- [x] Crear UI del selector
- [x] Agregar badges coloridos por nivel
- [x] Agregar tooltip explicativo
- [x] Deshabilitar selector durante generación
- [x] Probar cambio Junior → Mid
- [x] Probar cambio Mid → Senior
- [x] Probar cancelación de cambio
- [x] Probar selector deshabilitado durante loading
- [x] Crear documentación (este archivo)

---

## 🎉 Resultado Final

### Antes

```
Test generado con nivel "mid" (detectado automáticamente)
No se puede cambiar el nivel
```

### Después

```
Test generado con nivel "mid"
[Selector ▼ Junior / Mid / Senior]
💡 Cambia el nivel para regenerar con diferente dificultad

Usuario selecciona "senior"
→ Confirmación
→ Regeneración automática
→ Nuevas preguntas de nivel senior
→ Badge actualizado: 📕 Nivel senior
```

---

**Funcionalidad implementada exitosamente** ✅  
**Fecha:** 3 de Octubre, 2025  
**Versión:** 1.0
