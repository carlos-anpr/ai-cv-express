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

    // Versión 2: Añadir nuevas tablas y campos para sistema de candidaturas
    this.version(2).stores({
      resumes:
        '++id, documentId, userEmail, createdAt, updatedAt, title, firstName, lastName',
      userData: '++id, userEmail, preferences, lastLogin, totalResumes',
      coverLetters:
        '++id, resumeId, userEmail, companyName, jobTitle, jobDetails, content, jobApplicationId, style, length, createdAt, updatedAt',
      jobApplications:
        '++id, resumeId, userEmail, companyName, jobTitle, jobDescription, requirements, responsibilities, companyWebsite, contactPerson, applicationDate, status, notes, createdAt, updatedAt',
      interviewSimulations:
        '++id, jobApplicationId, resumeId, userEmail, candidateLevel, questions, createdAt, updatedAt',
    });

    // Versión 3: Añadir campos de contacto adicionales a candidaturas
    this.version(3).stores({
      resumes:
        '++id, documentId, userEmail, createdAt, updatedAt, title, firstName, lastName',
      userData: '++id, userEmail, preferences, lastLogin, totalResumes',
      coverLetters:
        '++id, resumeId, userEmail, companyName, jobTitle, jobDetails, content, jobApplicationId, style, length, createdAt, updatedAt',
      jobApplications:
        '++id, resumeId, resumeDocumentId, userEmail, companyName, jobTitle, jobDescription, requirements, responsibilities, companyWebsite, contactPerson, contactEmail, contactPhone, jobUrl, applicationDate, status, notes, createdAt, updatedAt',
      interviewSimulations:
        '++id, jobApplicationId, resumeId, userEmail, candidateLevel, questions, createdAt, updatedAt',
    });

    // Versión 4: Añadir índice resumeDocumentId explícito para consultas por documentId
    this.version(4).stores({
      resumes:
        '++id, documentId, userEmail, createdAt, updatedAt, title, firstName, lastName',
      userData: '++id, userEmail, preferences, lastLogin, totalResumes',
      coverLetters:
        '++id, resumeId, userEmail, companyName, jobTitle, jobDetails, content, jobApplicationId, style, length, createdAt, updatedAt',
      jobApplications:
        '++id, resumeId, resumeDocumentId, userEmail, companyName, jobTitle, jobDescription, requirements, responsibilities, companyWebsite, contactPerson, contactEmail, contactPhone, jobUrl, applicationDate, status, notes, createdAt, updatedAt',
      interviewSimulations:
        '++id, jobApplicationId, resumeId, userEmail, candidateLevel, questions, createdAt, updatedAt',
    });

    // Versión 5: Añadir índice 'shareToken' en resumes para permitir consultas por token de compartición
    // (esto evita errores cuando se usa db.resumes.where('shareToken').equals(token))
    this.version(5).stores({
      resumes:
        '++id, documentId, userEmail, createdAt, updatedAt, title, firstName, lastName, shareToken',
      userData: '++id, userEmail, preferences, lastLogin, totalResumes',
      coverLetters:
        '++id, resumeId, userEmail, companyName, jobTitle, jobDetails, content, jobApplicationId, style, length, createdAt, updatedAt',
      jobApplications:
        '++id, resumeId, resumeDocumentId, userEmail, companyName, jobTitle, jobDescription, requirements, responsibilities, companyWebsite, contactPerson, contactEmail, contactPhone, jobUrl, applicationDate, status, notes, createdAt, updatedAt',
      interviewSimulations:
        '++id, jobApplicationId, resumeId, userEmail, candidateLevel, questions, createdAt, updatedAt',
    });

    // Versión 6: Añadir tabla para tracking de visualizaciones de enlaces compartidos
    this.version(6).stores({
      resumes:
        '++id, documentId, userEmail, createdAt, updatedAt, title, firstName, lastName, shareToken',
      userData: '++id, userEmail, preferences, lastLogin, totalResumes',
      coverLetters:
        '++id, resumeId, userEmail, companyName, jobTitle, jobDetails, content, jobApplicationId, style, length, createdAt, updatedAt',
      jobApplications:
        '++id, resumeId, resumeDocumentId, userEmail, companyName, jobTitle, jobDescription, requirements, responsibilities, companyWebsite, contactPerson, contactEmail, contactPhone, jobUrl, applicationDate, status, notes, createdAt, updatedAt',
      interviewSimulations:
        '++id, jobApplicationId, resumeId, userEmail, candidateLevel, questions, createdAt, updatedAt',
      shareViews:
        '++id, shareToken, resumeId, viewedAt, userAgent, referrer, country, city',
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

    // Hooks para candidaturas
    this.jobApplications.hook('creating', function (primKey, obj) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.status = obj.status || 'draft';
    });

    this.jobApplications.hook('updating', function (modifications) {
      modifications.updatedAt = new Date();
    });

    // Hooks para simulaciones de entrevista
    this.interviewSimulations.hook('creating', function (primKey, obj) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.interviewSimulations.hook('updating', function (modifications) {
      modifications.updatedAt = new Date();
    });
  }
}

// Instancia global de la base de datos
export const db = new ResumeDatabase();

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  try {
    await db.open();

    // Verificar soporte del navegador
    if (!window.indexedDB) {
      throw new Error('IndexedDB no está soportado en este navegador');
    }

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
