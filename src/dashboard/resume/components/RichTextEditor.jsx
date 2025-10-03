import { Button } from '@/components/ui/button';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { LoaderCircle, WandSparkles } from 'lucide-react';
import React, { useContext, useState } from 'react';
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  Editor,
  EditorProvider,
  HtmlButton,
  Separator,
  Toolbar,
} from 'react-simple-wysiwyg';
import { AIChatSession } from './../../../../service/AIModal';
import { toast } from 'sonner';
import { useAIContentEnhancement } from '../../../hooks/useAIContentEnhancement';
import AIOptionsDialog from './AIOptionsDialog';
import AIPreviewPanel from './AIPreviewPanel';
const PROMPT =
  'Título del puesto: {positionTitle}. Según el título del puesto, dame entre 5-7 puntos clave para describir mi experiencia en el currículum (No añadas nivel de experiencia y no uses formato JSON array). Dame el resultado en formato JSON con la estructura { jobTitle: "{positionTitle}", points: ["punto1","punto2",...]}. Toda la respuesta debe estar en castellano (español).';
function RichTextEditor({ onRichTextEditorChange, index, defaultValue }) {
  const [value, setValue] = useState(defaultValue);
  const { resumeInfo } = useContext(ResumeInfoContext);
  const [loading, setLoading] = useState(false);

  // Hook para mejora de contenido con IA
  const {
    isLoading: isEnhancing,
    showOptions,
    showPreview,
    improvedContent,
    setShowOptions,
    setShowPreview,
    detectMode,
    enhanceExperience,
    applyImprovedContent,
    cancelImprovement,
    regenerateContent,
  } = useAIContentEnhancement();

  // Función para generar desde cero (comportamiento original)
  const generateFromScratch = async () => {
    if (!resumeInfo?.experience[index]?.title) {
      toast('Por favor añade el título del puesto');
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
      console.log(JSON.parse(result.response.text()).points);
      const resp = JSON.parse(result.response?.text());

      const listaItems = resp?.points
        .map((elemento) => `<li>${elemento}</li>`)
        .join('');
      const listaHTML = `<ul>${listaItems}</ul>`;

      setValue(listaHTML);
      onRichTextEditorChange({ target: { value: listaHTML } });
    } catch (error) {
      console.error('Error generating:', error);
      toast.error('Error al generar contenido');
    } finally {
      setLoading(false);
    }
  };

  // Detectar modo del botón (generar vs mejorar)
  const contentMode = detectMode(value);
  const aiButtonText =
    contentMode === 'enhance' ? 'Mejorar con IA' : 'Generar con IA';

  // Handler para clic en el botón de IA
  const handleAIAction = async () => {
    if (!resumeInfo?.experience[index]?.title) {
      toast('Por favor añade el título del puesto');
      return;
    }

    if (contentMode === 'enhance') {
      // Mostrar opciones de mejora
      setShowOptions(true);
    } else {
      // Generar desde cero (comportamiento actual)
      await generateFromScratch();
    }
  };

  // Handler para selección de opción de mejora
  const handleOptionSelect = async (option) => {
    const jobTitle = resumeInfo.experience[index].title;
    const companyName =
      resumeInfo.experience[index].companyName || 'la empresa';

    try {
      await enhanceExperience(value, jobTitle, companyName, option);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handler para aplicar contenido mejorado
  const handleApplyImproved = () => {
    const newContent = applyImprovedContent();
    setValue(newContent);
    onRichTextEditorChange({ target: { value: newContent } });
    toast.success('Contenido mejorado aplicado');
  };

  // Handler para regenerar
  const handleRegenerate = async () => {
    const jobTitle = resumeInfo.experience[index].title;
    const companyName =
      resumeInfo.experience[index].companyName || 'la empresa';

    try {
      await regenerateContent('experience', value, jobTitle, companyName);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between my-2">
        <label className="text-xs">Resumen</label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAIAction}
          disabled={loading || isEnhancing}
          className="flex gap-2 border-primary text-primary"
        >
          {loading || isEnhancing ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <>
              <WandSparkles className="h-4 w-4" /> {aiButtonText}
            </>
          )}
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

      {/* Diálogo de opciones de mejora */}
      <AIOptionsDialog
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        onSelect={handleOptionSelect}
        title="¿Cómo quieres mejorar tu experiencia?"
        options={[
          {
            id: 'improve',
            icon: '✨',
            label: 'Mejorar puntos actuales',
            description: 'Hace tu descripción más profesional',
          },
          {
            id: 'expand',
            icon: '📈',
            label: 'Ampliar con más detalles',
            description: 'Añade contexto y métricas sugeridas',
          },
          {
            id: 'reorganize',
            icon: '🔄',
            label: 'Reorganizar profesionalmente',
            description: 'Ordena por impacto y relevancia',
          },
        ]}
      />

      {/* Panel de preview */}
      <AIPreviewPanel
        isOpen={showPreview}
        title="✨ Experiencia Mejorada"
        content={improvedContent}
        originalContent={value}
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

export default RichTextEditor;
