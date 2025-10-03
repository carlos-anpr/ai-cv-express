import React from 'react';
import { Loader2, Sparkles, Zap, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * GenerationProgress Component
 *
 * Muestra el progreso de la generación con IA de forma visual y atractiva
 */

const GenerationProgress = ({
  phase,
  totalPhases = 4,
  progress = 0,
  message = 'Procesando...',
  className,
}) => {
  // Calcular progreso global
  const globalProgress =
    ((phase - 1) / totalPhases) * 100 + progress / totalPhases;

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Icono principal animado */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <Sparkles className="w-16 h-16 text-primary/20" />
          </div>
          <Zap className="w-16 h-16 text-primary animate-pulse" />
        </div>
      </div>

      {/* Mensaje de progreso */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          Fase {phase} de {totalPhases}
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="space-y-2">
        <Progress value={globalProgress} className="h-2" />
        <p className="text-xs text-right text-muted-foreground">
          {Math.round(globalProgress)}%
        </p>
      </div>
    </div>
  );
};

/**
 * StepProgress Component
 *
 * Muestra el progreso de pasos individuales con checkmarks
 */
export const StepProgress = ({ steps = [], className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg transition-all duration-300',
            step.status === 'completed' && 'bg-green-50',
            step.status === 'active' && 'bg-primary/5',
            step.status === 'pending' && 'bg-muted/30'
          )}
        >
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {step.status === 'completed' && (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-200">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            {step.status === 'active' && (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            )}
            {step.status === 'pending' && (
              <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
            )}
          </div>

          {/* Step Label */}
          <div className="flex-1">
            <p
              className={cn(
                'text-sm font-medium',
                step.status === 'completed' && 'text-green-700',
                step.status === 'active' && 'text-primary',
                step.status === 'pending' && 'text-muted-foreground'
              )}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </p>
            )}
          </div>

          {/* Duration (opcional) */}
          {step.duration && step.status === 'completed' && (
            <span className="text-xs text-muted-foreground">
              {step.duration}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * LoadingDots Component
 *
 * Animación simple de puntos para indicar carga
 */
export const LoadingDots = ({ className }) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
    </div>
  );
};

/**
 * Spinner Component
 *
 * Spinner simple reutilizable
 */
export const Spinner = ({ size = 'default', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
    />
  );
};

/**
 * AIThinkingIndicator Component
 *
 * Indicador visual de que la IA está "pensando"
 */
export const AIThinkingIndicator = ({
  message = 'La IA está trabajando...',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10',
        className
      )}
    >
      <div className="relative">
        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-primary">{message}</p>
        <LoadingDots className="mt-1" />
      </div>
    </div>
  );
};

export default GenerationProgress;
