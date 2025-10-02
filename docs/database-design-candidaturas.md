# Diseño de Base de Datos - Sistema de Candidaturas

## Estructura de Tablas

### 1. jobApplications (Nueva)

```sql
CREATE TABLE jobApplications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resumeId TEXT NOT NULL,
  userEmail TEXT NOT NULL,
  companyName TEXT NOT NULL,
  jobTitle TEXT NOT NULL,
  jobDescription TEXT,
  requirements TEXT,
  responsibilities TEXT,
  companyWebsite TEXT,
  contactPerson TEXT,
  applicationDate TEXT,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. coverLetters (Actualizada)

```sql
-- Agregar nuevas columnas
ALTER TABLE coverLetters ADD COLUMN jobApplicationId TEXT;
ALTER TABLE coverLetters ADD COLUMN style TEXT DEFAULT 'formal';
ALTER TABLE coverLetters ADD COLUMN length TEXT DEFAULT 'medium';

-- Índices
CREATE INDEX idx_coverletters_jobapplication ON coverLetters(jobApplicationId);
```

### 3. interviewSimulations (Nueva)

```sql
CREATE TABLE interviewSimulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jobApplicationId TEXT NOT NULL,
  resumeId TEXT NOT NULL,
  userEmail TEXT NOT NULL,
  candidateLevel TEXT NOT NULL,
  questions TEXT NOT NULL, -- JSON serializado
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jobApplicationId) REFERENCES jobApplications(id) ON DELETE CASCADE
);
```

## Índices y Optimizaciones

### Índices Principales

```sql
-- Para consultas frecuentes
CREATE INDEX idx_jobapplications_resume ON jobApplications(resumeId, userEmail);
CREATE INDEX idx_jobapplications_status ON jobApplications(status);
CREATE INDEX idx_interviewsimulations_jobapp ON interviewSimulations(jobApplicationId);
```

### Hooks de Actualización

```javascript
// En IndexedDBService.js
this.jobApplications.hook('creating', function (primKey, obj) {
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});

this.jobApplications.hook('updating', function (modifications, primKey, obj) {
  modifications.updatedAt = new Date();
});

this.interviewSimulations.hook('creating', function (primKey, obj) {
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});
```

## Relaciones

### Diagrama de Relaciones

```
resumes (1) ──────── (N) jobApplications
   │                        │
   │                        ├── (1) coverLetters
   │                        └── (1) interviewSimulations
   │
   └── (N) coverLetters (legacy)
```

### Lógica de Cascada

- **Eliminar CV** → Eliminar todas las candidaturas relacionadas
- **Eliminar candidatura** → Eliminar carta y simulación relacionadas
- **Actualizar candidatura** → Mantener carta y simulación vinculadas

## Migración de Datos

### Script de Migración

```javascript
// En LocalDatabase.js
const migrateToJobApplications = async () => {
  try {
    // 1. Crear nuevas tablas si no existen
    await db.jobApplications.count(); // Trigger creation

    // 2. Migrar cartas existentes (opcional)
    const existingLetters = await db.coverLetters
      .where('jobApplicationId')
      .equals(undefined)
      .toArray();

    for (const letter of existingLetters) {
      // Crear candidatura automática para cartas huérfanas
      const jobApp = await db.jobApplications.add({
        resumeId: letter.resumeId,
        userEmail: letter.userEmail,
        companyName: letter.companyName,
        jobTitle: letter.jobTitle,
        status: 'draft',
      });

      // Vincular carta a candidatura
      await db.coverLetters.update(letter.id, {
        jobApplicationId: jobApp,
      });
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
```

## Validaciones

### Reglas de Negocio

```javascript
// Validaciones en LocalDatabase.js
const validateJobApplication = (data) => {
  const required = ['resumeId', 'userEmail', 'companyName', 'jobTitle'];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Required fields missing: ${missing.join(', ')}`);
  }

  if (
    data.status &&
    !['draft', 'applied', 'interview', 'rejected', 'accepted'].includes(
      data.status
    )
  ) {
    throw new Error('Invalid application status');
  }

  return true;
};
```

### Constraints de Integridad

- **resumeId** debe existir en tabla resumes
- **userEmail** debe coincidir con el propietario del CV
- **status** debe ser uno de los valores permitidos
- **candidateLevel** debe ser: junior, mid, senior

---

_Esta estructura garantiza la integridad de datos y escalabilidad del sistema._
