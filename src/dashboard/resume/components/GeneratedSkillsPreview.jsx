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

  // Agrupar skills por categoría para mejor visualización
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || 'Otros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const handleEdit = (index, skill) => {
    setEditingIndex(index);
    setEditingSkill({ ...skill });
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
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Habilidades Generadas</DialogTitle>
          <DialogDescription>
            Se han generado {skills.length} habilidades en{' '}
            {Object.keys(skillsByCategory).length} categorías. Puedes editarlas
            antes de aplicar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {/* Mostrar agrupadas por categoría */}
          {Object.entries(skillsByCategory).map(
            ([category, categorySkills]) => (
              <div key={category} className="border rounded-lg p-3 bg-gray-50">
                <h4 className="font-semibold text-sm mb-3 text-primary">
                  {category} ({categorySkills.length})
                </h4>
                <div className="space-y-2">
                  {categorySkills.map((skill, index) => (
                    <div
                      key={skill.id || index}
                      className="flex items-center gap-3 p-2 bg-white border rounded"
                    >
                      {editingIndex === `${category}-${index}` ? (
                        // Modo edición
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
                      ) : (
                        // Modo vista
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {skill.name}
                          </div>
                          <Rating
                            style={{ maxWidth: 120 }}
                            value={skill.rating}
                            readOnly
                          />
                        </div>
                      )}
                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        {editingIndex === `${category}-${index}` ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleEdit(`${category}-${index}`, skill)
                              }
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onRemove(skill)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
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
