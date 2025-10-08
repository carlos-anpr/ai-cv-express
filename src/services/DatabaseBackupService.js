// src/services/DatabaseBackupService.js
import { db } from './IndexedDBService.js';
import { v4 as uuidv4 } from 'uuid';

class DatabaseBackupService {
  /**
   * Exporta la base de datos completa con limpieza
   * Elimina cartas de presentación y candidaturas huérfanas
   */
  async exportDatabase(userEmail) {
    try {
      console.log('🔄 Iniciando exportación de base de datos...');

      // 1. Obtener todos los CVs del usuario
      const resumes = await db.resumes
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      if (!resumes || resumes.length === 0) {
        throw new Error('No hay CVs para exportar');
      }

      const resumeIds = resumes.map((r) => r.id);
      const resumeDocumentIds = resumes.map((r) => r.documentId);

      console.log(
        `📊 Exportando ${resumes.length} CVs (IDs: ${resumeIds.join(', ')})`
      );

      // 2. Obtener candidaturas asociadas a estos CVs
      const allApplications = await db.jobApplications
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      // Filtrar solo las que están asociadas a CVs existentes
      const validApplications = allApplications.filter(
        (app) =>
          resumeIds.includes(app.resumeId) ||
          resumeDocumentIds.includes(app.resumeDocumentId)
      );

      const orphanApplications =
        allApplications.length - validApplications.length;
      if (orphanApplications > 0) {
        console.warn(
          `⚠️ Se encontraron ${orphanApplications} candidaturas huérfanas (no asociadas a CVs). No se exportarán.`
        );
      }

      const applicationIds = validApplications.map((a) => a.id);

      // 3. Obtener cartas de presentación asociadas a candidaturas válidas
      const allCoverLetters = await db.coverLetters
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      // Filtrar solo las que están asociadas a candidaturas válidas
      const validCoverLetters = allCoverLetters.filter(
        (letter) =>
          applicationIds.includes(letter.jobApplicationId) ||
          resumeIds.includes(letter.resumeId)
      );

      const orphanLetters = allCoverLetters.length - validCoverLetters.length;
      if (orphanLetters > 0) {
        console.warn(
          `⚠️ Se encontraron ${orphanLetters} cartas huérfanas (no asociadas a candidaturas válidas). No se exportarán.`
        );
      }

      // 4. Obtener simulaciones de entrevistas
      const interviewSimulations = await db.interviewSimulations
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      const validSimulations = interviewSimulations.filter(
        (sim) =>
          applicationIds.includes(sim.jobApplicationId) ||
          resumeIds.includes(sim.resumeId)
      );

      // 5. Obtener datos de usuario
      const userData = await db.userData
        .where('userEmail')
        .equals(userEmail)
        .first();

      // 6. Crear objeto de exportación
      const exportData = {
        metadata: {
          version: '1.0.0',
          exportDate: new Date().toISOString(),
          userEmail: userEmail,
          appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
        },
        statistics: {
          resumes: resumes.length,
          applications: validApplications.length,
          coverLetters: validCoverLetters.length,
          interviewSimulations: validSimulations.length,
          orphanApplicationsRemoved: orphanApplications,
          orphanLettersRemoved: orphanLetters,
        },
        data: {
          resumes: resumes,
          jobApplications: validApplications,
          coverLetters: validCoverLetters,
          interviewSimulations: validSimulations,
          userData: userData,
        },
      };

      console.log('✅ Exportación completada:', exportData.statistics);
      return exportData;
    } catch (error) {
      console.error('❌ Error en exportación:', error);
      throw new Error(`Error al exportar: ${error.message}`);
    }
  }

  /**
   * Descarga el backup como archivo JSON
   */
  async downloadBackup(userEmail) {
    try {
      const exportData = await this.exportDatabase(userEmail);

      const fileName = `resume-backup-${userEmail.split('@')[0]}-${
        new Date().toISOString().split('T')[0]
      }.json`;

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      console.log(`✅ Backup descargado: ${fileName}`);
      return exportData.statistics;
    } catch (error) {
      console.error('❌ Error al descargar backup:', error);
      throw error;
    }
  }

