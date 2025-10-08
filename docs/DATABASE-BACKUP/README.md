# Sistema de Copias de Seguridad - Base de Datos

## 📋 Descripción

Sistema completo de exportación e importación de la base de datos IndexedDB con limpieza automática de datos huérfanos y gestión inteligente de duplicados.

## ✨ Características

### 1. **Exportación con Limpieza Automática**

- Exporta todos los CVs, candidaturas, cartas de presentación y simulaciones de entrevistas
- **Limpieza automática**: Elimina candidaturas y cartas que no están asociadas a ningún CV
- Genera archivo JSON con metadatos y estadísticas
- Formato de nombre: `resume-backup-[usuario]-[fecha].json`

### 2. **Importación Inteligente**

- Valida la estructura del archivo antes de importar
- **Detección de duplicados**: Identifica CVs, candidaturas y cartas duplicadas
- Tres opciones para manejar duplicados:
  - ✅ **Omitir duplicados**: No importa elementos que ya existen
  - 🔄 **Importar con nuevos IDs**: Crea nuevos elementos con IDs únicos
  - ⚠️ **Sobrescribir**: Reemplaza los elementos existentes (opción avanzada)

### 3. **Limpieza Manual**

- Permite limpiar datos huérfanos en cualquier momento
- Muestra estadísticas de elementos eliminados
- Operación segura que solo afecta datos no asociados

### 4. **Estadísticas en Dashboard**

- Muestra contadores de CVs, candidaturas y cartas
- Alerta visual si hay datos huérfanos
- Actualización en tiempo real

## 🗂️ Estructura del Archivo de Backup

```json
{
  "metadata": {
    "version": "1.0.0",
    "exportDate": "2025-10-08T12:00:00.000Z",
    "userEmail": "usuario@ejemplo.com",
    "appVersion": "1.0.0"
  },
  "statistics": {
    "resumes": 5,
    "applications": 12,
    "coverLetters": 8,
    "interviewSimulations": 3,
    "orphanApplicationsRemoved": 2,
    "orphanLettersRemoved": 1
  },
  "data": {
    "resumes": [...],
    "jobApplications": [...],
    "coverLetters": [...],
    "interviewSimulations": [...],
    "userData": {...}
  }
}
```

## 🚀 Uso

### Exportar Base de Datos

1. Navega a **Dashboard → Copias de Seguridad**
2. Haz clic en **"Exportar Base de Datos"**
3. Se descargará automáticamente un archivo JSON
4. Guarda el archivo en un lugar seguro

**Nota**: La exportación elimina automáticamente datos huérfanos antes de guardar.

### Importar Base de Datos

1. Navega a **Dashboard → Copias de Seguridad**
2. Haz clic en **"Seleccionar Archivo"**
3. Elige el archivo JSON de backup
4. Si hay duplicados, aparecerá un diálogo con opciones:
   - **Omitir Duplicados**: No importa elementos existentes
   - **Importar con Nuevos IDs**: Crea copias con IDs únicos

### Limpiar Datos Huérfanos

1. Navega a **Dashboard → Copias de Seguridad**
2. Haz clic en **"Limpiar Ahora"**
3. Se eliminan candidaturas y cartas sin CV asociado
4. Se muestra un resumen de elementos eliminados

**⚠️ Recomendación**: Exporta una copia de seguridad antes de limpiar.

## 🔧 Archivos del Sistema

### Servicios

- **`DatabaseBackupService.js`**: Lógica de exportación/importación
  - `exportDatabase()`: Exporta datos con limpieza
  - `downloadBackup()`: Genera y descarga archivo JSON
  - `validateBackupFile()`: Valida estructura del archivo
  - `detectDuplicates()`: Detecta elementos duplicados
  - `importDatabase()`: Importa datos con opciones
  - `cleanOrphanData()`: Limpia datos huérfanos

### Componentes

