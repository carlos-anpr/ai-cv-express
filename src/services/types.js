// src/services/types.js

// Validaciones para candidaturas
export const validateJobApplication = (data) => {
  const required = ['resumeId', 'userEmail', 'companyName', 'jobTitle'];
  const missing = required.filter(
    (field) => !data[field] || data[field].trim() === ''
  );

  if (missing.length > 0) {
    throw new Error(`Campos obligatorios faltantes: ${missing.join(', ')}`);
  }

  // Validar estado si se proporciona
  const validStatuses = [
    'draft',
    'applied',
    'interview',
    'rejected',
    'accepted',
  ];
  if (data.status && !validStatuses.includes(data.status)) {
    throw new Error(
      `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`
    );
  }

  // Validar email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.userEmail)) {
    throw new Error('Email de usuario inválido');
  }

  return true;
};

// Validaciones para simulaciones de entrevista
export const validateInterviewSimulation = (data) => {
  const required = [
    'jobApplicationId',
    'resumeId',
    'userEmail',
    'candidateLevel',
    'questions',
  ];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new Error(
      `Campos obligatorios faltantes para simulación: ${missing.join(', ')}`
    );
  }

  // Validar nivel de candidato
  const validLevels = ['junior', 'mid', 'senior'];
  if (!validLevels.includes(data.candidateLevel)) {
    throw new Error(
      `Nivel de candidato inválido. Debe ser uno de: ${validLevels.join(', ')}`
    );
  }

  // Validar estructura de preguntas
  if (!Array.isArray(data.questions)) {
    throw new Error('Las preguntas deben ser un array');
  }

  // Validar cada pregunta
  data.questions.forEach((question, index) => {
    if (!question.category || !question.question || !question.suggestedAnswer) {
      throw new Error(
        `Pregunta ${
          index + 1
        } incompleta. Debe tener: category, question, suggestedAnswer`
      );
    }

    const validCategories = [
      'technical',
      'behavioral',
      'company',
      'missing_skill',
    ];
    if (!validCategories.includes(question.category)) {
      throw new Error(
        `Categoría inválida en pregunta ${
          index + 1
        }. Debe ser: ${validCategories.join(', ')}`
      );
    }
  });

  return true;
};

// Validaciones para cartas de presentación actualizadas
export const validateCoverLetter = (data) => {
  const required = ['resumeId', 'userEmail', 'content'];
  const missing = required.filter(
    (field) => !data[field] || data[field].trim() === ''
  );

  if (missing.length > 0) {
    throw new Error(
      `Campos obligatorios faltantes para carta: ${missing.join(', ')}`
    );
  }

  // Validar estilo si se proporciona
  const validStyles = ['formal', 'friendly', 'humanized', 'informal'];
  if (data.style && !validStyles.includes(data.style)) {
    throw new Error(
      `Estilo inválido. Debe ser uno de: ${validStyles.join(', ')}`
    );
  }

  // Validar longitud si se proporciona
  const validLengths = ['short', 'medium', 'long'];
  if (data.length && !validLengths.includes(data.length)) {
    throw new Error(
      `Longitud inválida. Debe ser una de: ${validLengths.join(', ')}`
    );
  }

  return true;
};

// Helpers de transformación de datos
export const formatJobApplicationForDB = (data) => {
  return {
    resumeId: data.resumeId,
    userEmail: data.userEmail,
    companyName: data.companyName?.trim() || '',
    jobTitle: data.jobTitle?.trim() || '',
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
};

export const formatInterviewSimulationForDB = (data) => {
  return {
    jobApplicationId: parseInt(data.jobApplicationId),
    resumeId: data.resumeId,
    userEmail: data.userEmail,
    candidateLevel: data.candidateLevel,
    questions: Array.isArray(data.questions) ? data.questions : [],
  };
};

// Constantes de la aplicación
export const JOB_APPLICATION_STATUS = {
  draft: 'Borrador',
  applied: 'Enviada',
  interview: 'Entrevista',
  rejected: 'Rechazada',
  accepted: 'Aceptada',
};

export const JOB_APPLICATION_STATUSES = {
  DRAFT: 'draft',
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
};

export const CANDIDATE_LEVELS = {
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
};

export const COVER_LETTER_STYLES = {
  FORMAL: 'formal',
  FRIENDLY: 'friendly',
  HUMANIZED: 'humanized',
  INFORMAL: 'informal',
};

export const COVER_LETTER_LENGTHS = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
};

export const QUESTION_CATEGORIES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  COMPANY: 'company',
  MISSING_SKILL: 'missing_skill',
};

// Helper para obtener etiquetas legibles
export const getStatusLabel = (status) => {
  const labels = {
    draft: 'Borrador',
    applied: 'Enviada',
    interview: 'Entrevista',
    rejected: 'Rechazada',
    accepted: 'Aceptada',
  };
  return labels[status] || status;
};

export const getLevelLabel = (level) => {
  const labels = {
    junior: 'Junior',
    mid: 'Mid-level',
    senior: 'Senior',
  };
  return labels[level] || level;
};

export const getStyleLabel = (style) => {
  const labels = {
    formal: 'Formal',
    friendly: 'Amigable',
    humanized: 'Humanizada',
    informal: 'Informal',
  };
  return labels[style] || style;
};

export const getLengthLabel = (length) => {
  const labels = {
    short: 'Corta (200-300 palabras)',
    medium: 'Media (350-450 palabras)',
    long: 'Larga (500-650 palabras)',
  };
  return labels[length] || length;
};

export const getCategoryLabel = (category) => {
  const labels = {
    technical: 'Técnica',
    behavioral: 'Comportamental',
    company: 'Empresa',
    missing_skill: 'Habilidad Faltante',
  };
  return labels[category] || category;
};

// Helper para obtener colores de estado
export const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-gray-500',
    applied: 'bg-blue-500',
    interview: 'bg-yellow-500',
    rejected: 'bg-red-500',
    accepted: 'bg-green-500',
  };
  return colors[status] || 'bg-gray-500';
};
