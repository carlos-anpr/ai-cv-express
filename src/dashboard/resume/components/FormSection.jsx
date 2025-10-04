import React, { useState } from 'react';
import PersonalDetail from './forms/PersonalDetail';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  LayoutGrid,
  Briefcase,
} from 'lucide-react';
import Summery from './forms/Summary';
import Experience from './forms/Experience';
import Education from './forms/Education';
import Skills from './forms/Skills';
import Languages from './forms/Languages';
import { Link, Navigate, useParams } from 'react-router-dom';
import ThemeColor from './ThemeColor';

function FormSection() {
  const [activeFormIndex, setActiveFormIndex] = useState(1);
  const [enableNext, setEnableNext] = useState(true);
  const [languagesSaveHandler, setLanguagesSaveHandler] = useState(null);

  const params = useParams();

  // Wrapper para registrar el handler de guardado
  // Necesario porque setState ejecuta funciones, no las almacena
  const registerLanguagesSaveHandler = (handler) => {
    console.log(
      '📝 Registrando handler de guardado, es función:',
      typeof handler === 'function'
    );
    setLanguagesSaveHandler(() => handler);
  };

  const handleNavigation = async (direction) => {
    console.log(
      '🔄 handleNavigation - direction:',
      direction,
      'activeFormIndex:',
      activeFormIndex
    );
    console.log('🔄 languagesSaveHandler existe:', !!languagesSaveHandler);
    console.log(
      '🔄 languagesSaveHandler es función:',
      typeof languagesSaveHandler === 'function'
    );

    // Si estamos en la sección de idiomas (paso 6) y tenemos el handler de guardado
    if (activeFormIndex === 6 && languagesSaveHandler) {
      console.log('💾 Guardando idiomas antes de navegar...');
      try {
        // Guardar idiomas antes de navegar
        await languagesSaveHandler();
        console.log('✅ Idiomas guardados correctamente antes de navegar');
      } catch (error) {
        console.error('❌ Error guardando idiomas:', error);
        // Continuar con la navegación aunque falle el guardado
      }
    }

    // Navegar al siguiente/anterior paso
    if (direction === 'next') {
      setActiveFormIndex(activeFormIndex + 1);
    } else if (direction === 'prev') {
      setActiveFormIndex(activeFormIndex - 1);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex gap-5">
          <Link to={'/dashboard'}>
            <Button>
              <Home />
            </Button>
          </Link>
          <Link to={`/dashboard/resume/${params.resumeId}/job-applications`}>
            <Button variant="outline">
              <Briefcase className="h-4 w-4 mr-2" />
              Candidaturas
            </Button>
          </Link>
          <ThemeColor />
        </div>
        <div className="flex gap-2">
          {activeFormIndex > 1 && (
            <Button size="sm" onClick={() => handleNavigation('prev')}>
              {' '}
              <ArrowLeft />{' '}
            </Button>
          )}
          <Button
            disabled={!enableNext}
            className="flex gap-2"
            size="sm"
            onClick={() => handleNavigation('next')}
          >
            {' '}
            Next
            <ArrowRight />{' '}
          </Button>
        </div>
      </div>
      {/* Personal Detail  */}
      {activeFormIndex == 1 ? (
        <PersonalDetail enableNext={(v) => setEnableNext(v)} />
      ) : activeFormIndex == 2 ? (
        <Summery enableNext={(v) => setEnableNext(v)} />
      ) : activeFormIndex == 3 ? (
        <Experience />
      ) : activeFormIndex == 4 ? (
        <Education />
      ) : activeFormIndex == 5 ? (
        <Skills />
      ) : activeFormIndex == 6 ? (
        <Languages onSaveHandlerReady={registerLanguagesSaveHandler} />
      ) : activeFormIndex == 7 ? (
        <Navigate to={`/my-resume/${params.resumeId}/view`} />
      ) : null}
    </div>
  );
}

export default FormSection;
