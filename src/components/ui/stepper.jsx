import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Stepper Component
 *
 * Muestra el progreso visual del flujo en múltiples pasos.
 * Soporta estados: pending, active, completed, error
 */

const Stepper = ({ steps, currentStep, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop/Tablet: Horizontal Stepper */}
      <div className="hidden sm:block">
        <ol className="flex items-center w-full">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.id}
                className={cn('flex items-center', !isLast && 'w-full')}
              >
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                      isCompleted && 'bg-green-500 border-green-500 text-white',
                      isActive &&
                        'bg-primary border-primary text-primary-foreground scale-110',
                      !isActive &&
                        !isCompleted &&
                        'bg-muted border-muted-foreground/30 text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 animate-in zoom-in duration-200" />
                    ) : (
                      <span className="text-sm font-semibold">
                        {stepNumber}
                      </span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={cn(
                      'mt-2 text-sm font-medium transition-colors duration-200 text-center',
                      isActive && 'text-primary font-semibold',
                      isCompleted && 'text-green-600',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-4 transition-all duration-500',
                      isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile: Compact Progress Bar */}
      <div className="sm:hidden">
        {/* Progress Bar */}
        <div className="relative">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-semibold transition-all duration-300 z-10',
                    isCompleted && 'bg-green-500 border-green-500 text-white',
                    isActive &&
                      'bg-primary border-primary text-primary-foreground scale-110',
                    !isActive &&
                      !isCompleted &&
                      'bg-background border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
              );
            })}
          </div>

          {/* Background connector line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted-foreground/20 -z-0" />

          {/* Progress connector line */}
          <div
            className="absolute top-4 left-0 h-0.5 bg-green-500 transition-all duration-500 -z-0"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Current Step Label */}
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-primary">
            {steps[currentStep - 1]?.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Paso {currentStep} de {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual Step Component (opcional, para usar independientemente)
 */
export const Step = ({ number, label, status = 'pending', className }) => {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const isError = status === 'error';

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
          isCompleted && 'bg-green-500 border-green-500 text-white',
          isActive &&
            'bg-primary border-primary text-primary-foreground scale-110',
          isError &&
            'bg-destructive border-destructive text-destructive-foreground',
          !isActive &&
            !isCompleted &&
            !isError &&
            'bg-muted border-muted-foreground/30 text-muted-foreground'
        )}
      >
        {isCompleted ? (
          <Check className="w-5 h-5" />
        ) : (
          <span className="text-sm font-semibold">{number}</span>
        )}
      </div>
      <span
        className={cn(
          'mt-2 text-sm font-medium transition-colors duration-200',
          isActive && 'text-primary font-semibold',
          isCompleted && 'text-green-600',
          isError && 'text-destructive',
          !isActive && !isCompleted && !isError && 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </div>
  );
};

/**
 * Vertical Stepper Component (útil para layouts específicos)
 */
export const VerticalStepper = ({ steps, currentStep, className }) => {
  return (
    <ol className={cn('space-y-4', className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className="relative">
            <div className="flex items-start">
              {/* Step Circle */}
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                    isCompleted && 'bg-green-500 border-green-500 text-white',
                    isActive &&
                      'bg-primary border-primary text-primary-foreground',
                    !isActive &&
                      !isCompleted &&
                      'bg-muted border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="ml-4 flex-1">
                <h3
                  className={cn(
                    'text-sm font-medium',
                    isActive && 'text-primary',
                    isCompleted && 'text-green-600',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </h3>
                {step.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Vertical Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-5 top-10 w-0.5 h-full -ml-px transition-colors duration-500',
                  isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;
