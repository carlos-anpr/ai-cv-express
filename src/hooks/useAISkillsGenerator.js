import { useState, useCallback } from 'react';
import AIContentEnhancer from '../services/AIContentEnhancer';
import { toast } from 'sonner';

/**
 * Hook personalizado para generar habilidades con IA
 * Ahora también maneja categorías
 */
export const useAISkillsGenerator = () => {
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [generatedSkills, setGeneratedSkills] = useState([]);
  const [generatedCategories, setGeneratedCategories] = useState([]); // NUEVO
  const [showPreview, setShowPreview] = useState(false);

  const generateSkills = useCallback(async (description, jobTitle) => {
    if (!description || !jobTitle) {
      toast.error('Se requiere descripción y puesto de trabajo');
      return;
    }

    if (description.length < 20) {
      toast.error('La descripción debe tener al menos 20 caracteres');
      return;
    }

    setIsGeneratingSkills(true);
    try {
      // Usar la nueva función que devuelve skills + categories
      const result = await AIContentEnhancer.parseSkillsFromText(
        description,
        jobTitle
      );

      console.log('🎯 Skills generadas con categorías:', result);

      // Preparar skills con IDs únicos
      const skillsWithIds = result.skills.map((skill, index) => ({
        ...skill,
        id: `skill-${Date.now()}-${index}`,
      }));

      setGeneratedSkills(skillsWithIds);
      setGeneratedCategories(result.categories || []); // NUEVO
      setShowPreview(true);

      toast.success(
        `✅ ${skillsWithIds.length} habilidades generadas en ${result.categories.length} categorías`
      );
    } catch (error) {
      console.error('Error generating skills:', error);
      toast.error('Error al generar habilidades: ' + error.message);
    } finally {
      setIsGeneratingSkills(false);
    }
  }, []);

  const editGeneratedSkill = useCallback((index, updatedSkill) => {
    setGeneratedSkills((prev) =>
      prev.map((skill, i) =>
        i === index ? { ...skill, ...updatedSkill } : skill
      )
    );
  }, []);

  const removeGeneratedSkill = useCallback((index) => {
    setGeneratedSkills((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const applyGeneratedSkills = useCallback(() => {
    const skillsToApply = [...generatedSkills];
    setGeneratedSkills([]);
    setGeneratedCategories([]); // NUEVO
    setShowPreview(false);
    return skillsToApply;
  }, [generatedSkills]);

  const cancelGeneration = useCallback(() => {
    setGeneratedSkills([]);
    setGeneratedCategories([]); // NUEVO
    setShowPreview(false);
  }, []);

  return {
    isGeneratingSkills,
    generatedSkills,
    generatedCategories, // NUEVO: Exportar categorías
    showPreview,
    generateSkills,
    editGeneratedSkill,
    removeGeneratedSkill,
    applyGeneratedSkills,
    cancelGeneration,
    setShowPreview,
  };
};
