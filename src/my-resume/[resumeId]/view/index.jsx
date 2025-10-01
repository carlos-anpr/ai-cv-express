import Header from '@/components/custom/Header';
import { Button } from '@/components/ui/button';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import ResumePreview from '@/dashboard/resume/components/ResumePreview';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LocalDatabase from '../../../services/LocalDatabase';
import { toast } from 'sonner';

function ResumeView() {
  const [resumeInfo, setResumeinfo] = useState();
  const [loading, setLoading] = useState(false);
  const { resumeId } = useParams();

  useEffect(() => {
    const getResumeInfo = async () => {
      if (!resumeId) {
        toast.error('ID del CV no válido');
        return;
      }

      setLoading(true);
      try {
        const response = await LocalDatabase.GetResumeById(resumeId);
        console.log('✅ CV cargado para vista previa:', response.data);
        setResumeinfo(response.data);
      } catch (error) {
        console.error('❌ Error cargando CV:', error);
        toast.error('Error al cargar el CV: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    getResumeInfo();
  }, [resumeId]);

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando vista previa...</p>
        </div>
      </div>
    );
  }

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeinfo }}>
      <div id="no-print">
        <Header />
        <div className="mt-10 mx-10 md:mx-20 lg:mx-36">
          <h2 className="text-center text-2xl font-medium">
            ¡Felicidades! Tu CV generado con IA está listo!
            <p className="text-center text-gray-400">
              Ahora puedes descargar tu CV y compartir la URL con amigos y
              familia
            </p>
          </h2>
          <div className="flex justify-between px-44 my-10">
            <Button onClick={handleDownload}>Descargar</Button>
            <Button>Compartir</Button>
          </div>
        </div>
      </div>
      <div className="my-10 mx-10 md:mx-20 lg:mx-80">
        <div id="print-area">
          <ResumePreview />
        </div>
      </div>
    </ResumeInfoContext.Provider>
  );
}

export default ResumeView;
