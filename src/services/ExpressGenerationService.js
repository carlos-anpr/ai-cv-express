/**
 * Express Generation Service
 *
 * Servicio principal que orquesta la generación express de CVs.
 * Integra todos los prompts y maneja el flujo completo.
 */

import { AIChatSession } from '../../../service/AIModal';
import {
  expressProfileParserPrompt,
  validateProfileData,
  normalizeProfileData,
} from './prompts/expressProfileParser';
import {
  expressJobExtractorPrompt,
  validateJobOfferData,
  normalizeJobOfferData,
} from './prompts/expressJobExtractor';
import {
  expressResumeGeneratorPrompt,
  validateGeneratedResume,
  normalizeGeneratedResume,
  calculateResumeQuality,
} from './prompts/expressResumeGenerator';
import {
  expressCoverLetterGeneratorPrompt,
  validateGeneratedCoverLetter,
  formatCoverLetterAsText,
  calculateCoverLetterQuality,
} from './prompts/expressCoverLetterGenerator';

class ExpressGenerationService {
  constructor() {
    this.aiSession = null;
  }

  /**
   * Inicializa la sesión de IA
   */
  initializeAI() {
    if (!this.aiSession) {
      this.aiSession = AIChatSession();
    }
    return this.aiSession;
  }

  /**
   * PASO 1: Parsea la descripción del perfil del usuario
   *
   * @param {string} userDescription - Descripción libre del perfil
   * @param {function} onProgress - Callback para reportar progreso
   * @returns {Promise<Object>} - Perfil estructurado
   */
  async parseUserProfile(userDescription, onProgress) {
    try {
      if (!userDescription || userDescription.length < 50) {
        throw new Error('La descripción debe tener al menos 50 caracteres');
      }

      onProgress?.({
        step: 'parsing-profile',
        progress: 10,
        message: 'Analizando tu perfil...',
      });

      const ai = this.initializeAI();
      const promptConfig = expressProfileParserPrompt(userDescription);

      onProgress?.({
        step: 'parsing-profile',
        progress: 30,
        message: 'Extrayendo información...',
      });

      const result = await ai.sendMessage(promptConfig.prompt);
      const responseText = result.response.text();

      onProgress?.({
        step: 'parsing-profile',
        progress: 70,
        message: 'Estructurando datos...',
      });

      // Parse JSON response
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        console.error('Error parsing AI response:', responseText);
        throw new Error(
          'La IA devolvió un formato inválido. Intenta de nuevo.'
        );
      }

      // Normalize data
      const normalizedData = normalizeProfileData(parsedData);

      // Validate
      const validation = validateProfileData(normalizedData);

      onProgress?.({
        step: 'parsing-profile',
        progress: 100,
        message: '¡Perfil analizado!',
      });

      return {
        success: true,
        data: normalizedData,
        validation,
        rawResponse: parsedData,
      };
    } catch (error) {
      console.error('Error parsing user profile:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * PASO 2: Extrae información de la oferta de trabajo
   *
   * @param {string} rawJobOfferText - Texto completo de la oferta
   * @param {function} onProgress - Callback para reportar progreso
   * @returns {Promise<Object>} - Oferta estructurada
   */
  async extractJobOffer(rawJobOfferText, onProgress) {
    try {
      if (!rawJobOfferText || rawJobOfferText.length < 100) {
        throw new Error(
          'La información de la oferta debe tener al menos 100 caracteres'
        );
      }

      onProgress?.({
        step: 'extracting-job',
        progress: 10,
        message: 'Analizando la oferta...',
      });

      const ai = this.initializeAI();
      const promptConfig = expressJobExtractorPrompt(rawJobOfferText);

      onProgress?.({
        step: 'extracting-job',
        progress: 30,
        message: 'Identificando requisitos...',
      });

      const result = await ai.sendMessage(promptConfig.prompt);
      const responseText = result.response.text();

      onProgress?.({
        step: 'extracting-job',
        progress: 70,
        message: 'Categorizando información...',
      });

      // Parse JSON response
      let extractedData;
      try {
        extractedData = JSON.parse(responseText);
      } catch {
        console.error('Error parsing job offer:', responseText);
        throw new Error('Error al procesar la oferta. Intenta de nuevo.');
      }

      // Normalize data
      const normalizedData = normalizeJobOfferData(extractedData);

      // Validate
      const validation = validateJobOfferData(normalizedData);

      onProgress?.({
        step: 'extracting-job',
        progress: 100,
        message: '¡Oferta analizada!',
      });

      return {
        success: true,
        data: normalizedData,
        validation,
        rawResponse: extractedData,
      };
    } catch (error) {
      console.error('Error extracting job offer:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * PASO 3: Genera el CV completo
   *
   * @param {Object} profileData - Datos del perfil
   * @param {Object} jobOfferData - Datos de la oferta
   * @param {function} onProgress - Callback para reportar progreso
   * @returns {Promise<Object>} - CV generado
   */
  async generateResume(profileData, jobOfferData, onProgress) {
    try {
      onProgress?.({
        step: 'generating-resume',
        progress: 10,
        message: 'Preparando tu CV...',
      });

      const ai = this.initializeAI();
      const promptConfig = expressResumeGeneratorPrompt(
        profileData,
        jobOfferData
      );

      onProgress?.({
        step: 'generating-resume',
        progress: 30,
        message: 'Generando resumen profesional...',
      });

      const result = await ai.sendMessage(promptConfig.prompt);
      const responseText = result.response.text();

      onProgress?.({
        step: 'generating-resume',
        progress: 60,
        message: 'Generando experiencia laboral...',
      });

      // Parse JSON response
      let generatedResume;
      try {
        generatedResume = JSON.parse(responseText);
      } catch {
        console.error('Error parsing resume:', responseText);
        throw new Error('Error al generar el CV. Intenta de nuevo.');
      }

      onProgress?.({
        step: 'generating-resume',
        progress: 80,
        message: 'Generando habilidades...',
      });

      // Validate
      const validation = validateGeneratedResume(generatedResume);

      if (!validation.isValid) {
        console.error('Resume validation errors:', validation.errors);
        throw new Error('El CV generado no cumple los estándares de calidad');
      }

      // Calculate quality
      const quality = calculateResumeQuality(generatedResume);

      onProgress?.({
        step: 'generating-resume',
        progress: 100,
        message: '¡CV generado!',
      });

      return {
        success: true,
        data: generatedResume,
        validation,
        quality,
        rawResponse: generatedResume,
      };
    } catch (error) {
      console.error('Error generating resume:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * PASO 4: Genera la carta de presentación
   *
   * @param {Object} profileData - Datos del perfil
   * @param {Object} jobOfferData - Datos de la oferta
   * @param {Object} resumeData - CV generado
   * @param {function} onProgress - Callback para reportar progreso
   * @returns {Promise<Object>} - Carta generada
   */
  async generateCoverLetter(profileData, jobOfferData, resumeData, onProgress) {
    try {
      onProgress?.({
        step: 'generating-cover-letter',
        progress: 10,
        message: 'Preparando carta de presentación...',
      });

      const ai = this.initializeAI();
      const promptConfig = expressCoverLetterGeneratorPrompt(
        profileData,
        jobOfferData,
        resumeData
      );

      onProgress?.({
        step: 'generating-cover-letter',
        progress: 40,
        message: 'Redactando contenido personalizado...',
      });

      const result = await ai.sendMessage(promptConfig.prompt);
      const responseText = result.response.text();

      onProgress?.({
        step: 'generating-cover-letter',
        progress: 70,
        message: 'Finalizando carta...',
      });

      // Parse JSON response
      let generatedLetter;
      try {
        generatedLetter = JSON.parse(responseText);
      } catch {
        console.error('Error parsing cover letter:', responseText);
        throw new Error('Error al generar la carta. Intenta de nuevo.');
      }

      // Validate
      const validation = validateGeneratedCoverLetter(generatedLetter);

      if (!validation.isValid) {
        console.error('Cover letter validation errors:', validation.errors);
        throw new Error(
          'La carta generada no cumple los estándares de calidad'
        );
      }

      // Calculate quality
      const quality = calculateCoverLetterQuality(generatedLetter);

      // Format as text
      const textVersion = formatCoverLetterAsText(generatedLetter);

      onProgress?.({
        step: 'generating-cover-letter',
        progress: 100,
        message: '¡Carta generada!',
      });

      return {
        success: true,
        data: generatedLetter,
        textVersion,
        validation,
        quality,
        rawResponse: generatedLetter,
      };
    } catch (error) {
      console.error('Error generating cover letter:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * FLUJO COMPLETO: Genera CV + Carta + Candidatura
   *
   * @param {string} userDescription - Descripción del perfil
   * @param {string} rawJobOffer - Texto de la oferta
   * @param {string} userEmail - Email del usuario (para guardar)
   * @param {function} onProgress - Callback para reportar progreso general
   * @returns {Promise<Object>} - Todo generado
   */
  async generateComplete(userDescription, rawJobOffer, userEmail, onProgress) {
    const results = {
      profileData: null,
      jobOfferData: null,
      resume: null,
      coverLetter: null,
      errors: [],
    };

    try {
      // PASO 1: Parse profile
      onProgress?.({
        phase: 1,
        totalPhases: 4,
        progress: 0,
        message: 'Analizando tu perfil...',
      });

      const profileResult = await this.parseUserProfile(
        userDescription,
        (stepProgress) => {
          onProgress?.({
            phase: 1,
            totalPhases: 4,
            progress: stepProgress.progress * 0.25, // 0-25%
            message: stepProgress.message,
          });
        }
      );

      if (!profileResult.success) {
        results.errors.push({ step: 'profile', error: profileResult.error });
        throw new Error(`Error en perfil: ${profileResult.error}`);
      }

      results.profileData = profileResult.data;

      // PASO 2: Extract job offer
      onProgress?.({
        phase: 2,
        totalPhases: 4,
        progress: 25,
        message: 'Analizando la oferta de trabajo...',
      });

      const jobOfferResult = await this.extractJobOffer(
        rawJobOffer,
        (stepProgress) => {
          onProgress?.({
            phase: 2,
            totalPhases: 4,
            progress: 25 + stepProgress.progress * 0.25, // 25-50%
            message: stepProgress.message,
          });
        }
      );

      if (!jobOfferResult.success) {
        results.errors.push({ step: 'job-offer', error: jobOfferResult.error });
        throw new Error(`Error en oferta: ${jobOfferResult.error}`);
      }

      results.jobOfferData = jobOfferResult.data;

      // PASO 3: Generate resume
      onProgress?.({
        phase: 3,
        totalPhases: 4,
        progress: 50,
        message: 'Generando tu CV personalizado...',
      });

      const resumeResult = await this.generateResume(
        results.profileData,
        results.jobOfferData,
        (stepProgress) => {
          onProgress?.({
            phase: 3,
            totalPhases: 4,
            progress: 50 + stepProgress.progress * 0.25, // 50-75%
            message: stepProgress.message,
          });
        }
      );

      if (!resumeResult.success) {
        results.errors.push({ step: 'resume', error: resumeResult.error });
        throw new Error(`Error generando CV: ${resumeResult.error}`);
      }

      results.resume = resumeResult.data;
      results.resumeQuality = resumeResult.quality;

      // PASO 4: Generate cover letter
      onProgress?.({
        phase: 4,
        totalPhases: 4,
        progress: 75,
        message: 'Generando carta de presentación...',
      });

      const coverLetterResult = await this.generateCoverLetter(
        results.profileData,
        results.jobOfferData,
        results.resume,
        (stepProgress) => {
          onProgress?.({
            phase: 4,
            totalPhases: 4,
            progress: 75 + stepProgress.progress * 0.25, // 75-100%
            message: stepProgress.message,
          });
        }
      );

      if (!coverLetterResult.success) {
        results.errors.push({
          step: 'cover-letter',
          error: coverLetterResult.error,
        });
        throw new Error(`Error generando carta: ${coverLetterResult.error}`);
      }

      results.coverLetter = coverLetterResult.data;
      results.coverLetterText = coverLetterResult.textVersion;
      results.coverLetterQuality = coverLetterResult.quality;

      // Normalize resume for database
      results.resumeForDB = normalizeGeneratedResume(results.resume, userEmail);

      onProgress?.({
        phase: 4,
        totalPhases: 4,
        progress: 100,
        message: '¡Generación completa!',
      });

      return {
        success: true,
        ...results,
      };
    } catch (error) {
      console.error('Error in complete generation:', error);
      return {
        success: false,
        error: error.message,
        ...results,
      };
    }
  }

  /**
   * Regenera solo una sección específica del CV
   * Útil si el usuario quiere mejorar algo sin regenerar todo
   */
  async regenerateSection() {
    // TODO: Implementar regeneración selectiva
    // Útil para: regenerar solo el resumen, solo experiencia, etc.
    throw new Error('Regeneración de secciones no implementada aún');
  }

  /**
   * Limpia la sesión de IA (útil para liberar memoria)
   */
  cleanup() {
    this.aiSession = null;
  }
}

// Export singleton instance
const expressGenerationService = new ExpressGenerationService();
export default expressGenerationService;
