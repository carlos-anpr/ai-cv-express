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
const PROMPT =
  'Título del puesto: {positionTitle}. Según el título del puesto, dame entre 5-7 puntos clave para describir mi experiencia en el currículum (No añadas nivel de experiencia y no uses formato JSON array). Dame el resultado en formato JSON con la estructura { jobTitle: "{positionTitle}", points: ["punto1","punto2",...]}. Toda la respuesta debe estar en castellano (español).';
function RichTextEditor({ onRichTextEditorChange, index, defaultValue }) {
  const [value, setValue] = useState(defaultValue);
  const { resumeInfo } = useContext(ResumeInfoContext);
  const [loading, setLoading] = useState(false);

  const GenerateSummaryFromAI = async () => {
    if (!resumeInfo?.experience[index]?.title) {
      toast('Por favor añade el título del puesto');
      return;
    }
    setLoading(true);
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

    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between my-2">
        <label className="text-xs">Resumen</label>
        <Button
          variant="outline"
          size="sm"
          onClick={GenerateSummaryFromAI}
          disabled={loading}
          className="flex gap-2 border-primary text-primary"
        >
          {loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <>
              <WandSparkles className="h-4 w-4" /> Generar con IA
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
    </div>
  );
}

export default RichTextEditor;
