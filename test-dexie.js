// Test rápido para verificar Dexie queries
import { db } from './src/services/IndexedDBService.js';

async function testDexieQueries() {
  try {
    console.log('🧪 Testing Dexie queries...');

    // Test 1: Verificar que la DB esté abierta
    await db.open();
    console.log('✅ DB opened:', db.isOpen());

    // Test 2: Count total records
    const totalResumes = await db.resumes.count();
    console.log('📊 Total resumes:', totalResumes);

    // Test 3: Test basic query
    const allResumes = await db.resumes.toArray();
    console.log('📋 All resumes:', allResumes);

    // Test 4: Test where query (the problematic one)
    const testEmail = 'test@example.com';
    const userResumes = await db.resumes
      .where('userEmail')
      .equals(testEmail)
      .toArray();
    console.log('👤 User resumes for', testEmail, ':', userResumes);

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Uncomment to run test
// testDexieQueries();

export default testDexieQueries;
