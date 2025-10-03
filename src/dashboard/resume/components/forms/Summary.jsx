import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import React, { useContext, useState, useEffect } from 'react';
import LocalDatabase from '../../../../services/LocalDatabase';
import { useParams } from 'react-router-dom';
import { LoaderCircle, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AIChatSession } from '../../../../../service/AIModal';
import { useAIContentEnhancement } from '../../../../hooks/useAIContentEnhancement';
import AIOptionsDialog from '../AIOptionsDialog';
import AIPreviewPanel from '../AIPreviewPanel';

const prompt =
  'Puesto de Trabajo: {jobTitle}. Según el puesto de trabajo, dame una lista de resúmenes profesionales para 3 niveles de experiencia: Senior, Nivel Medio y Junior/Principiante, cada uno de 5-6 líneas. Devuelve la respuesta en formato array JSON con los campos "summary" y "experience_level". Toda la respuesta debe estar en castellano (español).';

function Summary({ enableNext }) {
  const params = useParams();
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [summary, setSummary] = useState(resumeInfo?.summary || '');
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSummeryList, setAiGenerateSummaryList] = useState(null);

  // Hook para mejora de contenido con IA
  const {
    isLoading: isEnhancing,
    showOptions,
    showPreview,
    improvedContent,
    multipleOptions,
    setShowOptions,
    setShowPreview,
    detectMode,
    enhanceSummary,
    applyImprovedContent,
    cancelImprovement,
    regenerateContent,
    selectOption,
  } = useAIContentEnhancement();

  // Actualizar resumeInfo cuando cambie el summary
  useEffect(() => {
    // Actualizar el contexto del resumen
    setResumeInfo((prevResumeInfo) => ({
      ...prevResumeInfo,
      summary,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]); // Solo summary como dependencia para evitar loop infinito

  // Controlar el estado del botón Next y guardar automáticamente
  useEffect(() => {
    const hasValidSummary = summary && summary.trim().length > 0;
    enableNext(hasValidSummary);

    // Guardar automáticamente en la base de datos cuando hay contenido válido
    if (hasValidSummary && params?.resumeId) {
      const autoSaveTimeout = setTimeout(async () => {
        try {
          console.log('💾 Guardando resumen automáticamente...', summary);
          await LocalDatabase.UpdateResumeDetail(params.resumeId, {
            summary,
          });
          console.log('✅ Resumen guardado automáticamente en la BD');
        } catch (error) {
          console.error('❌ Error en guardado automático:', error);
          toast.error('Error al guardar: ' + error.message);
        }
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(autoSaveTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, params?.resumeId]);

  const GenerateSummaryFromAI = async () => {
    setLoading(true);
    try {
      const PROMPT = prompt.replace('jobTitle', resumeInfo?.jobTitle);
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(PROMPT);
      const generatedList = JSON.parse(result.response.text());
      setAiGenerateSummaryList(generatedList);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Detectar modo del botón (generar vs mejorar)
  const contentMode = detectMode(summary);
  const aiButtonText =
    contentMode === 'enhance' ? 'Mejorar con IA' : 'Generar con IA';

  // Handler para clic en el botón de IA
  const handleAIAction = () => {
    if (!resumeInfo?.jobTitle) {
      toast.error('Por favor añade primero el título del puesto');
      return;
    }

    if (contentMode === 'enhance') {
      // Mostrar opciones de mejora
      setShowOptions(true);
    } else {
      // Generar desde cero
      GenerateSummaryFromAI();
    }
  };

  // Handler para selección de opción de mejora
  const handleOptionSelect = async (option) => {
    try {
      await enhanceSummary(summary, resumeInfo.jobTitle, option);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handler para aplicar contenido mejorado
  const handleApplyImproved = () => {
    const newContent = applyImprovedContent();
    setSummary(newContent);
    toast.success('Contenido aplicado correctamente');
  };

  // Handler para regenerar
  const handleRegenerate = async () => {
    try {
      await regenerateContent('summary', summary, resumeInfo.jobTitle);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();

    if (!params?.resumeId) {
      toast.error('ID del CV no válido');
      return;
    }

    setLoading(true);

    try {
      const response = await LocalDatabase.UpdateResumeDetail(params.resumeId, {
        summary,
      });
      console.log('✅ Resumen actualizado:', response);
      enableNext(true);
      toast.success('Resumen actualizado correctamente');
    } catch (error) {
      console.error('❌ Error actualizando resumen:', error);
      toast.error('Error al actualizar resumen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-5 shadow-lg border-t-primary border-t-4 mt-10 rounded-lg">
        <h2 className="font-bold text-lg">Resumen Profesional</h2>
        <p>Añade un resumen para tu puesto de trabajo</p>
        <form className="mt-7" onSubmit={onSave}>
          <div className="flex justify-between items-end">
            <label>Añadir Resumen</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-primary text-primary"
              onClick={handleAIAction}
              disabled={loading || isEnhancing}
            >
              {isEnhancing ? (
                <LoaderCircle className="animate-spin h-4 w-4" />
              ) : (
                <WandSparkles className="h-4 w-4" />
              )}
              {' ' + aiButtonText}
            </Button>
          </div>
          <Textarea
            className="mt-5"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button disabled={loading} type="submit">
              {loading ? <LoaderCircle className="animate-spin" /> : null}
              Guardar
            </Button>
          </div>
        </form>
      </div>

      {aiGeneratedSummeryList && (
        <div className="my-5">
          <h2 className="font-bold text-lg">Sugerencias</h2>
          {aiGeneratedSummeryList?.map((item, index) => (
            <div
              key={index}
              onClick={() => setSummary(item?.summary)}
              className="p-5 shadow-lg my-4 rounded-lg cursor-pointer"
            >
              <h2 className="font-bold my-1 text-primary">
                Nivel: {item?.experience_level}
              </h2>
              <p>{item?.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* Diálogo de opciones de mejora */}
      <AIOptionsDialog
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        onSelect={handleOptionSelect}
        title="¿Cómo quieres mejorar tu resumen?"
        options={[
          {
            id: 'improve',
            icon: '✨',
            label: 'Mejorar mi texto actual',
            description: 'Mantiene tu contenido pero lo hace más profesional',
          },
          {
            id: 'expand',
            icon: '📈',
            label: 'Ampliar y hacer más atractivo',
            description: 'Añade más detalles y contexto profesional',
          },
          {
            id: 'regenerate',
            icon: '🎯',
            label: 'Generar nuevas opciones',
            description: 'Crea versiones completamente nuevas',
          },
        ]}
      />

      {/* Panel de preview */}
      <AIPreviewPanel
        isOpen={showPreview}
        title="✨ Resumen Mejorado"
        content={improvedContent}
        originalContent={summary}
        multipleOptions={multipleOptions}
        onSelectOption={selectOption}
        onApply={handleApplyImproved}
        onRegenerate={handleRegenerate}
        onCancel={() => {
          cancelImprovement();
          setShowPreview(false);
        }}
        isLoading={isEnhancing}
        showComparison={true}
      />
    </div>
  );
}

export default Summary;
