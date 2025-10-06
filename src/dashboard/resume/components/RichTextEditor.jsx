import { Button } from '@/components/ui/button';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { LoaderCircle, WandSparkles } from 'lucide-react';
import React, { useContext, useState } from 'react';
import {
  BtnBold,
  BtnBulletList,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnUnderline,
  Editor,
  EditorProvider,
  Separator,
  Toolbar,
} from 'react-simple-wysiwyg';
import { AIChatSession } from './../../../../service/AIModal';
import { toast } from 'sonner';
import AIPreviewPanel from './AIPreviewPanel';

const PROMPT =
  'Título del puesto: {positionTitle}. Según el título del puesto, dame entre 5-7 puntos clave para describir mi experiencia en el currículum (No añadas nivel de experiencia y no uses formato JSON array). Dame el resultado en formato JSON con la estructura { jobTitle: "{positionTitle}", points: ["punto1","punto2",...]}. Toda la respuesta debe estar en castellano (español).';

function RichTextEditor({ onRichTextEditorChange, index, defaultValue }) {
  const [value, setValue] = useState(defaultValue || '');
  const { resumeInfo } = useContext(ResumeInfoContext);
  const [loading, setLoading] = useState(false);

  // Estados para preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Función para generar desde cero
  const generateFromScratch = async () => {
    if (!resumeInfo?.experience[index]?.title) {
      toast.error('Por favor añade el título del puesto primero');
      return;
    }
    setLoading(true);
    try {
      const prompt = PROMPT.replace(
        '{positionTitle}',
        resumeInfo.experience[index].title
      );

      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const resp = JSON.parse(result.response?.text());

      const listaItems = resp?.points
        ?.map((elemento) => `<li>${elemento}</li>`)
        .join('');
      const listaHTML = `<ul>${listaItems}</ul>`;

      setValue(listaHTML);
      onRichTextEditorChange({ target: { value: listaHTML } });
      toast.success('✨ Contenido generado correctamente');
    } catch (error) {
      console.error('Error generando:', error);
      toast.error('Error al generar contenido');
    } finally {
      setLoading(false);
    }
  };

  // Función MEJORAR con CONTEXTO COMPLETO y PREVIEW MODAL
  const improveExistingContent = async () => {
    const currentExperience = resumeInfo?.experience?.[index];
    if (!currentExperience) {
      toast.error('No se encontró la experiencia');
      return;
    }

    const jobTitle = currentExperience.title;
    const companyName = currentExperience.companyName || '';
    const currentContent = value;
    const mainJobTitle = resumeInfo?.jobTitle || jobTitle;

    // Obtener TODO el contexto previo del CV
    const allExperiences = resumeInfo?.experience || [];
    const previousExperiences = allExperiences
      .filter((_, idx) => idx !== index)
      .map((exp) => `- ${exp.title} en ${exp.companyName || 'empresa'}`)
      .join('\n');

    const skillsList =
      resumeInfo?.skills?.map((skill) => skill.name).join(', ') ||
      'habilidades técnicas';

    const education = resumeInfo?.education?.[0]
      ? `${resumeInfo.education[0].degree} en ${resumeInfo.education[0].major}`
      : '';

    setLoading(true);

    try {
      const prompt = `Eres un experto en redacción de CVs profesionales y reclutamiento.

**CONTEXTO DEL CANDIDATO:**
- Puesto objetivo principal: "${mainJobTitle}"
- Educación: ${education || 'No especificada'}
- Habilidades clave: ${skillsList}
${previousExperiences ? `- Otras experiencias:\n${previousExperiences}` : ''}

**EXPERIENCIA A MEJORAR:**
- Puesto: "${jobTitle}"
- Empresa: "${companyName}"

**DESCRIPCIÓN ACTUAL:**
${currentContent}

**INSTRUCCIONES CRÍTICAS:**
1. Mejora SOLO el contenido existente, NO inventes información falsa
2. NO añadas tecnologías, proyectos o logros que no estén mencionados
3. Mejora la redacción para que sea más profesional e impactante
4. Adapta la descripción para que sea relevante al puesto objetivo "${mainJobTitle}"
5. Usa verbos de acción potentes (desarrollé, lideré, implementé, optimicé, etc.)
6. Cuantifica cuando sea posible basándote en lo que YA está escrito
7. Mantén el formato HTML <ul><li>...</li></ul>
8. Máximo 5-7 puntos concisos

**FORMATO DE RESPUESTA:**
Devuelve SOLO el HTML mejorado con estructura <ul><li>...</li></ul>, sin explicaciones.

IMPORTANTE: NO inventes datos. Si el contenido actual es vago, mejora la redacción pero mantén la misma información.`;

      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      let improvedHTML = result.response.text().trim();

      // Limpiar posibles wrappings JSON
      if (improvedHTML.startsWith('{') || improvedHTML.startsWith('[')) {
        try {
          const jsonResp = JSON.parse(improvedHTML);
          improvedHTML =
            jsonResp.html ||
            jsonResp.content ||
            jsonResp.points?.map((p) => `<li>${p}</li>`).join('') ||
            improvedHTML;
          if (!improvedHTML.includes('<ul>')) {
            improvedHTML = `<ul>${improvedHTML}</ul>`;
          }
        } catch {
          // Si falla el parse, usar como está
        }
      }

      // Mostrar preview modal
      setImprovedContent(improvedHTML);
      setShowPreview(true);
    } catch (error) {
      console.error('Error mejorando contenido:', error);
      toast.error('Error al mejorar el contenido');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar mejora desde modal
  const handleApplyImproved = () => {
    setValue(improvedContent);
    onRichTextEditorChange({ target: { value: improvedContent } });
    setShowPreview(false);
    toast.success('✨ Mejora aplicada correctamente');
  };

  // Regenerar mejora
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setShowPreview(false);
    await improveExistingContent();
    setIsRegenerating(false);
  };

  // Cancelar mejora
  const handleCancelImprovement = () => {
    setShowPreview(false);
    setImprovedContent('');
  };

  // Detectar si hay contenido
  const hasContent = () => {
    if (!value) return false;
    const textContent = value.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 0;
  };

  // Handler principal del botón AI
  const handleAIAction = async () => {
    if (!resumeInfo?.experience?.[index]?.title) {
      toast.error('Por favor añade el título del puesto primero');
      return;
    }

    if (hasContent()) {
      // Si hay contenido: MEJORAR con preview
      await improveExistingContent();
    } else {
      // Si no hay contenido: GENERAR desde cero
      await generateFromScratch();
    }
  };

  const buttonText = hasContent() ? 'Mejorar con IA' : 'Generar con IA';

  return (
    <div>
      <div className="flex justify-between my-2">
        <label className="text-xs">Resumen</label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAIAction}
          disabled={loading || isRegenerating}
          className="flex gap-2 border-primary text-primary"
        >
          {loading || isRegenerating ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <WandSparkles className="h-4 w-4" />
          )}
          {buttonText}
        </Button>
      </div>

      <EditorProvider>
        <Editor
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onRichTextEditorChange(e);
          }}
        >
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>

      {/* MODAL DE PREVIEW */}
      <AIPreviewPanel
        isOpen={showPreview}
        title="✨ Descripción Mejorada"
        content={improvedContent}
        originalContent={value}
        onApply={handleApplyImproved}
        onRegenerate={handleRegenerate}
        onCancel={handleCancelImprovement}
        isLoading={loading || isRegenerating}
        showComparison={true}
      />
    </div>
  );
}

export default RichTextEditor;
