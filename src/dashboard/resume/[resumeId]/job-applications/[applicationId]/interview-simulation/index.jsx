import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Brain,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Trash2,
  Target,
  AlertTriangle,
  XCircle,
  Info,
  Edit,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import LocalDatabase from '@/services/LocalDatabase';
import { InterviewTestGenerator } from '@/services/prompts/interviewTestGenerator';
import { AIChatSession } from '../../../../../../../service/AIModal';

function InterviewSimulation() {
  const { resumeId, applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  // Estados
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [application, setApplication] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null); // Nivel seleccionado por el usuario
  const [detectedLevel, setDetectedLevel] = useState('mid'); // Nivel detectado por defecto

  // Función para detectar el nivel según la descripción de la oferta
  const detectLevel = (jobApplication) => {
    const description =
      (jobApplication?.jobDescription || '') +
      ' ' +
      (Array.isArray(jobApplication?.requirements)
        ? jobApplication.requirements.join(' ')
        : jobApplication?.requirements || '');

    const lowerText = description.toLowerCase();

    // Patrones para detectar senior
    const seniorPatterns = [
      /senior/i,
      /lead/i,
      /architect/i,
      /principal/i,
      /\b[6-9]\+?\s*años/i,
      /\b1[0-9]\+?\s*años/i,
      /liderazgo/i,
      /mentori[aá]/i,
      /strategic/i,
    ];

    // Patrones para detectar junior
    const juniorPatterns = [
      /junior/i,
      /entry\s*level/i,
      /trainee/i,
      /\b[0-2]\s*años/i,
      /sin experiencia/i,
      /recién graduado/i,
      /graduate/i,
    ];

    // Verificar senior primero
    if (seniorPatterns.some((pattern) => pattern.test(lowerText))) {
      return 'senior';
    }

    // Verificar junior
    if (juniorPatterns.some((pattern) => pattern.test(lowerText))) {
      return 'junior';
    }

    // Por defecto: mid
    return 'mid';
  };

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setLoading(true);
      setValidationErrors([]);
      setError(null);

      console.log('🔄 Cargando datos de candidatura y CV...');

      // Cargar candidatura
      const appResponse = await LocalDatabase.GetJobApplicationById(
        applicationId,
        user.primaryEmailAddress.emailAddress
      );

      if (!appResponse.data) {
        throw new Error('Candidatura no encontrada');
      }

      setApplication(appResponse.data);
      console.log('✅ Candidatura cargada:', appResponse.data);

      // Detectar nivel basado en la oferta
      const level = detectLevel(appResponse.data);
      setDetectedLevel(level);
      setSelectedLevel(level); // Inicializar con el nivel detectado
      console.log('📊 Nivel detectado:', level);

      // Cargar CV
      const resumeResponse = await LocalDatabase.GetResumeById(resumeId);

      if (!resumeResponse.data) {
        throw new Error('CV no encontrado');
      }

      setResumeData(resumeResponse.data);
      console.log('✅ CV cargado:', resumeResponse.data);

      // Validar datos de candidatura
      const validation = InterviewTestGenerator.validateJobApplicationData(
        appResponse.data
      );

      if (!validation.isValid) {
        console.warn(
          '⚠️ Candidatura con datos insuficientes:',
          validation.errors
        );
        setValidationErrors(validation.errors);
        // No bloquear carga, solo mostrar advertencia
      }

      // Buscar simulación existente (solo si datos son válidos)
      if (validation.isValid) {
        const simResponse =
          await LocalDatabase.GetInterviewSimulationByJobApplication(
            applicationId,
            user.primaryEmailAddress.emailAddress
          );

        if (simResponse.data) {
          console.log('✅ Simulación existente encontrada:', simResponse.data);
          setSimulation(simResponse.data);
        } else {
          console.log('ℹ️ No hay simulación previa para esta candidatura');
        }
      }
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setError(error.message);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [applicationId, resumeId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generar test con IA
  const handleGenerateTest = async (levelOverride = null) => {
    try {
      setGenerating(true);
      setError(null);

      console.log('🤖 Iniciando generación de test con IA...');
      if (levelOverride) {
        console.log(`📊 Nivel forzado por usuario: ${levelOverride}`);
      }

      // Validar datos de candidatura
      const validation =
        InterviewTestGenerator.validateJobApplicationData(application);

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.error('Faltan datos obligatorios de la candidatura');
        return;
      }

      // Generar prompt (con nivel forzado si existe)
      const prompt = InterviewTestGenerator.generatePrompt(
        resumeData,
        application,
        levelOverride || selectedLevel
      );

      console.log('📝 Prompt generado, longitud:', prompt.length);

      // Llamar a Gemini AI
      toast.info('Generando test personalizado con IA...');
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const responseText = await result.response.text();

      console.log('✅ Respuesta de IA recibida');

      // Parsear respuesta JSON
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
        console.log('Respuesta recibida:', responseText);
        throw new Error('La IA no devolvió un formato válido');
      }

      // Validar estructura
      if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
        throw new Error('Respuesta de IA inválida: falta array de preguntas');
      }

      if (parsedData.questions.length !== 5) {
        console.warn(
          `⚠️ Se esperaban 5 preguntas, se recibieron ${parsedData.questions.length}`
        );
      }

      // Añadir IDs únicos a cada pregunta
      const questionsWithIds = parsedData.questions.map((q) => ({
        ...q,
        id: uuidv4(),
      }));

      console.log('✅ Datos validados:', {
        nivel: parsedData.candidateLevel,
        skills: parsedData.detectedSkills,
        rol: parsedData.roleType,
        preguntas: questionsWithIds.length,
      });

      // Guardar en IndexedDB
      const simulationData = {
        jobApplicationId: parseInt(applicationId),
        resumeId: resumeId,
        userEmail: user.primaryEmailAddress.emailAddress,
        candidateLevel: parsedData.candidateLevel || 'mid',
        questions: questionsWithIds,
      };

      const simulationId = await LocalDatabase.CreateInterviewSimulation(
        simulationData
      );

      console.log('✅ Simulación guardada en DB con ID:', simulationId);

      // Recargar simulación desde DB
      const savedSimulation =
        await LocalDatabase.GetInterviewSimulationByJobApplication(
          applicationId,
          user.primaryEmailAddress.emailAddress
        );

      setSimulation(savedSimulation.data);
      toast.success('Test de entrevista generado correctamente');
    } catch (error) {
      console.error('❌ Error generando test:', error);
      setError(error.message);
      toast.error('Error al generar el test: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  // Regenerar test
  const handleRegenerate = async () => {
    if (
      !confirm(
        '¿Generar un nuevo test? El actual se eliminará permanentemente.'
      )
    ) {
      return;
    }

    try {
      setGenerating(true);

      console.log('🔄 Regenerando test...');

      // Eliminar simulación actual
      if (simulation?.id) {
        await LocalDatabase.DeleteInterviewSimulation(
          simulation.id,
          user.primaryEmailAddress.emailAddress
        );
        console.log('✅ Simulación anterior eliminada');
      }

      // Generar nuevo test
      setSimulation(null);
      await handleGenerateTest();
    } catch (error) {
      console.error('❌ Error regenerando test:', error);
      toast.error('Error al regenerar el test');
      setGenerating(false);
    }
  };

  // Eliminar test
  const handleDelete = async () => {
    if (!confirm('¿Eliminar este test permanentemente?')) {
      return;
    }

    try {
      await LocalDatabase.DeleteInterviewSimulation(
        simulation.id,
        user.primaryEmailAddress.emailAddress
      );

      setSimulation(null);
      setSelectedLevel(null);
      toast.success('Test eliminado correctamente');
      console.log('✅ Test eliminado');
    } catch (error) {
      console.error('❌ Error eliminando test:', error);
      toast.error('Error al eliminar el test');
    }
  };

  // Cambiar nivel de la entrevista
  const handleChangeLevel = async (newLevel) => {
    if (!newLevel) return;

    if (
      !confirm(
        `¿Regenerar el test con nivel "${newLevel.toUpperCase()}"? El test actual se eliminará.`
      )
    ) {
      return;
    }

    try {
      setGenerating(true);
      setSelectedLevel(newLevel);

      console.log(`🔄 Regenerando test con nivel: ${newLevel}`);

      // Eliminar simulación actual
      if (simulation?.id) {
        await LocalDatabase.DeleteInterviewSimulation(
          simulation.id,
          user.primaryEmailAddress.emailAddress
        );
        console.log('✅ Simulación anterior eliminada');
      }

      // Generar nuevo test con el nivel seleccionado
      setSimulation(null);
      await handleGenerateTest(newLevel);

      toast.success(`Test regenerado con nivel ${newLevel}`);
    } catch (error) {
      console.error('❌ Error cambiando nivel:', error);
      toast.error('Error al cambiar el nivel del test');
      setGenerating(false);
    }
  };

  // Navegar a edición de candidatura
  const handleGoToEdit = () => {
    navigate(
      `/dashboard/resume/${resumeId}/job-applications/${applicationId}/edit`
    );
  };

  const handleGoBack = () => {
    navigate(`/dashboard/resume/${resumeId}/job-applications/${applicationId}`);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Estado: Cargando
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">
              Cargando preparación de entrevista...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Error crítico
  if (error && !application) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-900 mb-2">
              Error al cargar datos
            </h3>
            <p className="text-red-700 mb-6">{error}</p>
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
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
              Test de Preparación para Entrevista
            </h1>
            <p className="text-gray-600 mt-2">
              {application?.companyName} - {application?.jobTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Estado: Datos insuficientes */}
      {validationErrors.length > 0 &&
        validationErrors.some((e) => !e.startsWith('⚠️')) && (
          <Card className="border-yellow-200 bg-yellow-50 mb-6">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <CardTitle className="text-yellow-900">
                    No se puede generar el test
                  </CardTitle>
                  <CardDescription className="text-yellow-800 mt-2">
                    Faltan datos obligatorios de la candidatura para poder
                    generar preguntas relevantes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Campos obligatorios faltantes:
                </h4>
                <ul className="space-y-2">
                  {validationErrors
                    .filter((e) => !e.startsWith('⚠️'))
                    .map((error, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  ¿Por qué son necesarios estos datos?
                </h4>
                <p className="text-sm text-blue-800">
                  El sistema de IA necesita información específica sobre las{' '}
                  <strong>habilidades técnicas requeridas</strong>, el{' '}
                  <strong>nivel de experiencia</strong> y las{' '}
                  <strong>responsabilidades del puesto</strong> para generar
                  preguntas de entrevista relevantes y personalizadas.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleGoToEdit}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Completar Datos de la Candidatura
                </Button>
                <Button variant="outline" onClick={handleGoBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Estado: Generando */}
      {generating && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="relative inline-block">
                <Loader2 className="animate-spin h-16 w-16 text-blue-600" />
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-2">
                Generando Test Personalizado
              </h3>
              <p className="text-gray-600 mb-4">
                La IA está analizando tu CV y el puesto para crear preguntas
                relevantes...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="animate-pulse">⚡</div>
                <span>Esto puede tardar 10-20 segundos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado: Sin test y datos válidos */}
      {!simulation &&
        !generating &&
        validationErrors.every(
          (e) => e.startsWith('⚠️') || validationErrors.length === 0
        ) && (
          <Card>
            <CardHeader>
              <CardTitle>Test de Preparación para Entrevista</CardTitle>
              <CardDescription>
                Genera un test personalizado con 5 preguntas basadas en tu CV y
                el puesto
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No hay test generado todavía
              </h3>
              <p className="text-gray-600 mb-6">
                Genera un test de estudio personalizado con preguntas,
                respuestas y explicaciones
              </p>

              {/* Selector de Nivel */}
              <div className="mb-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Selecciona el nivel de dificultad:
                  </span>
                </div>
                <Select
                  value={selectedLevel || detectedLevel}
                  onValueChange={setSelectedLevel}
                  disabled={generating}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📗</span>
                        <span>Junior (0-3 años)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mid">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📘</span>
                        <span>Mid (3-6 años)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="senior">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📕</span>
                        <span>Senior (6+ años)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Badge
                  variant="outline"
                  className={
                    (selectedLevel || detectedLevel) === 'junior'
                      ? 'bg-green-50 text-green-700 border-green-300'
                      : (selectedLevel || detectedLevel) === 'mid'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-purple-50 text-purple-700 border-purple-300'
                  }
                >
                  {(selectedLevel || detectedLevel) === 'junior' && '📗'}
                  {(selectedLevel || detectedLevel) === 'mid' && '📘'}
                  {(selectedLevel || detectedLevel) === 'senior' &&
                    '📕'} Nivel {selectedLevel || detectedLevel}
                </Badge>
                <p className="text-xs text-gray-500 max-w-md">
                  💡 Se ha detectado automáticamente el nivel según la oferta.
                  Puedes cambiarlo si lo deseas antes de generar el test.
                </p>
              </div>

              <Button
                onClick={() => handleGenerateTest(selectedLevel)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={generating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generar Test con IA
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Estado: Test generado */}
      {simulation && !generating && (
        <div className="space-y-6">
          {/* Header con acciones */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle>Test de Preparación</CardTitle>
                  <CardDescription>
                    Generado el {formatDate(simulation.createdAt)}
                  </CardDescription>

                  {/* Selector de Nivel */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Nivel de Entrevista:
                      </span>
                    </div>
                    <Select
                      value={simulation.candidateLevel}
                      onValueChange={handleChangeLevel}
                      disabled={generating}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            Junior
                          </div>
                        </SelectItem>
                        <SelectItem value="mid">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            Mid
                          </div>
                        </SelectItem>
                        <SelectItem value="senior">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            Senior
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge
                      variant="outline"
                      className={
                        simulation.candidateLevel === 'junior'
                          ? 'bg-green-50 text-green-700 border-green-300'
                          : simulation.candidateLevel === 'mid'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-purple-50 text-purple-700 border-purple-300'
                      }
                    >
                      {simulation.candidateLevel === 'junior' && '📗'}
                      {simulation.candidateLevel === 'mid' && '📘'}
                      {simulation.candidateLevel === 'senior' &&
                        '📕'} Nivel {simulation.candidateLevel}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    💡 Cambia el nivel para regenerar el test con preguntas de
                    diferente dificultad
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={generating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Preguntas */}
          {simulation.questions.map((q, index) => (
            <Card key={q.id || index} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline">{q.category}</Badge>
                      <Badge variant="secondary">{q.difficulty}</Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {index + 1}. {q.question}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Respuesta sugerida */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 mb-1">
                        Respuesta Sugerida:
                      </p>
                      <p className="text-green-800">{q.correctAnswer}</p>
                    </div>
                  </div>
                </div>

                {/* Explicación */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 mb-1">
                        ¿Por qué esta respuesta?
                      </p>
                      <p className="text-blue-800">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Consejos adicionales */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Consejos para la Entrevista
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Practica estas respuestas en voz alta antes de la entrevista
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Personaliza las respuestas con ejemplos de tu experiencia
                    real
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Investiga más sobre {application?.companyName} antes de la
                    entrevista
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Prepara 2-3 preguntas inteligentes para hacer al
                    entrevistador
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default InterviewSimulation;
