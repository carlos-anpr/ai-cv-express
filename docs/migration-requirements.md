# Migración de Strapi a IndexedDB - Documento de Requisitos

## 📋 Resumen Ejecutivo

**Objetivo:** Eliminar la dependencia de Strapi (backend + base de datos) y migrar toda la funcionalidad de persistencia a IndexedDB para que la aplicación funcione completamente offline y sin servidor.

**Beneficios:**

- ✅ Aplicación completamente standalone (sin backend)
- ✅ Funciona offline
- ✅ Instalación y despliegue simplificados
- ✅ Eliminación de costos de servidor
- ✅ Mayor velocidad de acceso a datos
- ✅ Privacidad total (datos locales)

---

## 🎯 Alcance del Proyecto

### ✅ Funcionalidades a Mantener

1. **Gestión de CVs**

   - Crear nuevo CV
   - Listar CVs del usuario
   - Editar CV existente
   - Eliminar CV
   - Duplicar CV

2. **Formularios de CV**

   - Datos personales
   - Resumen profesional
   - Experiencia laboral
   - Educación
   - Habilidades
   - Selección de tema/colores

3. **Vista previa y exportación**

   - Vista previa en tiempo real
   - Exportación a PDF (si existe)

4. **Autenticación**
   - Mantener Clerk para autenticación
   - Asociar datos locales con usuario

### ❌ Funcionalidades a Eliminar

- Sincronización con servidor Strapi
- API REST endpoints
- Dependencia de conexión a internet para CRUD

---

## 📊 Análisis de Datos Actuales

### Estructura de Datos en Strapi

Basado en el análisis del código, los CVs contienen:

```javascript
{
  documentId: string,          // ID único del CV
  userEmail: string,          // Email del usuario (de Clerk)
  firstName: string,
  lastName: string,
  jobTitle: string,
  address: string,
  phone: string,
  email: string,
  themeColor: string,
  summary: string,
  experience: Array<{
    id: number,
    title: string,
    companyName: string,
    city: string,
    state: string,
    startDate: string,
    endDate: string,
    currentlyWorking: boolean,
    workSummary: string
  }>,
  education: Array<{
    id: number,
    universityName: string,
    degree: string,
    major: string,
    startDate: string,
    endDate: string,
    description: string
  }>,
  skills: Array<{
    id: number,
    name: string,
    rating: number
  }>,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Requisitos Técnicos

### Tecnologías a Implementar

1. **IndexedDB**

   - Base de datos nativa del navegador
   - Soporte para transacciones ACID
   - Almacenamiento ilimitado (con permisos)

2. **Dexie.js** (Recomendado)
   - Wrapper moderno para IndexedDB
   - API Promise-based
   - Esquemas tipados
   - Migrations automáticas

### Requisitos de Navegador

- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+
- (IndexedDB tiene soporte universal moderno)

---

## 🏗️ Arquitectura Propuesta

### Estructura de Archivos Nueva

```
src/
├── services/
│   ├── LocalDatabase.js     # Reemplaza GlobalApi.js
│   ├── IndexedDBService.js  # Configuración de Dexie
│   └── DataMigration.js     # Utilidades de migración
├── models/
│   ├── Resume.js           # Modelo de datos del CV
│   └── User.js             # Modelo de usuario local
└── utils/
    ├── DataValidation.js   # Validaciones
    └── DataImportExport.js # Import/Export JSON
```

---

## 🔄 Plan de Migración de Datos

### Opción 1: Migración Manual

- Usuario exporta datos desde Strapi (si existe)
- Importa JSON a IndexedDB

### Opción 2: Inicialización Limpia

- Comenzar con base de datos vacía
- Usuario crea CVs desde cero
- Importar datos de ejemplo (dummy.jsx)

---

## 📝 Casos de Uso

### CU-001: Crear Nuevo CV

**Actor:** Usuario autenticado
**Flujo:**

1. Usuario hace clic en "Crear CV"
2. Sistema genera UUID único
3. Datos se guardan en IndexedDB
4. Redirección a editor

### CU-002: Listar CVs del Usuario

**Actor:** Usuario autenticado
**Flujo:**

1. Sistema consulta IndexedDB por userEmail
2. Muestra lista de CVs
3. Ordenado por fecha de modificación

### CU-003: Editar CV Existente

**Actor:** Usuario autenticado
**Flujo:**

1. Usuario selecciona CV
2. Sistema carga datos desde IndexedDB
3. Permite edición en formularios
4. Auto-guardado cada X segundos

### CU-004: Eliminar CV

**Actor:** Usuario autenticado
**Flujo:**

1. Confirmación de eliminación
2. Borrado de IndexedDB
3. Actualización de lista

---

## ⚠️ Consideraciones y Limitaciones

### Limitaciones de IndexedDB

- **Límite de almacenamiento**: Varía por navegador (~50MB-1GB)
- **Solo local**: No sincronización entre dispositivos
- **Borrado**: Usuario puede limpiar datos del navegador

### Soluciones Propuestas

1. **Backup automático**: Exportar JSON periódicamente
2. **Compresión**: Comprimir datos grandes
3. **Validación**: Verificar integridad de datos
4. **Fallbacks**: Datos de ejemplo si DB vacía

---

## 📈 Métricas de Éxito

### KPIs Técnicos

- Tiempo de carga < 500ms
- Operaciones CRUD < 100ms
- Tamaño bundle reducido (-axios, -strapi deps)
- 0 errores de conexión

### KPIs Funcionales

- 100% funcionalidades migradas
- 0 pérdida de datos en migración
- UX idéntico al actual

---

## 🚀 Entregables

1. **Documentación técnica detallada**
2. **Código de migración completo**
3. **Tests unitarios para IndexedDB**
4. **Guía de despliegue actualizada**
5. **Script de migración de datos**

---

## ⏱️ Cronograma Estimado

| Fase | Duración | Descripción                      |
| ---- | -------- | -------------------------------- |
| 1    | 1 día    | Configuración IndexedDB + Dexie  |
| 2    | 2 días   | Desarrollo LocalDatabase service |
| 3    | 2 días   | Migración de formularios         |
| 4    | 1 día    | Testing y validación             |
| 5    | 1 día    | Documentación y cleanup          |

**Total: 7 días de desarrollo**

---

_Documento creado: Octubre 2025_
_Versión: 1.0_
