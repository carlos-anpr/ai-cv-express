/**
 * Custom Hook para generación de skills con IA
 * Maneja la lógica de parsing de lenguaje natural a skills estructuradas
 */

import { useState } from 'react';
import AIContentEnhancer from '../services/AIContentEnhancer';
import { toast } from 'sonner';

export const useSkillsGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSkills, setGeneratedSkills] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [skillsDescription, setSkillsDescription] = useState('');

  /**
   * Genera skills desde descripción en lenguaje natural
   * @param {string} description - Descripción de habilidades
   * @param {string} jobTitle - Título del puesto
   * @returns {Promise<Array>} - Array de skills generadas
   */
  const generateSkills = async (description, jobTitle) => {
    if (!description || description.trim().length < 10) {
      toast.error(
        'Por favor escribe una descripción más detallada de tus habilidades'
      );
      return;
    }

    setIsLoading(true);
    setSkillsDescription(description);

    try {
      const result = await AIContentEnhancer.parseSkillsFromText(
        description,
        jobTitle
      );

      setGeneratedSkills(result);
      setShowPreview(true);

      toast.success(`Se generaron ${result.length} habilidades`);
      return result;
    } catch (error) {
      console.error('Error generating skills:', error);
      toast.error('Error al generar habilidades. Por favor intenta de nuevo.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Edita una skill generada
   * @param {number} index - Índice de la skill
   * @param {Object} updates - Actualizaciones a aplicar
   */
  const editGeneratedSkill = (index, updates) => {
    const updated = [...generatedSkills];
    updated[index] = { ...updated[index], ...updates };
    setGeneratedSkills(updated);
  };

  /**
   * Elimina una skill generada
   * @param {number} index - Índice de la skill a eliminar
   */
  const removeGeneratedSkill = (index) => {
    const updated = generatedSkills.filter((_, i) => i !== index);
    setGeneratedSkills(updated);
  };

  /**
   * Aplica todas las skills generadas
   * @returns {Array} - Array de skills generadas
   */
  const applyGeneratedSkills = () => {
    setShowPreview(false);
    return generatedSkills;
  };

  /**
   * Cancela la generación
   */
  const cancelGeneration = () => {
    setShowPreview(false);
    setGeneratedSkills([]);
    setSkillsDescription('');
  };

  return {
    isLoading,
    generatedSkills,
    showPreview,
    skillsDescription,
    setSkillsDescription,
    generateSkills,
    editGeneratedSkill,
    removeGeneratedSkill,
    applyGeneratedSkills,
    cancelGeneration,
  };
};
