# Migración Strapi → IndexedDB - Especificación Técnica

## 🏗️ Arquitectura Técnica Detallada

### Stack Tecnológico Actual vs Futuro

| Componente        | Actual                     | Futuro           | Justificación           |
| ----------------- | -------------------------- | ---------------- | ----------------------- |
| **Base de datos** | Strapi + PostgreSQL/SQLite | IndexedDB        | Eliminación de servidor |
| **API Client**    | Axios + REST               | Dexie.js         | API nativa optimizada   |
| **Persistencia**  | HTTP requests              | Local storage    | Velocidad y offline     |
| **Autenticación** | Clerk (mantener)           | Clerk (mantener) | Funciona sin cambios    |

---

## 📦 Dependencias

### Nuevas Dependencias

```json
{
  "dexie": "^3.2.4",
  "uuid": "^9.0.1" // Ya existe
}
```

### Dependencias a Eliminar

```json
{
  "axios": "^1.8.1" // Solo para Strapi, mantener para otras APIs
}
```

---

## 🗄️ Diseño de Base de Datos IndexedDB

### Esquema de Base de Datos

```javascript
// src/services/IndexedDBService.js
import Dexie from 'dexie';

export class ResumeDatabase extends Dexie {
  constructor() {
    super('ResumeBuilderDB');

    this.version(1).stores({
      resumes: '++id, documentId, userEmail, createdAt, updatedAt, title',
      userData: '++id, userEmail, preferences, lastLogin',
    });
  }
}

// Instancia global
export const db = new ResumeDatabase();
```

### Estructura de Tabla `resumes`

```javascript
{
  id: number,                    // Primary key auto-increment
  documentId: string,           // UUID único (compatible con Strapi)
  userEmail: string,            // Email del usuario (índice)
  title: string,                // Título del CV (para búsqueda)

  // Datos personales
  firstName: string,
  lastName: string,
  jobTitle: string,
  address: string,
  phone: string,
  email: string,

  // Configuración
  themeColor: string,

  // Contenido
  summary: string,
  experience: JSON,             // Array de objetos
  education: JSON,              // Array de objetos
  skills: JSON,                 // Array de objetos

  // Metadatos
  createdAt: Date,
  updatedAt: Date,
  version: number               // Para control de versiones
}
```

### Estructura de Tabla `userData`

```javascript
{
  id: number,
  userEmail: string,
  preferences: {
    defaultTheme: string,
    autoSave: boolean,
    autoSaveInterval: number
  },
  lastLogin: Date,
  totalResumes: number
}
```

---

## 🔧 Implementación del Servicio Local

### LocalDatabase.js - Reemplazo de GlobalApi.js

