import React, { useEffect, useState } from 'react';
import FormSection from '../../components/FormSection';
import ResumePreview from '../../components/ResumePreview';
import WebPagePreview from '../../components/WebPagePreview';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import LocalDatabase from '../../../../services/LocalDatabase';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Globe } from 'lucide-react';

function EditResume() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [resumeInfo, setResumeInfo] = useState();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('editor');

  // Nota: el tema de la vista web ahora es fijo en el componente WebPagePreview.

  const location = useLocation();

  const GetResumeInfo = React.useCallback(async () => {
    if (!resumeId) {
      toast.error('ID del CV no válido');
      return;
    }

    setLoading(true);
    try {
      const response = await LocalDatabase.GetResumeById(resumeId);

      // Asegurar que experience, education, skills y languages sean arrays
      const processedData = {
        ...response.data,
        experience: Array.isArray(response.data.experience)
          ? response.data.experience
          : typeof response.data.experience === 'string'
          ? JSON.parse(response.data.experience)
          : [],
        education: Array.isArray(response.data.education)
          ? response.data.education
          : typeof response.data.education === 'string'
          ? JSON.parse(response.data.education)
          : [],
        skills: Array.isArray(response.data.skills)
          ? response.data.skills
          : typeof response.data.skills === 'string'
          ? JSON.parse(response.data.skills)
          : [],
        languages: Array.isArray(response.data.languages)
          ? response.data.languages
          : typeof response.data.languages === 'string'
          ? JSON.parse(response.data.languages)
          : [],
      };

      console.log('✅ CV cargado:', processedData);
      setResumeInfo(processedData);

      // ✅ Nota: la configuración de tema web, si existe, se ignora porque
      // la vista web ahora usa un tema fijo dentro del componente preview.
    } catch (error) {
      console.error('❌ Error cargando CV:', error);
      toast.error('Error al cargar el CV: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    // Select tab from query param (e.g. ?tab=webpage)
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'webpage') {
      setCurrentTab('webpage');
    }

    GetResumeInfo();
  }, [GetResumeInfo, location.search]);

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

  // Nota: ya no existe la opción para cambiar tema desde aquí.

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <div className="min-h-screen bg-background">
        {/* Header Profesional Compacto */}
        <div className="sticky top-0 z-50 bg-background/98 backdrop-blur-md border-b shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Back Button + Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="flex-shrink-0 h-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>

                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold truncate leading-tight">
                    {resumeInfo?.title || 'Mi CV'}
                  </h1>
                  <p className="text-xs text-muted-foreground truncate leading-tight">
                    {resumeInfo?.jobTitle || 'Sin puesto especificado'}
                  </p>
                </div>
              </div>

              {/* Right: Tabs + Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Tabs Inline Profesionales */}
                <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg border">
                  <Button
                    variant={currentTab === 'editor' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentTab('editor')}
                    className="h-8 px-3 gap-2 text-xs font-medium transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editor</span>
                  </Button>

                  <Button
                    variant={currentTab === 'webpage' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentTab('webpage')}
                    className="h-8 px-3 gap-2 text-xs font-medium transition-all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Web</span>
                  </Button>
                </div>

                {/* PDF View Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/my-resume/${resumeId}/view`)}
                  className="h-8 px-3 gap-2 hidden md:flex"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-xs">PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content SIN Tabs Repetidas */}
        <div className="container mx-auto px-4 py-4">
          {currentTab === 'editor' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <FormSection />
              </div>
              <div className="sticky top-20 h-fit">
                <ResumePreview />
              </div>
            </div>
          ) : (
            <WebPagePreview resumeInfo={resumeInfo} />
          )}
        </div>
      </div>
    </ResumeInfoContext.Provider>
  );
}

export default EditResume;
