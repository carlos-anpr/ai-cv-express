import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  FileText,
  Sparkles,
  RefreshCw,
  Copy,
  Save,
  Eye,
  Edit,
  Download,
  Trash2,
} from 'lucide-react';
import LocalDatabase from '@/services/LocalDatabase';
import { AIChatSessionText } from '../../../../../../../service/AIModal';
import CoverLetterGenerator from '@/services/prompts/coverLetterGenerator';
import { COVER_LETTER_STYLES, COVER_LETTER_LENGTHS } from '@/services/types';
import { toast } from 'sonner';

function CoverLetterApplication() {
  const { resumeId, applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  // Estado de datos
  const [resumeData, setResumeData] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);

  // Estado de configuración
  const [selectedStyle, setSelectedStyle] = useState('friendly');
  const [selectedLength, setSelectedLength] = useState('medium');

  // Estado de UI
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadData = React.useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setLoading(true);

      // Cargar datos del CV
      const resumeResponse = await LocalDatabase.GetResumeById(resumeId);
      setResumeData(resumeResponse.data);

      // Cargar datos de la candidatura
      const applicationResponse = await LocalDatabase.GetJobApplicationById(
        applicationId,
        user?.primaryEmailAddress?.emailAddress
      );
      setApplicationData(applicationResponse.data);

      // Buscar carta existente
      const coverLetterResponse =
        await LocalDatabase.GetCoverLetterByApplication(applicationId);
      if (coverLetterResponse.data) {
        const existingLetter = coverLetterResponse.data;
        setCoverLetter(existingLetter);
        setSelectedStyle(existingLetter.style || 'friendly');
        setSelectedLength(existingLetter.length || 'medium');
        setEditedContent(existingLetter.content || '');
      }
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [resumeId, applicationId, user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateCoverLetter = async () => {
    if (!resumeData || !applicationData) {
      toast.error('Faltan datos para generar la carta');
      return;
    }

    try {
      setGenerating(true);

      // Generar el prompt
      const prompt = CoverLetterGenerator.generatePrompt(
        resumeData,
        applicationData,
        selectedStyle,
        selectedLength
      );

      console.log(
        '🤖 Generando carta con prompt:',
        prompt.substring(0, 200) + '...'
      );

      // Crear sesión de IA y enviar mensaje
      const chatSession = AIChatSessionText();
      const result = await chatSession.sendMessage(prompt);
      const aiResponse = result.response.text();

      // Crear o actualizar la carta
      const coverLetterData = {
        resumeId,
        jobApplicationId: parseInt(applicationId),
        userEmail:
          user?.primaryEmailAddress?.emailAddress || 'user@example.com',
        content: aiResponse,
        style: selectedStyle,
        length: selectedLength,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let savedLetter;
      if (coverLetter && coverLetter.id) {
        // Actualizar carta existente
        savedLetter = await LocalDatabase.UpdateCoverLetter(
          coverLetter.id,
          coverLetterData
        );
      } else {
        // Crear nueva carta
        savedLetter = await LocalDatabase.CreateCoverLetter(coverLetterData);

        // Marcar la candidatura como que tiene carta generada
        await LocalDatabase.UpdateJobApplication(applicationId, {
          coverLetterGenerated: true,
          updatedAt: new Date().toISOString(),
        });
      }

      console.log('📄 Carta guardada:', savedLetter.data);
      setCoverLetter(savedLetter.data);
      setEditedContent(aiResponse);

      // Recargar datos para asegurar consistencia
      await loadData();

      toast.success('Carta de presentación generada correctamente');
    } catch (error) {
      console.error('❌ Error generando carta:', error);
      toast.error('Error al generar la carta: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const saveCoverLetter = async () => {
    if (!coverLetter || !editedContent.trim()) {
      toast.error('No hay contenido para guardar');
      return;
    }

    try {
      setGenerating(true);

      const updatedData = {
        content: editedContent,
        style: selectedStyle,
        length: selectedLength,
        updatedAt: new Date().toISOString(),
      };

      const savedLetter = await LocalDatabase.UpdateCoverLetter(
        coverLetter.id,
        updatedData
      );
      setCoverLetter(savedLetter.data);
      setEditing(false);

      toast.success('Carta guardada correctamente');
    } catch (error) {
      console.error('❌ Error guardando carta:', error);
      toast.error('Error al guardar la carta');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      toast.success('Carta copiada al portapapeles');
    } catch {
      toast.error('Error al copiar al portapapeles');
    }
  };

  const handleGoBack = () => {
    navigate(`/dashboard/resume/${resumeId}/job-applications/${applicationId}`);
  };

  const deleteCoverLetter = async () => {
    if (!coverLetter) return;

    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar esta carta de presentación?'
    );
    if (!confirmed) return;

    try {
      setDeleting(true);

      await LocalDatabase.DeleteCoverLetter(coverLetter.id);

      // Actualizar el estado de la candidatura para marcar que no tiene carta
      await LocalDatabase.UpdateJobApplication(applicationId, {
        coverLetterGenerated: false,
        updatedAt: new Date().toISOString(),
      });

      // Limpiar el estado local
      setCoverLetter(null);
      setEditedContent('');
      setEditing(false);

      toast.success('Carta de presentación eliminada correctamente');
    } catch (error) {
      console.error('❌ Error eliminando carta:', error);
      toast.error('Error al eliminar la carta: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Carta de Presentación
            </h1>
            <p className="text-gray-600 mt-2">
              {applicationData?.jobTitle} en {applicationData?.companyName}
            </p>
          </div>
        </div>

        {coverLetter && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const blob = new Blob([editedContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `carta-${applicationData?.companyName}-${applicationData?.jobTitle}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de configuración */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Configuración
              </CardTitle>
              <CardDescription>
                Personaliza el estilo y longitud de tu carta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="style">Estilo de escritura</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COVER_LETTER_STYLES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="length">Longitud</Label>
                <Select
                  value={selectedLength}
                  onValueChange={setSelectedLength}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COVER_LETTER_LENGTHS).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  onClick={generateCoverLetter}
                  disabled={generating}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {coverLetter ? 'Regenerar Carta' : 'Generar Carta'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Información de la candidatura */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Puesto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>Empresa:</strong> {applicationData?.companyName}
              </div>
              <div>
                <strong>Puesto:</strong> {applicationData?.jobTitle}
              </div>
              {applicationData?.location && (
                <div>
                  <strong>Ubicación:</strong> {applicationData.location}
                </div>
              )}
              {applicationData?.salary && (
                <div>
                  <strong>Salario:</strong>{' '}
                  {applicationData.salary.toLocaleString()}€
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vista previa y edición */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {editing ? 'Editando Carta' : 'Vista Previa'}
                </CardTitle>
                {coverLetter && (
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditing(false);
                            setEditedContent(coverLetter.content);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={saveCoverLetter} disabled={generating}>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setEditing(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={deleteCoverLetter}
                          disabled={deleting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!coverLetter ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No hay carta generada
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Configura el estilo y longitud deseados y haz clic en
                    "Generar Carta"
                  </p>
                </div>
              ) : editing ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Contenido de la carta de presentación..."
                  className="min-h-[500px] font-mono text-sm"
                />
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {editedContent || coverLetter.content}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>
                        Estilo: {COVER_LETTER_STYLES[coverLetter.style]}
                      </span>
                      <span>
                        Longitud: {COVER_LETTER_LENGTHS[coverLetter.length]}
                      </span>
                    </div>
                    <div className="mt-1">
                      Palabras aproximadas: {editedContent.split(/\s+/).length}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CoverLetterApplication;
