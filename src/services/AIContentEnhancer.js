/**
 * Servicio central para mejora de contenido con IA
 * Maneja toda la lógica de detección y mejora de contenido para CV
 */

import { AIChatSession } from '../../service/AIModal';
import {
  summaryEnhancementPrompt,
  summaryExpansionPrompt,
  summaryGenerationPrompt,
  experienceEnhancementPrompt,
  experienceExpansionPrompt,
  experienceGenerationPrompt,
} from './prompts/enhancementPrompts';
import {
  skillsParserPrompt,
  skillsCategorizationPrompt,
} from './prompts/skillsPrompts';

class AIContentEnhancer {
  /**
   * Detecta si el contenido está vacío o tiene texto significativo
   * @param {string} text - Texto a evaluar
   * @returns {boolean} - true si tiene contenido significativo
   */
  hasSignificantContent(text) {
    if (!text) return false;
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const wordCount = cleanText.split(/\s+/).filter((w) => w.length > 0).length;
    return cleanText.length > 10 && wordCount > 3;
  }

  /**
   * Determina el modo de operación basado en el contenido
   * @param {string} content - Contenido a evaluar
   * @returns {string} - 'enhance' o 'generate'
   */
  detectContentMode(content) {
    return this.hasSignificantContent(content) ? 'enhance' : 'generate';
  }

  /**
   * Mejora el resumen profesional existente
   * @param {string} currentText - Texto actual del resumen
   * @param {string} jobTitle - Título del puesto
   * @param {string} option - Opción de mejora: 'improve', 'expand', 'regenerate'
   * @returns {Promise<Object>} - Resumen mejorado
   */
  async enhanceSummary(currentText, jobTitle, option = 'improve') {
    const mode = this.detectContentMode(currentText);

    let prompt;
    if (mode === 'generate') {
      prompt = summaryGenerationPrompt(jobTitle);
    } else {
      switch (option) {
        case 'improve':
          prompt = summaryEnhancementPrompt(currentText, jobTitle);
          break;
        case 'expand':
          prompt = summaryExpansionPrompt(currentText, jobTitle);
          break;
        case 'regenerate':
          // Pasar currentText para generar variaciones basadas en el nivel del usuario
          prompt = summaryGenerationPrompt(jobTitle, currentText);
          break;
        default:
          prompt = summaryEnhancementPrompt(currentText, jobTitle);
      }
    }

    try {
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const response = JSON.parse(result.response.text());
      return response;
    } catch (error) {
      console.error('Error in enhanceSummary:', error);
      throw error;
    }
  }

  /**
   * Mejora la descripción de experiencia laboral
   * @param {string} currentText - HTML actual de la experiencia
   * @param {string} jobTitle - Título del puesto
   * @param {string} companyName - Nombre de la empresa
   * @param {string} option - Opción de mejora: 'improve', 'expand', 'reorganize'
   * @returns {Promise<string>} - HTML mejorado
   */
  async enhanceExperience(
    currentText,
    jobTitle,
    companyName,
    option = 'improve'
  ) {
    const mode = this.detectContentMode(currentText);

    let prompt;
    if (mode === 'generate') {
      prompt = experienceGenerationPrompt(jobTitle);
    } else {
      const points = this.extractPointsFromHTML(currentText);

      switch (option) {
        case 'improve':
          prompt = experienceEnhancementPrompt(points, jobTitle, companyName);
          break;
        case 'expand':
          prompt = experienceExpansionPrompt(points, jobTitle, companyName);
          break;
        case 'reorganize':
          prompt = experienceEnhancementPrompt(
            points,
            jobTitle,
            companyName,
            true
          );
          break;
        default:
          prompt = experienceEnhancementPrompt(points, jobTitle, companyName);
      }
    }

    try {
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const response = JSON.parse(result.response.text());

      return this.pointsToHTML(response.points);
    } catch (error) {
      console.error('Error in enhanceExperience:', error);
      throw error;
    }
  }

