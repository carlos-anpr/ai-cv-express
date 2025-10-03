/**
 * Componente AIPreviewPanel
 * Panel de preview para mostrar contenido mejorado por IA antes de aplicarlo
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Check, X, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const AIPreviewPanel = ({
  isOpen,
  title,
  content,
  originalContent,
  onApply,
  onRegenerate,
  onCancel,
  isLoading,
  showComparison = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || '✨ Versión Mejorada'}</DialogTitle>
          <DialogDescription>
            Revisa el contenido generado y aplícalo si te gusta
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {showComparison && originalContent && (
            <div>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                Original:
              </h4>
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-muted">
                <div
                  dangerouslySetInnerHTML={{ __html: originalContent }}
                  className="text-sm opacity-70"
                />
              </div>
            </div>
          )}

          <div>
            {showComparison && (
              <h4 className="font-semibold text-sm mb-2 text-primary">
                Mejorado:
              </h4>
            )}
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerar
          </Button>
          <Button
            onClick={onApply}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            <Check className="h-4 w-4 mr-2" />
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIPreviewPanel;
