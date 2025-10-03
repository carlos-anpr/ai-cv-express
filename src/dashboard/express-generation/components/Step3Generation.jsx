import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import GenerationProgress, {
  StepProgress,
} from '@/components/ui/generation-progress';
import { ErrorMessage } from '@/components/ui/result-message';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import ExpressGenerationService from '@/services/ExpressGenerationService';
import { useUser } from '@clerk/clerk-react';

/**
 * Step3Generation Component
 *
 * Tercer paso: Generación automática con IA (CV + Carta)
 */

const Step3Generation = ({
  profileData,
  jobOfferData,
  onComplete,
  onBack,
  onError,
}) => {
  const { user } = useUser();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Iniciando generación...');
  const [generationSteps, setGenerationSteps] = useState([
    {
      label: 'Analizando perfil',
      status: 'pending',
      description: 'Procesando tu información',
    },
    {
      label: 'Extrayendo oferta',
      status: 'pending',
      description: 'Categorizando requisitos',
    },
    {
      label: 'Generando CV',
      status: 'pending',
      description: 'Creando secciones personalizadas',
    },
    {
      label: 'Generando carta',
      status: 'pending',
      description: 'Redactando presentación',
    },
  ]);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Actualizar estado de un step específico
  const updateStepStatus = (index, status, duration) => {
    setGenerationSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, status, duration } : step
      )
    );
  };

  // Función principal de generación
  const startGeneration = async () => {
    try {
      setError(null);
      setIsRetrying(false);

      const userEmail =
        user?.primaryEmailAddress?.emailAddress || 'user@example.com';
      const startTime = Date.now();

      const result = await ExpressGenerationService.generateComplete(
        profileData.description,
        jobOfferData.rawText,
        userEmail,
        (progressUpdate) => {
          // Actualizar progreso general
          setCurrentPhase(progressUpdate.phase);
          setProgress(progressUpdate.progress);
          setMessage(progressUpdate.message);

          // Actualizar estado de steps
          const phaseIndex = progressUpdate.phase - 1;

          // Marcar como activo el step actual
          if (progressUpdate.progress > 0 && progressUpdate.progress < 100) {
            updateStepStatus(phaseIndex, 'active');
          }

          // Marcar como completado el step anterior
          if (phaseIndex > 0 && progressUpdate.progress > 25) {
            const prevTime = ((Date.now() - startTime) / 1000).toFixed(1);
            updateStepStatus(phaseIndex - 1, 'completed', `${prevTime}s`);
          }
        }
      );

      // Marcar último step como completado
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      updateStepStatus(3, 'completed', `${totalTime}s`);

      if (result.success) {
        // Pequeño delay para mostrar el éxito antes de continuar
        setTimeout(() => {
          onComplete(result);
        }, 500);
      } else {
        throw new Error(result.error || 'Error desconocido en la generación');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Ocurrió un error durante la generación');

      // Marcar el step actual como error
      const errorPhaseIndex = currentPhase - 1;
      updateStepStatus(errorPhaseIndex, 'error');

      onError?.(err);
    }
  };

  // Retry generation
  const handleRetry = () => {
    setIsRetrying(true);

    // Reset todos los steps
    setGenerationSteps((prev) =>
      prev.map((step) => ({ ...step, status: 'pending', duration: undefined }))
    );
    setCurrentPhase(1);
    setProgress(0);
    setMessage('Reintentando generación...');

    startGeneration();
  };

  // Iniciar generación al montar
  useEffect(() => {
    startGeneration();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Progreso principal */}
      {!error && (
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <GenerationProgress
              phase={currentPhase}
              totalPhases={4}
              progress={progress}
              message={message}
            />
          </CardContent>
        </Card>
      )}

      {/* Steps detallados */}
      <Card>
        <CardContent className="pt-6">
          <StepProgress steps={generationSteps} />
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
          <ErrorMessage title="Error en la Generación" message={error} />

          <div className="flex gap-3 justify-center">
            <Button onClick={onBack} variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver Atrás
            </Button>

            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              size="lg"
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`}
              />
              {isRetrying ? 'Reintentando...' : 'Reintentar'}
            </Button>
          </div>
        </div>
      )}

      {/* Información adicional mientras carga */}
      {!error && progress < 100 && (
        <div className="text-center space-y-2 animate-in fade-in duration-500 delay-1000">
          <p className="text-sm text-muted-foreground">
            ⏱️ Esto suele tomar 30-45 segundos
          </p>
          <p className="text-xs text-muted-foreground">
            La IA está creando contenido personalizado basado en tu perfil y la
            oferta
          </p>
        </div>
      )}

      {/* Fun facts mientras espera (aparecen después de 10 segundos) */}
      {!error && progress < 100 && progress > 25 && (
        <Card className="border-dashed animate-in fade-in duration-500">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground text-center italic">
              💡 <strong>¿Sabías que?</strong> Los CVs personalizados tienen 50%
              más probabilidades de conseguir entrevistas que los genéricos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Step3Generation;
