import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { LoaderCircle } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LocalDatabase from '../../../../services/LocalDatabase';
import { toast } from 'sonner';

function Education() {
  const [loading, setLoading] = useState(false);
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const params = useParams();
  const [educationalList, setEducationalList] = useState([
    {
      universityName: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ]);

  useEffect(() => {
    resumeInfo && setEducationalList(resumeInfo?.education);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleChange = (event, index) => {
    const newEntries = educationalList.slice();
    const { name, value } = event.target;
    newEntries[index][name] = value;
    setEducationalList(newEntries);
  };

  const AddNewEducation = () => {
    setEducationalList([
      ...educationalList,
      {
        universityName: '',
        degree: '',
        major: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ]);
  };
  const RemoveEducation = () => {
    setEducationalList((educationalList) => educationalList.slice(0, -1));
  };
  const onSave = async () => {
    if (!params?.resumeId) {
      toast.error('ID del CV no válido');
      return;
    }

    setLoading(true);

    try {
      // Limpiar IDs temporales antes de guardar
      const cleanEducation =
        educationalList?.map((item) => {
          // eslint-disable-next-line no-unused-vars
          const { id, ...rest } = item;
          return rest;
        }) || [];

      const response = await LocalDatabase.UpdateResumeDetail(params.resumeId, {
        education: cleanEducation,
      });

      console.log('✅ Educación actualizada:', response);
      toast.success('Educación actualizada correctamente');
    } catch (error) {
      console.error('❌ Error actualizando educación:', error);
      toast.error('Error al actualizar educación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setResumeInfo({
      ...resumeInfo,
      education: educationalList,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [educationalList]);
  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Education</h2>
      <p>Add Your educational details</p>

      <div>
        {educationalList?.map((item, index) => (
          <div key={index}>
            <div className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
              <div className="col-span-2">
                <label>University Name</label>
                <Input
                  name="universityName"
                  onChange={(e) => handleChange(e, index)}
                  defaultValue={item?.universityName}
                />
              </div>
              <div>
                <label>Degree</label>
                <Input
                  name="degree"
                  onChange={(e) => handleChange(e, index)}
                  defaultValue={item?.degree}
                />
              </div>
              <div>
                <label>Major</label>
                <Input
                  name="major"
                  onChange={(e) => handleChange(e, index)}
                  defaultValue={item?.major}
                />
              </div>
              <div>
                <label>Start Date</label>
                <Input
                  type="date"
                  name="startDate"
                  onChange={(e) => handleChange(e, index)}
                  defaultValue={item?.startDate}
                />
              </div>
              <div>
                <label>End Date</label>
                <Input
                  type="date"
                  name="endDate"
                  onChange={(e) => handleChange(e, index)}
                  defaultValue={item?.endDate}
                />
              </div>
              <div className="col-span-2">
                <label>Description</label>
                <Textarea
                  name="description"
                  onChange={(e) => handleChange(e, index)}
                  defaultValue={item?.description}
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
            onClick={AddNewEducation}
            className="text-primary"
          >
            {' '}
            + Add More Education
          </Button>
          <Button
            variant="outline"
            onClick={RemoveEducation}
            className="text-primary"
          >
            {' '}
            - Remove
          </Button>
        </div>
        <Button disabled={loading} onClick={() => onSave()}>
          {loading ? <LoaderCircle className="animate-spin" /> : 'Save'}
        </Button>
      </div>
    </div>
  );
}

export default Education;
