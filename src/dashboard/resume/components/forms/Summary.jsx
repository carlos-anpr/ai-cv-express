import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import React, { useContext, useState, useEffect } from 'react';
import LocalDatabase from '../../../../services/LocalDatabase';
import { useParams } from 'react-router-dom';
import { LoaderCircle, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AIChatSession } from '../../../../../service/AIModal';

const prompt =
  'Puesto de Trabajo: {jobTitle}. Según el puesto de trabajo, dame una lista de resúmenes profesionales para 3 niveles de experiencia: Senior, Nivel Medio y Junior/Principiante, cada uno de 5-6 líneas. Devuelve la respuesta en formato array JSON con los campos "summary" y "experience_level". Toda la respuesta debe estar en castellano (español).';

function Summary({ enableNext }) {
  const params = useParams();
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [summary, setSummary] = useState(resumeInfo?.summary || '');
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSummeryList, setAiGenerateSummaryList] = useState(null);

  // Actualizar resumeInfo y enableNext cuando cambie el summary
  useEffect(() => {
    // Actualizar el contexto del resumen
    setResumeInfo((prevResumeInfo) => ({
      ...prevResumeInfo,
      summary,
    }));

    // Controlar el estado del botón Next
    const hasValidSummary = summary && summary.trim().length > 0;
    enableNext(hasValidSummary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]); // Solo summary como dependencia para evitar loop infinito

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
              onClick={() => GenerateSummaryFromAI()}
            >
              <WandSparkles className="h-4 w-4" /> Generar con IA
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
    </div>
  );
}

export default Summary;
