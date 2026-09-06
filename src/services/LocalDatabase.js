// src/services/LocalDatabase.js
import { db } from './IndexedDBService.js';
import { v4 as uuidv4 } from 'uuid';

class LocalDatabase {
  // UTILITY - Verificar que la DB esté inicializada
  async ensureDatabaseReady() {
    try {
      if (!db.isOpen()) {
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
        languages: JSON.stringify(data.languages || []),
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const id = await db.resumes.add(resumeData);

      // Re-vincular candidaturas que se crearon antes de que el CV tuviera ID numérico
      try {
        const orphanApps = await db.jobApplications
          .where('resumeDocumentId')
          .equals(documentId)
          .toArray();

        if (orphanApps && orphanApps.length > 0) {
          for (const app of orphanApps) {
            try {
              await db.jobApplications.update(app.id, {
                resumeId: id,
                // eliminar la referencia temporal
                resumeDocumentId: undefined,
              });
            } catch (err) {
              console.warn(
                '⚠️ No se pudo re-vincular candidatura ID:',
                app.id,
                err
              );
            }
          }
        }
      } catch (linkErr) {
        console.warn(
          '⚠️ Error re-vinculando candidaturas al crear CV:',
          linkErr
        );
      }

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
      // Verificar que la base de datos esté disponible
      if (!db || !db.resumes) {
        throw new Error('Base de datos no disponible');
      } // Obtener todos los CVs del usuario y ordenar en memoria
      const resumes = await db.resumes
        .where('userEmail')
        .equals(userEmail)
        .toArray();

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
        languages: this.safeJsonParse(resume.languages, []),
      }));

