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
  async parseSkillsFromText(description, jobTitle) {
    const prompt = skillsParserPrompt(description, jobTitle);

    try {
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const response = JSON.parse(result.response.text());

      return response.skills.map((skill) => ({
        name: skill.name,
        rating: this.normalizeSkillRating(skill.level),
      }));
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
  async categorizeSkills(skills, jobTitle) {
    if (!skills || skills.length === 0) {
      return { categorizedSkills: [], categories: [] };
    }

    try {
      const prompt = skillsCategorizationPrompt(skills, jobTitle);
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const response = JSON.parse(result.response.text());

      console.log('📊 Skills categorizadas por IA:', response);

      return {
        categorizedSkills: response.categorizedSkills || [],
        categories: response.categories || [],
      };
    } catch (error) {
      console.error('Error al categorizar skills:', error);
      // En caso de error, devolver skills sin categorizar
      return {
        categorizedSkills: skills.map((s) => ({ ...s, category: 'Otros' })),
        categories: ['Otros'],
      };
    }
  }
}

// Exportar instancia única (Singleton)
export default new AIContentEnhancer();
