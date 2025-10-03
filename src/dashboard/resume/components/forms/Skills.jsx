import { Input } from '@/components/ui/input';
import React, { useContext, useEffect, useState } from 'react';
import { Rating } from '@smastrom/react-rating';

import '@smastrom/react-rating/style.css';
import { Button } from '@/components/ui/button';
import {
  LoaderCircle,
  Sparkles,
  Trash2,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import LocalDatabase from '../../../../services/LocalDatabase';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useSkillsGenerator } from '@/hooks/useSkillsGenerator';
import SkillsGeneratorInput from '../SkillsGeneratorInput';
import GeneratedSkillsPreview from '../GeneratedSkillsPreview';
import AIContentEnhancer from '@/services/AIContentEnhancer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
function Skills() {
  const [skillsList, setSkillsList] = useState([]);
  const { resumeId } = useParams();

  const [loading, setLoading] = useState(false);
  const [categorizingSkills, setCategorizingSkills] = useState(false);
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);

  const {
    isLoading: isGeneratingSkills,
    generatedSkills,
    showPreview,
    skillsDescription,
    setSkillsDescription,
    generateSkills,
    editGeneratedSkill,
    removeGeneratedSkill,
    applyGeneratedSkills,
    cancelGeneration,
  } = useSkillsGenerator();

  useEffect(() => {
    // Solo cargar una vez al montar el componente
    if (resumeInfo?.skills && resumeInfo.skills.length > 0) {
      console.log(
        '🔄 Cargando skills desde resumeInfo (inicial):',
        resumeInfo.skills
      );
      // Asignar IDs únicos si no existen
      const skillsWithIds = resumeInfo.skills.map((skill, idx) => ({
        ...skill,
        id: skill.id || `skill-${Date.now()}-${idx}`,
      }));
      setSkillsList(skillsWithIds);
    } else if (skillsList.length === 0) {
      console.log('⚠️ No hay skills en resumeInfo, iniciando con skill vacía');
      setSkillsList([{ id: `skill-${Date.now()}-0`, name: '', rating: 0 }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar el componente

  const handleChange = (index, name, value) => {
    const newEntries = skillsList.slice();

    newEntries[index][name] = value;
    setSkillsList(newEntries);
  };

  const AddNewSkills = () => {
    setSkillsList([
      ...skillsList,
      {
        id: `skill-${Date.now()}-${skillsList.length}`,
        name: '',
        rating: 0,
      },
    ]);
  };
  const RemoveSkills = () => {
    setSkillsList((skillsList) => skillsList.slice(0, -1));
  };

  const RemoveSkillByIndex = async (index) => {
    try {
      // Filtrar la skill a eliminar
      const updatedSkills = skillsList.filter((_, i) => i !== index);

      // Limpiar flags para guardar en DB
      const cleanSkills = updatedSkills
        .filter((skill) => skill.name && skill.name.trim() !== '')
        .map(
          // eslint-disable-next-line no-unused-vars
          ({ id, isNew, isUpdated, isDuplicate, ...rest }) => rest
        );

      // Primero actualizar ambos estados inmediatamente
      setSkillsList(updatedSkills);
      setResumeInfo((prev) => ({
        ...prev,
        skills: updatedSkills,
      }));

      // Luego guardar en la base de datos en segundo plano
      await LocalDatabase.UpdateResumeDetail(resumeId, { skills: cleanSkills });

      toast.success('Habilidad eliminada');
    } catch (error) {
      console.error('Error al eliminar habilidad:', error);
      toast.error('Error al eliminar la habilidad');
    }
  };

  const categorizeAllSkills = async () => {
    if (!resumeInfo?.jobTitle) {
      toast.error('Por favor, añade el puesto de trabajo primero');
      return;
    }

    if (skillsList.length === 0) {
      toast.error('No hay habilidades para categorizar');
      return;
    }

    setCategorizingSkills(true);
    try {
      const skillsToCategory = skillsList
        .filter((skill) => skill.name && skill.name.trim() !== '')
        .map((skill) => ({ name: skill.name, rating: skill.rating }));

      const result = await AIContentEnhancer.categorizeSkills(
        skillsToCategory,
        resumeInfo.jobTitle
      );

      console.log('📊 Resultado de categorización:', result);

      // Fusionar las categorías con los skills existentes (preservando IDs y flags)
      const categorizedSkillsList = skillsList.map((skill) => {
        const categorized = result.categorizedSkills.find(
          (cs) => cs.name.toLowerCase() === skill.name.toLowerCase()
        );
        return {
          ...skill,
          category: categorized?.category || 'Otros',
        };
      });

      console.log('🔄 Skills categorizadas localmente:', categorizedSkillsList);

      // Actualizar estado local
      setSkillsList(categorizedSkillsList);

      // Actualizar contexto para que se refleje en el preview
      setResumeInfo((prev) => ({
        ...prev,
        skills: categorizedSkillsList,
      }));

      // Guardar en base de datos
      const cleanSkills = categorizedSkillsList
        .filter((skill) => skill.name && skill.name.trim() !== '')
        .map(
          // eslint-disable-next-line no-unused-vars
          ({ id, isNew, isUpdated, isDuplicate, ...rest }) => rest
        );

      await LocalDatabase.UpdateResumeDetail(resumeId, {
        skills: cleanSkills,
      });

      console.log('✅ Skills categorizadas guardadas en DB');

      toast.success(
        `✅ ${result.categorizedSkills.length} habilidades categorizadas`
      );
    } catch (error) {
      console.error('Error categorizando skills:', error);
      toast.error('Error al categorizar habilidades');
    } finally {
      setCategorizingSkills(false);
    }
  };

  const handleCategoryChange = (index, newCategory) => {
    const updatedSkills = [...skillsList];
    updatedSkills[index].category = newCategory;
    setSkillsList(updatedSkills);

    // Actualizar contexto inmediatamente para reflejar en preview
    setResumeInfo((prev) => ({
      ...prev,
      skills: updatedSkills,
    }));
  };

  const onSave = async () => {
    if (!resumeId) {
      toast.error('ID del CV no válido');
      return;
    }

    setLoading(true);

    try {
      // Filtrar skills vacías y limpiar IDs temporales antes de guardar
      const cleanSkills = (skillsList || [])
        .filter((skill) => skill.name && skill.name.trim() !== '')
        .map(
          // eslint-disable-next-line no-unused-vars
          ({ id, isNew, isUpdated, isDuplicate, ...rest }) => rest
        );

      console.log('💾 Guardando skills manualmente:', cleanSkills);

      const response = await LocalDatabase.UpdateResumeDetail(resumeId, {
        skills: cleanSkills,
      });

      console.log('✅ Habilidades actualizadas:', response);

      // Actualizar el contexto
      setResumeInfo((prev) => ({
        ...prev,
        skills: cleanSkills,
      }));

      toast.success('Habilidades guardadas correctamente');
    } catch (error) {
      console.error('❌ Error actualizando habilidades:', error);
      toast.error('Error al actualizar habilidades: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSkills = async () => {
    if (!resumeInfo?.jobTitle) {
      toast.error('Por favor, añade el puesto de trabajo primero');
      return;
    }

    try {
      await generateSkills(skillsDescription, resumeInfo.jobTitle);
    } catch (error) {
      toast.error('Error al generar habilidades: ' + error.message);
    }
  };

  const handleApplyGeneratedSkills = async () => {
    const newSkills = applyGeneratedSkills();

    console.log('🔍 DEBUG: newSkills recibidas de IA:', newSkills);
    console.log('🔍 DEBUG: skillsList actual:', skillsList);

    if (newSkills.length === 0) {
      toast.error('No hay habilidades para añadir');
      return;
    }

    // Sistema inteligente de fusión
    const updatedSkillsList = [...skillsList];
    const existingSkillsMap = new Map(
      skillsList.map((skill, idx) => [
        skill.name.toLowerCase().trim(),
        { skill, index: idx },
      ])
    );

    console.log(
      '🔍 DEBUG: existingSkillsMap:',
      Array.from(existingSkillsMap.keys())
    );

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    newSkills.forEach((newSkill) => {
      const normalizedName = newSkill.name.toLowerCase().trim();
      const existing = existingSkillsMap.get(normalizedName);

      console.log(
        `🔍 DEBUG: Procesando "${newSkill.name}" (normalizado: "${normalizedName}")`
      );
      console.log(`   - ¿Existe? ${existing ? 'SÍ' : 'NO'}`);

      if (existing) {
        // Si existe y el nuevo rating es mayor, actualizar
        if (newSkill.rating > existing.skill.rating) {
          console.log(
            `   - ✅ Actualizando: rating ${existing.skill.rating} → ${newSkill.rating}`
          );
          updatedSkillsList[existing.index] = {
            ...existing.skill,
            rating: newSkill.rating,
            isUpdated: true, // Flag para animación
          };
          updatedCount++;
        } else {
          console.log(
            `   - ⏭️ Omitiendo: rating actual ${existing.skill.rating} >= nuevo ${newSkill.rating}`
          );
          // Marcar la existente como duplicada para mostrar advertencia
          updatedSkillsList[existing.index] = {
            ...updatedSkillsList[existing.index],
            isDuplicate: true, // Flag para mostrar icono de advertencia
          };
          skippedCount++;
        }
      } else {
        // Añadir nueva skill con ID único
        console.log(`   - ✨ Añadiendo como nueva skill`);
        updatedSkillsList.push({
          ...newSkill,
          id: `skill-${Date.now()}-${updatedSkillsList.length}`,
          isNew: true, // Flag para animación
        });
        addedCount++;
      }
    });

    console.log(
      '🔍 DEBUG: updatedSkillsList ANTES de setSkillsList:',
      updatedSkillsList
    );
    console.log(
      `📊 RESUMEN: ${addedCount} nuevas, ${updatedCount} actualizadas, ${skippedCount} omitidas`
    );

    // Actualizar estado
    setSkillsList(updatedSkillsList);

    // Auto-guardar en la base de datos
    if (!resumeId) {
      toast.error('ID del CV no válido');
      return;
    }

    setLoading(true);

    try {
      // Limpiar flags, IDs temporales y skills vacías antes de guardar
      const cleanSkills = updatedSkillsList
        .filter((skill) => skill.name && skill.name.trim() !== '')
        .map(
          // eslint-disable-next-line no-unused-vars
          ({ id, isNew, isUpdated, isDuplicate, ...rest }) => rest
        );

      console.log('💾 Guardando skills:', cleanSkills);

      const response = await LocalDatabase.UpdateResumeDetail(resumeId, {
        skills: cleanSkills,
      });

      console.log('✅ Respuesta de BD:', response);

      // Actualizar el contexto inmediatamente
      setResumeInfo((prev) => ({
        ...prev,
        skills: cleanSkills,
      }));

      // Mensajes personalizados
      const messages = [];
      if (addedCount > 0) messages.push(`${addedCount} nueva(s)`);
      if (updatedCount > 0) messages.push(`${updatedCount} mejorada(s)`);
      if (skippedCount > 0) messages.push(`${skippedCount} omitida(s)`);

      toast.success(`✅ Habilidades guardadas: ${messages.join(', ')}`);

      // Limpiar flags después de 2 segundos
      setTimeout(() => {
        setSkillsList((prev) =>
          // eslint-disable-next-line no-unused-vars
          prev.map(({ isNew, isUpdated, isDuplicate, ...rest }) => rest)
        );
      }, 2000);
    } catch (error) {
      console.error('❌ Error actualizando habilidades:', error);
      toast.error('Error al guardar habilidades: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-bold text-lg">Habilidades</h2>
          <p className="text-sm text-gray-600">
            Añade manualmente o genera con IA tus habilidades profesionales
          </p>
        </div>
        {skillsList.length > 0 && (
          <div className="bg-primary/10 px-3 py-1 rounded-full">
            <span className="text-sm font-semibold text-primary">
              {skillsList.filter((s) => s.name).length} habilidades
            </span>
          </div>
        )}
      </div>

      {/* Lista de habilidades actual */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-700">
            Mis Habilidades
          </h3>
          <div className="flex gap-2">
            {skillsList.length > 0 && skillsList.some((s) => s.name) && (
              <Button
                variant="outline"
                size="sm"
                onClick={categorizeAllSkills}
                disabled={categorizingSkills}
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                {categorizingSkills ? (
                  <>
                    <LoaderCircle className="w-3 h-3 mr-1 animate-spin" />
                    Categorizando...
                  </>
                ) : (
                  <>
                    <Tag className="w-3 h-3 mr-1" />
                    Categorizar con IA
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={AddNewSkills}
              className="text-primary"
            >
              + Añadir
            </Button>
            {skillsList.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={RemoveSkills}
                className="text-destructive"
              >
                - Eliminar última
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {skillsList?.map((item, index) => (
            <div
              key={item.id || index}
              className={`border rounded-lg p-3 transition-all duration-300 ${
                item.isNew
                  ? 'bg-green-50 border-green-300 animate-pulse'
                  : item.isUpdated
                  ? 'bg-blue-50 border-blue-300'
                  : item.isDuplicate
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                {/* Columna 1: Habilidad */}
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Habilidad</label>
                  <Input
                    className="w-full mt-1"
                    value={item.name}
                    onChange={(e) =>
                      handleChange(index, 'name', e.target.value)
                    }
                    placeholder="ej: React, Node.js, Python..."
                  />
                </div>

                {/* Columna 2: Categoría */}
                <div className="w-48">
                  <label className="text-xs text-gray-500">Categoría</label>
                  <Select
                    value={item.category || ''}
                    onValueChange={(value) =>
                      handleCategoryChange(index, value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1 h-9">
                      <SelectValue placeholder="Sin categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Backend Development">
                        Backend Development
                      </SelectItem>
                      <SelectItem value="Frontend Development">
                        Frontend Development
                      </SelectItem>
                      <SelectItem value="Bases de Datos">
                        Bases de Datos
                      </SelectItem>
                      <SelectItem value="DevOps & Herramientas">
                        DevOps & Herramientas
                      </SelectItem>
                      <SelectItem value="Mobile Development">
                        Mobile Development
                      </SelectItem>
                      <SelectItem value="Testing & Quality">
                        Testing & Quality
                      </SelectItem>
                      <SelectItem value="Metodologías">Metodologías</SelectItem>
                      <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Columna 3: Nivel y acciones */}
                <div className="flex flex-col items-end gap-2">
                  <div>
                    <label className="text-xs text-gray-500 block text-center">
                      Nivel
                    </label>
                    <Rating
                      style={{ maxWidth: 120 }}
                      value={item.rating}
                      onChange={(v) => handleChange(index, 'rating', v)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isNew && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                        Nueva
                      </span>
                    )}
                    {item.isUpdated && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        Mejorada
                      </span>
                    )}
                    {item.isDuplicate && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border border-yellow-400 text-yellow-800 text-xs rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Duplicada</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => RemoveSkillByIndex(index)}
                      className="text-destructive hover:text-destructive hover:bg-red-50"
                      title="Eliminar esta habilidad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generador con IA - Sección colapsable */}
      <div className="border-t pt-6">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                🚀 Generar Habilidades con IA
              </h3>
              <p className="text-sm text-gray-600">
                Describe tus conocimientos en lenguaje natural y la IA los
                convertirá en habilidades estructuradas. Las nuevas se añadirán
                a tu lista y las duplicadas se actualizarán si mejoran el nivel.
              </p>
            </div>
          </div>

          <SkillsGeneratorInput
            value={skillsDescription}
            onChange={setSkillsDescription}
            onGenerate={handleGenerateSkills}
            isLoading={isGeneratingSkills}
          />

          <GeneratedSkillsPreview
            isOpen={showPreview}
            skills={generatedSkills}
            onEdit={editGeneratedSkill}
            onRemove={removeGeneratedSkill}
            onApply={handleApplyGeneratedSkills}
            onCancel={cancelGeneration}
          />
        </div>
      </div>

      {/* Botón de guardar manual (solo si hay cambios sin guardar) */}
      <div className="flex justify-end mt-4">
        <Button disabled={loading} onClick={() => onSave()}>
          {loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            '💾 Guardar Cambios'
          )}
        </Button>
      </div>
    </div>
  );
}

export default Skills;
