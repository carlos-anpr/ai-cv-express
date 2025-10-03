/**
 * Componente GeneratedSkillsPreview
 * Preview de skills generadas con opciones de edición antes de aplicar
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rating } from '@smastrom/react-rating';
import { Check, X, Trash2, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const GeneratedSkillsPreview = ({
  isOpen,
  skills,
  onApply,
  onEdit,
  onRemove,
  onCancel,
}) => {
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingSkill, setEditingSkill] = React.useState(null);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingSkill({ ...skills[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingSkill) {
      onEdit(editingIndex, editingSkill);
      setEditingIndex(null);
      setEditingSkill(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingSkill(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✨ Habilidades Generadas</DialogTitle>
          <DialogDescription>
            Se han generado {skills.length} habilidades. Puedes editarlas o
            eliminarlas antes de aplicar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20"
            >
              {editingIndex === index ? (
                <>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={editingSkill.name}
                      onChange={(e) =>
                        setEditingSkill({
                          ...editingSkill,
                          name: e.target.value,
                        })
                      }
                      placeholder="Nombre de la habilidad"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Nivel:</span>
                      <Rating
                        style={{ maxWidth: 120 }}
                        value={editingSkill.rating}
                        onChange={(v) =>
                          setEditingSkill({ ...editingSkill, rating: v })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveEdit}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-semibold">{skill.name}</div>
                    <Rating
                      style={{ maxWidth: 120 }}
                      value={skill.rating}
                      readOnly
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(index)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {skills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay habilidades para mostrar
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={onApply}
            disabled={skills.length === 0}
            className="flex-1 sm:flex-none"
          >
            <Check className="h-4 w-4 mr-2" />
            Aplicar Todas ({skills.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratedSkillsPreview;
