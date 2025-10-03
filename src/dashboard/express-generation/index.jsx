import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Stepper from '@/components/ui/stepper';
import { X, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Steps
import Step1Profile from './components/Step1Profile';
import Step2JobOffer from './components/Step2JobOffer';
import Step3Generation from './components/Step3Generation';
import Step4Results from './components/Step4Results';

// Hook
import useExpressGeneration from './hooks/useExpressGeneration';

/**
 * ExpressGeneration Container
 *
 * Componente principal que orquesta el flujo completo de Generación Express
 */

const ExpressGeneration = () => {
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = React.useState(false);

  const {
    currentStep,
    stepData,
    isTransitioning,
    handleStep1Complete,
    handleStep2Complete,
    handleStep3Complete,
    handleStep3Error,
    goToPreviousStep,
    resetWizard,
  } = useExpressGeneration();

  // Definición de steps para el Stepper
  const steps = [
    { id: 'profile', label: 'Tu Perfil' },
    { id: 'job-offer', label: 'Oferta' },
    { id: 'generation', label: 'Generación' },
    { id: 'results', label: 'Resultados' },
  ];

  // Handler para cerrar/volver
  const handleExit = () => {
    // Si está en step 1, salir directamente
    if (currentStep === 1 && !stepData.step1) {
      navigate('/dashboard');
      return;
    }

    // Si hay datos, mostrar confirmación
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    navigate('/dashboard');
  };

  const handleStartOver = () => {
    resetWizard();
  };

  // Renderizar step actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Profile
            onNext={handleStep1Complete}
            initialData={stepData.step1}
          />
        );

      case 2:
        return (
          <Step2JobOffer
            onNext={handleStep2Complete}
            onBack={goToPreviousStep}
            initialData={stepData.step2}
          />
        );

      case 3:
        return (
          <Step3Generation
            profileData={stepData.step1}
            jobOfferData={stepData.step2}
            onComplete={handleStep3Complete}
            onBack={goToPreviousStep}
            onError={handleStep3Error}
          />
        );

      case 4:
        return (
          <Step4Results
            generatedData={stepData.step4}
            onStartOver={handleStartOver}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back button (solo en step 1) */}
            {currentStep === 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExit}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Dashboard
              </Button>
            )}

            {/* Title */}
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                <span className="text-2xl">⚡</span>
                Generación Express
              </h1>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Stepper */}
          <div className="mt-6">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-7xl mx-auto">
          <div className="p-6 md:p-8 lg:p-12">
            {/* Render current step with transition */}
            <div
              className={`transition-opacity duration-150 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {renderCurrentStep()}
            </div>
          </div>
        </Card>
      </main>

      {/* Footer Info */}
      {currentStep < 4 && (
        <footer className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            💡 Puedes cerrar esta ventana en cualquier momento. Tu progreso se
            guardará automáticamente.
          </p>
        </footer>
      )}

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir de Generación Express?</AlertDialogTitle>
            <AlertDialogDescription>
              {currentStep < 4
                ? 'Tu progreso se perderá si sales ahora. ¿Estás seguro de que quieres continuar?'
                : 'Si sales ahora, el CV no se guardará. ¿Estás seguro?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>
              Sí, Salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpressGeneration;
