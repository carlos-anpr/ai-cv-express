import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useContext, useEffect, useState } from 'react';
import RichTextEditor from '../RichTextEditor';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { useParams } from 'react-router-dom';
import LocalDatabase from '../../../../services/LocalDatabase';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';

// const formField = {
//   title: '',
//   companyName: '',
//   city: '',
//   state: '',
//   startDate: '',
//   endDate: '',
//   workSummary: '',
// };
function Experience() {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [experinceList, setExperinceList] = useState(
    resumeInfo?.experience ?? []
  );

  const params = useParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resumeInfo?.experience?.length > 0 &&
      setExperinceList(resumeInfo?.experience);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index, event) => {
    const newEntries = experinceList.slice();
    const { name, value } = event.target;
    newEntries[index][name] = value;
    setExperinceList(newEntries);
  };

  const AddNewExperience = () => {
    setExperinceList([
      ...experinceList,
      {
        title: '',
        companyName: '',
        city: '',
        state: '',
        startDate: '',
        endDate: '',
        workSummary: '',
      },
    ]);
  };

  const RemoveExperience = () => {
    setExperinceList((experinceList) => experinceList.slice(0, -1));
  };

  const handleRichTextEditor = (e, name, index) => {
    const newEntries = experinceList.slice();
    newEntries[index][name] = e.target.value;

    setExperinceList(newEntries);
  };

  useEffect(() => {
    setResumeInfo({
      ...resumeInfo,
      experience: experinceList,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experinceList]);

  const onSave = async () => {
    if (!params?.resumeId) {
      toast.error('ID del CV no válido');
      return;
    }

    setLoading(true);

    try {
      // Limpiar IDs temporales antes de guardar
      const cleanExperience =
        experinceList?.map((item) => {
          // eslint-disable-next-line no-unused-vars
          const { id, ...rest } = item;
          return rest;
        }) || [];

      await LocalDatabase.UpdateResumeDetail(params.resumeId, {
        experience: cleanExperience,
      });
      toast.success('Experiencia actualizada correctamente');
    } catch (error) {
      console.error('❌ Error actualizando experiencia:', error);
      toast.error('Error al actualizar experiencia: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
        <h2 className="font-bold text-lg">Experiencia Profesional</h2>
        <p>Añade tu experiencia laboral anterior</p>
        <div>
          {experinceList?.map((item, index) => (
            <div key={index}>
              <div className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
                <div>
                  <label className="text-xs">Puesto</label>
                  <Input
                    name="title"
                    onChange={(event) => handleChange(index, event)}
                    defaultValue={item?.title}
                  />
                </div>
                <div>
                  <label className="text-xs">Empresa</label>
                  <Input
                    name="companyName"
                    onChange={(event) => handleChange(index, event)}
                    defaultValue={item?.companyName}
                  />
                </div>
                <div>
                  <label className="text-xs">Ciudad</label>
                  <Input
                    name="city"
                    onChange={(event) => handleChange(index, event)}
                    defaultValue={item?.city}
                  />
                </div>
                <div>
                  <label className="text-xs">Provincia/Estado</label>
                  <Input
                    name="state"
                    onChange={(event) => handleChange(index, event)}
                    defaultValue={item?.state}
                  />
                </div>
                <div>
                  <label className="text-xs">Fecha de Inicio</label>
                  <Input
                    type="date"
                    name="startDate"
                    onChange={(event) => handleChange(index, event)}
                    defaultValue={item?.startDate}
                  />
                </div>
                <div>
                  <label className="text-xs">Fecha de Fin</label>
                  <Input
                    type="date"
                    name="endDate"
                    onChange={(event) => handleChange(index, event)}
                    defaultValue={item?.endDate}
                  />
                </div>
                <div className="col-span-2">
                  {/* Work Summery  */}
                  <RichTextEditor
                    index={index}
                    defaultValue={item?.workSummary}
                    onRichTextEditorChange={(event) =>
                      handleRichTextEditor(event, 'workSummary', index)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={AddNewExperience}
              className="text-primary"
            >
              {' '}
              + Añadir Más Experiencia
            </Button>
            <Button
              variant="outline"
              onClick={RemoveExperience}
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
    </div>
  );
}

export default Experience;
