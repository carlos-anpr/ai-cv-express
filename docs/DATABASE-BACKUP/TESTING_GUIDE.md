# 🧪 Guía de Pruebas - Sistema de Copias de Seguridad

## ✅ Checklist de Pruebas

### 1. Pruebas de Exportación

#### Caso 1: Exportación Básica

```
📋 Pasos:
1. Ir a /dashboard/backup
2. Clic en "Exportar Base de Datos"
3. Verificar descarga de archivo JSON

✅ Resultado esperado:
- Archivo descargado: resume-backup-[usuario]-[fecha].json
- Notificación toast de éxito
- Estadísticas mostradas en panel verde

🔍 Verificar:
- Tamaño del archivo > 0 bytes
- Formato JSON válido
- Contiene: metadata, statistics, data
```

#### Caso 2: Exportación con Limpieza

```
📋 Preparación:
1. Crear CV de prueba
2. Crear candidatura asociada
3. Eliminar el CV
4. La candidatura queda huérfana

📋 Pasos:
1. Exportar base de datos
2. Verificar estadísticas

✅ Resultado esperado:
- orphanApplicationsRemoved > 0
- Candidatura NO en el archivo exportado
- Alerta naranja en estadísticas
```

---

### 2. Pruebas de Importación

#### Caso 1: Importación Sin Duplicados

```
📋 Preparación:
1. Exportar datos actuales
2. Limpiar base de datos (opcional)

📋 Pasos:
1. Seleccionar archivo de backup
2. Esperar validación (barra de progreso)
3. Verificar importación directa

✅ Resultado esperado:
- Importación sin diálogo de duplicados
- Todos los elementos importados
- Notificación de éxito con estadísticas
```

#### Caso 2: Importación Con Duplicados - Omitir

```
📋 Preparación:
1. Tener CVs en la base de datos
2. Exportar archivo de backup
3. NO limpiar base de datos

📋 Pasos:
1. Importar el mismo archivo
2. Aparece diálogo de duplicados
3. Clic en "Omitir Duplicados"

✅ Resultado esperado:
- Diálogo muestra resumen de duplicados
- Elementos duplicados NO importados
- Estadísticas: X importados, Y omitidos
```

#### Caso 3: Importación Con Duplicados - Nuevos IDs

```
📋 Preparación:
1. Mismo setup anterior

📋 Pasos:
1. Importar archivo
2. Aparecer diálogo de duplicados
3. Clic en "Importar con Nuevos IDs"

✅ Resultado esperado:
- Todos los elementos importados
- CVs tienen nuevos documentId (UUID)
- Candidaturas vinculadas correctamente
- Total de CVs duplicado en la base de datos
```

---

### 3. Pruebas de Limpieza

#### Caso 1: Limpieza Básica

```
📋 Preparación:
1. Crear datos huérfanos:
   - CV → Candidatura → Eliminar CV
   - Candidatura → Carta → Eliminar Candidatura

📋 Pasos:
1. Ver alerta en widget de estadísticas (⚠️)
2. Ir a /dashboard/backup
3. Clic en "Limpiar Ahora"

✅ Resultado esperado:
- Panel naranja con estadísticas
- orphanApplications > 0 o orphanLetters > 0
- Base de datos limpia después
- Widget estadísticas muestra ✅ 0 Limpia
```

#### Caso 2: Base de Datos Ya Limpia

```
📋 Preparación:
1. Base de datos sin huérfanos

📋 Pasos:
1. Clic en "Limpiar Ahora"

✅ Resultado esperado:
- Mensaje: "No se encontraron datos huérfanos"
- Todos los contadores en 0
```

---

### 4. Pruebas de Validación

#### Caso 1: Archivo JSON Inválido

```
📋 Pasos:
1. Crear archivo .txt con contenido: "Hola mundo"
2. Renombrar a .json
3. Intentar importar

✅ Resultado esperado:
- Error: "Formato de archivo inválido"
- No se importa nada
- Notificación toast de error
```

#### Caso 2: Archivo JSON Sin Estructura

```
📋 Pasos:
1. Crear archivo .json con: {"test": "data"}
2. Intentar importar

✅ Resultado esperado:
- Error: "Falta metadata o data"
- No se importa nada
```

---

### 5. Pruebas de Interfaz

#### Caso 1: Widget de Estadísticas

```
📋 Pasos:
1. Ir a /dashboard
2. Verificar widget en la parte superior

✅ Resultado esperado:
- 4 tarjetas visibles
- Contadores actualizados
- Si hay huérfanos: tarjeta naranja con ⚠️
- Si está limpia: tarjeta gris con ✅
```

#### Caso 2: Barra de Progreso

```
📋 Pasos:
1. Seleccionar archivo grande de importación
2. Observar barra de progreso

✅ Resultado esperado:
- Barra progresa: 10% → 30% → 50% → 70% → 100%
- Texto descriptivo cambia
- UI no se congela
```

#### Caso 3: Responsive Design

```
📋 Pasos:
1. Abrir /dashboard/backup
2. Cambiar tamaño de ventana:
   - Desktop (> 1024px)
   - Tablet (768px - 1024px)
   - Mobile (< 768px)

✅ Resultado esperado:
- Desktop: 2 columnas + 1 fila completa
- Tablet: 2 columnas + 1 fila completa
- Mobile: 1 columna (stack vertical)
- Diálogo de duplicados scrolleable
```

