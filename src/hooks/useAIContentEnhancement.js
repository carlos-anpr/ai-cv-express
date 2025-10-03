/**
 * Custom Hook para mejora de contenido con IA
 * Maneja la lógica de mejora de resúmenes y experiencia laboral
 */

import { useState } from 'react';
import AIContentEnhancer from '../services/AIContentEnhancer';
import { toast } from 'sonner';

export const useAIContentEnhancement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  /**
   * Detecta el modo basado en el contenido
   * @param {string} content - Contenido a evaluar
   * @returns {string} - 'enhance' o 'generate'
   */
  const detectMode = (content) => {
    return AIContentEnhancer.detectContentMode(content);
  };

  /**
   * Mejora un resumen profesional
   * @param {string} currentText - Texto actual
   * @param {string} jobTitle - Título del puesto
   * @param {string} option - Opción de mejora
   * @returns {Promise<Object>} - Resultado de la mejora
   */
  const enhanceSummary = async (currentText, jobTitle, option = 'improve') => {
    setIsLoading(true);
    setOriginalContent(currentText);

    try {
      const result = await AIContentEnhancer.enhanceSummary(
        currentText,
        jobTitle,
        option
      );

      // Manejar diferentes estructuras de respuesta
      const content =
        result.improved || result.expanded || result[0]?.summary || '';
      setImprovedContent(content);
      setShowPreview(true);
      return result;
    } catch (error) {
      console.error('Error enhancing summary:', error);
      toast.error('Error al mejorar el resumen. Por favor intenta de nuevo.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mejora experiencia laboral
   * @param {string} currentText - HTML actual
   * @param {string} jobTitle - Título del puesto
   * @param {string} companyName - Nombre de la empresa
   * @param {string} option - Opción de mejora
   * @returns {Promise<string>} - HTML mejorado
   */
  const enhanceExperience = async (
    currentText,
    jobTitle,
    companyName,
    option = 'improve'
  ) => {
    setIsLoading(true);
    setOriginalContent(currentText);

    try {
      const result = await AIContentEnhancer.enhanceExperience(
        currentText,
        jobTitle,
        companyName,
        option
      );

      setImprovedContent(result);
      setShowPreview(true);
      return result;
    } catch (error) {
      console.error('Error enhancing experience:', error);
      toast.error(
        'Error al mejorar la experiencia. Por favor intenta de nuevo.'
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Aplica el contenido mejorado
   * @returns {string} - Contenido mejorado
   */
  const applyImprovedContent = () => {
    setShowPreview(false);
    return improvedContent;
  };

  /**
   * Cancela la mejora
   * @returns {string} - Contenido original
   */
  const cancelImprovement = () => {
    setShowPreview(false);
    setImprovedContent('');
    return originalContent;
  };

  /**
   * Regenera el contenido
   * @param {string} type - Tipo: 'summary' o 'experience'
   * @param {...any} params - Parámetros para la generación
   * @returns {Promise} - Resultado de la regeneración
   */
  const regenerateContent = async (type, ...params) => {
    if (type === 'summary') {
      return await enhanceSummary(params[0], params[1], 'regenerate');
    } else if (type === 'experience') {
      return await enhanceExperience(
        params[0],
        params[1],
        params[2],
        'regenerate'
      );
    }
  };

  return {
    isLoading,
    showOptions,
    showPreview,
    improvedContent,
    originalContent,
    setShowOptions,
    setShowPreview,
    detectMode,
    enhanceSummary,
    enhanceExperience,
    applyImprovedContent,
    cancelImprovement,
    regenerateContent,
  };
};
