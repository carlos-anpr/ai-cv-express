import { useState, useCallback } from 'react';

/**
 * useExpressGeneration Hook
 *
 * Hook principal que maneja todo el estado del wizard de Generación Express
 */

const useExpressGeneration = () => {
  // Estado del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Datos de cada paso
  const [stepData, setStepData] = useState({
    step1: null, // { description }
    step2: null, // { rawText, extractedData, validation }
    step3: null, // { generatedData }
    step4: null, // { resume, coverLetter, etc }
  });

  // Navegación entre steps
  const goToStep = useCallback((stepNumber) => {
    if (stepNumber < 1 || stepNumber > 4) return;

    setIsTransitioning(true);

    // Pequeño delay para animación
    setTimeout(() => {
      setCurrentStep(stepNumber);
      setIsTransitioning(false);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
  }, []);

  const goToNextStep = useCallback(() => {
    if (currentStep < 4) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // Guardar datos de un step específico
  const saveStepData = useCallback((step, data) => {
    setStepData((prev) => ({
      ...prev,
      [`step${step}`]: data,
    }));
  }, []);

  // Handler para Step 1 (Profile)
  const handleStep1Complete = useCallback(
    (data) => {
      saveStepData(1, data);
      goToNextStep();
    },
    [saveStepData, goToNextStep]
  );

  // Handler para Step 2 (Job Offer)
  const handleStep2Complete = useCallback(
    (data) => {
      saveStepData(2, data);
      goToNextStep();
    },
    [saveStepData, goToNextStep]
  );

  // Handler para Step 3 (Generation)
  const handleStep3Complete = useCallback(
    (data) => {
      saveStepData(3, data);
      saveStepData(4, data); // También guardar en step 4 para resultados
      goToNextStep();
    },
    [saveStepData, goToNextStep]
  );

  // Handler para error en Step 3
  const handleStep3Error = useCallback((error) => {
    console.error('Generation error:', error);
    // Por ahora, no hacemos nada especial
    // En el futuro podríamos mostrar un modal de error
  }, []);

  // Reset completo (para empezar de nuevo)
  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setStepData({
      step1: null,
      step2: null,
      step3: null,
      step4: null,
    });
    setIsTransitioning(false);
  }, []);

  // Obtener progreso del wizard
  const getProgress = useCallback(() => {
    const completedSteps = Object.values(stepData).filter(Boolean).length;
    return {
      current: currentStep,
      total: 4,
      completed: completedSteps,
      percentage: (completedSteps / 4) * 100,
    };
  }, [currentStep, stepData]);

  // Verificar si se puede avanzar al siguiente step
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return stepData.step1 !== null;
      case 2:
        return stepData.step2 !== null;
      case 3:
        return stepData.step3 !== null;
      case 4:
        return true; // Siempre se puede "proceder" desde el último step
      default:
        return false;
    }
  }, [currentStep, stepData]);

  return {
    // Estado
    currentStep,
    stepData,
    isTransitioning,

    // Navegación
    goToStep,
    goToNextStep,
    goToPreviousStep,

    // Handlers de pasos
    handleStep1Complete,
    handleStep2Complete,
    handleStep3Complete,
    handleStep3Error,

    // Utilidades
    saveStepData,
    resetWizard,
    getProgress,
    canProceed,
  };
};

export default useExpressGeneration;
