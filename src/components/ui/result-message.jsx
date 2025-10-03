import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Sparkles,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

/**
 * ResultMessage Component
 *
 * Componente unificado para mostrar mensajes de éxito, error, warning, info
 */

const ResultMessage = ({
  type = 'info',
  title,
  message,
  className,
  children,
}) => {
  const configs = {
    success: {
      icon: CheckCircle2,
      variant: 'success',
      defaultTitle: '¡Éxito!',
    },
    error: {
      icon: XCircle,
      variant: 'destructive',
      defaultTitle: 'Error',
    },
    warning: {
      icon: AlertCircle,
      variant: 'warning',
      defaultTitle: 'Advertencia',
    },
    info: {
      icon: Info,
      variant: 'info',
      defaultTitle: 'Información',
    },
    ai: {
      icon: Sparkles,
      variant: 'default',
      defaultTitle: 'Generado con IA',
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <Alert
      variant={config.variant}
      className={cn(
        'animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <AlertTitle>{title || config.defaultTitle}</AlertTitle>
      {(message || children) && (
        <AlertDescription>
          {message}
          {children}
        </AlertDescription>
      )}
    </Alert>
  );
};

/**
 * SuccessMessage Component
 */
export const SuccessMessage = ({ title, message, className, children }) => (
  <ResultMessage
    type="success"
    title={title}
    message={message}
    className={className}
  >
    {children}
  </ResultMessage>
);

/**
 * ErrorMessage Component
 */
export const ErrorMessage = ({ title, message, className, children }) => (
  <ResultMessage
    type="error"
    title={title}
    message={message}
    className={className}
  >
    {children}
  </ResultMessage>
);

/**
 * WarningMessage Component
 */
export const WarningMessage = ({ title, message, className, children }) => (
  <ResultMessage
    type="warning"
    title={title}
    message={message}
    className={className}
  >
    {children}
  </ResultMessage>
);

/**
 * InfoMessage Component
 */
export const InfoMessage = ({ title, message, className, children }) => (
  <ResultMessage
    type="info"
    title={title}
    message={message}
    className={className}
  >
    {children}
  </ResultMessage>
);

/**
 * AIGeneratedMessage Component
 * Para indicar que algo fue generado por IA
 */
export const AIGeneratedMessage = ({ title, message, className, children }) => (
  <ResultMessage
    type="ai"
    title={title}
    message={message}
    className={className}
  >
    {children}
  </ResultMessage>
);

/**
 * ValidationMessages Component
 * Muestra múltiples mensajes de validación (errores y warnings)
 */
export const ValidationMessages = ({
  errors = [],
  warnings = [],
  className,
}) => {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Errores */}
      {errors.length > 0 && (
        <ErrorMessage
          title={`${errors.length} ${
            errors.length === 1 ? 'Error' : 'Errores'
          }`}
        >
          <ul className="mt-2 space-y-1 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </ErrorMessage>
      )}

      {/* Advertencias */}
      {warnings.length > 0 && (
        <WarningMessage
          title={`${warnings.length} ${
            warnings.length === 1 ? 'Advertencia' : 'Advertencias'
          }`}
        >
          <ul className="mt-2 space-y-1 list-disc list-inside">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm">
                {warning}
              </li>
            ))}
          </ul>
        </WarningMessage>
      )}
    </div>
  );
};

/**
 * QualityIndicator Component
 * Muestra la calidad de contenido generado
 */
export const QualityIndicator = ({
  score,
  maxScore = 100,
  level,
  feedback = [],
  className,
}) => {
  const percentage = (score / maxScore) * 100;

  const levelConfig = {
    excelente: {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Excelente',
    },
    'muy bueno': {
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: 'Muy Bueno',
    },
    bueno: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Bueno',
    },
    aceptable: {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      label: 'Aceptable',
    },
    insuficiente: {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Insuficiente',
    },
  };

  const config = levelConfig[level] || levelConfig.bueno;

  return (
    <div className={cn('p-4 rounded-lg border', className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Calidad del Contenido</h4>
        <span
          className={cn(
            'text-sm font-semibold px-2 py-1 rounded',
            config.bgColor,
            config.color
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-muted rounded-full h-2 mb-3">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-500',
            percentage >= 85
              ? 'bg-green-500'
              : percentage >= 70
              ? 'bg-blue-500'
              : percentage >= 55
              ? 'bg-yellow-500'
              : 'bg-orange-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mb-2">
        Puntuación: {score} / {maxScore}
      </p>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="space-y-1 mt-3 pt-3 border-t">
          {feedback.map((item, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              {item}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultMessage;