  /**
   * Valida un archivo de backup
   */
  async validateBackupFile(fileContent) {
    try {
      const data = JSON.parse(fileContent);

      // Validar estructura básica
      if (!data.metadata || !data.data) {
        return {
          valid: false,
          error: 'Formato de archivo inválido. Falta metadata o data.',
        };
      }

      if (!data.metadata.version || !data.metadata.exportDate) {
        return {
          valid: false,
          error: 'Metadata incompleta en el archivo.',
        };
      }

      if (!data.data.resumes || !Array.isArray(data.data.resumes)) {
        return {
          valid: false,
          error: 'No se encontraron CVs en el archivo.',
        };
      }

      return {
        valid: true,
        data: data,
        statistics: data.statistics,
        metadata: data.metadata,
      };
    } catch (error) {
      return {
        valid: false,
        error: `Error al leer el archivo: ${error.message}`,
      };
    }
  }

  /**
   * Detecta duplicados en la base de datos actual
   */
  async detectDuplicates(importData, userEmail) {
    try {
      const duplicates = {
        resumes: [],
        jobApplications: [],
        coverLetters: [],
        interviewSimulations: [],
      };

      // Verificar CVs duplicados por documentId
      for (const resume of importData.data.resumes || []) {
        const existing = await db.resumes
          .where('documentId')
          .equals(resume.documentId)
          .first();

        if (existing) {
          duplicates.resumes.push({
            importItem: resume,
            existingItem: existing,
            field: 'documentId',
            value: resume.documentId,
          });
        }
      }

      // Verificar candidaturas duplicadas por combinación companyName + jobTitle + userEmail
      for (const app of importData.data.jobApplications || []) {
        const existing = await db.jobApplications
          .where('userEmail')
          .equals(userEmail)
          .filter(
            (item) =>
              item.companyName === app.companyName &&
              item.jobTitle === app.jobTitle &&
              new Date(item.createdAt).getTime() ===
                new Date(app.createdAt).getTime()
          )
          .first();

        if (existing) {
          duplicates.jobApplications.push({
            importItem: app,
            existingItem: existing,
            field: 'companyName+jobTitle',
            value: `${app.companyName} - ${app.jobTitle}`,
          });
        }
      }

      // Verificar cartas duplicadas por jobApplicationId
      for (const letter of importData.data.coverLetters || []) {
        if (letter.jobApplicationId) {
          const existing = await db.coverLetters
            .where('jobApplicationId')
            .equals(letter.jobApplicationId)
            .first();

          if (existing) {
            duplicates.coverLetters.push({
              importItem: letter,
              existingItem: existing,
              field: 'jobApplicationId',
              value: letter.jobApplicationId,
            });
          }
        }
      }

      const hasDuplicates =
        duplicates.resumes.length > 0 ||
        duplicates.jobApplications.length > 0 ||
        duplicates.coverLetters.length > 0 ||
        duplicates.interviewSimulations.length > 0;

      return {
        hasDuplicates,
        duplicates,
        summary: {
          resumes: duplicates.resumes.length,
          jobApplications: duplicates.jobApplications.length,
          coverLetters: duplicates.coverLetters.length,
          interviewSimulations: duplicates.interviewSimulations.length,
        },
      };
    } catch (error) {
      console.error('❌ Error detectando duplicados:', error);
      throw error;
    }
  }

