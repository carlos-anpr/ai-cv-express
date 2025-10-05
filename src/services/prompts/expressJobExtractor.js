/**
 * Express Job Offer Extractor Prompt
 * Extrae información estructurada de ofertas de trabajo pegadas en formato libre.
 */

export const expressJobExtractorPrompt = (rawJobOfferText) => {
  return {
    systemInstruction: `Eres un experto en análisis de ofertas de trabajo. Tu tarea es extraer información estructurada de textos de ofertas laborales en cualquier formato (LinkedIn, InfoJobs, Indeed, etc.).

IMPORTANTE:
- Lee CUIDADOSAMENTE todo el texto antes de extraer
- Identifica correctamente empresa, puesto, ubicación, requisitos
- BUSCA el título del puesto incluso si no dice explícitamente "Puesto" o "Título"
- El título suele estar en la primera línea o después de "Oferta de trabajo" o "Buscamos"
- Si menciona empresa/compañía de cualquier forma, extráela (puede estar en firma, contacto, etc.)
- Si algo no está presente después de leer TODO el texto, marca como "No especificado"
- Normaliza formatos (ej: 50k-60k, 50.000-60.000/año)
- Detecta modalidad de trabajo (remoto/híbrido/presencial)`,

    prompt: `Analiza CUIDADOSAMENTE la siguiente oferta de trabajo y extrae información estructurada en formato JSON:

OFERTA DE TRABAJO:
${rawJobOfferText}

INSTRUCCIONES DE EXTRACCIÓN:

1. Lee TODO el texto completo primero

2. El **título del puesto** puede estar:
   - En la primera línea
   - Después de "Oferta de trabajo", "Buscamos", "Puesto"
   - Entre paréntesis como "(Nivel Mid)"
   Ejemplo: "Desarrollador Java Backend (Nivel Mid)" → jobTitle: "Desarrollador Java Backend"

3. La **empresa** puede estar:
   - Al final en firma/contacto: empleo@empresaX.com → empresaX
   - Mencionada como "nuestra empresa", "nuestro equipo"
   - Si NO hay nombre de empresa real, usa "No especificado"

4. **DESCRIPCIÓN DEL PUESTO (CRÍTICO)**:
   - Busca secciones como "Descripción del puesto", "Sobre el rol", "Qué harás", "Acerca de la posición"
   - **SI NO ENCUENTRAS una descripción específica del puesto**, usa el contenido de los REQUISITOS como descripción
   - La descripción NO puede estar vacía - es obligatorio tener contenido aquí
   - Si solo hay requisitos técnicos sin contexto del rol, combínalos en una descripción coherente

5. Los **requisitos** están en secciones como "Requisitos", "Requirements", "Necesitas":
   - **essential**: Marcados como "obligatorio", "requerido", "must have", "esencial"
   - **desired**: Marcados como "valorable", "deseable", "nice to have", "se valora"

6. Las **responsabilidades** están en "Responsabilidades", "Funciones", "Harás"

Extrae la siguiente información y devuélvela en formato JSON válido:

{
  "companyName": "Nombre de la empresa",
  "companyDescription": "Breve descripción de la empresa si está disponible, sino 'No especificado'",
  "jobTitle": "Título exacto del puesto",
  "jobDescription": "Descripción completa del rol - SI ESTÁ VACÍO, USA LOS REQUISITOS AQUÍ",
  "location": {
    "city": "Ciudad",
    "country": "País",
    "isRemote": false,
    "workMode": "presencial|híbrido|remoto"
  },
  "contractType": "indefinido|temporal|freelance|prácticas|No especificado",
  "salaryRange": {
    "min": 0,
    "max": 0,
    "currency": "EUR",
    "period": "anual|mensual",
    "display": "Formato legible (ej: '45.000 - 55.000€/año')"
  },
  "requirements": {
    "essential": ["Requisito esencial 1", "Requisito esencial 2"],
    "desired": ["Requisito deseable 1", "Requisito deseable 2"],
    "experience": "Años de experiencia requeridos o 'No especificado'",
    "education": "Nivel educativo requerido o 'No especificado'"
  },
  "responsibilities": [
    "Responsabilidad 1",
    "Responsabilidad 2"
  ],
  "benefits": ["Beneficio 1", "Beneficio 2"],
  "technicalSkills": ["Habilidad técnica 1", "Habilidad técnica 2"],
  "softSkills": ["Habilidad blanda 1", "Habilidad blanda 2"],
  "jobLevel": "junior|mid|senior|lead|director",
  "industry": "Industria o sector",
  "applicationDeadline": "Fecha límite si se menciona, sino null",
  "postedDate": "Fecha de publicación si se menciona, sino null"
}

**REGLA CRÍTICA PARA jobDescription**:
- Si no hay una sección clara de "descripción del puesto", construye una descripción combinando:
  1. El contexto del título del puesto
  2. Los requisitos esenciales
  3. Las responsabilidades mencionadas
- jobDescription NUNCA debe estar vacío o ser "No especificado"
- Si realmente no hay información suficiente, copia directamente los requisitos esenciales

REGLAS PARA CLASIFICACIÓN:
- **workMode**: "remoto" si menciona "100% remoto", "híbrido" si menciona "2-3 días oficina", sino "presencial"
- **jobLevel**: Basado en título y años de experiencia requeridos
  - junior: 0-2 años
  - mid: 2-5 años, sin calificativo especial
  - senior: 5+ años, títulos con "Senior", "Lead"
  - lead/director: Roles de liderazgo, "Team Lead", "Manager", "Director"

REGLAS PARA SALARIO:
- Si no se menciona: min: 0, max: 0, display: "No especificado"
- Normaliza formatos: 50k → 50000, 50.000 → 50000
- Detecta periodo: "año", "mes", "anual", "mensual"

Si algo no está mencionado explícitamente, usa "No especificado" o valores por defecto apropiados.

Responde ÚNICAMENTE con el JSON, sin texto adicional.`,
    responseFormat: 'application/json',
  };
};

