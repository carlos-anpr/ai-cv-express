# 📚 Guía de Usuario: Sistema de Preparación para Entrevistas

## 🎯 ¿Qué es esta funcionalidad?

El **Sistema de Preparación para Entrevistas** genera automáticamente un test personalizado de 5 preguntas con respuestas sugeridas y explicaciones, basándose en:

- ✅ Tu CV
- ✅ El puesto al que aplicas
- ✅ Los requisitos del trabajo
- ✅ La descripción del puesto

Todo gracias a **Inteligencia Artificial (Gemini 2.0)** que analiza tus datos y crea preguntas relevantes para ayudarte a prepararte mejor.

---

## 🚀 Cómo Acceder

### Opción 1: Desde el Detalle de la Candidatura

1. Ve a **Dashboard** → **Candidaturas**
2. Click en una candidatura para ver sus detalles
3. En la parte superior derecha verás un botón:
   - 🧠 **"Ver Test de Preparación"** (verde) - Si ya generaste el test
   - ✨ **"Generar Test de Preparación"** (morado) - Si aún no lo has generado

### Opción 2: Desde el Menú de Acciones Rápidas

1. En el listado de candidaturas
2. Click en el botón **"⋮"** (tres puntos) de cualquier candidatura
3. Selecciona **"Test de preparación"** (icono 🧠)

---

## 📋 Requisitos Previos

Para generar un test de preparación, **DEBES** haber completado estos campos en tu candidatura:

### ✅ Campos Obligatorios

| Campo | Mínimo Requerido | ¿Por qué es necesario? |
|-------|------------------|------------------------|
| **Empresa** | Nombre completo | Para contextualizar preguntas sobre la empresa |
| **Puesto** | Título del rol | Para adaptar preguntas al rol específico |
| **Requisitos Específicos** | 50 caracteres | **CRÍTICO**: De aquí se extraen las habilidades técnicas requeridas |
| **Descripción del Puesto** | 50 caracteres | **CRÍTICO**: De aquí se detecta el nivel (Junior/Mid/Senior) y responsabilidades |

### ⚠️ Campos Recomendados (No Obligatorios)

- **Responsabilidades:** Ayuda a generar preguntas más precisas
- **Ubicación:** Contexto adicional
- **Salario:** No afecta la generación

---

## 🎬 Proceso Paso a Paso

### Paso 1: Completa los Datos de tu Candidatura

#### Si los datos están incompletos:

Verás una **advertencia amarilla** con el mensaje:

```
⚠️ No se puede generar el test
Faltan datos obligatorios de la candidatura para poder generar preguntas relevantes

Campos obligatorios faltantes:
❌ Los Requisitos Específicos deben tener al menos 50 caracteres
❌ La Descripción del Puesto debe tener al menos 50 caracteres

¿Por qué son necesarios estos datos?
El sistema de IA necesita información específica sobre las habilidades técnicas
requeridas, el nivel de experiencia y las responsabilidades del puesto para
generar preguntas de entrevista relevantes y personalizadas.

[Completar Datos de la Candidatura]
```

**Acción:** Click en **"Completar Datos de la Candidatura"**

#### Ejemplo de Requisitos Bien Completados:

```
3+ años de experiencia en desarrollo backend con Node.js, Express y MongoDB.
Conocimientos sólidos de arquitecturas RESTful, manejo de bases de datos NoSQL,
integración con APIs de terceros. Experiencia con Docker y CI/CD. Metodología
Scrum y trabajo en equipo.
```

#### Ejemplo de Descripción Bien Completada:

```
Desarrollador backend responsable de diseñar, implementar y mantener servicios
backend escalables. Trabajará en equipo con frontend y DevOps para entregar
funcionalidades de alta calidad. Participará en code reviews, diseño de
arquitectura y mentoría a desarrolladores junior.
```

---

### Paso 2: Genera el Test

Una vez que los datos son suficientes:

1. Click en **"Generar Test de Preparación"** (botón morado con ✨)
2. Verás una pantalla de carga:
   ```
   ✨ Generando Test Personalizado
   La IA está analizando tu CV y el puesto para crear preguntas relevantes...
   ⚡ Esto puede tardar 10-20 segundos
   ```
3. **Espera** mientras la IA genera tu test personalizado

#### ¿Qué está haciendo la IA?

1. **Analiza** los requisitos del puesto para extraer habilidades técnicas
2. **Detecta** tu nivel profesional (Junior, Mid, Senior) basándose en la experiencia y responsabilidades
3. **Identifica** el tipo de rol (Backend, Frontend, Full Stack, DevOps, etc.)
4. **Cruza** tu CV con los requisitos para generar preguntas relevantes
5. **Crea** 5 preguntas con respuestas sugeridas y explicaciones

---

### Paso 3: Revisa tu Test

Una vez generado, verás:

#### Header del Test

```
┌─────────────────────────────────────────────────────────────────┐
│  Test de Preparación                                             │
│  Generado el 3 de octubre de 2025                               │
│  [Nivel: mid]                                                    │
│                                                                   │
│  [🔄 Regenerar]  [🗑️ Eliminar]                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Preguntas (5 en total)

Cada pregunta incluye:

```
┌─────────────────────────────────────────────────────────────────┐
│  [Categoría]  [Dificultad]                                       │
│                                                                   │
│  1. ¿Puedes explicar el patrón MVC y cómo lo has aplicado       │
│     en Node.js?                                                  │
│                                                                   │
│  ✅ Respuesta Sugerida:                                          │
│  El patrón MVC (Modelo-Vista-Controlador) separa la lógica      │
│  de negocio (Modelo), la presentación (Vista) y el control      │
│  de flujo (Controlador). En Node.js con Express, he              │
│  implementado este patrón definiendo rutas que llaman a          │
│  controladores, estos interactúan con modelos de datos           │
│  (usando Mongoose para MongoDB) y devuelven respuestas JSON      │
│  al cliente. Esto mejora la mantenibilidad y escalabilidad.      │
│                                                                   │
│  💡 ¿Por qué esta respuesta?                                     │
│  Esta respuesta demuestra comprensión del patrón MVC,            │
│  experiencia práctica con tecnologías mencionadas en el CV       │
│  (Node.js, Express, MongoDB), y habilidad para explicar          │
│  conceptos técnicos de forma clara. Además, menciona             │
│  beneficios (mantenibilidad, escalabilidad) lo que muestra       │
│  pensamiento más allá del código.                                │
└─────────────────────────────────────────────────────────────────┘
```

#### Categorías de Preguntas

Las preguntas pueden ser de diferentes categorías:

- **Técnicas:** Habilidades específicas del rol
- **Comportamentales:** Trabajo en equipo, resolución de problemas
- **Sobre la Empresa:** Conocimiento del sector/empresa
- **De Experiencia:** Proyectos anteriores, aprendizajes
- **De Situación:** Casos hipotéticos

#### Niveles de Dificultad

- **Básico:** Conceptos fundamentales
- **Intermedio:** Aplicación práctica
- **Avanzado:** Casos complejos, arquitectura

---

### Paso 4: Prepara tu Entrevista

#### Consejos para Usar el Test

Al final del test verás consejos personalizados:

```
🎯 Consejos para la Entrevista

