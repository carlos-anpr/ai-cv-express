// src/services/test-database.js
// Script de prueba para verificar la nueva estructura de base de datos

import LocalDatabase from './LocalDatabase.js';
import {
  validateJobApplication,
  validateInterviewSimulation,
} from './types.js';

// Script de prueba de la base de datos
export const testDatabase = async () => {
  console.log('🧪 Iniciando pruebas de base de datos...');

  try {
    // 1. Verificar estado de migración
    console.log('\n📊 Verificando estado de migración...');
    const migrationStatus = await LocalDatabase.CheckMigrationStatus();
    console.log('Estado de migración:', migrationStatus);

    // 2. Ejecutar migración si es necesario
    if (migrationStatus.needsMigration) {
      console.log('\n🔄 Ejecutando migración...');
      const migrationResult = await LocalDatabase.MigrateExistingCoverLetters();
      console.log('Resultado de migración:', migrationResult);
    }

    // 3. Probar creación de candidatura
    console.log('\n📝 Probando creación de candidatura...');
    const testJobApp = {
      resumeId: 'test-resume-id',
      userEmail: 'test@example.com',
      companyName: 'Empresa de Prueba',
      jobTitle: 'Desarrollador de Prueba',
      jobDescription: 'Descripción de prueba',
      requirements: 'React, JavaScript, Testing',
      responsibilities: 'Desarrollar, probar, mantener',
    };

    // Validar antes de crear
    validateJobApplication(testJobApp);
    console.log('✅ Validación de candidatura pasada');

    // Crear candidatura de prueba
    const jobAppId = await LocalDatabase.CreateJobApplication(testJobApp);
    console.log('✅ Candidatura de prueba creada con ID:', jobAppId);

    // 4. Probar creación de simulación
    console.log('\n🎯 Probando creación de simulación...');
    const testSimulation = {
      jobApplicationId: jobAppId,
      resumeId: 'test-resume-id',
      userEmail: 'test@example.com',
      candidateLevel: 'mid',
      questions: [
        {
          category: 'technical',
          question: '¿Qué es React?',
          suggestedAnswer: 'React es una biblioteca de JavaScript...',
          tips: ['Mencionar componentes', 'Hablar de virtual DOM'],
        },
        {
          category: 'behavioral',
          question: '¿Cómo manejas el estrés?',
          suggestedAnswer:
            'En mi experiencia, cuando me enfrento a situaciones estresantes...',
          tips: ['Dar ejemplo específico', 'Mostrar autoconocimiento'],
        },
      ],
    };

    // Validar antes de crear
    validateInterviewSimulation(testSimulation);
    console.log('✅ Validación de simulación pasada');

    // Crear simulación de prueba
    const simulationId = await LocalDatabase.CreateInterviewSimulation(
      testSimulation
    );
    console.log('✅ Simulación de prueba creada con ID:', simulationId);

    // 5. Probar lectura de datos
    console.log('\n📖 Probando lectura de datos...');
    const jobApps = await LocalDatabase.GetJobApplicationsByResume(
      'test-resume-id',
      'test@example.com'
    );
    console.log('✅ Candidaturas obtenidas:', jobApps.length);

    const simulation = await LocalDatabase.GetInterviewSimulation(
      jobAppId,
      'test@example.com'
    );
    console.log('✅ Simulación obtenida:', simulation ? 'Sí' : 'No');

    // 6. Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await LocalDatabase.DeleteJobApplication(jobAppId, 'test@example.com');
    console.log('✅ Datos de prueba eliminados');

    console.log(
      '\n🎉 ¡Todas las pruebas de base de datos pasaron exitosamente!'
    );
    return true;
  } catch (error) {
    console.error('❌ Error en pruebas de base de datos:', error);
    return false;
  }
};

// Función para ejecutar pruebas desde consola del navegador
window.testCandidaturasDB = testDatabase;

export default testDatabase;
