import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Wand2, X } from 'lucide-react';
import { toast } from 'sonner';
import LocalDatabase from '../../../services/LocalDatabase';
import { useUser } from '@clerk/clerk-react';
import { AIChatSessionText } from '../../../../service/AIModal';

// Prompt para generar cartas de presentación
const COVER_LETTER_PROMPT = `
Actúa como un experto redactor de cartas de presentación profesionales. 

Basándote en la siguiente información del candidato y el puesto solicitado, crea una carta de presentación persuasiva y personalizada:

INFORMACIÓN DEL CANDIDATO:
- Nombre: {candidateName}
- Puesto Actual/Objetivo: {currentJobTitle}
- Resumen Profesional: {summary}
- Experiencia: {experience}
- Educación: {education}
- Habilidades: {skills}

INFORMACIÓN DEL PUESTO:
- Empresa: {companyName}
- Puesto Solicitado: {jobTitle}

INSTRUCCIONES:
1. Crea una carta de presentación en primera persona dirigida al departamento de recursos humanos
2. El candidato se presenta a sí mismo para el puesto específico
3. Usa un tono profesional pero cercano y personal
4. Incluye ejemplos específicos de la experiencia del candidato
5. La carta debe tener entre 300-500 palabras
6. Estructura: Saludo, introducción personal, cuerpo (2-3 párrafos), cierre con disponibilidad

FORMATO REQUERIDO:
Devuelve solo el contenido de la carta, sin encabezados adicionales ni metadatos.
`;

