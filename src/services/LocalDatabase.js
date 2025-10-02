// src/services/LocalDatabase.js
import { db } from './IndexedDBService.js';
import { v4 as uuidv4 } from 'uuid';

class LocalDatabase {
  // UTILITY - Verificar que la DB esté inicializada
  async ensureDatabaseReady() {
    try {
      if (!db.isOpen()) {
        console.log('🔄 Base de datos no abierta, inicializando...');
        await db.open();
      }
      return true;
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      throw new Error('Base de datos no disponible: ' + error.message);
    }
  }

  // CREATE - Crear nuevo CV
  async CreateNewResume(data) {
    await this.ensureDatabaseReady();
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

      console.log('💾 Guardando CV:', resumeData);

      const id = await db.resumes.add(resumeData);

      console.log('✅ CV guardado con ID:', id);

      // Actualizar contador de usuario
      await this.updateUserStats(data.userEmail);

      // Retornar en formato compatible con la API anterior
      const result = {
        data: {
          ...resumeData,
          id,
          experience: JSON.parse(resumeData.experience),
          education: JSON.parse(resumeData.education),
          skills: JSON.parse(resumeData.skills),
        },
      };

      console.log('📋 CV creado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw new Error('No se pudo crear el CV: ' + error.message);
    }
  }

  // READ - Obtener CVs del usuario
  async GetUserResumes(userEmail) {
    await this.ensureDatabaseReady();
    try {
      console.log('🔍 GetUserResumes - userEmail:', userEmail);

      // Verificar que la base de datos esté disponible
      if (!db || !db.resumes) {
        throw new Error('Base de datos no disponible');
      } // Obtener todos los CVs del usuario y ordenar en memoria
      const resumes = await db.resumes
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      console.log('📊 CVs encontrados:', resumes.length, resumes);

      // Ordenar por fecha de actualización (más reciente primero)
      const sortedResumes = resumes.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      // Parsear JSON fields para compatibilidad
      const processedResumes = sortedResumes.map((resume) => ({
        ...resume,
        experience: this.safeJsonParse(resume.experience, []),
        education: this.safeJsonParse(resume.education, []),
        skills: this.safeJsonParse(resume.skills, []),
      }));

      console.log('✅ CVs procesados:', processedResumes.length);
      return { data: processedResumes };
    } catch (error) {
      console.error('Error getting user resumes:', error);
      throw new Error('No se pudieron cargar los CVs: ' + error.message);
    }
  }

  // READ - Obtener CV por ID
  async GetResumeById(documentId) {
    await this.ensureDatabaseReady();
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
        experience: this.safeJsonParse(resume.experience, []),
        education: this.safeJsonParse(resume.education, []),
        skills: this.safeJsonParse(resume.skills, []),
      };

