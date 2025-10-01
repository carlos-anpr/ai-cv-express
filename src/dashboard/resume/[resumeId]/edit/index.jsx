import React, { useEffect, useState } from 'react';
import FormSection from '../../components/FormSection';
import ResumePreview from '../../components/ResumePreview';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import LocalDatabase from '../../../../services/LocalDatabase';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

function EditResume() {
  const { resumeId } = useParams();
  const [resumeInfo, setResumeInfo] = useState();
  const [loading, setLoading] = useState(false);

  const GetResumeInfo = React.useCallback(async () => {
    if (!resumeId) {
      toast.error('ID del CV no válido');
      return;
    }

    setLoading(true);
    try {
      const response = await LocalDatabase.GetResumeById(resumeId);
      console.log('✅ CV cargado:', response.data);
      setResumeInfo(response.data);
    } catch (error) {
      console.error('❌ Error cargando CV:', error);
      toast.error('Error al cargar el CV: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    GetResumeInfo();
  }, [GetResumeInfo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando CV...</p>
        </div>
      </div>
    );
  }

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <div className="grid grid-cols-1 md:grid-cols-2 p-10 gap-10">
        <FormSection />
        <ResumePreview />
      </div>
    </ResumeInfoContext.Provider>
  );
}

export default EditResume;
