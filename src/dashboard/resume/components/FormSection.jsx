import React, { useState } from 'react';
import PersonalDetail from './forms/PersonalDetail';
import { ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Summary from './forms/Summary';
import Experience from './forms/Experience';
import Education from './forms/Education';
import Skills from './forms/Skills';

function FormSection() {
  const [activeFormIndex, setActiveFormIndex] = useState(1);
  const [enableNext, setEnableNext] = useState(false);

  const [isFromBack, setIsFromBack] = useState(false);

  const handleBack = () => {
    setActiveFormIndex(activeFormIndex - 1), setIsFromBack(true);
  };

  const handleForward = () => {
    setActiveFormIndex(activeFormIndex + 1), setIsFromBack(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" className="flex gap-2">
          <LayoutGrid />
          Theme
        </Button>
        <div className="flex gap-2">
          {activeFormIndex > 1 && (
            <Button size="sm" onClick={() => handleBack()}>
              <ArrowLeft />
            </Button>
          )}

          <Button
            className="flex gap-2"
            size="sm"
            disabled={!enableNext}
            onClick={() => handleForward()}
          >
            Next <ArrowRight />{' '}
          </Button>
        </div>
      </div>
      {activeFormIndex == 1 ? (
        <PersonalDetail
          enableNext={(v) => setEnableNext(v)}
          isBack={isFromBack}
        />
      ) : null}

      {activeFormIndex == 2 ? (
        <Summary enableNext={(v) => setEnableNext(v)} />
      ) : null}

      {activeFormIndex == 3 ? (
        <Experience enableNext={(v) => setEnableNext(v)} />
      ) : null}

      {activeFormIndex == 4 ? (
        <Education enableNext={(v) => setEnableNext(v)} />
      ) : null}

      {activeFormIndex == 5 ? (
        <Skills enableNext={(v) => setEnableNext(v)} />
      ) : null}
    </div>
  );
}

export default FormSection;