```javascript
// src/services/LocalDatabase.js
import { db } from './IndexedDBService.js';
import { v4 as uuidv4 } from 'uuid';

class LocalDatabase {
  // CREATE - Crear nuevo CV
  async CreateNewResume(data) {
    try {
      const documentId = uuidv4();
      const now = new Date();

      const resumeData = {
        documentId,
        userEmail: data.userEmail,
        title: data.title || `CV ${now.toLocaleDateString()}`,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        jobTitle: data.jobTitle || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || data.userEmail,
        themeColor: data.themeColor || '#3b82f6',
        summary: data.summary || '',
        experience: JSON.stringify(data.experience || []),
        education: JSON.stringify(data.education || []),
        skills: JSON.stringify(data.skills || []),
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const id = await db.resumes.add(resumeData);

      // Actualizar contador de usuario
      await this.updateUserStats(data.userEmail);

      return {
        data: {
          ...resumeData,
          id,
          experience: JSON.parse(resumeData.experience),
          education: JSON.parse(resumeData.education),
          skills: JSON.parse(resumeData.skills),
        },
      };
    } catch (error) {
      console.error('Error creating resume:', error);
      throw new Error('No se pudo crear el CV');
    }
  }

  // READ - Obtener CVs del usuario
  async GetUserResumes(userEmail) {
    try {
      const resumes = await db.resumes
        .where('userEmail')
        .equals(userEmail)
        .orderBy('updatedAt')
        .reverse()
        .toArray();

      // Parsear JSON fields
      const processedResumes = resumes.map((resume) => ({
        ...resume,
        experience: JSON.parse(resume.experience || '[]'),
        education: JSON.parse(resume.education || '[]'),
        skills: JSON.parse(resume.skills || '[]'),
      }));

      return { data: processedResumes };
    } catch (error) {
      console.error('Error getting user resumes:', error);
      throw new Error('No se pudieron cargar los CVs');
    }
  }

  // READ - Obtener CV por ID
  async GetResumeById(documentId) {
    try {
      const resume = await db.resumes
        .where('documentId')
        .equals(documentId)
        .first();

      if (!resume) {
        throw new Error('CV no encontrado');
      }

      const processedResume = {
        ...resume,
        experience: JSON.parse(resume.experience || '[]'),
        education: JSON.parse(resume.education || '[]'),
        skills: JSON.parse(resume.skills || '[]'),
      };

      return { data: processedResume };
    } catch (error) {
      console.error('Error getting resume by ID:', error);
      throw error;
    }
  }

  // UPDATE - Actualizar CV
  async UpdateResumeDetail(documentId, updateData) {
    try {
      const existingResume = await db.resumes
        .where('documentId')
        .equals(documentId)
        .first();

      if (!existingResume) {
        throw new Error('CV no encontrado');
      }

      // Procesar datos de actualización
      const processedData = { ...updateData };

      // Convertir arrays a JSON si es necesario
      if (processedData.experience) {
        processedData.experience = JSON.stringify(processedData.experience);
      }
      if (processedData.education) {
        processedData.education = JSON.stringify(processedData.education);
      }
      if (processedData.skills) {
        processedData.skills = JSON.stringify(processedData.skills);
      }

      // Actualizar campos
      const updatedFields = {
        ...processedData,
        updatedAt: new Date(),
        version: existingResume.version + 1,
      };

      await db.resumes
        .where('documentId')
        .equals(documentId)
        .modify(updatedFields);

      // Obtener registro actualizado
      const updatedResume = await this.GetResumeById(documentId);
      return updatedResume;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw new Error('No se pudo actualizar el CV');
    }
  }

  // DELETE - Eliminar CV
  async DeleteResumeById(documentId) {
    try {
      const resume = await db.resumes
        .where('documentId')
        .equals(documentId)
        .first();

      if (!resume) {
        throw new Error('CV no encontrado');
      }

      await db.resumes.where('documentId').equals(documentId).delete();

      // Actualizar contador de usuario
      await this.updateUserStats(resume.userEmail);

      return { success: true };
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error('No se pudo eliminar el CV');
    }
  }

  // UTILITY - Actualizar estadísticas de usuario
  async updateUserStats(userEmail) {
    try {
      const count = await db.resumes
        .where('userEmail')
        .equals(userEmail)
        .count();

      await db.userData
        .where('userEmail')
        .equals(userEmail)
        .modify({ totalResumes: count })
        .catch(async () => {
          // Si no existe, crear entrada
          await db.userData.add({
            userEmail,
            preferences: {
              defaultTheme: '#3b82f6',
              autoSave: true,
              autoSaveInterval: 5000,
            },
            lastLogin: new Date(),
            totalResumes: count,
          });
        });
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // UTILITY - Exportar datos para backup
  async ExportUserData(userEmail) {
    try {
      const resumes = await this.GetUserResumes(userEmail);
      const userData = await db.userData
        .where('userEmail')
        .equals(userEmail)
        .first();

      return {
        exportDate: new Date().toISOString(),
        userEmail,
        userData,
        resumes: resumes.data,
        version: '1.0',
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('No se pudo exportar los datos');
    }
  }

  // UTILITY - Importar datos desde backup
  async ImportUserData(importData) {
    try {
      const { userEmail, resumes, userData } = importData;

      // Importar configuración de usuario
      if (userData) {
        await db.userData.where('userEmail').equals(userEmail).delete();

        await db.userData.add(userData);
      }

      // Importar CVs
      if (resumes && resumes.length > 0) {
        for (const resume of resumes) {
          // Asegurar que tenga documentId único
          if (!resume.documentId) {
            resume.documentId = uuidv4();
          }

          // Convertir arrays a JSON
          const processedResume = {
            ...resume,
            experience: JSON.stringify(resume.experience || []),
            education: JSON.stringify(resume.education || []),
            skills: JSON.stringify(resume.skills || []),
            createdAt: new Date(resume.createdAt),
            updatedAt: new Date(resume.updatedAt),
          };

          await db.resumes.add(processedResume);
        }
      }

      return { success: true, imported: resumes.length };
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('No se pudieron importar los datos');
    }
  }
}

// Instancia global
const localDB = new LocalDatabase();
export default localDB;
```

---

## 🔄 Migración de Componentes

### Pasos de Migración por Archivo

#### 1. Actualizar imports

