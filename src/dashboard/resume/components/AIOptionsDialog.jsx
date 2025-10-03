/**
 * Componente AIOptionsDialog
 * Diálogo modal para seleccionar opciones de mejora de contenido con IA
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const AIOptionsDialog = ({ isOpen, onClose, onSelect, options, title }) => {
  const handleSelect = (optionId) => {
    onSelect(optionId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || '¿Qué deseas hacer?'}</DialogTitle>
          <DialogDescription>
            Selecciona cómo quieres que la IA te ayude con tu contenido
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="w-full justify-start text-left h-auto py-4"
              onClick={() => handleSelect(option.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <div className="font-semibold">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIOptionsDialog;
