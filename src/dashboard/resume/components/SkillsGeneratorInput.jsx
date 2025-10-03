/**
 * Componente SkillsGeneratorInput
 * Input de texto para describir habilidades en lenguaje natural
 */

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { WandSparkles, LoaderCircle } from 'lucide-react';

const SkillsGeneratorInput = ({
  value,
  onChange,
  onGenerate,
  isLoading,
  placeholder,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">
          💡 Describe tus habilidades
        </label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ||
            'Ejemplo: Domino Node.js a nivel experto, React con conocimientos básicos, TypeScript nivel intermedio, Docker y Kubernetes para despliegue...'
          }
          className="min-h-[120px]"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Describe tus habilidades en lenguaje natural y la IA las clasificará
          automáticamente
        </p>
      </div>

      <Button
        onClick={onGenerate}
        disabled={isLoading || !value || value.trim().length < 10}
        className="w-full"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
            Generando habilidades...
          </>
        ) : (
          <>
            <WandSparkles className="h-4 w-4 mr-2" />
            Generar Habilidades con IA
          </>
        )}
      </Button>
    </div>
  );
};

export default SkillsGeneratorInput;