      return { data: processedResumes };
    } catch (error) {
      console.error('Error getting user resumes:', error);
      throw new Error('No se pudieron cargar los CVs: ' + error.message);
    }
  }

  // READ - Obtener CV por ID
  async GetResumeById(resumeId) {
    await this.ensureDatabaseReady();
    try {
      let resume;

      // Si es un número, buscar por ID numérico (clave primaria de IndexedDB)
      if (!isNaN(resumeId) && resumeId !== null && resumeId !== undefined) {
        resume = await db.resumes.get(parseInt(resumeId));
      } else {
        // Si es un string (UUID), buscar por documentId
        resume = await db.resumes.where('documentId').equals(resumeId).first();
      }

      if (!resume) {
        throw new Error('CV no encontrado');
      }

      const processedResume = {
        ...resume,
        experience: this.safeJsonParse(resume.experience, []),
        education: this.safeJsonParse(resume.education, []),
        skills: this.safeJsonParse(resume.skills, []),
        languages: this.safeJsonParse(resume.languages, []),
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
      // Soportar tanto documentId (UUID) como el id numérico (clave primaria)
      let existingResume = null;

      // Si parece un número, intentar por ID numérico (clave primaria)
      if (
        !isNaN(documentId) &&
        documentId !== null &&
        documentId !== undefined
      ) {
        existingResume = await db.resumes.get(parseInt(documentId));
      }

      // Si no encontramos por ID numérico, intentar por documentId (UUID)
      if (!existingResume) {
        existingResume = await db.resumes
          .where('documentId')
          .equals(documentId)
          .first();
      }

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
      if (processedData.languages && Array.isArray(processedData.languages)) {
        processedData.languages = JSON.stringify(processedData.languages);
      }

      // Actualizar campos (Dexie hook se encarga de updatedAt y version)
      // Si tenemos el id numérico, usar update por clave primaria, sino usar modify por documentId
      if (existingResume.id !== undefined && existingResume.id !== null) {
        await db.resumes.update(existingResume.id, processedData);
      } else {
        await db.resumes
          .where('documentId')
          .equals(documentId)
          .modify(processedData);
      }

      // Obtener registro actualizado para retornar
      const updatedResume = await this.GetResumeById(
        existingResume.id !== undefined && existingResume.id !== null
          ? existingResume.id
          : documentId
      );
      // resume updated
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
      // Si es null o undefined, devolver valor por defecto
      if (jsonString === null || jsonString === undefined) {
        return defaultValue;
      }

      // Si es string, parsear
      if (typeof jsonString === 'string') {
        // Si está vacío, devolver valor por defecto
        if (jsonString.trim() === '') {
          return defaultValue;
        }
        return JSON.parse(jsonString);
      }

      // Si ya es un objeto/array, devolverlo tal cual
      return jsonString;
    } catch (error) {
      console.warn('Error parsing JSON:', error, 'Value:', jsonString);
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

  // READ - Obtener CV por shareToken (para compartir públicamente en cliente local)
  async GetResumeByShareToken(shareToken, trackView = false) {
    await this.ensureDatabaseReady();
    try {
      if (!shareToken) throw new Error('shareToken inválido');

      // Intentar buscar por campo shareToken en la tabla de resumes (requiere índice)
      let resume = null;
      try {
        resume = await db.resumes
          .where('shareToken')
          .equals(shareToken)
          .first();
      } catch (dexieErr) {
        // Si Dexie falla (por ejemplo, porque no existe índice 'shareToken'),
        // caemos a una estrategia de respaldo: leer todos los resumes y buscar manualmente.
        console.warn(
          'GetResumeByShareToken: query by index failed, falling back to scan:',
          dexieErr
        );
        const all = await db.resumes.toArray();
        resume = all.find((r) => r && r.shareToken === shareToken);
      }

      if (!resume) {
        throw new Error('CV no encontrado para este token');
      }

      // Registrar visualización si se solicita
      if (trackView) {
        try {
          await this.TrackShareView(shareToken, resume.id);
        } catch (trackError) {
          console.warn('Error tracking view:', trackError);
          // No lanzar error para no interrumpir la carga del CV
        }
      }

      const processedResume = {
        ...resume,
        experience: this.safeJsonParse(resume.experience, []),
        education: this.safeJsonParse(resume.education, []),
        skills: this.safeJsonParse(resume.skills, []),
        languages: this.safeJsonParse(resume.languages, []),
      };

      return { data: processedResume };
    } catch (error) {
      console.error('Error GetResumeByShareToken:', error);
      throw error;
    }
  }

  // CREATE - Registrar visualización de enlace compartido
  async TrackShareView(shareToken, resumeId) {
    await this.ensureDatabaseReady();
    try {
      const viewData = {
        shareToken,
        resumeId,
        viewedAt: new Date(),
        userAgent: navigator.userAgent || 'Unknown',
        referrer: document.referrer || 'Direct',
        // Podrías añadir geolocalización con una API externa aquí
        country: null,
        city: null,
      };

      await db.shareViews.add(viewData);
    } catch (error) {
      console.error('Error tracking share view:', error);
      throw error;
    }
  }

  // READ - Obtener estadísticas de visualizaciones para un CV
  async GetShareStats(resumeId) {
    await this.ensureDatabaseReady();
    try {
      // Obtener el resume para verificar que existe
      const resume = await db.resumes.get(parseInt(resumeId));
      if (!resume) {
        throw new Error('CV no encontrado');
      }

      // Obtener todas las visualizaciones
      const views = await db.shareViews
        .where('resumeId')
        .equals(parseInt(resumeId))
        .toArray();

      // Calcular estadísticas
      const totalViews = views.length;
      const uniqueUserAgents = [...new Set(views.map((v) => v.userAgent))]
        .length;
      const viewsByDate = views.reduce((acc, view) => {
        const date = new Date(view.viewedAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const lastView =
        views.length > 0
          ? new Date(Math.max(...views.map((v) => new Date(v.viewedAt))))
          : null;

      return {
        totalViews,
        uniqueVisitors: uniqueUserAgents,
        viewsByDate,
        lastView,
        recentViews: views
          .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
          .slice(0, 10), // Últimas 10 visualizaciones
      };
    } catch (error) {
      console.error('Error getting share stats:', error);
      throw error;
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
      return await db.resumes.toArray();
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

      return {
        isOpen: db.isOpen(),
        version: db.verno,
        totalResumes,
        totalUsers,
        tables: db.tables.map((t) => t.name),
      };
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

  // UPDATE - Actualizar carta de recomendación
  async UpdateCoverLetter(id, updates) {
    await this.ensureDatabaseReady();
    try {
      await db.coverLetters.update(id, updates);
      const updatedCoverLetter = await db.coverLetters.get(id);

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
      const coverLetter = await db.coverLetters.get(id);
      if (!coverLetter) {
        throw new Error('Carta de recomendación no encontrada');
      }

      await db.coverLetters.delete(id);
      return { success: true, message: 'Carta eliminada correctamente' };
    } catch (error) {
      console.error('❌ Error eliminando carta de recomendación:', error);
      throw new Error('Error al eliminar carta: ' + error.message);
    }
  }

  // READ - Obtener la carta actual de una candidatura específica
  async GetCoverLetterByApplication(jobApplicationId) {
    await this.ensureDatabaseReady();
    try {
      const coverLetters = await db.coverLetters
        .where('jobApplicationId')
        .equals(parseInt(jobApplicationId))
        .toArray();

      if (coverLetters.length === 0) {
        return {
          success: true,
          data: null,
          message: 'No hay carta para esta candidatura',
        };
      }

      // Solo debería haber una carta por candidatura, pero por si acaso tomamos la más reciente
      const sortedCoverLetters = coverLetters.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const coverLetter = sortedCoverLetters[0];
      return {
        success: true,
        data: coverLetter,
        message: 'Carta encontrada',
      };
    } catch (error) {
      console.error('❌ Error obteniendo carta de la candidatura:', error);
      throw new Error(
        'Error al obtener carta de la candidatura: ' + error.message
      );
    }
  }

  // ===== CANDIDATURAS (JOB APPLICATIONS) =====

  // CREATE - Crear nueva candidatura
  async CreateJobApplication(data) {
    await this.ensureDatabaseReady();
    try {
      // Normalizar resumeId: si recibimos un UUID (documentId), resolver al id numérico
      let numericResumeId = data.resumeId;
      if (
        typeof numericResumeId === 'string' &&
        numericResumeId.includes('-')
      ) {
        const resumeRecord = await db.resumes
          .where('documentId')
          .equals(numericResumeId)
          .first();
        if (resumeRecord && resumeRecord.id !== undefined) {
          numericResumeId = resumeRecord.id;
        } else {
          // Si no encontramos el CV guardado todavía, no bloqueamos la creación.
          // Guardaremos la candidatura vinculándola al documentId en el campo resumeDocumentId
          console.warn(
            '⚠️ No se encontró CV con documentId proporcionado (se guardará referencia por documentId):',
            data.resumeId
          );
          // marcar para almacenar la referencia al documentId más abajo
          data._resumeDocumentIdFallback = numericResumeId;
          numericResumeId = undefined;
        }
      }

      // Validar datos requeridos
      if (
        (numericResumeId === undefined && !data._resumeDocumentIdFallback) ||
        !data.userEmail ||
        !data.companyName ||
        !data.jobTitle
      ) {
        throw new Error(
          'Faltan campos obligatorios: resumeId, userEmail, companyName, jobTitle'
        );
      }

      const jobApplicationData = {
        // Guardamos el resumeId como número cuando esté disponible; si no, usaremos resumeDocumentId
        resumeId:
          numericResumeId !== undefined ? parseInt(numericResumeId) : undefined,
        userEmail: data.userEmail,
        companyName: data.companyName.trim(),
        jobTitle: data.jobTitle.trim(),
        jobDescription: data.jobDescription?.trim() || '',
        location: data.location?.trim() || '',
        salary:
          data.salary !== undefined && data.salary !== null && data.salary !== ''
            ? Number(data.salary)
            : null,
        requirements: data.requirements?.trim() || '',
        responsibilities: data.responsibilities?.trim() || '',
        benefits: data.benefits?.trim() || '',
        companyWebsite: data.companyWebsite?.trim() || '',
        contactPerson: data.contactPerson?.trim() || '',
        contactEmail: data.contactEmail?.trim() || '',
        contactPhone: data.contactPhone?.trim() || '',
        jobUrl: data.jobUrl?.trim() || '',
        // Interview fields
        interviewDate: data.interviewDate || null,
        interviewLink: data.interviewLink?.trim() || '',
        applicationDate:
          data.applicationDate || new Date().toISOString().split('T')[0],
        status: data.status || 'draft',
        workMode: data.workMode || 'presencial',
        candidateLevel: data.candidateLevel || 'junior',
        coverLetterGenerated: Boolean(data.coverLetterGenerated),
        interviewSimulated: Boolean(data.interviewSimulated),
        notes: data.notes?.trim() || '',
      };

      // Si tuvimos que caer al documentId porque el CV no estaba guardado, añadirlo
      if (data._resumeDocumentIdFallback) {
        jobApplicationData.resumeDocumentId = data._resumeDocumentIdFallback;
      }

      const id = await db.jobApplications.add(jobApplicationData);

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
      // Si resumeId es un UUID (string), primero buscar el CV para obtener el ID numérico
      let numericResumeId = resumeId;
      if (typeof resumeId === 'string' && resumeId.includes('-')) {
        const resume = await db.resumes
          .where('documentId')
          .equals(resumeId)
          .first();
        if (resume) {
          numericResumeId = resume.id;
        } else {
          console.warn('⚠️ No se encontró CV con documentId:', resumeId);
          return { success: true, data: [] };
        }
      }

      const applications = await db.jobApplications
        .where('resumeId')
        .equals(parseInt(numericResumeId))
        .and((item) => item.userEmail === userEmail)
        .toArray();

      // Si no encontramos aplicaciones y recibimos un resumeId que podría ser un documentId
      let finalApplications = applications;
      if (
        (applications.length === 0 || applications === undefined) &&
        typeof resumeId === 'string' &&
        resumeId.includes('-')
      ) {
        finalApplications = await db.jobApplications
          .where('resumeDocumentId')
          .equals(resumeId)
          .and((item) => item.userEmail === userEmail)
          .toArray();
      }

      // Ordenar por fecha de actualización (más reciente primero)
      const sortedApplications = (finalApplications || applications).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
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
      let application;
      if (userEmail) {
        application = await db.jobApplications
          .where('id')
          .equals(parseInt(applicationId))
          .and((item) => item.userEmail === userEmail)
          .first();
      } else {
        // Si no se proporciona userEmail, buscar solo por ID
        application = await db.jobApplications.get(parseInt(applicationId));
      }

      if (!application) {
        throw new Error('Candidatura no encontrada');
      }

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
  async UpdateJobApplication(applicationId, updateData, userEmail) {
    await this.ensureDatabaseReady();
    try {
      if (userEmail) {
        await this.GetJobApplicationById(applicationId, userEmail);
      }

      const updatedFields = {};

      // Solo actualizar campos que se proporcionan
      if (updateData.companyName !== undefined)
        updatedFields.companyName = updateData.companyName.trim();
      if (updateData.jobTitle !== undefined)
        updatedFields.jobTitle = updateData.jobTitle.trim();
      if (updateData.jobDescription !== undefined)
        updatedFields.jobDescription = updateData.jobDescription.trim();
      if (updateData.location !== undefined)
        updatedFields.location = updateData.location?.trim() || '';
      if (updateData.salary !== undefined)
        updatedFields.salary =
          updateData.salary !== null && updateData.salary !== ''
            ? Number(updateData.salary)
            : null;
      if (updateData.requirements !== undefined)
        updatedFields.requirements = updateData.requirements.trim();
      if (updateData.responsibilities !== undefined)
        updatedFields.responsibilities = updateData.responsibilities.trim();
      if (updateData.benefits !== undefined)
        updatedFields.benefits = updateData.benefits?.trim() || '';
      if (updateData.companyWebsite !== undefined)
        updatedFields.companyWebsite = updateData.companyWebsite.trim();
      if (updateData.contactPerson !== undefined)
        updatedFields.contactPerson = updateData.contactPerson.trim();
      if (updateData.contactEmail !== undefined)
        updatedFields.contactEmail = updateData.contactEmail.trim();
      if (updateData.contactPhone !== undefined)
        updatedFields.contactPhone = updateData.contactPhone.trim();
      if (updateData.jobUrl !== undefined)
        updatedFields.jobUrl = updateData.jobUrl.trim();
      if (updateData.interviewDate !== undefined)
        updatedFields.interviewDate = updateData.interviewDate;
      if (updateData.interviewLink !== undefined)
        updatedFields.interviewLink = updateData.interviewLink?.trim();
      if (updateData.applicationDate !== undefined)
        updatedFields.applicationDate = updateData.applicationDate;
      if (updateData.status !== undefined)
        updatedFields.status = updateData.status;
      if (updateData.workMode !== undefined)
        updatedFields.workMode = updateData.workMode;
      if (updateData.candidateLevel !== undefined)
        updatedFields.candidateLevel = updateData.candidateLevel;
      if (updateData.coverLetterGenerated !== undefined)
        updatedFields.coverLetterGenerated = Boolean(
          updateData.coverLetterGenerated
        );
      if (updateData.interviewSimulated !== undefined)
        updatedFields.interviewSimulated = Boolean(updateData.interviewSimulated);
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
      const simulation = await db.interviewSimulations
        .where('jobApplicationId')
        .equals(parseInt(jobApplicationId))
        .and((item) => item.userEmail === userEmail)
        .first();

      if (simulation) {
        // Deserializar preguntas
        simulation.questions = JSON.parse(simulation.questions);
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
      // Obtener todas las cartas que no tienen jobApplicationId
      const orphanLetters = await db.coverLetters
        .where('jobApplicationId')
        .equals(undefined)
        .or('jobApplicationId')
        .equals(null)
        .toArray();

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

          const jobApp = await this.CreateJobApplication(jobAppData);

          // Vincular carta a la nueva candidatura
          await db.coverLetters.update(letter.id, {
            jobApplicationId: jobApp.data.id,
            style: letter.style || 'formal',
            length: letter.length || 'medium',
          });

          migratedCount++;
        } catch (error) {
          console.error(`❌ Error migrando carta ID ${letter.id}:`, error);
        }
      }

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

  // ============================================================================
  // MÉTODOS ADICIONALES PARA INTERVIEW SIMULATIONS
  // ============================================================================

  /**
   * READ - Obtener simulación por ID de candidatura (alias mejorado)
   * @param {string} jobApplicationId - ID de la candidatura
   * @param {string} userEmail - Email del usuario
   * @returns {Promise<Object>} Simulación encontrada o null
   */
  async GetInterviewSimulationByJobApplication(jobApplicationId, userEmail) {
    // Usar el método existente GetInterviewSimulation
    const simulation = await this.GetInterviewSimulation(
      jobApplicationId,
      userEmail
    );
    return { data: simulation || null };
  }

  /**
   * DELETE - Eliminar simulación por candidatura (para regenerar)
   * @param {string} jobApplicationId - ID de la candidatura
   * @param {string} userEmail - Email del usuario
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async DeleteInterviewSimulationByJobApplication(jobApplicationId, userEmail) {
    await this.ensureDatabaseReady();
    try {
      // Buscar simulación existente
      const simulation = await this.GetInterviewSimulation(
        jobApplicationId,
        userEmail
      );

      if (simulation && simulation.id) {
        await this.DeleteInterviewSimulation(simulation.id, userEmail);
        return {
          success: true,
          message: 'Simulación eliminada, lista para regenerar',
        };
      }

      return {
        success: true,
        message: 'No había simulación previa',
      };
    } catch (error) {
      console.error('❌ Error eliminando simulación por candidatura:', error);
      throw new Error('No se pudo eliminar la simulación: ' + error.message);
    }
  }

  /**
   * UTILITY - Obtener estadísticas de simulaciones de un usuario
   * @param {string} userEmail - Email del usuario
   * @returns {Promise<Object>} Estadísticas
   */
  async GetInterviewSimulationStats(userEmail) {
    await this.ensureDatabaseReady();
    try {
      const simulations = await db.interviewSimulations
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      const stats = {
        total: simulations.length,
        byLevel: {
          junior: simulations.filter((s) => s.candidateLevel === 'junior')
            .length,
          mid: simulations.filter((s) => s.candidateLevel === 'mid').length,
          senior: simulations.filter((s) => s.candidateLevel === 'senior')
            .length,
        },
        totalQuestions: simulations.reduce((acc, sim) => {
          const questions = this.safeJsonParse(sim.questions, []);
          return acc + questions.length;
        }, 0),
        lastGenerated:
          simulations.length > 0
            ? simulations.reduce((latest, sim) =>
                new Date(sim.generatedAt || sim.createdAt) >
                new Date(latest.generatedAt || latest.createdAt)
                  ? sim
                  : latest
              ).generatedAt || simulations[0].createdAt
            : null,
      };

      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        total: 0,
        byLevel: { junior: 0, mid: 0, senior: 0 },
        totalQuestions: 0,
        lastGenerated: null,
      };
    }
  }
}

// Instancia global del servicio
const localDB = new LocalDatabase();

// ---------------------------------------------
// Web Page Config - Persistencia y recuperación
// ---------------------------------------------

/**
 * Guarda la configuración de la página web del CV
 */
LocalDatabase.prototype.SaveWebPageConfig = async function (resumeId, config) {
  try {
    // Reutilizar UpdateResumeDetail para persistir webPageConfig dentro del registro
    const payload = { webPageConfig: config };
    // SaveWebPageConfig called
    return await this.UpdateResumeDetail(resumeId, payload);
  } catch (error) {
    console.error('❌ Error guardando configuración web:', error);
    throw error;
  }
};

/**
 * Obtiene la configuración de la página web del CV
 */
LocalDatabase.prototype.GetWebPageConfig = async function (resumeId) {
  try {
    const response = await this.GetResumeById(resumeId);
    const resume = response.data;
    return { data: resume.webPageConfig || null };
  } catch (error) {
    console.error('❌ Error cargando configuración web:', error);
    throw error;
  }
};

// Exportar tanto la clase como la instancia
export { LocalDatabase };
export default localDB;

// -----------------------------------------------------------------------------
// Métodos añadidos para soporte de Calendario / Entrevistas
// -----------------------------------------------------------------------------

/**
 * Obtener todas las entrevistas de un usuario
 */
LocalDatabase.prototype.GetAllInterviews = async function (userEmail) {
  await this.ensureDatabaseReady();
  try {
    const applications = await db.jobApplications
      .where('userEmail')
      .equals(userEmail)
      .filter((app) => app.interviewDate != null && app.interviewDate !== '')
      .toArray();

    return {
      success: true,
      data: applications,
    };
  } catch (error) {
    console.error('Error al obtener entrevistas:', error);
    throw new Error('Error al obtener entrevistas: ' + error.message);
  }
};

/**
 * Obtener entrevistas de un mes específico
 */
LocalDatabase.prototype.GetInterviewsByMonth = async function (
  userEmail,
  year,
  month
) {
  await this.ensureDatabaseReady();
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const applications = await db.jobApplications
      .where('userEmail')
      .equals(userEmail)
      .filter((app) => {
        if (!app.interviewDate) return false;
        const interviewDate = new Date(app.interviewDate);
        return interviewDate >= startDate && interviewDate <= endDate;
      })
      .toArray();

    return {
      success: true,
      data: applications,
      count: applications.length,
    };
  } catch (error) {
    console.error('Error al obtener entrevistas del mes:', error);
    throw new Error('Error al obtener entrevistas del mes: ' + error.message);
  }
};

/**
 * Obtener entrevistas pendientes (futuras)
 */
LocalDatabase.prototype.GetUpcomingInterviews = async function (
  userEmail,
  limit = 10
) {
  await this.ensureDatabaseReady();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const applications = await db.jobApplications
      .where('userEmail')
      .equals(userEmail)
      .filter((app) => {
        if (!app.interviewDate) return false;
        const interviewDate = new Date(app.interviewDate);
        return interviewDate >= today;
      })
      .toArray();

    // Ordenar por fecha ascendente y limitar
    const sorted = applications
      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
      .slice(0, limit);

    return {
      success: true,
      data: sorted,
    };
  } catch (error) {
    console.error('Error al obtener entrevistas próximas:', error);
    throw new Error('Error al obtener entrevistas próximas: ' + error.message);
  }
};