```javascript
// ANTES
import GlobalApi from '../../../../../service/GlobalApi';

// DESPUÉS
import LocalDatabase from '../../../../../service/LocalDatabase';
```

#### 2. Actualizar llamadas a API

```javascript
// ANTES
GlobalApi.UpdateResumeDetail(resumeId, data).then(
  (resp) => {
    console.log(resp);
    toast('Details updated!');
  },
  (error) => {
    console.log(error);
  }
);

// DESPUÉS
LocalDatabase.UpdateResumeDetail(resumeId, data)
  .then((resp) => {
    console.log(resp);
    toast('Details updated!');
  })
  .catch((error) => {
    console.error(error);
    toast.error('Error al actualizar');
  });
```

#### 3. Manejo de errores mejorado

```javascript
// Patrón recomendado con async/await
const handleUpdateResume = async (resumeId, data) => {
  try {
    setLoading(true);
    const response = await LocalDatabase.UpdateResumeDetail(resumeId, data);
    toast.success('CV actualizado correctamente');
    return response;
  } catch (error) {
    console.error('Error updating resume:', error);
    toast.error(error.message || 'Error al actualizar el CV');
  } finally {
    setLoading(false);
  }
};
```

---

## 🧪 Plan de Testing

### Tests Unitarios

```javascript
// __tests__/LocalDatabase.test.js
import LocalDatabase from '../src/services/LocalDatabase';
import { db } from '../src/services/IndexedDBService';

describe('LocalDatabase', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  test('should create new resume', async () => {
    const data = {
      userEmail: 'test@example.com',
      title: 'Test CV',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = await LocalDatabase.CreateNewResume(data);

    expect(result.data.documentId).toBeDefined();
    expect(result.data.firstName).toBe('John');
    expect(result.data.lastName).toBe('Doe');
  });

  test('should get user resumes', async () => {
    // Crear datos de prueba
    await LocalDatabase.CreateNewResume({
      userEmail: 'test@example.com',
      title: 'CV 1',
    });

    const result = await LocalDatabase.GetUserResumes('test@example.com');

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('CV 1');
  });
});
```

### Tests de Integración

- Verificar flujo completo CRUD
- Validar integridad de datos
- Probar scenarios de error

---

## 📊 Monitoreo y Métricas

### Métricas a Implementar

```javascript
// src/utils/Analytics.js
class LocalAnalytics {
  static trackOperation(operation, duration, success) {
    console.log(
      `${operation}: ${duration}ms - ${success ? 'SUCCESS' : 'FAILED'}`
    );

    // Opcional: enviar a servicio de analytics
    if (window.gtag) {
      window.gtag('event', 'database_operation', {
        operation_type: operation,
        duration: duration,
        success: success,
      });
    }
  }

  static trackDatabaseSize() {
    navigator.storage.estimate().then((estimate) => {
      console.log('Storage used:', estimate.usage);
      console.log('Storage quota:', estimate.quota);
    });
  }
}
```

---

## 🚀 Despliegue y Optimización

### Build Optimizations

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      external: ['axios'], // Si se elimina completamente
      output: {
        manualChunks: {
          database: ['dexie'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
};
```

### Performance Tips

1. **Lazy loading**: Cargar Dexie solo cuando se necesite
2. **Batch operations**: Agrupar múltiples operaciones
3. **Indexes**: Crear índices en campos de búsqueda frecuente
4. **Compression**: Comprimir datos JSON grandes

---

## 🔒 Consideraciones de Seguridad

### Validación de Datos

```javascript
// src/utils/DataValidator.js
export const validateResumeData = (data) => {
  const errors = [];

  if (!data.userEmail || !data.userEmail.includes('@')) {
    errors.push('Email válido requerido');
  }

  if (!data.firstName || data.firstName.length < 1) {
    errors.push('Nombre requerido');
  }

  // Sanitizar HTML en campos de texto
  if (data.summary) {
    data.summary = sanitizeHtml(data.summary);
  }

  return { isValid: errors.length === 0, errors, data };
};
```

### Backup Automático

```javascript
// Auto-backup cada 24 horas
setInterval(async () => {
  if (user?.primaryEmailAddress?.emailAddress) {
    const backup = await LocalDatabase.ExportUserData(
      user.primaryEmailAddress.emailAddress
    );

    // Guardar en localStorage como backup
    localStorage.setItem(
      'resume_backup_' + new Date().toISOString().split('T')[0],
      JSON.stringify(backup)
    );
  }
}, 24 * 60 * 60 * 1000); // 24 horas
```

---

_Documento técnico creado: Octubre 2025_
_Versión: 1.0_