  /**
   * Importa datos con opciones para manejar duplicados
   */
  async importDatabase(importData, userEmail, options = {}) {
    try {
      const {
        skipDuplicates = false,
        generateNewIds = true,
        overwriteExisting = false,
      } = options;

      console.log('🔄 Iniciando importación...', options);

      const results = {
        resumes: { imported: 0, skipped: 0, errors: 0 },
        jobApplications: { imported: 0, skipped: 0, errors: 0 },
        coverLetters: { imported: 0, skipped: 0, errors: 0 },
        interviewSimulations: { imported: 0, skipped: 0, errors: 0 },
      };

      // Mapa para rastrear IDs antiguos -> nuevos IDs
      const idMapping = {
        resumes: new Map(),
        jobApplications: new Map(),
      };

      // 1. Importar CVs
      for (const resume of importData.data.resumes || []) {
        try {
          const oldResumeId = resume.id;
          const oldDocumentId = resume.documentId;

          // Verificar si existe
          const existing = await db.resumes
            .where('documentId')
            .equals(resume.documentId)
            .first();

          if (existing && skipDuplicates) {
            results.resumes.skipped++;
            idMapping.resumes.set(oldResumeId, existing.id);
            idMapping.resumes.set(oldDocumentId, existing.documentId);
            continue;
          }

          if (existing && overwriteExisting) {
            // Actualizar existente
            await db.resumes.update(existing.id, {
              ...resume,
              id: existing.id,
              documentId: existing.documentId,
              updatedAt: new Date(),
              userEmail: userEmail, // Asegurar que sea del usuario actual
            });
            results.resumes.imported++;
            idMapping.resumes.set(oldResumeId, existing.id);
            idMapping.resumes.set(oldDocumentId, existing.documentId);
            continue;
          }

          // Crear nuevo con nuevo ID
          const newDocumentId = generateNewIds ? uuidv4() : resume.documentId;
          const newResume = {
            ...resume,
            documentId: newDocumentId,
            userEmail: userEmail,
            createdAt: new Date(resume.createdAt),
            updatedAt: new Date(),
          };

          delete newResume.id; // Dejar que IndexedDB genere el ID

          const newId = await db.resumes.add(newResume);
          results.resumes.imported++;
          idMapping.resumes.set(oldResumeId, newId);
          idMapping.resumes.set(oldDocumentId, newDocumentId);

          console.log(
            `✅ CV importado: ${oldResumeId} -> ${newId} (${oldDocumentId} -> ${newDocumentId})`
          );
        } catch (error) {
          console.error('Error importando CV:', error);
          results.resumes.errors++;
        }
      }

      // 2. Importar candidaturas
      for (const app of importData.data.jobApplications || []) {
        try {
          const oldAppId = app.id;
          const oldResumeId = app.resumeId;
          const oldResumeDocumentId = app.resumeDocumentId;

          // Obtener el nuevo ID del CV
          let newResumeId = idMapping.resumes.get(oldResumeId);
          let newResumeDocumentId = idMapping.resumes.get(oldResumeDocumentId);

          // Si no encontramos mapeo, intentar buscar por documentId
          if (!newResumeId && oldResumeDocumentId) {
            const resume = await db.resumes
              .where('documentId')
              .equals(oldResumeDocumentId)
              .first();
            if (resume) {
              newResumeId = resume.id;
              newResumeDocumentId = resume.documentId;
            }
          }

          if (!newResumeId) {
            console.warn(
              `⚠️ No se encontró CV para la candidatura ${oldAppId}, saltando...`
            );
            results.jobApplications.skipped++;
            continue;
          }

          // Verificar duplicado
          const existing = await db.jobApplications
            .where('userEmail')
            .equals(userEmail)
            .filter(
              (item) =>
                item.companyName === app.companyName &&
                item.jobTitle === app.jobTitle &&
                new Date(item.createdAt).getTime() ===
                  new Date(app.createdAt).getTime()
            )
            .first();

          if (existing && skipDuplicates) {
            results.jobApplications.skipped++;
            idMapping.jobApplications.set(oldAppId, existing.id);
            continue;
          }

          const newApp = {
            ...app,
            resumeId: newResumeId,
            resumeDocumentId: newResumeDocumentId,
            userEmail: userEmail,
            createdAt: new Date(app.createdAt),
            updatedAt: new Date(),
          };

          delete newApp.id;

          const newId = await db.jobApplications.add(newApp);
          results.jobApplications.imported++;
          idMapping.jobApplications.set(oldAppId, newId);

          console.log(`✅ Candidatura importada: ${oldAppId} -> ${newId}`);
        } catch (error) {
          console.error('Error importando candidatura:', error);
          results.jobApplications.errors++;
        }
      }

      // 3. Importar cartas de presentación
      for (const letter of importData.data.coverLetters || []) {
        try {
          const oldResumeId = letter.resumeId;
          const oldAppId = letter.jobApplicationId;

          const newResumeId = idMapping.resumes.get(oldResumeId);
          const newAppId = idMapping.jobApplications.get(oldAppId);

          if (!newResumeId) {
            console.warn(`⚠️ No se encontró CV para la carta, saltando...`);
            results.coverLetters.skipped++;
            continue;
          }

          const newLetter = {
            ...letter,
            resumeId: newResumeId,
            jobApplicationId: newAppId || null,
            userEmail: userEmail,
            createdAt: new Date(letter.createdAt),
            updatedAt: new Date(),
          };

          delete newLetter.id;

          await db.coverLetters.add(newLetter);
          results.coverLetters.imported++;
        } catch (error) {
          console.error('Error importando carta:', error);
          results.coverLetters.errors++;
        }
      }

      // 4. Importar simulaciones de entrevistas
      for (const sim of importData.data.interviewSimulations || []) {
        try {
          const oldResumeId = sim.resumeId;
          const oldAppId = sim.jobApplicationId;

          const newResumeId = idMapping.resumes.get(oldResumeId);
          const newAppId = idMapping.jobApplications.get(oldAppId);

          if (!newResumeId) {
            results.interviewSimulations.skipped++;
            continue;
          }

          const newSim = {
            ...sim,
            resumeId: newResumeId,
            jobApplicationId: newAppId || null,
            userEmail: userEmail,
            createdAt: new Date(sim.createdAt),
            updatedAt: new Date(),
          };

          delete newSim.id;

          await db.interviewSimulations.add(newSim);
          results.interviewSimulations.imported++;
        } catch (error) {
          console.error('Error importando simulación:', error);
          results.interviewSimulations.errors++;
        }
      }

      // 5. Importar datos de usuario (opcional)
      if (importData.data.userData) {
        try {
          const existing = await db.userData
            .where('userEmail')
            .equals(userEmail)
            .first();

          if (existing) {
            await db.userData.update(existing.id, {
              ...importData.data.userData,
              userEmail: userEmail,
              lastLogin: new Date(),
            });
          } else {
            await db.userData.add({
              ...importData.data.userData,
              userEmail: userEmail,
              lastLogin: new Date(),
            });
          }
        } catch (error) {
          console.error('Error importando datos de usuario:', error);
        }
      }

      console.log('✅ Importación completada:', results);
      return results;
    } catch (error) {
      console.error('❌ Error en importación:', error);
      throw new Error(`Error al importar: ${error.message}`);
    }
  }