  /**
   * Extrae puntos de texto de HTML
   * @param {string} html - HTML con lista de items
   * @returns {Array<string>} - Array de puntos de texto
   */
  extractPointsFromHTML(html) {
    if (!html) return [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const listItems = tempDiv.querySelectorAll('li');
    return Array.from(listItems).map((li) => li.textContent.trim());
  }

  /**
   * Convierte array de puntos a HTML con formato
   * @param {Array<string>} points - Array de puntos de texto
   * @returns {string} - HTML con lista formateada
   */
  pointsToHTML(points) {
    if (!points || points.length === 0) return '';
    const listItems = points.map((point) => `<li>${point}</li>`).join('');
    return `<ul>${listItems}</ul>`;
  }

  /**
   * Parsea descripción de habilidades en lenguaje natural
   * @param {string} description - Descripción en texto libre
   * @param {string} jobTitle - Título del puesto
   * @returns {Promise<Array>} - Array de skills con nombre y rating
   */
  /**
   * Parsea descripción de habilidades en lenguaje natural
   * Ahora también categoriza automáticamente
   * @param {string} description - Descripción en texto libre
   * @param {string} jobTitle - Título del puesto
   * @returns {Promise<Object>} - Skills parseadas Y categorizadas con lista de categorías
   */
  async parseSkillsFromText(description, jobTitle) {
    const prompt = `
Eres un experto en extracción y categorización de habilidades profesionales.

PUESTO DE TRABAJO: ${jobTitle}

DESCRIPCIÓN DEL USUARIO:
${description}

INSTRUCCIONES:
1. Extrae TODAS las habilidades mencionadas en la descripción
2. Asigna un nivel realista (1-5) basándote en las palabras del usuario:
   - "experto", "avanzado", "dominio" → 5
   - "experiencia sólida", "buen nivel" → 4
   - "intermedio", "conocimientos" → 3
   - "básico", "nociones" → 2
   - "principiante", "aprendiendo" → 1
3. Genera 7 categorías GENERALES relevantes para "${jobTitle}"
4. SIEMPRE incluye "Otros" como última categoría
5. Asigna cada skill a su categoría más apropiada

FORMATO DE RESPUESTA (JSON estricto):
{
  "categories": [
    "Categoría 1",
    "Categoría 2",
    "Categoría 3",
    "Categoría 4",
    "Categoría 5",
    "Categoría 6",
    "Categoría 7",
    "Otros"
  ],
  "skills": [
    {
      "name": "nombre de la habilidad",
      "rating": número del 1-5,
      "category": "una de las categorías generadas"
    }
  ]
}

IMPORTANTE:
- NO inventes habilidades que no estén mencionadas
- Usa nombres estándar para tecnologías (ej: "JavaScript" no "JS")
- Las categorías deben ser cortas (1-3 palabras)
- Todas las skills deben tener categoría asignada
`;

    try {
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const response = JSON.parse(result.response.text());

      // Validar y normalizar
      const skills = (response.skills || []).map((skill) => ({
        name: skill.name,
        rating: this.normalizeSkillRating(skill.rating),
        category: skill.category || 'Otros',
      }));

      const categories = response.categories || this.getDefaultCategories();
      // Asegurar que "Otros" esté presente
      if (!categories.includes('Otros')) {
        categories.push('Otros');
      }

      console.log('✅ Skills parseadas con categorías:', skills.length);
      console.log('✅ Categorías generadas:', categories);

      return {
        skills: skills,
        categories: categories,
      };
    } catch (error) {
      console.error('Error in parseSkillsFromText:', error);
      throw error;
    }
  }

  /**
   * Normaliza el nivel de habilidad a rating numérico (1-5)
   * @param {string|number} level - Nivel de habilidad
   * @returns {number} - Rating de 1 a 5
   */
  normalizeSkillRating(level) {
    if (typeof level === 'number') return Math.min(Math.max(level, 0), 5);

    const levelMap = {
      experto: 5,
      avanzado: 5,
      expert: 5,
      advanced: 5,
      intermedio: 3,
      medio: 3,
      intermediate: 3,
      básico: 2,
      basico: 2,
      basic: 2,
      principiante: 2,
      beginner: 2,
      conocimientos: 1,
      familiar: 1,
      knowledge: 1,
    };

    const normalizedLevel = level.toLowerCase().trim();
    return levelMap[normalizedLevel] || 3; // Default a intermedio
  }

  /**
   * Categoriza automáticamente una lista de habilidades existentes
   * @param {Array} skills - Array de skills con {name, rating}
   * @param {string} jobTitle - Título del puesto para contexto
   * @returns {Promise<Object>} - Skills categorizadas con lista de categorías
   */
  /**
   * Categoriza automáticamente una lista de habilidades existentes
   * Ahora genera categorías específicas del puesto
   * @param {Array} skills - Array de skills con {name, rating}
   * @param {string} jobTitle - Título del puesto para contexto
   * @returns {Promise<Object>} - Skills categorizadas con lista de categorías
   */
  async categorizeSkills(skills, jobTitle) {
    if (!skills || skills.length === 0) {
      return {
        categorizedSkills: [],
        categories: this.getDefaultCategories(),
      };
    }

    try {
      const prompt = `
Eres un experto en categorización de habilidades profesionales.

PUESTO DE TRABAJO: ${jobTitle}

INSTRUCCIONES:
1. Analiza el puesto "${jobTitle}" y genera EXACTAMENTE 7 categorías relevantes para este tipo de trabajo
2. Las categorías deben ser GENERALES, como "Backend", "Frontend", "DevOps", NO uses términos como "Backend nivel especializado"
3. SIEMPRE incluye "Otros" como última categoría para habilidades que no encajen
4. Categoriza cada una de estas habilidades en las categorías que generaste

HABILIDADES A CATEGORIZAR:
${skills.map((s) => `- ${s.name} (nivel: ${s.rating}/5)`).join('\n')}

FORMATO DE RESPUESTA (JSON estricto):
{
  "categories": [
    "Categoría 1",
    "Categoría 2",
    "Categoría 3",
    "Categoría 4",
    "Categoría 5",
    "Categoría 6",
    "Categoría 7",
    "Otros"
  ],
  "categorizedSkills": [
    {
      "name": "nombre de la habilidad",
      "rating": número del 1-5,
      "category": "una de las 7 categorías generadas"
    }
  ]
}

EJEMPLOS DE CATEGORÍAS GENERALES SEGÚN PUESTO:
- Fontanero: "Instalaciones", "Reparaciones", "Herramientas", "Normativa", "Materiales", "Diagnóstico", "Otros"
- Desarrollador Backend: "Backend", "Bases de Datos", "APIs", "DevOps", "Testing", "Arquitectura", "Otros"
- Marketing: "Social Media", "Análisis", "Contenido", "SEO/SEM", "Diseño", "Estrategia", "Otros"

IMPORTANTE:
- NO uses subcategorías o niveles en el nombre
- Las categorías deben ser de 1-3 palabras máximo
- Todas las skills deben tener una categoría asignada
`;

      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const response = JSON.parse(result.response.text());

      console.log('✅ Categorías generadas por IA:', response.categories);
      console.log(
        '✅ Skills categorizadas:',
        response.categorizedSkills.length
      );

      // Asegurar que todas las skills tengan categoría
      const validatedSkills = response.categorizedSkills.map((skill) => ({
        ...skill,
        category: skill.category || 'Otros',
      }));

      // Asegurar que "Otros" siempre esté en las categorías
      const categories = response.categories || [];
      if (!categories.includes('Otros')) {
        categories.push('Otros');
      }

      return {
        categorizedSkills: validatedSkills,
        categories: categories,
      };
    } catch (error) {
      console.error('Error al categorizar skills:', error);
      // En caso de error, devolver skills sin categorizar con categorías por defecto
      return {
        categorizedSkills: skills.map((s) => ({ ...s, category: 'Otros' })),
        categories: this.getDefaultCategories(),
      };
    }
  }

  /**
   * Obtiene categorías genéricas por defecto
   * Se usan como fallback si la IA falla
   */
  getDefaultCategories() {
    return [
      'Técnicas',
      'Herramientas',
      'Metodologías',
      'Soft Skills',
      'Lenguajes',
      'Frameworks',
      'Certificaciones',
      'Otros',
    ];
  }
}

// Exportar instancia única (Singleton)
export default new AIContentEnhancer();