function CoverLetterForm({ resumeId, resumeInfo, editingLetter, onClose }) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobDetails: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (editingLetter) {
      setFormData({
        companyName: editingLetter.companyName || '',
        jobTitle: editingLetter.jobTitle || '',
        jobDetails: editingLetter.jobDetails || '',
        content: editingLetter.content || '',
      });
    }
  }, [editingLetter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para generar carta template cuando no hay API
  const generateTemplateCoverLetter = () => {
    const candidateName =
      `${resumeInfo?.firstName || ''} ${resumeInfo?.lastName || ''}`.trim() ||
      'mi nombre';
    const experience =
      Array.isArray(resumeInfo?.experience) && resumeInfo.experience.length > 0
        ? resumeInfo.experience[0] // Tomar la primera experiencia
        : null;

    const skills =
      Array.isArray(resumeInfo?.skills) && resumeInfo.skills.length > 0
        ? resumeInfo.skills
            .slice(0, 3)
            .map((skill) => skill.name)
            .join(', ')
        : 'tecnologías relevantes';

    const templateContent = `Estimado equipo de Recursos Humanos de ${
      formData.companyName
    },

Mi nombre es ${candidateName} y me dirijo a ustedes para expresar mi interés en el puesto de ${
      formData.jobTitle
    } en su empresa.

${
  resumeInfo?.summary ||
  'Soy un profesional comprometido con experiencia en desarrollo de software y tecnología.'
} Me siento especialmente atraído por esta oportunidad porque considero que mis habilidades y experiencia se alinean bien con lo que buscan.

${
  experience
    ? `Durante mi experiencia como ${experience.title} en ${
        experience.companyName
      }, he desarrollado habilidades sólidas en ${skills}, trabajando en proyectos que han fortalecido mi capacidad técnica y profesional. Esta experiencia me ha permitido entender la importancia de ${
        experience.workSummery ||
        'la colaboración en equipo y la entrega de resultados de calidad'
      }.`
    : `He desarrollado experiencia práctica con ${skills}, tecnologías que considero fundamentales para desempeñarme efectivamente en el puesto de ${formData.jobTitle}.`
}

Entre mis principales fortalezas destacan:
• Capacidad de resolución de problemas y análisis
• Orientación a resultados y atención al detalle
• Buenas habilidades de comunicación
• Facilidad para trabajar en equipo
• Disposición para aprender y adaptarme a nuevos desafíos

Estoy muy interesado en formar parte de su equipo y contribuir al crecimiento de ${
      formData.companyName
    }. Creo que mi experiencia y actitud positiva pueden aportar valor a la posición.

Quedo a su disposición para ampliar cualquier información sobre mi perfil profesional.

Atentamente,
${candidateName}`;

    return templateContent;
  };

  const generateAICoverLetter = async () => {
    if (!formData.companyName || !formData.jobTitle) {
      toast.error(
        'Por favor completa el nombre de la empresa y el puesto antes de generar la carta'
      );
      return;
    }

    setAiLoading(true);

    try {
      // Preparar datos del candidato
      const candidateName = `${resumeInfo?.firstName || ''} ${
        resumeInfo?.lastName || ''
      }`.trim();

      const latestExperience =
        Array.isArray(resumeInfo?.experience) &&
        resumeInfo.experience.length > 0
          ? resumeInfo.experience[0]
          : null;

      const skills =
        Array.isArray(resumeInfo?.skills) && resumeInfo.skills.length > 0
          ? resumeInfo.skills.map((skill) => skill.name).join(', ')
          : '';

      const education =
        Array.isArray(resumeInfo?.education) && resumeInfo.education.length > 0
          ? resumeInfo.education[0]
          : null;

      const prompt = `Escribe una carta de presentación profesional en primera persona en español con tono humano y honesto. El candidato se presenta a sí mismo. Devuelve ÚNICAMENTE el texto de la carta, sin formato JSON, sin comentarios adicionales.

INFORMACIÓN DEL CANDIDATO Y PUESTO:
- Mi nombre: ${candidateName || 'el candidato'}
- Empresa a la que me postulo: ${formData.companyName}
- Puesto que solicito: ${formData.jobTitle}

REQUISITOS Y TECNOLOGÍAS QUE BUSCAN:
${
  formData.jobDetails ||
  'Puesto de desarrollo de software con requisitos técnicos específicos'
}

MI PERFIL PROFESIONAL:
- Mi experiencia laboral: ${
        latestExperience
          ? `${latestExperience.title} en ${
              latestExperience.companyName
            } durante ${latestExperience.startDate} - ${
              latestExperience.endDate || 'presente'
            }. Mis responsabilidades incluyeron: ${
              latestExperience.workSummery ||
              'desarrollo y mantenimiento de aplicaciones'
            }`
          : 'experiencia en desarrollo de software'
      }
- Tecnologías que manejo: ${skills || 'tecnologías de desarrollo modernas'}
- Mi formación: ${
        education
          ? `${education.degree} en ${education.universityName}`
          : 'formación técnica relevante'
      }
- Sobre mí: ${
        resumeInfo?.summary ||
        'profesional con experiencia en desarrollo de software'
      }

ANÁLISIS REQUERIDO PARA MI PRESENTACIÓN:
1. Compara las tecnologías que REALMENTE manejo con las que piden
2. Para tecnologías que SÍ manejo: menciona mi experiencia práctica en primera persona
3. Para tecnologías que NO manejo pero son similares: habla de mi capacidad de transferir conocimiento
4. Para tecnologías completamente nuevas: menciona mi capacidad de aprendizaje sin exagerar

INSTRUCCIONES PARA UN TONO HUMANO Y REALISTA EN PRIMERA PERSONA:
- Comienza con "Estimado equipo de Recursos Humanos de ${formData.companyName},"
- Presenta mi nombre: "Mi nombre es ${
        candidateName || '[nombre]'
      } y me dirijo a ustedes..."
- Sé honesto sobre mis habilidades: si tengo experiencia sólida en algo, menciónalo con confianza
- Si NO tengo experiencia directa en algún requisito, habla de mi capacidad de adaptación y aprendizaje
- Usa frases como "tengo experiencia práctica en...", "he trabajado con...", "estoy familiarizado con...", "he demostrado capacidad para aprender..."
- Evita palabras como "excepcional", "extraordinario", "dominio completo", "experto absoluto"
- Usa un lenguaje personal y cercano: "considero que puedo", "en mi experiencia", "he observado que"
- Menciona tanto mis fortalezas como áreas donde puedo crecer
- Si hay tecnologías que no domino pero son similares a las que conozco, menciónalo: "aunque no he trabajado directamente con X, mi experiencia con Y me dará una base sólida"
- Sé específico pero modesto: "durante los 2 años que trabajé en...", "en los proyectos que desarrollé..."
- Incluye una pequeña limitación honesta que no sea crítica: "aunque siempre estoy dispuesto a seguir aprendiendo" o "con ganas de seguir creciendo en..."
- Termina con disponibilidad y interés genuine pero sin exagerar
- Extensión: 300-450 palabras
- Tono: profesional pero humano, honesto y equilibrado, en primera persona

EJEMPLOS DE FRASES HUMANAS EN PRIMERA PERSONA EN LUGAR DE "IA":
❌ Evitar: "Domino completamente", "Soy un experto absoluto", "Tengo conocimiento excepcional"
✅ Usar: "Tengo buena experiencia con", "He trabajado efectivamente con", "Estoy familiarizado con"

❌ Evitar: "Superaré todas las expectativas", "Soy el candidato perfecto"
✅ Usar: "Creo que puedo ser una buena adición al equipo", "Considero que puedo encajar bien"

❌ Evitar: "Domino absolutamente todas las tecnologías requeridas"
✅ Usar: "Manejo bien las tecnologías principales y tengo capacidad para adaptarme a las nuevas"

Escribe la carta completa de presentación en primera persona ahora, siendo honesto sobre lo que realmente sé y lo que puedo aprender:`;

      console.log('=== PROMPT GENERADO ===');
      console.log(prompt);
      console.log('=== FIN PROMPT ===');

      const result = await AIChatSessionText.sendMessage(prompt);
      const generatedContent = result.response.text();

      if (generatedContent && generatedContent.trim()) {
        setFormData((prev) => ({ ...prev, content: generatedContent.trim() }));
        toast.success('¡Carta de presentación generada exitosamente con IA!');
      } else {
        throw new Error('Respuesta vacía de la IA');
      }
    } catch (error) {
      console.error('Error generando carta con IA:', error);

      // Si falla la IA, usar template como fallback
      const templateContent = generateTemplateCoverLetter();
      setFormData((prev) => ({
        ...prev,
        content: templateContent,
      }));

      toast.error(
        'Error con la IA. Se generó una carta base que puedes personalizar.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (
      !formData.companyName.trim() ||
      !formData.jobTitle.trim() ||
      !formData.content.trim()
    ) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const coverLetterData = {
        resumeId,
        userEmail: user.primaryEmailAddress.emailAddress,
        companyName: formData.companyName.trim(),
        jobTitle: formData.jobTitle.trim(),
        jobDetails: formData.jobDetails.trim(),
        content: formData.content.trim(),
      };

      if (editingLetter) {
        await LocalDatabase.UpdateCoverLetter(editingLetter.id, {
          companyName: coverLetterData.companyName,
          jobTitle: coverLetterData.jobTitle,
          jobDetails: coverLetterData.jobDetails,
          content: coverLetterData.content,
        });
        toast.success('Carta actualizada correctamente');
      } else {
        await LocalDatabase.CreateCoverLetter(coverLetterData);
        toast.success('Carta creada correctamente');
      }

      onClose();
    } catch (error) {
      console.error('Error guardando carta:', error);
      toast.error('Error al guardar la carta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {editingLetter
                ? 'Editar Carta de Presentación'
                : 'Nueva Carta de Presentación'}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {editingLetter
              ? 'Modifica los datos de la carta de presentación existente.'
              : 'Crea una nueva carta de presentación personalizada con ayuda de inteligencia artificial.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del CV */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Información del CV</h3>
            <p className="text-sm text-gray-600">
              <strong>Candidato:</strong> {resumeInfo?.firstName}{' '}
              {resumeInfo?.lastName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Puesto Objetivo:</strong>{' '}
              {resumeInfo?.jobTitle || 'No especificado'}
            </p>
          </div>

          {/* Datos de la empresa y puesto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre de la Empresa *
              </label>
              <Input
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Ej: Google, Amazon, Microsoft..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Puesto Solicitado *
              </label>
              <Input
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="Ej: Desarrollador Full Stack, Product Manager..."
                required
              />
            </div>
          </div>

          {/* Detalles de la oferta laboral */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Detalles de la Oferta Laboral
            </label>
            <Textarea
              name="jobDetails"
              value={formData.jobDetails}
              onChange={handleInputChange}
              placeholder="Describe los requisitos técnicos, tecnologías, experiencia requerida, responsabilidades del puesto, etc. Esta información ayudará a generar una carta más precisa y personalizada."
              className="min-h-[100px] resize-vertical"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Opcional: Incluye tecnologías específicas, años de experiencia,
              responsabilidades clave, etc.
            </p>
          </div>

          {/* Botón para generar con IA */}
          <div className="text-center space-y-3">
            <Button
              onClick={generateAICoverLetter}
              disabled={
                aiLoading || !formData.companyName || !formData.jobTitle
              }
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              {aiLoading ? 'Generando carta...' : 'Generar Carta Inteligente'}
            </Button>

            {(!import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY ||
              import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY ===
                'tu_api_key_aqui') && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                ℹ️ Sin API key configurada - se generará una carta base
                personalizable
              </p>
            )}
          </div>

          {/* Contenido de la carta */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contenido de la Carta *
            </label>
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Escribe aquí el contenido de tu carta de presentación o usa la IA para generarla automáticamente..."
              rows={15}
              className="min-h-[400px]"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length} caracteres
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingLetter ? 'Actualizar Carta' : 'Crear Carta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CoverLetterForm;