      return { data: processedResume };
    } catch (error) {
      console.error('Error getting resume by ID:', error);
      throw error;
    }
  }

  // UPDATE - Actualizar CV
  async UpdateResumeDetail(documentId, updateData) {
    await this.ensureDatabaseReady();
    try {
      const existingResume = await db.resumes
        .where('documentId')
        .equals(documentId)
        .first();

      if (!existingResume) {
        throw new Error('CV no encontrado para actualizar');
      }

      // Procesar datos de actualización
      const processedData = { ...updateData };

      // Convertir arrays a JSON si es necesario
      if (processedData.experience && Array.isArray(processedData.experience)) {
        processedData.experience = JSON.stringify(processedData.experience);
      }
      if (processedData.education && Array.isArray(processedData.education)) {
        processedData.education = JSON.stringify(processedData.education);
      }
      if (processedData.skills && Array.isArray(processedData.skills)) {
        processedData.skills = JSON.stringify(processedData.skills);
      }

      // Actualizar campos (Dexie hook se encarga de updatedAt y version)
      await db.resumes
        .where('documentId')
        .equals(documentId)
        .modify(processedData);

      // Obtener registro actualizado para retornar
      const updatedResume = await this.GetResumeById(documentId);
      return updatedResume;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw new Error('No se pudo actualizar el CV: ' + error.message);
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
        throw new Error('CV no encontrado para eliminar');
      }

      const userEmail = resume.userEmail;

      await db.resumes.where('documentId').equals(documentId).delete();

      // Actualizar contador de usuario
      await this.updateUserStats(userEmail);

      return { success: true, message: 'CV eliminado correctamente' };
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error('No se pudo eliminar el CV: ' + error.message);
    }
  }

  // UTILITY - Parsear JSON de forma segura
  safeJsonParse(jsonString, defaultValue = null) {
    try {
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      }
      return jsonString || defaultValue;
    } catch (error) {
      console.warn('Error parsing JSON:', error);
      return defaultValue;
    }
  }

  // UTILITY - Actualizar estadísticas de usuario
  async updateUserStats(userEmail) {
    try {
      const count = await db.resumes
        .where('userEmail')
        .equals(userEmail)
        .count();

      const existingUser = await db.userData
        .where('userEmail')
        .equals(userEmail)
        .first();

      if (existingUser) {
        // Actualizar usuario existente
        await db.userData.where('userEmail').equals(userEmail).modify({
          totalResumes: count,
          lastLogin: new Date(),
        });
      } else {
        // Crear nueva entrada de usuario
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
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      // No lanzar error para no interrumpir operación principal
    }
  }

  // UTILITY - Obtener estadísticas de usuario
  async GetUserStats(userEmail) {
    try {
      const userData = await db.userData
        .where('userEmail')
        .equals(userEmail)
        .first();

      const resumeCount = await db.resumes
        .where('userEmail')
        .equals(userEmail)
        .count();

      return {
        userData: userData || null,
        totalResumes: resumeCount,
        lastLogin: userData?.lastLogin || null,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { userData: null, totalResumes: 0, lastLogin: null };
    }
  }

  // UTILITY - Exportar datos para backup
  async ExportUserData(userEmail) {
    try {
      const resumes = await this.GetUserResumes(userEmail);
      const userStats = await this.GetUserStats(userEmail);

      return {
        exportDate: new Date().toISOString(),
        userEmail,
        userData: userStats.userData,
        resumes: resumes.data,
        totalResumes: userStats.totalResumes,
        version: '1.0',
        appVersion: 'AI Resume Builder v1.0',
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('No se pudo exportar los datos: ' + error.message);
    }
  }

  // UTILITY - Importar datos desde backup
  async ImportUserData(importData, overwrite = false) {
    try {
      const { userEmail, resumes, userData } = importData;

      if (!userEmail || !resumes) {
        throw new Error('Datos de importación inválidos');
      }

      // Si overwrite es true, eliminar datos existentes
      if (overwrite) {
        await db.resumes.where('userEmail').equals(userEmail).delete();
        await db.userData.where('userEmail').equals(userEmail).delete();
      }

      // Importar configuración de usuario
      if (userData) {
        await db.userData.add({
          ...userData,
          userEmail, // Asegurar consistencia
          lastLogin: new Date(),
        });
      }

      // Importar CVs
      let importedCount = 0;
      if (resumes && resumes.length > 0) {
        for (const resume of resumes) {
          try {
            // Asegurar que tenga documentId único
            if (!resume.documentId) {
              resume.documentId = uuidv4();
            }

            // Verificar si ya existe (si no overwrite)
            if (!overwrite) {
              const existing = await db.resumes
                .where('documentId')
                .equals(resume.documentId)
                .first();

              if (existing) {
                console.warn(`CV ${resume.documentId} ya existe, saltando...`);
                continue;
              }
            }

            // Procesar datos para almacenamiento
            const processedResume = {
              ...resume,
              userEmail, // Asegurar consistencia
              experience: JSON.stringify(resume.experience || []),
              education: JSON.stringify(resume.education || []),
              skills: JSON.stringify(resume.skills || []),
              createdAt: resume.createdAt
                ? new Date(resume.createdAt)
                : new Date(),
              updatedAt: new Date(), // Actualizar timestamp de importación
              version: (resume.version || 0) + 1,
            };

            await db.resumes.add(processedResume);
            importedCount++;
          } catch (resumeError) {
            console.error(
              `Error importando CV ${resume.documentId}:`,
              resumeError
            );
          }
        }
      }

      // Actualizar estadísticas
      await this.updateUserStats(userEmail);

      return {
        success: true,
        imported: importedCount,
        total: resumes.length,
        message: `${importedCount} CVs importados correctamente`,
      };
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('No se pudieron importar los datos: ' + error.message);
    }
  }

  // UTILITY - Debug: Listar todos los CVs en la base de datos
  async DebugListAllResumes() {
    try {
      const allResumes = await db.resumes.toArray();
      console.log('🔍 DEBUG - Total de CVs en la DB:', allResumes.length);
      console.log('📋 DEBUG - Todos los CVs:', allResumes);
      return allResumes;
    } catch (error) {
      console.error('❌ DEBUG - Error listando CVs:', error);
      return [];
    }
  }

  // UTILITY - Debug: Verificar estado de la base de datos
  async DebugDatabaseStatus() {
    try {
      await db.open();
      const totalResumes = await db.resumes.count();
      const totalUsers = await db.userData.count();

      const status = {
        isOpen: db.isOpen(),
        version: db.verno,
        totalResumes,
        totalUsers,
        tables: db.tables.map((t) => t.name),
      };

      console.log('🔍 DEBUG - Base de datos:', status);
      return status;
    } catch (error) {
      console.error('❌ DEBUG - Error verificando DB:', error);
      return null;
    }
  }

  // UTILITY - Buscar CVs
  async SearchResumes(userEmail, searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return this.GetUserResumes(userEmail);
      }

      const term = searchTerm.toLowerCase();
      const resumes = await db.resumes
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      const filtered = resumes.filter((resume) => {
        return (
          resume.title?.toLowerCase().includes(term) ||
          resume.firstName?.toLowerCase().includes(term) ||
          resume.lastName?.toLowerCase().includes(term) ||
          resume.jobTitle?.toLowerCase().includes(term) ||
          resume.summary?.toLowerCase().includes(term)
        );
      });

      // Procesar resultados
      const processedResumes = filtered.map((resume) => ({
        ...resume,
        experience: this.safeJsonParse(resume.experience, []),
        education: this.safeJsonParse(resume.education, []),
        skills: this.safeJsonParse(resume.skills, []),
      }));

      return { data: processedResumes };
    } catch (error) {
      console.error('Error searching resumes:', error);
      throw new Error('Error en la búsqueda: ' + error.message);
    }
  }

  // ===============================================
  // COVER LETTERS CRUD OPERATIONS
  // ===============================================

  // CREATE - Crear nueva carta de recomendación
  async CreateCoverLetter(data) {
    await this.ensureDatabaseReady();
    try {
      console.log('💌 Creando carta de recomendación:', data);

      const coverLetterData = {
        resumeId: data.resumeId,
        jobApplicationId: data.jobApplicationId,
        userEmail: data.userEmail,
        content: data.content,
        style: data.style,
        length: data.length,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      const id = await db.coverLetters.add(coverLetterData);
      const result = await db.coverLetters.get(id);

      console.log('✅ Carta de recomendación creada con ID:', id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('❌ Error creando carta de recomendación:', error);
      throw new Error(
        'Error al crear carta de recomendación: ' + error.message
      );
    }
  }

  // READ - Obtener cartas de recomendación por CV
  async GetCoverLettersByResume(resumeId) {
    await this.ensureDatabaseReady();
    try {
      console.log('📋 Obteniendo cartas de recomendación para CV:', resumeId);

      const coverLetters = await db.coverLetters
        .where('resumeId')
        .equals(resumeId)
        .toArray();

      // Ordenar por fecha de creación (más reciente primero)
      const sortedCoverLetters = coverLetters.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      console.log('✅ Cartas encontradas:', sortedCoverLetters.length);
      return sortedCoverLetters;
    } catch (error) {
      console.error('❌ Error obteniendo cartas de recomendación:', error);
      throw new Error('Error al obtener cartas: ' + error.message);
    }
  }

  // READ - Obtener carta de recomendación por ID
  async GetCoverLetterById(id) {
    await this.ensureDatabaseReady();
    try {
      console.log('📄 Obteniendo carta de recomendación ID:', id);

      const coverLetter = await db.coverLetters.get(id);
      if (!coverLetter) {
        throw new Error('Carta de recomendación no encontrada');
      }

      console.log('✅ Carta encontrada:', coverLetter.companyName);
      return coverLetter;
    } catch (error) {
      console.error('❌ Error obteniendo carta de recomendación:', error);
      throw new Error('Error al obtener carta: ' + error.message);
    }
  }

  // UPDATE - Actualizar carta de recomendación
  async UpdateCoverLetter(id, updates) {
    await this.ensureDatabaseReady();
    try {
      console.log('📝 Actualizando carta de recomendación ID:', id, updates);

      await db.coverLetters.update(id, updates);
      const updatedCoverLetter = await db.coverLetters.get(id);

      console.log('✅ Carta actualizada exitosamente');
      return {
        success: true,
        data: updatedCoverLetter,
      };
    } catch (error) {
      console.error('❌ Error actualizando carta de recomendación:', error);
      throw new Error('Error al actualizar carta: ' + error.message);
    }
  }

  // DELETE - Eliminar carta de recomendación
  async DeleteCoverLetter(id) {
    await this.ensureDatabaseReady();
    try {
      console.log('🗑️ Eliminando carta de recomendación ID:', id);

      const coverLetter = await db.coverLetters.get(id);
      if (!coverLetter) {
        throw new Error('Carta de recomendación no encontrada');
      }

      await db.coverLetters.delete(id);
      console.log('✅ Carta eliminada exitosamente');
      return { success: true, message: 'Carta eliminada correctamente' };
    } catch (error) {
      console.error('❌ Error eliminando carta de recomendación:', error);
      throw new Error('Error al eliminar carta: ' + error.message);
    }
  }

  // READ - Obtener todas las cartas de un usuario
  async GetUserCoverLetters(userEmail) {
    await this.ensureDatabaseReady();
    try {
      console.log('📚 Obteniendo todas las cartas del usuario:', userEmail);

      const coverLetters = await db.coverLetters
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      // Ordenar por fecha de creación (más reciente primero)
      const sortedCoverLetters = coverLetters.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      console.log('✅ Total cartas del usuario:', sortedCoverLetters.length);
      return sortedCoverLetters;
    } catch (error) {
      console.error('❌ Error obteniendo cartas del usuario:', error);
      throw new Error('Error al obtener cartas del usuario: ' + error.message);
    }
  }

  // READ - Obtener cartas por candidatura específica
  async GetCoverLettersByApplication(jobApplicationId) {
    await this.ensureDatabaseReady();
    try {
      console.log(
        '📚 Obteniendo cartas para candidatura ID:',
        jobApplicationId
      );

      const coverLetters = await db.coverLetters
        .where('jobApplicationId')
        .equals(parseInt(jobApplicationId))
        .toArray();

      // Ordenar por fecha de creación (más reciente primero)
      const sortedCoverLetters = coverLetters.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      console.log(
        '✅ Total cartas para esta candidatura:',
        sortedCoverLetters.length
      );
      return {
        success: true,
        data: sortedCoverLetters,
        message: `${sortedCoverLetters.length} carta(s) encontrada(s)`,
      };
    } catch (error) {
      console.error('❌ Error obteniendo cartas de la candidatura:', error);
      throw new Error(
        'Error al obtener cartas de la candidatura: ' + error.message
      );
    }
  }

  // ===== CANDIDATURAS (JOB APPLICATIONS) =====

  // CREATE - Crear nueva candidatura
  async CreateJobApplication(data) {
    await this.ensureDatabaseReady();
    try {
      console.log('📝 Creando nueva candidatura:', data);

      // Validar datos requeridos
      if (
        !data.resumeId ||
        !data.userEmail ||
        !data.companyName ||
        !data.jobTitle
      ) {
        throw new Error(
          'Faltan campos obligatorios: resumeId, userEmail, companyName, jobTitle'
        );
      }

      const jobApplicationData = {
        resumeId: data.resumeId,
        userEmail: data.userEmail,
        companyName: data.companyName.trim(),
        jobTitle: data.jobTitle.trim(),
        jobDescription: data.jobDescription?.trim() || '',
        requirements: data.requirements?.trim() || '',
        responsibilities: data.responsibilities?.trim() || '',
        companyWebsite: data.companyWebsite?.trim() || '',
        contactPerson: data.contactPerson?.trim() || '',
        applicationDate:
          data.applicationDate || new Date().toISOString().split('T')[0],
        status: data.status || 'draft',
        notes: data.notes?.trim() || '',
      };

      const id = await db.jobApplications.add(jobApplicationData);
      console.log('✅ Candidatura creada con ID:', id);

      // Obtener el objeto completo creado
      const createdApplication = await db.jobApplications.get(id);

      return {
        success: true,
        data: createdApplication,
      };
    } catch (error) {
      console.error('❌ Error creando candidatura:', error);
      throw new Error('Error al crear candidatura: ' + error.message);
    }
  }

  // READ - Obtener candidaturas por CV
  async GetJobApplicationsByResume(resumeId, userEmail) {
    await this.ensureDatabaseReady();
    try {
      console.log('📚 Obteniendo candidaturas del CV:', resumeId);

      const applications = await db.jobApplications
        .where('resumeId')
        .equals(resumeId)
        .and((item) => item.userEmail === userEmail)
        .toArray();

      // Ordenar por fecha de actualización (más reciente primero)
      const sortedApplications = applications.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      console.log(
        '✅ Total candidaturas encontradas:',
        sortedApplications.length
      );
      return {
        success: true,
        data: sortedApplications,
      };
    } catch (error) {
      console.error('❌ Error obteniendo candidaturas:', error);
      throw new Error('Error al obtener candidaturas: ' + error.message);
    }
  }

  // READ - Obtener candidatura por ID
  async GetJobApplicationById(applicationId, userEmail) {
    await this.ensureDatabaseReady();
    try {
      console.log(
        '🔍 Obteniendo candidatura por ID:',
        applicationId,
        'para usuario:',
        userEmail
      );

      // Debug: ver todas las candidaturas existentes
      const allApplications = await db.jobApplications.toArray();
      console.log(
        '📚 Todas las candidaturas en DB:',
        allApplications.map((app) => ({
          id: app.id,
          userEmail: app.userEmail,
          company: app.companyName,
        }))
      );

      let application;
      if (userEmail) {
        application = await db.jobApplications
          .where('id')
          .equals(parseInt(applicationId))
          .and((item) => {
            console.log(
              '📧 Comparando emails:',
              item.userEmail,
              '===',
              userEmail,
              '?',
              item.userEmail === userEmail
            );
            return item.userEmail === userEmail;
          })
          .first();
      } else {
        // Si no se proporciona userEmail, buscar solo por ID
        application = await db.jobApplications.get(parseInt(applicationId));
      }

      if (!application) {
        throw new Error('Candidatura no encontrada');
      }

      console.log('✅ Candidatura encontrada:', application.companyName);
      return {
        success: true,
        data: application,
      };
    } catch (error) {
      console.error('❌ Error obteniendo candidatura:', error);
      throw new Error('Error al obtener candidatura: ' + error.message);
    }
  }

  // UPDATE - Actualizar candidatura
  async UpdateJobApplication(applicationId, updateData) {
    await this.ensureDatabaseReady();
    try {
      console.log('📝 Actualizando candidatura ID:', applicationId, updateData);

      const updatedFields = {};

      // Solo actualizar campos que se proporcionan
      if (updateData.companyName !== undefined)
        updatedFields.companyName = updateData.companyName.trim();
      if (updateData.jobTitle !== undefined)
        updatedFields.jobTitle = updateData.jobTitle.trim();
      if (updateData.jobDescription !== undefined)
        updatedFields.jobDescription = updateData.jobDescription.trim();
      if (updateData.requirements !== undefined)
        updatedFields.requirements = updateData.requirements.trim();
      if (updateData.responsibilities !== undefined)
        updatedFields.responsibilities = updateData.responsibilities.trim();
      if (updateData.companyWebsite !== undefined)
        updatedFields.companyWebsite = updateData.companyWebsite.trim();
      if (updateData.contactPerson !== undefined)
        updatedFields.contactPerson = updateData.contactPerson.trim();
      if (updateData.applicationDate !== undefined)
        updatedFields.applicationDate = updateData.applicationDate;
      if (updateData.status !== undefined)
        updatedFields.status = updateData.status;
      if (updateData.notes !== undefined)
        updatedFields.notes = updateData.notes.trim();

      const updated = await db.jobApplications.update(
        parseInt(applicationId),
        updatedFields
      );

      if (updated === 0) {
        throw new Error('Candidatura no encontrada para actualizar');
      }

      // Obtener la candidatura actualizada
      const updatedApplication = await db.jobApplications.get(
        parseInt(applicationId)
      );

      console.log('✅ Candidatura actualizada correctamente');
      return {
        success: true,
        data: updatedApplication,
      };
    } catch (error) {
      console.error('❌ Error actualizando candidatura:', error);
      throw new Error('Error al actualizar candidatura: ' + error.message);
    }
  }

  // DELETE - Eliminar candidatura
  async DeleteJobApplication(applicationId, userEmail) {
    await this.ensureDatabaseReady();
    try {
      console.log('🗑️ Eliminando candidatura ID:', applicationId);

      // Verificar que la candidatura pertenece al usuario
      const applicationResponse = await this.GetJobApplicationById(
        applicationId,
        userEmail
      );
      if (!applicationResponse.success || !applicationResponse.data) {
        throw new Error('Candidatura no encontrada o no autorizada');
      }

      // Eliminar cartas de presentación asociadas
      await db.coverLetters
        .where('jobApplicationId')
        .equals(parseInt(applicationId))
        .delete();

      // Eliminar simulaciones de entrevista asociadas
      await db.interviewSimulations
        .where('jobApplicationId')
        .equals(parseInt(applicationId))
        .delete();

      // Eliminar la candidatura
      const deleted = await db.jobApplications.delete(parseInt(applicationId));

      console.log('✅ Candidatura y datos asociados eliminados');
      return {
        success: true,
        data: { deleted: deleted > 0 },
      };
    } catch (error) {
      console.error('❌ Error eliminando candidatura:', error);
      throw new Error('Error al eliminar candidatura: ' + error.message);
    }
  }

  // ===== SIMULACIONES DE ENTREVISTA =====

  // CREATE - Crear simulación de entrevista
  async CreateInterviewSimulation(data) {
    await this.ensureDatabaseReady();
    try {
      console.log('🎯 Creando simulación de entrevista:', data);

      // Validar datos requeridos
      if (
        !data.jobApplicationId ||
        !data.resumeId ||
        !data.userEmail ||
        !data.candidateLevel ||
        !data.questions
      ) {
        throw new Error(
          'Faltan campos obligatorios para simulación de entrevista'
        );
      }

      const simulationData = {
        jobApplicationId: parseInt(data.jobApplicationId),
        resumeId: data.resumeId,
        userEmail: data.userEmail,
        candidateLevel: data.candidateLevel,
        questions: JSON.stringify(data.questions), // Serializar array de preguntas
      };

      const id = await db.interviewSimulations.add(simulationData);
      console.log('✅ Simulación de entrevista creada con ID:', id);

      return id;
    } catch (error) {
      console.error('❌ Error creando simulación:', error);
      throw new Error(
        'Error al crear simulación de entrevista: ' + error.message
      );
    }
  }

  // READ - Obtener simulación de entrevista por candidatura
  async GetInterviewSimulation(jobApplicationId, userEmail) {
    await this.ensureDatabaseReady();
    try {
      console.log(
        '🎯 Obteniendo simulación para candidatura:',
        jobApplicationId
      );

      const simulation = await db.interviewSimulations
        .where('jobApplicationId')
        .equals(parseInt(jobApplicationId))
        .and((item) => item.userEmail === userEmail)
        .first();

      if (simulation) {
        // Deserializar preguntas
        simulation.questions = JSON.parse(simulation.questions);
        console.log(
          '✅ Simulación encontrada con',
          simulation.questions.length,
          'preguntas'
        );
      } else {
        console.log('ℹ️ No se encontró simulación para esta candidatura');
      }

      return simulation;
    } catch (error) {
      console.error('❌ Error obteniendo simulación:', error);
      throw new Error(
        'Error al obtener simulación de entrevista: ' + error.message
      );
    }
  }

  // UPDATE - Actualizar simulación de entrevista
  async UpdateInterviewSimulation(simulationId, updateData) {
    await this.ensureDatabaseReady();
    try {
      console.log('📝 Actualizando simulación ID:', simulationId);

      const updatedFields = {};

      if (updateData.candidateLevel !== undefined)
        updatedFields.candidateLevel = updateData.candidateLevel;
      if (updateData.questions !== undefined)
        updatedFields.questions = JSON.stringify(updateData.questions);

      const updated = await db.interviewSimulations.update(
        parseInt(simulationId),
        updatedFields
      );

      if (updated === 0) {
        throw new Error('Simulación no encontrada para actualizar');
      }

      console.log('✅ Simulación actualizada correctamente');
      return updated;
    } catch (error) {
      console.error('❌ Error actualizando simulación:', error);
      throw new Error('Error al actualizar simulación: ' + error.message);
    }
  }

  // DELETE - Eliminar simulación de entrevista
  async DeleteInterviewSimulation(simulationId, userEmail) {
    await this.ensureDatabaseReady();
    try {
      console.log('🗑️ Eliminando simulación ID:', simulationId);

      // Verificar que la simulación pertenece al usuario
      const simulation = await db.interviewSimulations
        .where('id')
        .equals(parseInt(simulationId))
        .and((item) => item.userEmail === userEmail)
        .first();

      if (!simulation) {
        throw new Error('Simulación no encontrada o no autorizada');
      }

      const deleted = await db.interviewSimulations.delete(
        parseInt(simulationId)
      );

      console.log('✅ Simulación eliminada correctamente');
      return deleted;
    } catch (error) {
      console.error('❌ Error eliminando simulación:', error);
      throw new Error('Error al eliminar simulación: ' + error.message);
    }
  }

  // ===== MIGRACIÓN DE DATOS =====

  // Migrar cartas existentes a candidaturas automáticas
  async MigrateExistingCoverLetters() {
    await this.ensureDatabaseReady();
    try {
      console.log('🔄 Iniciando migración de cartas existentes...');

      // Obtener todas las cartas que no tienen jobApplicationId
      const orphanLetters = await db.coverLetters
        .where('jobApplicationId')
        .equals(undefined)
        .or('jobApplicationId')
        .equals(null)
        .toArray();

      console.log(`📋 Encontradas ${orphanLetters.length} cartas para migrar`);

      let migratedCount = 0;

      for (const letter of orphanLetters) {
        try {
          // Crear candidatura automática para cada carta huérfana
          const jobAppData = {
            resumeId: letter.resumeId,
            userEmail: letter.userEmail,
            companyName: letter.companyName || 'Empresa no especificada',
            jobTitle: letter.jobTitle || 'Puesto no especificado',
            jobDescription: letter.jobDetails || '',
            requirements: '',
            responsibilities: '',
            status: 'draft',
          };

          const jobAppId = await this.CreateJobApplication(jobAppData);

          // Vincular carta a la nueva candidatura
          await db.coverLetters.update(letter.id, {
            jobApplicationId: jobAppId,
            style: letter.style || 'formal',
            length: letter.length || 'medium',
          });

          migratedCount++;
          console.log(
            `✅ Carta migrada: ${letter.companyName} - ${letter.jobTitle}`
          );
        } catch (error) {
          console.error(`❌ Error migrando carta ID ${letter.id}:`, error);
        }
      }

      console.log(
        `🎉 Migración completada: ${migratedCount}/${orphanLetters.length} cartas migradas`
      );
      return { total: orphanLetters.length, migrated: migratedCount };
    } catch (error) {
      console.error('❌ Error en migración:', error);
      throw new Error('Error en migración de datos: ' + error.message);
    }
  }

  // Verificar estado de migración
  async CheckMigrationStatus() {
    await this.ensureDatabaseReady();
    try {
      const orphanLetters = await db.coverLetters
        .where('jobApplicationId')
        .equals(undefined)
        .or('jobApplicationId')
        .equals(null)
        .count();

      const totalApplications = await db.jobApplications.count();
      const totalSimulations = await db.interviewSimulations.count();

      return {
        needsMigration: orphanLetters > 0,
        orphanLetters,
        totalApplications,
        totalSimulations,
      };
    } catch (error) {
      console.error('❌ Error verificando migración:', error);
      return { needsMigration: false, error: error.message };
    }
  }
}

// Instancia global del servicio
const localDB = new LocalDatabase();

// Exportar tanto la clase como la instancia
export { LocalDatabase };
export default localDB;
