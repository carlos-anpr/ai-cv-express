# 🧪 Guía de Pruebas - Skills Preview Mejorado

## 📋 **Instrucciones de Prueba**

### **Paso 1: Iniciar la Aplicación**

```bash
npm run dev
```

- ✅ Servidor corriendo en: `http://localhost:5174`

### **Paso 2: Probar el Formulario de Skills**

1. **Acceder al editor de CV:**

   - Crear nuevo CV o editar uno existente
   - Ir a la sección "Skills"

2. **Añadir habilidades de prueba:**

   ```
   Nombre: React.js        Rating: ★★★★★ (5 estrellas)
   Nombre: Python          Rating: ★★★★☆ (4 estrellas)
   Nombre: JavaScript      Rating: ★★★☆☆ (3 estrellas)
   Nombre: CSS             Rating: ★★☆☆☆ (2 estrellas)
   Nombre: HTML            Rating: ★☆☆☆☆ (1 estrella)
   ```

3. **Guardar los cambios**
   - Hacer clic en "Save"
   - Verificar mensaje de éxito

### **Paso 3: Verificar la Vista Previa**

**🔍 En la vista previa del CV, verificar que se muestre:**

1. **Sección Skills con título** y línea divisoria
2. **Para cada habilidad:**
   - ✅ **Nombre:** Visible y bien formateado
   - ✅ **Nivel textual:** Expert, Advanced, Intermediate, Basic, Beginner
   - ✅ **Porcentaje:** 100%, 80%, 60%, 40%, 20%
   - ✅ **Barra de progreso:** Color del tema, ancho proporcional
   - ✅ **Cuadrados de nivel:** 5/5, 4/5, 3/5, 2/5, 1/5
   - ✅ **Indicador numérico:** Level X/5

### **Paso 4: Probar Generación de PDF**

1. **Generar PDF:**

   - Hacer clic en "Download PDF"
   - Esperar la descarga

2. **Verificar en el PDF:**
   - ✅ **Todos los elementos visibles** (no aparecen vacíos)
   - ✅ **Barras de progreso renderizadas** correctamente
   - ✅ **Cuadrados de nivel visibles** y proporcionados
   - ✅ **Texto legible** y bien formateado
   - ✅ **Colores aplicados** según el tema

### **Paso 5: Probar Diferentes Escenarios**

#### **Escenario A: Skills con Rating Alto (Expert)**

```
React.js: 5 estrellas → 100% → Expert → Level 5/5
```

**Esperado:** Barra completa, 5 cuadrados activos, etiqueta "Expert"

#### **Escenario B: Skills con Rating Medio (Intermediate)**

```
Python: 3 estrellas → 60% → Intermediate → Level 3/5
```

**Esperado:** Barra 60%, 3 cuadrados activos, etiqueta "Intermediate"

#### **Escenario C: Skills con Rating Bajo (Basic)**

```
CSS: 2 estrellas → 40% → Basic → Level 2/5
```

**Esperado:** Barra 40%, 2 cuadrados activos, etiqueta "Basic"

### **Paso 6: Verificar Persistencia**

1. **Guardar y recargar:**

   - Guardar el CV
   - Recargar la página
   - Verificar que las skills se mantienen

2. **Navegación:**
   - Ir al dashboard
   - Volver al editor
   - Verificar que no se pierden los datos

## 🐛 **Casos de Prueba de Error**

### **Test 1: Skills sin Rating**

- Añadir skill sin seleccionar estrellas
- **Esperado:** Mostrar "Beginner", 0%, Level 0/5

### **Test 2: Skills con Nombres Largos**

- Añadir skill con nombre muy largo
- **Esperado:** Texto truncado o wrapeado elegantemente

### **Test 3: Muchas Skills**

- Añadir 10+ skills
- **Esperado:** Lista scrolleable o paginada

### **Test 4: Sin Skills**

- No añadir ninguna skill
- **Esperado:** Sección vacía sin errores

## ✅ **Checklist de Validación**

### **Vista Web (Navegador)**

- [ ] Título "Skills" visible
- [ ] Línea divisoria con color del tema
- [ ] Nombre de cada skill legible
- [ ] Etiquetas de nivel (Expert, Advanced, etc.)
- [ ] Porcentajes correctos
- [ ] Barras de progreso proporcionales
- [ ] Cuadrados de nivel apropiados
- [ ] Separadores entre skills
- [ ] Colores del tema aplicados

### **Generación PDF**

- [ ] Sección Skills presente en PDF
- [ ] Nombres de skills visibles
- [ ] Etiquetas de nivel renderizadas
- [ ] Porcentajes incluidos
- [ ] Barras de progreso sólidas
- [ ] Cuadrados de nivel definidos
- [ ] Sin elementos vacíos o faltantes
- [ ] Colores preservados
- [ ] Layout consistente con vista web

### **Funcionalidad**

- [ ] Formulario de skills guarda correctamente
- [ ] Vista previa se actualiza en tiempo real
- [ ] Datos persisten después de guardar
- [ ] Navegación mantiene los datos
- [ ] PDF se genera sin errores
- [ ] Múltiples skills manejan correctamente

## 🎯 **Resultado Esperado Final**

Después de las pruebas, el usuario debe ver:

**En Vista Web:**

```
Skills
────────────────────

React.js                    [Expert]    100%
██████████████████████████████████████    ■■■■■ Level 5/5
────────────────────

Python                   [Advanced]     80%
████████████████████████████████░░░░░░    ■■■■□ Level 4/5
────────────────────

JavaScript            [Intermediate]    60%
████████████████████████░░░░░░░░░░░░░░    ■■■□□ Level 3/5
```

**En PDF:** Exactamente igual, con elementos sólidos y bien definidos.

---

_Guía de pruebas actualizada - Octubre 2025_  
_Para validar: Skills Preview con compatibilidad PDF completa_
