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

// Prompt para generar cartas de recomendación
const COVER_LETTER_PROMPT = `
Actúa como un experto redactor de cartas de recomendación profesionales. 

Basándote en la siguiente información del candidato y el puesto solicitado, crea una carta de recomendación persuasiva y personalizada:

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
1. Crea una carta profesional en español dirigida al departamento de recursos humanos
2. Destaca las cualidades más relevantes del candidato para el puesto específico
3. Usa un tono profesional pero cercano
4. Incluye ejemplos específicos basados en la experiencia del candidato
5. La carta debe tener entre 300-500 palabras
6. Estructura: Saludo, introducción, cuerpo (2-3 párrafos), cierre profesional

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
      'Candidato';
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

Me dirijo a ustedes con el propósito de recomendar encarecidamente a ${candidateName} para el puesto de ${
      formData.jobTitle
    } en su prestigiosa empresa.

Durante mi experiencia profesional, he tenido la oportunidad de conocer las capacidades y el desempeño de ${candidateName}, quien ha demostrado ser un profesional altamente competente y comprometido. ${
      resumeInfo?.summary ||
      'Su experiencia y dedicación lo convierten en un candidato ideal para este puesto.'
    } 

${
  experience
    ? `En su rol como ${experience.title} en ${experience.companyName}, ${candidateName} ha desarrollado habilidades excepcionales que son directamente aplicables al puesto que solicita. Su experiencia incluye trabajo con ${skills}, lo cual es fundamental para el éxito en esta posición.`
    : `${candidateName} posee las habilidades técnicas necesarias, incluyendo experiencia con ${skills}, que son fundamentales para destacar en el puesto de ${formData.jobTitle}.`
}

Las cualidades que más destacan de ${candidateName} incluyen:
• Excelente capacidad de resolución de problemas
• Fuerte orientación a resultados
• Habilidades de comunicación excepcionales  
• Capacidad para trabajar efectivamente en equipo
• Adaptabilidad a nuevos desafíos y tecnologías

Estoy convencido/a de que ${candidateName} será una valiosa adición a su equipo y contribuirá significativamente al éxito continuo de ${
      formData.companyName
    }. Su combinación de experiencia técnica, profesionalismo y dedicación lo convierten en el candidato ideal para esta oportunidad.

No duden en contactarme si requieren información adicional sobre esta recomendación.

Atentamente,

[Nombre del Recomendador]
[Título/Posición]
[Información de Contacto]`;

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

      const prompt = `Escribe una carta de recomendación profesional en español. Devuelve ÚNICAMENTE el texto de la carta, sin formato JSON, sin comentarios adicionales.

INFORMACIÓN DEL PUESTO:
- Candidato: ${candidateName || 'el candidato'}
- Empresa: ${formData.companyName}
- Puesto: ${formData.jobTitle}

REQUISITOS DE LA OFERTA LABORAL:
${
  formData.jobDetails ||
  'Puesto de desarrollo de software con requisitos técnicos específicos'
}

PERFIL DEL CANDIDATO:
- Experiencia: ${
        latestExperience
          ? `${latestExperience.title} en ${latestExperience.companyName} (${
              latestExperience.startDate
            } - ${
              latestExperience.endDate || 'Presente'
            }). Responsabilidades: ${
              latestExperience.workSummery ||
              'Desarrollo y mantenimiento de aplicaciones'
            }`
          : 'Experiencia en desarrollo de software'
      }
- Habilidades técnicas: ${skills || 'Tecnologías de desarrollo modernas'}
- Educación: ${
        education
          ? `${education.degree} en ${education.universityName}`
          : 'Formación técnica relevante'
      }
- Resumen: ${
        resumeInfo?.summary ||
        'Profesional con experiencia en desarrollo de software'
      }

INSTRUCCIONES:
- Comienza con "Estimado equipo de Recursos Humanos de ${formData.companyName},"
- Menciona específicamente las tecnologías del candidato que coincidan con las requeridas en la oferta
- Destaca cómo la experiencia del candidato se alinea con las responsabilidades del puesto
- Incluye ejemplos concretos de logros o proyectos relevantes
- Usa un tono profesional y convincente
- Termina con una recomendación clara y datos de contacto genéricos
- Extensión: 350-500 palabras

Escribe la carta completa ahora:`;

      console.log('=== PROMPT GENERADO ===');
      console.log(prompt);
      console.log('=== FIN PROMPT ===');

      const result = await AIChatSessionText.sendMessage(prompt);
      const generatedContent = result.response.text();

      if (generatedContent && generatedContent.trim()) {
        setFormData((prev) => ({ ...prev, content: generatedContent.trim() }));
        toast.success('¡Carta de recomendación generada exitosamente con IA!');
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
                ? 'Editar Carta de Recomendación'
                : 'Nueva Carta de Recomendación'}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {editingLetter
              ? 'Modifica los datos de la carta de recomendación existente.'
              : 'Crea una nueva carta de recomendación personalizada con ayuda de inteligencia artificial.'}
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
              placeholder="Escribe aquí el contenido de tu carta de recomendación o usa la IA para generarla automáticamente..."
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
