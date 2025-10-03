import { Input } from '@/components/ui/input';
import React, { useContext, useEffect, useState } from 'react';
import { Rating } from '@smastrom/react-rating';

import '@smastrom/react-rating/style.css';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import LocalDatabase from '../../../../services/LocalDatabase';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSkillsGenerator } from '@/hooks/useSkillsGenerator';
import SkillsGeneratorInput from '../SkillsGeneratorInput';
import GeneratedSkillsPreview from '../GeneratedSkillsPreview';
function Skills() {
  const [skillsList, setSkillsList] = useState([
    {
      name: '',
      rating: 0,
    },
  ]);
  const { resumeId } = useParams();

  const [loading, setLoading] = useState(false);
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
    resumeInfo && setSkillsList(resumeInfo?.skills);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index, name, value) => {
    const newEntries = skillsList.slice();

    newEntries[index][name] = value;
    setSkillsList(newEntries);
  };

  const AddNewSkills = () => {
    setSkillsList([
      ...skillsList,
      {
        name: '',
        rating: 0,
      },
    ]);
  };
  const RemoveSkills = () => {
    setSkillsList((skillsList) => skillsList.slice(0, -1));
  };

  const onSave = async () => {
    if (!resumeId) {
      toast.error('ID del CV no válido');
      return;
    }

    setLoading(true);

    try {
      // Limpiar IDs temporales antes de guardar
      // eslint-disable-next-line no-unused-vars
      const cleanSkills = skillsList?.map(({ id, ...rest }) => rest) || [];

      const response = await LocalDatabase.UpdateResumeDetail(resumeId, {
        skills: cleanSkills,
      });

      console.log('✅ Habilidades actualizadas:', response);
      toast.success('Habilidades actualizadas correctamente');
    } catch (error) {
      console.error('❌ Error actualizando habilidades:', error);
      toast.error('Error al actualizar habilidades: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setResumeInfo((prevResumeInfo) => ({
      ...prevResumeInfo,
      skills: skillsList,
    }));
  }, [skillsList, setResumeInfo]);

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

  const handleApplyGeneratedSkills = () => {
    const newSkills = applyGeneratedSkills();

    // Deduplicar: evitar añadir skills que ya existen
    const existingSkillNames = new Set(
      skillsList.map((s) => s.name.toLowerCase().trim())
    );

    const uniqueNewSkills = newSkills.filter(
      (skill) => !existingSkillNames.has(skill.name.toLowerCase().trim())
    );

    if (uniqueNewSkills.length === 0) {
      toast.info('Todas las habilidades generadas ya existen en tu lista');
      return;
    }

    // Añadir las nuevas skills al final de la lista
    setSkillsList([...skillsList, ...uniqueNewSkills]);

    const addedCount = uniqueNewSkills.length;
    const duplicateCount = newSkills.length - addedCount;

    if (duplicateCount > 0) {
      toast.success(
        `✅ ${addedCount} habilidad(es) añadida(s). ${duplicateCount} duplicada(s) omitida(s)`
      );
    } else {
      toast.success(`✅ ${addedCount} habilidad(es) añadida(s) correctamente`);
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Habilidades</h2>
      <p>Añade tus principales habilidades profesionales</p>

      <Tabs defaultValue="manual" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">✏️ Manual</TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="w-4 h-4 mr-2" />
            Generar con IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
          <div>
            {skillsList?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between mb-2 border rounded-lg p-3 "
              >
                <div>
                  <label className="text-xs">Nombre</label>
                  <Input
                    className="w-full"
                    defaultValue={item.name}
                    onChange={(e) =>
                      handleChange(index, 'name', e.target.value)
                    }
                  />
                </div>
                <Rating
                  style={{ maxWidth: 120 }}
                  value={item.rating}
                  onChange={(v) => handleChange(index, 'rating', v)}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={AddNewSkills}
                className="text-primary"
              >
                + Añadir Más Habilidad
              </Button>
              <Button
                variant="outline"
                onClick={RemoveSkills}
                className="text-primary"
              >
                - Eliminar
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2">💡 ¿Cómo funciona?</h3>
              <p className="text-sm text-gray-600">
                Describe tus habilidades en lenguaje natural y la IA las
                convertirá automáticamente en una lista estructurada con niveles
                de dominio. Ejemplo: "Soy experto en React y TypeScript, tengo
                nivel intermedio en Node.js y bases de datos SQL"
              </p>
            </div>

            <SkillsGeneratorInput
              value={skillsDescription}
              onChange={setSkillsDescription}
              onGenerate={handleGenerateSkills}
              isLoading={isGeneratingSkills}
            />

            {showPreview && (
              <GeneratedSkillsPreview
                skills={generatedSkills}
                onEdit={editGeneratedSkill}
                onRemove={removeGeneratedSkill}
                onApply={handleApplyGeneratedSkills}
                onCancel={cancelGeneration}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-4">
        <Button disabled={loading} onClick={() => onSave()}>
          {loading ? <LoaderCircle className="animate-spin" /> : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}

export default Skills;