/**
 * Valida los datos extraídos de la oferta
 */
export const validateJobOfferData = (data) => {
  const errors = [];
  const warnings = [];

  // Validaciones críticas
  if (!data.companyName || data.companyName === 'No especificado') {
    errors.push('No se pudo detectar el nombre de la empresa');
  }

  if (!data.jobTitle || data.jobTitle.length < 3) {
    errors.push('No se pudo detectar el título del puesto');
  }

  if (!data.location?.city && !data.location?.isRemote) {
    warnings.push('No se detectó ubicación. Verifica si es trabajo remoto.');
  }

  // Validaciones de calidad
  if (
    !data.requirements?.essential ||
    data.requirements.essential.length === 0
  ) {
    warnings.push('No se detectaron requisitos esenciales. Revisa la oferta.');
  }

  if (!data.responsibilities || data.responsibilities.length === 0) {
    warnings.push(
      'No se detectaron responsabilidades. Esto puede afectar la calidad del CV.'
    );
  }

  if (!data.technicalSkills || data.technicalSkills.length === 0) {
    warnings.push('No se detectaron habilidades técnicas específicas.');
  }

  if (data.salaryRange?.min === 0 && data.salaryRange?.max === 0) {
    warnings.push('No se especifica rango salarial en la oferta.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness: calculateCompleteness(data),
  };
};

/**
 * Calcula el nivel de completitud de la información extraída
 */
const calculateCompleteness = (data) => {
  let score = 0;
  let maxScore = 10;

  if (data.companyName && data.companyName !== 'No especificado') score++;
  if (data.jobTitle && data.jobTitle.length >= 3) score++;
  if (data.location?.city) score++;
  if (data.requirements?.essential?.length > 0) score++;
  if (data.responsibilities?.length > 0) score++;
  if (data.technicalSkills?.length > 0) score++;
  if (data.benefits?.length > 0) score++;
  if (data.salaryRange?.min > 0) score++;
  if (data.companyDescription && data.companyDescription !== 'No especificado')
    score++;
  if (data.contractType && data.contractType !== 'No especificado') score++;

  const percentage = (score / maxScore) * 100;

  return {
    score,
    maxScore,
    percentage,
    level:
      percentage >= 80
        ? 'excelente'
        : percentage >= 60
        ? 'bueno'
        : percentage >= 40
        ? 'suficiente'
        : 'insuficiente',
  };
};

/**
 * Normaliza los datos extrados con fallback para jobDescription
 */
export const normalizeJobOfferData = (data) => {
  // Si jobDescription está vacío o es "No especificado", usar requirements como fallback
  let jobDescription = data.jobDescription?.trim() || '';

  if (!jobDescription || jobDescription === 'No especificado') {
    // Construir descripción desde los requisitos
    const essentialReqs = Array.isArray(data.requirements?.essential)
      ? data.requirements.essential.filter(Boolean)
      : [];

    if (essentialReqs.length > 0) {
      jobDescription = `Este puesto requiere: ${essentialReqs.join(', ')}.`;
    } else {
      // Si tampoco hay requisitos, usar una descripción genérica basada en el título
      jobDescription = `Posición de ${data.jobTitle || 'desarrollo'} en ${
        data.companyName || 'la empresa'
      }.`;
    }
  }

  return {
    companyName: data.companyName?.trim() || 'No especificado',
    companyDescription: data.companyDescription?.trim() || 'No especificado',
    jobTitle: data.jobTitle?.trim() || 'No especificado',
    jobDescription: jobDescription, // Usar la versión procesada con fallback
    location: {
      city: data.location?.city?.trim() || 'No especificado',
      country: data.location?.country?.trim() || 'No especificado',
      isRemote: Boolean(data.location?.isRemote),
      workMode: data.location?.workMode || 'presencial',
    },
    contractType: data.contractType || 'No especificado',
    salaryRange: {
      min: parseInt(data.salaryRange?.min) || 0,
      max: parseInt(data.salaryRange?.max) || 0,
      currency: data.salaryRange?.currency || 'EUR',
      period: data.salaryRange?.period || 'anual',
      display: data.salaryRange?.display || 'No especificado',
    },
    requirements: {
      essential: Array.isArray(data.requirements?.essential)
        ? data.requirements.essential.filter(Boolean)
        : [],
      desired: Array.isArray(data.requirements?.desired)
        ? data.requirements.desired.filter(Boolean)
        : [],
      experience: data.requirements?.experience || 'No especificado',
      education: data.requirements?.education || 'No especificado',
    },
    responsibilities: Array.isArray(data.responsibilities)
      ? data.responsibilities.filter(Boolean)
      : [],
    benefits: Array.isArray(data.benefits) ? data.benefits.filter(Boolean) : [],
    technicalSkills: Array.isArray(data.technicalSkills)
      ? data.technicalSkills.filter(Boolean)
      : [],
    softSkills: Array.isArray(data.softSkills)
      ? data.softSkills.filter(Boolean)
      : [],
    jobLevel: data.jobLevel || 'mid',
    industry: data.industry?.trim() || 'No especificado',
    applicationDeadline: data.applicationDeadline || null,
    postedDate: data.postedDate || null,
  };
};

/**
 * Genera sugerencias basadas en la oferta analizada
 */
export const generateJobOfferSuggestions = (data, completeness) => {
  const suggestions = [];

  if (completeness.percentage < 60) {
    suggestions.push(
      'La oferta parece incompleta. Considera pegar más información si está disponible.'
    );
  }

  if (data.requirements.essential.length === 0) {
    suggestions.push(
      'No se detectaron requisitos claros. El CV se generará basado en el título del puesto.'
    );
  }

  if (data.salaryRange.min === 0) {
    suggestions.push(
      'No se especifica salario. Esto es normal en muchas ofertas.'
    );
  }

  if (data.technicalSkills.length < 3) {
    suggestions.push(
      'Se detectaron pocas habilidades técnicas. El CV resaltará tus skills generales.'
    );
  }

  if (data.location.isRemote) {
    suggestions.push(
      'Trabajo remoto detectado. Esto se reflejará en la candidatura.'
    );
  }

  if (data.benefits.length > 0) {
    suggestions.push(
      `Se detectaron ${data.benefits.length} beneficios. Genial para la carta de presentación.`
    );
  }

  return suggestions;
};

export default {
  expressJobExtractorPrompt,
  validateJobOfferData,
  normalizeJobOfferData,
  generateJobOfferSuggestions,
};