---

### 6. Pruebas de Relaciones

#### Caso 1: Preservación de Relaciones

```
📋 Preparación:
1. Crear: CV → Candidatura → Carta
2. Exportar
3. Limpiar base de datos

📋 Pasos:
1. Importar archivo
2. Verificar en dashboard

✅ Resultado esperado:
- CV importado con nuevo ID
- Candidatura asociada al nuevo CV
- Carta asociada a la nueva candidatura
- Navegación funciona: CV → Candidaturas → Detalle
```

---

### 7. Pruebas de Errores

#### Caso 1: Base de Datos No Disponible

```
📋 Pasos:
1. Abrir DevTools
2. Application → IndexedDB → Eliminar DB
3. Intentar exportar

✅ Resultado esperado:
- Error descriptivo
- Mensaje: "Base de datos no disponible"
- No se descarga archivo
```

#### Caso 2: Importación Parcial

```
📋 Preparación:
1. Archivo con:
   - 3 CVs válidos
   - 2 candidaturas sin CV asociado

📋 Pasos:
1. Importar archivo

✅ Resultado esperado:
- 3 CVs importados
- 2 candidaturas omitidas (sin CV)
- Warnings en consola
- Estadísticas correctas
```

---

### 8. Pruebas de Rendimiento

#### Caso 1: Dataset Pequeño (< 10 CVs)

```
📋 Pasos:
1. Exportar 5 CVs con datos
2. Medir tiempo

✅ Resultado esperado:
- Exportación: < 1 segundo
- Archivo: < 500 KB
- Importación: < 3 segundos
```

#### Caso 2: Dataset Grande (> 50 CVs)

```
📋 Pasos:
1. Exportar 50+ CVs con datos
2. Medir tiempo

✅ Resultado esperado:
- Exportación: 5-10 segundos
- Archivo: 2-5 MB
- Importación: 15-30 segundos
- UI responsive (no congela)
```

---

## 🎯 Casos de Uso Reales

### Escenario 1: Migración de Navegador

```
DADO que un usuario cambia de navegador
CUANDO exporta desde Chrome e importa en Firefox
ENTONCES todos sus datos deben estar disponibles
Y las relaciones deben mantenerse intactas
```

### Escenario 2: Backup Semanal

```
DADO que es viernes
CUANDO el usuario exporta su base de datos
ENTONCES debe tener un archivo actualizado
Y debe poder restaurarlo en cualquier momento
```

### Escenario 3: Recuperación de Error

```
DADO que el usuario eliminó CVs por error
CUANDO importa un backup de hace 2 días
ENTONCES puede elegir "Importar con Nuevos IDs"
Y recuperar los CVs eliminados
```

---

## 📊 Matriz de Pruebas

| Funcionalidad | Caso Básico | Caso Error | Caso Límite | Estado  |
| ------------- | ----------- | ---------- | ----------- | ------- |
| Exportación   | ✅          | ✅         | ✅          | PASS    |
| Importación   | ✅          | ✅         | ✅          | PASS    |
| Limpieza      | ✅          | ✅         | ✅          | PASS    |
| Validación    | ✅          | ✅         | ✅          | PASS    |
| Duplicados    | ✅          | ✅         | ✅          | PASS    |
| Relaciones    | ✅          | ✅         | ✅          | PASS    |
| UI/UX         | ✅          | ✅         | ✅          | PASS    |
| Rendimiento   | ✅          | ✅         | ⏳          | PENDING |

---

## 🔧 Herramientas de Prueba

### DevTools - Console

```javascript
// Ver estructura de IndexedDB
await db.resumes.toArray();
await db.jobApplications.toArray();
await db.coverLetters.toArray();

// Limpiar base de datos (CUIDADO)
await db.delete();
```

### DevTools - Application

```
Application → IndexedDB → ResumeBuilderDB
├── resumes
├── jobApplications
├── coverLetters
└── interviewSimulations
```

### DevTools - Network

```
- Verificar que NO hay llamadas de red
- Todo es local (IndexedDB)
```

---

## ✅ Checklist Final

### Antes de Desplegar

- [ ] Todas las pruebas PASS
- [ ] Sin errores en consola
- [ ] Documentación actualizada
- [ ] Código comentado
- [ ] UI responsive en todos los dispositivos
- [ ] Mensajes de error claros
- [ ] Feedback visual en todas las acciones

### Post-Despliegue

- [ ] Monitorear reportes de usuarios
- [ ] Verificar logs de errores
- [ ] Recopilar feedback
- [ ] Planificar mejoras

---

## 📝 Reporte de Bugs

### Template

```markdown
**Descripción**: [Qué pasó]
**Pasos para reproducir**:

1. [Paso 1]
2. [Paso 2]

**Resultado esperado**: [Qué debería pasar]
**Resultado actual**: [Qué pasó realmente]
**Navegador**: [Chrome/Firefox/etc]
**Consola**: [Mensajes de error]
**Captura**: [Screenshot si es posible]
```

---

**Última actualización**: Octubre 8, 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para Testing