  /**
   * Limpia datos huérfanos de la base de datos
   */
  async cleanOrphanData(userEmail) {
    try {
      console.log('🧹 Iniciando limpieza de datos huérfanos...');

      const results = {
        orphanApplications: 0,
        orphanLetters: 0,
        orphanSimulations: 0,
      };

      // Obtener todos los CVs del usuario
      const resumes = await db.resumes
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      const resumeIds = resumes.map((r) => r.id);
      const resumeDocumentIds = resumes.map((r) => r.documentId);

      // Limpiar candidaturas huérfanas
      const allApplications = await db.jobApplications
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      for (const app of allApplications) {
        const isOrphan =
          !resumeIds.includes(app.resumeId) &&
          !resumeDocumentIds.includes(app.resumeDocumentId);

        if (isOrphan) {
          await db.jobApplications.delete(app.id);
          results.orphanApplications++;
          console.log(`🗑️ Eliminada candidatura huérfana: ${app.id}`);
        }
      }

      // Obtener IDs válidos de candidaturas
      const validApplications = await db.jobApplications
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      const applicationIds = validApplications.map((a) => a.id);

      // Limpiar cartas huérfanas
      const allLetters = await db.coverLetters
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      for (const letter of allLetters) {
        const isOrphan =
          (!letter.jobApplicationId ||
            !applicationIds.includes(letter.jobApplicationId)) &&
          (!letter.resumeId || !resumeIds.includes(letter.resumeId));

        if (isOrphan) {
          await db.coverLetters.delete(letter.id);
          results.orphanLetters++;
          console.log(`🗑️ Eliminada carta huérfana: ${letter.id}`);
        }
      }

      // Limpiar simulaciones huérfanas
      const allSimulations = await db.interviewSimulations
        .where('userEmail')
        .equals(userEmail)
        .toArray();

      for (const sim of allSimulations) {
        const isOrphan =
          (!sim.jobApplicationId ||
            !applicationIds.includes(sim.jobApplicationId)) &&
          (!sim.resumeId || !resumeIds.includes(sim.resumeId));

        if (isOrphan) {
          await db.interviewSimulations.delete(sim.id);
          results.orphanSimulations++;
          console.log(`🗑️ Eliminada simulación huérfana: ${sim.id}`);
        }
      }

      console.log('✅ Limpieza completada:', results);
      return results;
    } catch (error) {
      console.error('❌ Error en limpieza:', error);
      throw new Error(`Error al limpiar: ${error.message}`);
    }
  }
}

export default new DatabaseBackupService();
