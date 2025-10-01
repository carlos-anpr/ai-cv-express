// src/services/IndexedDBService.js
import Dexie from 'dexie';

export class ResumeDatabase extends Dexie {
  constructor() {
    super('ResumeBuilderDB');

    // Definir esquema de la base de datos
    this.version(1).stores({
      resumes:
        '++id, documentId, userEmail, createdAt, updatedAt, title, firstName, lastName',
      userData: '++id, userEmail, preferences, lastLogin, totalResumes',
      coverLetters:
        '++id, resumeId, userEmail, companyName, jobTitle, jobDetails, content, createdAt, updatedAt',
    });

    // Hooks para auto-generar timestamps
    this.resumes.hook('creating', function (primKey, obj) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.version = 1;
    });

    this.resumes.hook('updating', function (modifications, primKey, obj) {
      modifications.updatedAt = new Date();
      if (obj.version) {
        modifications.version = obj.version + 1;
      }
    });

    // Hooks para cartas de recomendación
    this.coverLetters.hook('creating', function (primKey, obj) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.version = 1;
    });

    this.coverLetters.hook('updating', function (modifications, primKey, obj) {
      modifications.updatedAt = new Date();
      if (obj.version) {
        modifications.version = obj.version + 1;
      }
    });
  }
}

// Instancia global de la base de datos
export const db = new ResumeDatabase();

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  try {
    await db.open();
    console.log('✅ IndexedDB inicializado correctamente');

    // Verificar soporte del navegador
    if (!window.indexedDB) {
      throw new Error('IndexedDB no está soportado en este navegador');
    }

    // Debug: Verificar que las tablas se crearon
    console.log(
      '📋 Tablas disponibles:',
      db.tables.map((t) => t.name)
    );
    console.log('🔍 Esquema de resumes:', db.resumes.schema);

    // Test básico de creación y lectura
    const testCount = await db.resumes.count();
    console.log('📊 CVs existentes en la DB:', testCount);

    return true;
  } catch (error) {
    console.error('❌ Error al inicializar IndexedDB:', error);
    throw error;
  }
};

// Función para obtener información de la base de datos
export const getDatabaseInfo = async () => {
  try {
    const totalResumes = await db.resumes.count();
    const totalUsers = await db.userData.count();

    // Obtener tamaño estimado de almacenamiento
    let storageInfo = { usage: 0, quota: 0 };
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      storageInfo = await navigator.storage.estimate();
    }

    return {
      totalResumes,
      totalUsers,
      storageUsed: storageInfo.usage,
      storageQuota: storageInfo.quota,
      databaseName: db.name,
      version: db.verno,
    };
  } catch (error) {
    console.error('Error obteniendo información de la DB:', error);
    return null;
  }
};

// Función para limpiar la base de datos (útil para testing)
export const clearDatabase = async () => {
  try {
    await db.resumes.clear();
    await db.userData.clear();
    console.log('🧹 Base de datos limpiada');
    return true;
  } catch (error) {
    console.error('Error limpiando la base de datos:', error);
    throw error;
  }
};

// Función para backup completo
export const createFullBackup = async () => {
  try {
    const resumes = await db.resumes.toArray();
    const userData = await db.userData.toArray();

    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      database: db.name,
      data: {
        resumes,
        userData,
      },
    };

    return backup;
  } catch (error) {
    console.error('Error creando backup:', error);
    throw error;
  }
};

export default db;