• Practica estas respuestas en voz alta antes de la entrevista
• Personaliza las respuestas con ejemplos de tu experiencia real
• Investiga más sobre [Empresa] antes de la entrevista
• Prepara 2-3 preguntas inteligentes para hacer al entrevistador
```

#### Cómo Estudiar

1. **Lee cada pregunta** detenidamente
2. **Intenta responder mentalmente** antes de leer la respuesta sugerida
3. **Lee la respuesta sugerida** y compara con tu respuesta
4. **Lee la explicación** para entender por qué es una buena respuesta
5. **Personaliza** la respuesta con ejemplos de TU experiencia
6. **Practica en voz alta** varias veces

#### Ejemplo de Personalización

**Respuesta Sugerida:**
> "He trabajado con APIs RESTful usando Express y he implementado autenticación con JWT..."

**Tu Respuesta Personalizada:**
> "En mi proyecto anterior en [Empresa X], desarrollé una API REST con Express para [funcionalidad específica]. Implementé autenticación JWT que manejaba [X] usuarios concurrentes. Un desafío interesante fue [situación real] que resolví [cómo lo resolviste]."

---

## 🔄 Regenerar el Test

¿No te convencen las preguntas? Puedes generar un test completamente nuevo:

1. Click en **"🔄 Regenerar"**
2. Confirma la acción: *"¿Generar un nuevo test? El actual se eliminará permanentemente."*
3. Click en **"Aceptar"**
4. La IA generará 5 preguntas completamente nuevas (10-20 segundos)

**Nota:** El test anterior se eliminará y no podrás recuperarlo.

---

## 🗑️ Eliminar el Test

Si ya no necesitas el test:

1. Click en **"🗑️ Eliminar"**
2. Confirma la acción: *"¿Eliminar este test permanentemente?"*
3. Click en **"Aceptar"**
4. El test se eliminará de tu cuenta

Puedes generar uno nuevo cuando quieras.

---

## 💡 Consejos y Trucos

### Para Obtener Mejores Preguntas

1. **Completa el campo "Requisitos" con detalle:**
   - Lista tecnologías específicas
   - Menciona años de experiencia
   - Incluye frameworks y herramientas
   
2. **Descripción detallada del puesto:**
   - Responsabilidades claras
   - Nivel de autonomía esperado
   - Contexto del equipo

3. **Tu CV debe estar actualizado:**
   - Proyectos recientes
   - Habilidades técnicas actualizadas
   - Experiencia relevante

### Interpretación del Nivel Detectado

La IA detecta automáticamente tu nivel:

| Nivel | Indicadores | Tipo de Preguntas |
|-------|-------------|-------------------|
| **Junior** | 0-2 años experiencia, tareas supervisadas | Conceptos básicos, sintaxis, best practices |
| **Mid** | 3-5 años, autonomía, trabajo en equipo | Aplicación práctica, resolución de problemas, arquitectura básica |
| **Senior** | 6+ años, liderazgo, mentoría | Diseño de sistemas, decisiones arquitectónicas, liderazgo técnico |

---

## ❓ Preguntas Frecuentes (FAQ)

### ¿Cuánto tarda en generar el test?
**Entre 10-20 segundos.** Depende de la carga del servidor de IA.

### ¿Puedo generar múltiples tests para la misma candidatura?
**Sí, pero solo se guarda uno a la vez.** Si regeneras, el anterior se elimina.

### ¿Las preguntas son siempre las mismas?
**No.** Cada generación produce preguntas completamente nuevas.

### ¿Puedo editar las respuestas sugeridas?
**No directamente en la app.** Pero puedes copiar el contenido y adaptarlo a tu estilo.

### ¿El test se guarda automáticamente?
**Sí.** Una vez generado, se guarda en tu cuenta y puedes verlo cuando quieras.

### ¿Funciona sin conexión a internet?
**No.** Necesitas internet para generar el test (llama a la IA). Una vez generado, puedes verlo offline.

### ¿Puedo compartir el test con alguien?
**No hay función de compartir actualmente.** Puedes tomar capturas de pantalla o copiar el texto.

### ¿Cuántas candidaturas puedo tener con test?
**Ilimitadas.** Cada candidatura puede tener su propio test.

---

## 🐛 Resolución de Problemas

### Problema: "No se puede generar el test"

**Causa:** Datos de candidatura insuficientes

**Solución:**
1. Lee los mensajes de error (te dice exactamente qué falta)
2. Click en "Completar Datos de la Candidatura"
3. Añade al menos 50 caracteres en Requisitos y Descripción
4. Guarda los cambios
5. Intenta generar el test nuevamente

---

### Problema: "Error al generar el test"

**Causas posibles:**
- Sin conexión a internet
- Servidor de IA sobrecargado
- Respuesta inválida de la IA

**Solución:**
1. Verifica tu conexión a internet
2. Espera 1-2 minutos
3. Intenta de nuevo
4. Si persiste, recarga la página (F5)

---

### Problema: El botón sigue diciendo "Generar" después de crear el test

**Causa:** La página no se actualizó automáticamente

**Solución:**
1. Recarga la página (F5) o
2. Click en "Volver" y vuelve a entrar

---

### Problema: No veo el botón de "Test de Preparación"

**Causas posibles:**
- Versión antigua de la app
- Cache del navegador

**Solución:**
1. Recarga con Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
2. Limpia la caché del navegador
3. Cierra y vuelve a abrir la aplicación

---

## 📊 Ejemplo Completo: De Candidatura Vacía a Test Generado

### 1. Estado Inicial: Candidatura Básica

```
Empresa: Plexus Tech
Puesto: Backend Developer
Requisitos: Node.js
Descripción: Desarrollador backend
```

**Resultado:** ⚠️ Advertencia - Datos insuficientes

---

### 2. Completar Datos

```
Empresa: Plexus Tech
Puesto: Backend Developer Node.js

