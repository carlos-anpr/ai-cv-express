import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import React, { useContext, useState, useEffect } from 'react';
import LocalDatabase from '../../../../services/LocalDatabase';
import { useParams } from 'react-router-dom';
import { LoaderCircle, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AIChatSession } from '../../../../../service/AIModal';
import AIPreviewPanel from '../AIPreviewPanel';

const prompt =
  'Puesto de Trabajo: {jobTitle}. Según el puesto de trabajo, dame una lista de resúmenes profesionales para 3 niveles de experiencia: Senior, Nivel Medio y Junior/Principiante, cada uno de 5-6 líneas. Devuelve la respuesta en formato array JSON con los campos "summary" y "experience_level". Toda la respuesta debe estar en castellano (español).';

function Summary({ enableNext }) {
  const params = useParams();
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [summary, setSummary] = useState(resumeInfo?.summary || '');
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSummeryList, setAiGenerateSummaryList] = useState(null);

  // Estados para preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Actualizar resumeInfo cuando cambie el summary
  useEffect(() => {
    setResumeInfo((prevResumeInfo) => ({
      ...prevResumeInfo,
      summary,
    }));
  }, [summary]);

  // Controlar el estado del botón Next y guardar automáticamente
  useEffect(() => {
    const hasValidSummary = summary && summary.trim().length > 0;
    enableNext(hasValidSummary);

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
      }, 1000);

      return () => clearTimeout(autoSaveTimeout);
    }
  }, [summary, params?.resumeId, enableNext]);

  // Generar desde cero (comportamiento actual)
  const GenerateSummaryFromAI = async () => {
    setLoading(true);
    try {
      const PROMPT = prompt.replace('{jobTitle}', resumeInfo?.jobTitle);
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(PROMPT);
      const generatedList = JSON.parse(result.response.text());
      setAiGenerateSummaryList(generatedList);
      toast.success('✨ Resúmenes generados correctamente');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Error al generar resumen');
    } finally {
      setLoading(false);
    }
  };

  // NUEVA FUNCIÓN: Mejorar resumen existente con preview
  const improveSummaryWithAI = async () => {
    const jobTitle = resumeInfo?.jobTitle;
    const currentSummary = summary;

    // Obtener contexto completo
    const skillsList =
      resumeInfo?.skills?.map((skill) => skill.name).join(', ') || '';

    const experienceContext =
      resumeInfo?.experience
        ?.map((exp) => `${exp.title} en ${exp.companyName}`)
        .join(', ') || '';

    const education = resumeInfo?.education?.[0]
      ? `${resumeInfo.education[0].degree} en ${resumeInfo.education[0].major}`
      : '';

    setLoading(true);

    try {
      const aiPrompt = `Eres un experto en redacción de CVs profesionales.

**CONTEXTO DEL CANDIDATO:**
- Puesto objetivo: "${jobTitle}"
- Educación: ${education || 'No especificada'}
- Habilidades: ${skillsList || 'No especificadas'}
- Experiencia: ${experienceContext || 'No especificada'}

**RESUMEN ACTUAL:**
${currentSummary}

**INSTRUCCIONES CRÍTICAS:**
1. Mejora SOLO el contenido existente del resumen profesional
2. NO inventes experiencia, habilidades o logros que no estén mencionados
3. Hazlo más profesional, conciso e impactante
4. Mantén el tono profesional pero cercano
5. Enfócalo hacia el puesto objetivo "${jobTitle}"
6. Máximo 4-5 líneas (100-120 palabras)
7. Usa verbos de acción y logros cuantificables si están en el texto original
8. NO uses formato JSON

**FORMATO DE RESPUESTA:**
Devuelve SOLO el texto mejorado del resumen profesional, sin explicaciones, sin formato JSON, sin comillas. Solo el texto plano mejorado.`;

      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(aiPrompt);
      let improvedText = result.response.text().trim();

      // LIMPIAR POSIBLE FORMATO JSON
      // Caso 1: Si viene en formato JSON {"summary": "..."}
      if (improvedText.startsWith('{')) {
        try {
          const jsonResponse = JSON.parse(improvedText);
          improvedText =
            jsonResponse.summary ||
            jsonResponse.improved_summary ||
            jsonResponse.content ||
            improvedText;
        } catch {
          // Si falla el parse, intentar extraer con regex
          const match = improvedText.match(
            /"(?:summary|improved_summary|content)"\s*:\s*"([^"]+)"/
          );
          if (match) {
            improvedText = match[1];
          }
        }
      }

      // Caso 2: Si viene con comillas al inicio y final
      improvedText = improvedText.replace(/^["']|["']$/g, '');

      // Caso 3: Limpiar escapes de JSON (\n, \", etc)
      improvedText = improvedText
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");

      // Mostrar preview modal
      setImprovedContent(improvedText);
      setShowPreview(true);
    } catch (error) {
      console.error('Error mejorando resumen:', error);
      toast.error('Error al mejorar el resumen');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar mejora desde modal
  const handleApplyImproved = () => {
    setSummary(improvedContent);
    setShowPreview(false);
    toast.success('✨ Resumen mejorado aplicado correctamente');
  };

  // Regenerar mejora
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setShowPreview(false);
    await improveSummaryWithAI();
    setIsRegenerating(false);
  };

  // Cancelar mejora
  const handleCancelImprovement = () => {
    setShowPreview(false);
    setImprovedContent('');
  };

  // Detectar si hay contenido
  const hasContent = () => {
    if (!summary) return false;
    return summary.trim().length > 0;
  };

  // Handler principal del botón AI
  const handleAIAction = () => {
    if (!resumeInfo?.jobTitle) {
      toast.error('Por favor añade primero el título del puesto');
      return;
    }

    if (hasContent()) {
      // Si hay contenido: MEJORAR con preview
      improveSummaryWithAI();
    } else {
      // Si no hay contenido: GENERAR desde cero
      GenerateSummaryFromAI();
    }
  };

  const buttonText = hasContent() ? 'Mejorar con IA' : 'Generar con IA';

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
              disabled={loading || isRegenerating}
            >
              {loading || isRegenerating ? (
                <LoaderCircle className="animate-spin h-4 w-4" />
              ) : (
                <WandSparkles className="h-4 w-4" />
              )}
              {' ' + buttonText}
            </Button>
          </div>
          <Textarea
            className="mt-5"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={6}
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
              className="p-5 shadow-lg my-4 rounded-lg cursor-pointer hover:border-primary border-2 border-transparent transition-all"
            >
              <h2 className="font-bold my-1 text-primary">
                Nivel: {item?.experience_level}
              </h2>
              <p>{item?.summary}</p>
            </div>
          ))}
        </div>
      )}

      <AIPreviewPanel
        isOpen={showPreview}
        title="✨ Resumen Mejorado"
        content={improvedContent}
        originalContent={summary}
        onApply={handleApplyImproved}
        onRegenerate={handleRegenerate}
        onCancel={handleCancelImprovement}
        isLoading={loading || isRegenerating}
        showComparison={true}
      />
    </div>
  );
}

export default Summary;
