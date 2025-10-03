import { Input } from '@/components/ui/input';
import React, { useContext, useEffect, useState } from 'react';
import { Rating } from '@smastrom/react-rating';

import '@smastrom/react-rating/style.css';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import LocalDatabase from '../../../../services/LocalDatabase';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
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
  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Habilidades</h2>
      <p>Añade tus principales habilidades profesionales</p>

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
                onChange={(e) => handleChange(index, 'name', e.target.value)}
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
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={AddNewSkills}
            className="text-primary"
          >
            {' '}
            + Añadir Más Habilidad
          </Button>
          <Button
            variant="outline"
            onClick={RemoveSkills}
            className="text-primary"
          >
            {' '}
            - Eliminar
          </Button>
        </div>
        <Button disabled={loading} onClick={() => onSave()}>
          {loading ? <LoaderCircle className="animate-spin" /> : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}

export default Skills;