Requisitos:
3-5 años de experiencia en desarrollo backend con Node.js y Express.
Conocimientos sólidos de MongoDB, PostgreSQL, arquitecturas RESTful.
Experiencia con Docker, CI/CD pipelines. Familiaridad con metodologías
ágiles (Scrum). Capacidad para trabajar en equipo y comunicar
soluciones técnicas de forma clara.

Descripción:
Buscamos un desarrollador backend mid-level para unirse a nuestro equipo
de producto. Serás responsable de diseñar, desarrollar y mantener APIs
escalables que soporten nuestra aplicación web. Trabajarás en estrecha
colaboración con el equipo de frontend, participarás en code reviews y
contribuirás al diseño de la arquitectura del sistema. Valoramos la
proactividad, el aprendizaje continuo y el trabajo en equipo.
```

**Resultado:** ✅ Datos válidos

---

### 3. Generar Test

Click en **"Generar Test de Preparación"**

**Espera 15 segundos...**

---

### 4. Test Generado

```
Test de Preparación
Generado el 3 de octubre de 2025
[Nivel: mid]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pregunta 1 de 5
[Técnica] [Intermedio]

¿Cómo manejas la autenticación y autorización en una API REST con Node.js?

✅ Respuesta Sugerida:
Utilizo JSON Web Tokens (JWT) para autenticación stateless. El flujo típico es:
usuario envía credenciales, servidor valida y genera un JWT firmado, cliente
almacena el token y lo envía en headers de peticiones subsecuentes. Para
autorización, uso middleware que verifica el token y los permisos del usuario
antes de acceder a recursos protegidos. También implemento refresh tokens para
mantener sesiones seguras sin comprometer UX.

💡 ¿Por qué esta respuesta?
Demuestra conocimiento de JWT (estándar de la industria), comprensión del flujo
completo de auth, consideraciones de seguridad (refresh tokens), y experiencia
implementando autenticación en producción.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[... 4 preguntas más similares ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Consejos para la Entrevista

• Practica estas respuestas en voz alta
• Personaliza con ejemplos de tus proyectos
• Investiga más sobre Plexus Tech
• Prepara preguntas para el entrevistador
```

---

## 🎉 ¡Listo para tu Entrevista!

Ahora tienes un test personalizado con:

- ✅ 5 preguntas relevantes para el puesto
- ✅ Respuestas sugeridas bien estructuradas
- ✅ Explicaciones de por qué son buenas respuestas
- ✅ Nivel de dificultad apropiado
- ✅ Consejos adicionales

**¡Mucha suerte en tu entrevista!** 🚀

---

## 📞 Soporte

Si tienes problemas o sugerencias:

1. Verifica la sección "Resolución de Problemas"
2. Recarga la aplicación (F5)
3. Comprueba tu conexión a internet
4. Asegúrate de que los datos de la candidatura están completos

---

**Versión:** 1.0  
**Última actualización:** 3 de Octubre, 2025