- **`DatabaseBackup.jsx`**: Interfaz principal

  - Panel de exportación
  - Panel de importación con barra de progreso
  - Panel de limpieza
  - Diálogo de gestión de duplicados
  - Estadísticas y alertas visuales

- **`DatabaseStats.jsx`**: Widget de estadísticas
  - Contador de CVs
  - Contador de candidaturas
  - Contador de cartas
  - Alerta de datos huérfanos

## 🎨 Diseño

La interfaz sigue el tema de colores del proyecto:

- **Background**: `bg-background`
- **Bordes**: `border-border`
- **Hover**: `hover:border-black/20`
- **Botones principales**: `bg-black text-white hover:bg-black/90`
- **Alertas**: Colores semánticos (verde, naranja, azul)

## 🔍 Detección de Duplicados

### CVs

- Compara por `documentId` (UUID único)

### Candidaturas

- Compara por combinación: `companyName + jobTitle + createdAt`

### Cartas de Presentación

- Compara por `jobApplicationId`

## 📊 Manejo de Relaciones

El sistema mantiene las relaciones entre entidades:

```
CV (resume)
  └─ Candidaturas (jobApplications)
       └─ Cartas de Presentación (coverLetters)
       └─ Simulaciones de Entrevistas (interviewSimulations)
```

Al importar, se mapean los IDs antiguos a los nuevos para preservar las relaciones.

## ⚠️ Consideraciones Importantes

1. **Datos Huérfanos**:

   - Candidaturas sin CV asociado
   - Cartas sin candidatura o CV asociado
   - Se eliminan automáticamente en exportación
   - Pueden limpiarse manualmente

2. **IDs Únicos**:

   - Los CVs usan UUID (`documentId`)
   - Al importar con "nuevos IDs", se generan UUIDs nuevos
   - Las relaciones se mantienen con mapeo interno

3. **Tamaño de Archivos**:

   - Los backups incluyen todo el contenido en formato JSON
   - Tamaño típico: 100KB - 5MB dependiendo del volumen de datos
   - Se recomienda comprimir archivos grandes

4. **Compatibilidad**:
   - Versión actual: 1.0.0
   - Los backups incluyen número de versión
   - Futuras versiones pueden incluir migraciones

## 🐛 Resolución de Problemas

### "Archivo inválido"

- Verifica que el archivo sea JSON válido
- Asegúrate de que tenga la estructura correcta con `metadata` y `data`

### "No se encontró CV para la candidatura"

- Normal si importas candidaturas sin sus CVs asociados
- Se omiten automáticamente estas candidaturas

### "Error al importar"

- Revisa la consola del navegador para detalles
- Verifica que la base de datos IndexedDB esté disponible
- Intenta refrescar la página y volver a intentar

## 🔐 Seguridad

- Los backups contienen datos sensibles
- Guarda los archivos en ubicaciones seguras
- No compartas archivos de backup públicamente
- Los datos se almacenan localmente en el navegador (IndexedDB)
- No se envía nada a servidores externos

## 📈 Futuras Mejoras

- [ ] Compresión de archivos de backup
- [ ] Exportación selectiva (por CV)
- [ ] Programación de backups automáticos
- [ ] Sincronización en la nube (opcional)
- [ ] Cifrado de archivos de backup
- [ ] Historial de backups
- [ ] Comparación de backups (diff)

## 📝 Changelog

### v1.0.0 (2025-10-08)

- ✨ Exportación con limpieza automática
- ✨ Importación con detección de duplicados
- ✨ Limpieza manual de datos huérfanos
- ✨ Widget de estadísticas en dashboard
- ✨ Interfaz intuitiva y moderna
- ✨ Validación de archivos de backup
- ✨ Mapeo de IDs para preservar relaciones

## 🤝 Contribuciones

Para reportar bugs o sugerir mejoras, contacta al equipo de desarrollo.

---

**Autor**: Sistema AI Resume Builder  
**Fecha**: Octubre 2025  
**Versión**: 1.0.0
