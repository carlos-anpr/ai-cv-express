/**
 * 🎯 INTERVIEW PREPARATION - CHECKPOINT 6.3 COMPLETADO
 * Componente principal con generador automático de preguntas
 * orientado específicamente a la empresa y candidatura
 */

import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  Clock,
  Brain,
  Loader2,
  Building2,
  AlertCircle,
  Settings,
  Target,
  FileText,
  Sparkles,
} from 'lucide-react';

import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { analyzeCandidateProfile } from '@/services/ProfileAnalyzer';
import { compareSkills } from '@/utils/skillMatcher';
import questionGenerator from '@/services/QuestionGenerator';
import LocalDatabase from '@/services/LocalDatabase';
import JobApplicationDataForm from '@/dashboard/resume/[resumeId]/job-applications/components/JobApplicationDataForm';
import { extractTechnicalRequirements } from '@/utils/requirementsExtractor';

const InterviewPreparation = () => {
  const { resumeInfo } = useContext(ResumeInfoContext);
  const { resumeId, applicationId } = useParams();

  // Estados principales
  const [currentStep, setCurrentStep] = useState('check-data'); // check-data | generate | study
  const [jobApplication, setJobApplication] = useState(null);
  const [_candidateProfile, setCandidateProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 100,
    stage: '',
  });
  const [error, setError] = useState(null);
  const [existingPreparation, setExistingPreparation] = useState(null);

  // Estados para estudio
  const [studiedQuestions, setStudiedQuestions] = useState(new Set());
  const [currentFilter, setCurrentFilter] = useState('all');

  /**
   * 🚀 INICIALIZAR COMPONENTE
   * Cargar datos de candidatura y verificar si ya existe test
   */
  const initializeComponent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Cargar datos de la candidatura
      const appResponse = await LocalDatabase.GetJobApplicationById(
        applicationId
      );
      if (!appResponse.success) {
        throw new Error('No se pudo cargar la información de la candidatura');
      }

      const appData = appResponse.data;

      // 🔍 EXTRAER REQUISITOS TÉCNICOS AUTOMÁTICAMENTE
      if (appData.jobDescription || appData.requirements) {
        console.log('🔄 Extrayendo requisitos técnicos automáticamente...');
        const extractionResult = await extractTechnicalRequirements(
          appData.jobDescription || '',
          appData.requirements || ''
        );

        if (
          extractionResult.success &&
          extractionResult.requirements.length > 0
        ) {
          console.log(
            '✅ Requisitos extraídos:',
            extractionResult.requirements
          );
          // Actualizar los datos con los requisitos extraídos
          appData.requirements = extractionResult.requirements;

          // Actualizar en la base de datos
          try {
            await LocalDatabase.UpdateJobApplication(applicationId, {
              ...appData,
              requirements: extractionResult.requirements,
            });
          } catch (updateError) {
            console.warn(
              '⚠️ No se pudieron guardar los requisitos extraídos:',
              updateError
            );
          }
        }
      }

      setJobApplication(appData);

      // 2. Verificar datos obligatorios
      const requiredFields = [
        'companyName',
        'jobTitle',
        'jobDescription',
        // 'companyDescription' - Ya no es obligatorio
        // 'requirements' - Ya no es obligatorio, se extraen automáticamente
      ];

      const missingFields = requiredFields.filter((field) => {
        return !appData[field] || appData[field].trim() === '';
      });

      if (missingFields.length > 0) {
        setCurrentStep('check-data');
        return;
      }

      // 3. Verificar si ya existe un test para esta candidatura
      const existingResponse =
        await LocalDatabase.GetInterviewPreparationByApplication(
          resumeId,
          applicationId
        );

      if (existingResponse.success && existingResponse.data) {
        setExistingPreparation(existingResponse.data);
        setQuestions(existingResponse.data.questions || []);
        setCandidateProfile(existingResponse.data.profileAnalysis);

        // Cargar progreso de estudio
        const studiedIds = existingResponse.data.questions
          .filter((q) => q.isStudied)
          .map((q) => q.id);
        setStudiedQuestions(new Set(studiedIds));

        setCurrentStep('study');
      } else {
        // Datos completos pero no hay test -> mostrar botón generar
        setCurrentStep('generate');
      }
    } catch (error) {
      console.error('❌ Error inicializando componente:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [resumeId, applicationId]);

  // Efecto para inicializar el componente
  useEffect(() => {
    initializeComponent();
  }, [initializeComponent]);

  /**
   * 📋 COMPLETAR DATOS DE CANDIDATURA
   * Guardar datos faltantes y continuar
   */
  const handleDataComplete = async (completedData) => {
    try {
      setIsLoading(true);

      // Actualizar candidatura con datos completos
      const updateResponse = await LocalDatabase.UpdateJobApplication(
        applicationId,
        completedData
      );

      if (!updateResponse.success) {
        throw new Error('Error al guardar los datos de la candidatura');
      }

      // Actualizar estado local
      setJobApplication((prev) => ({ ...prev, ...completedData }));
      setCurrentStep('generate');
    } catch (error) {
      console.error('❌ Error completando datos:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🎯 GENERAR TEST DE PREPARACIÓN
   * Analizar perfil y generar preguntas personalizadas
   */
  const handleGenerateTest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingProgress({
        current: 0,
        total: 100,
        stage: 'Iniciando análisis...',
      });

      // 1. Analizar perfil del candidato (20%)
      setLoadingProgress({
        current: 20,
        total: 100,
        stage: 'Analizando perfil del candidato...',
      });

      const profileAnalysis = await analyzeCandidateProfile({
        personalDetail: resumeInfo.personalDetail,
        experience: resumeInfo.experience || [],
        education: resumeInfo.education || [],
        skills: resumeInfo.skills || [],
      });

      setCandidateProfile(profileAnalysis);

      // 2. Analizar skills vs requisitos (40%)
      setLoadingProgress({
        current: 40,
        total: 100,
        stage: 'Comparando skills con requisitos...',
      });

      const skillsAnalysis = await compareSkills(
        resumeInfo.skills || [],
        jobApplication.requirements || []
      );

      // 3. Generar preguntas personalizadas - ✅ PROGRESO REAL DESDE 0%
      const questionConfig = {
        totalQuestions: 40, // ✅ CAMBIAR A 40 PREGUNTAS
        distribution: {
          technical: 16, // 40% técnicas (16 de 40)
          behavioral: 8, // 20% comportamentales (8 de 40)
          situational: 8, // 20% situacionales (8 de 40)
          company: 4, // 10% empresa (4 de 40)
          role: 4, // 10% puesto (4 de 40)
        },
      };

      // ✅ CALLBACK PARA PROGRESO REAL
      const handleProgress = (current, total, stage) => {
        const percentage = Math.round((current / total) * 30) + 60; // 60-90% del progreso total
        setLoadingProgress({
          current: percentage,
          total: 100,
          stage: `${stage} (${current}/${total} preguntas)`,
        });
      };

      const questionsResponse =
        await questionGenerator.generateInterviewQuestions(
          profileAnalysis,
          jobApplication,
          questionConfig,
          handleProgress
        );

      setLoadingProgress({
        current: 90,
        total: 100,
        stage: 'Procesando preguntas generadas...',
      });

      if (!questionsResponse.success) {
        if (questionsResponse.error === 'missing_data') {
          throw new Error(
            `Faltan datos obligatorios: ${questionsResponse.missingFields.join(
              ', '
            )}`
          );
        }
        throw new Error(questionsResponse.message);
      }

      setLoadingProgress({
        current: 90,
        total: 100,
        stage: 'Guardando test de preparación...',
      });

      // 4. Guardar test en base de datos (100%)
      const testData = {
        resumeId,
        applicationId,
        userEmail: resumeInfo.personalDetail?.email || 'usuario@test.com',
        profileLevel: profileAnalysis.level,
        profileAnalysis,
        skillsAnalysis,
        questions: questionsResponse.data.questions,
        configuration: questionConfig,
      };

      const saveResponse = await LocalDatabase.CreateInterviewPreparation(
        testData
      );

      if (!saveResponse.success) {
        throw new Error('Error al guardar el test de preparación');
      }

      setExistingPreparation(saveResponse.data);
      setQuestions(questionsResponse.data.questions);
      setLoadingProgress({
        current: 100,
        total: 100,
        stage: '¡Test generado exitosamente!',
      });

      // Transición suave a modo estudio
      setTimeout(() => {
        setCurrentStep('study');
      }, 1500);

      // Quitar loading pero mantener el progreso visible un poco más
      setTimeout(() => {
        setIsLoading(false);
      }, 1200);
    } catch (error) {
      console.error('❌ Error generando test:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  /**
   * 🗑️ REGENERAR TEST
   * Eliminar test actual y generar uno nuevo
   */
  const handleRegenerateTest = async () => {
    try {
      if (existingPreparation) {
        await LocalDatabase.DeleteInterviewPreparation(existingPreparation.id);
      }

      setExistingPreparation(null);
      setQuestions([]);
      setStudiedQuestions(new Set());
      setCurrentStep('generate');
    } catch (error) {
      console.error('❌ Error regenerando test:', error);
      setError('Error al regenerar el test');
    }
  };

  /**
   * ✅ MARCAR PREGUNTA COMO ESTUDIADA
   */
  const handleMarkAsStudied = async (questionId) => {
    try {
      const newStudiedSet = new Set(studiedQuestions);

      if (newStudiedSet.has(questionId)) {
        newStudiedSet.delete(questionId);
      } else {
        newStudiedSet.add(questionId);
      }

      setStudiedQuestions(newStudiedSet);

      // Actualizar en base de datos
      if (existingPreparation) {
        await LocalDatabase.UpdateStudyProgress(
          existingPreparation.id,
          Array.from(newStudiedSet)
        );
      }
    } catch (error) {
      console.error('❌ Error actualizando progreso:', error);
    }
  };

  // COMPONENTE: Verificar datos obligatorios
  if (currentStep === 'check-data') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <Target className="h-6 w-6 text-blue-600" />
            Preparación para Entrevista
          </h1>
          <p className="text-gray-600">
            Datos específicos requeridos para generar preguntas personalizadas
          </p>
        </div>

        <JobApplicationDataForm
          applicationData={jobApplication}
          onDataComplete={handleDataComplete}
          onCancel={() => setCurrentStep('generate')}
        />
      </div>
    );
  }

  // COMPONENTE: Generar nuevo test
  if (currentStep === 'generate') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Generar Test de Preparación
          </h1>
          <p className="text-gray-600">
            Test personalizado basado en tu perfil y los requisitos específicos
            de la empresa
          </p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Información de la candidatura */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Información de la Candidatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Empresa</p>
                <p className="font-semibold">{jobApplication?.companyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Puesto</p>
                <p className="font-semibold">{jobApplication?.jobTitle}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Requisitos técnicos
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(jobApplication?.requirements) &&
                  jobApplication.requirements.slice(0, 10).map((req, index) => (
                    <Badge key={index} variant="secondary">
                      {req}
                    </Badge>
                  ))}
                {Array.isArray(jobApplication?.requirements) &&
                  jobApplication.requirements.length > 10 && (
                    <Badge variant="outline">
                      +{jobApplication.requirements.length - 10} más
                    </Badge>
                  )}
                {!Array.isArray(jobApplication?.requirements) && (
                  <Badge variant="outline">No hay requisitos definidos</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado de carga */}
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {loadingProgress.stage}
                  </p>
                  <Progress
                    value={loadingProgress.current}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    {loadingProgress.current}% completado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Botón para generar */
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Sparkles className="h-12 w-12 mx-auto text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    ¿Listo para generar tu test personalizado?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Crearemos 20 preguntas específicas basadas en:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Tu perfil profesional detectado
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Requisitos específicos de {jobApplication?.companyName}
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Tecnologías del puesto
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Cultura y contexto empresarial
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateTest}
                  disabled={isLoading}
                  className="px-8 py-2"
                  size="lg"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generar Test de Preparación
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // COMPONENTE: Modo estudio - Mostrar preguntas
  if (currentStep === 'study' && questions.length > 0) {
    const filteredQuestions = questions.filter((q) => {
      if (currentFilter === 'all') return true;
      if (currentFilter === 'studied') return studiedQuestions.has(q.id);
      if (currentFilter === 'pending') return !studiedQuestions.has(q.id);
      return q.type === currentFilter;
    });

    const studyProgress = {
      total: questions.length,
      studied: studiedQuestions.size,
      percentage: Math.round((studiedQuestions.size / questions.length) * 100),
    };

    return (
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Guía de Estudio
              </h1>
              <p className="text-gray-600">
                Test personalizado para {jobApplication?.companyName} -{' '}
                {jobApplication?.jobTitle}
              </p>
            </div>

            <Button variant="outline" onClick={handleRegenerateTest}>
              <Settings className="h-4 w-4 mr-2" />
              Regenerar Test
            </Button>
          </div>

          {/* Progreso */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progreso de Estudio</span>
                <span className="text-sm text-gray-600">
                  {studyProgress.studied}/{studyProgress.total} preguntas
                </span>
              </div>
              <Progress value={studyProgress.percentage} className="mb-2" />
              <p className="text-xs text-gray-500">
                {studyProgress.percentage}% completado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={currentFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFilter('all')}
            >
              Todas ({questions.length})
            </Button>
            <Button
              variant={currentFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFilter('pending')}
            >
              Pendientes ({questions.length - studiedQuestions.size})
            </Button>
            <Button
              variant={currentFilter === 'studied' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFilter('studied')}
            >
              Estudiadas ({studiedQuestions.size})
            </Button>
            <Button
              variant={currentFilter === 'technical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFilter('technical')}
            >
              Técnicas ({questions.filter((q) => q.type === 'technical').length}
              )
            </Button>
            <Button
              variant={currentFilter === 'behavioral' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFilter('behavioral')}
            >
              Comportamentales (
              {questions.filter((q) => q.type === 'behavioral').length})
            </Button>
            <Button
              variant={currentFilter === 'situational' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFilter('situational')}
            >
              Situacionales (
              {questions.filter((q) => q.type === 'situational').length})
            </Button>
            <Button
              variant={currentFilter === 'company' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFilter('company')}
            >
              Empresa ({questions.filter((q) => q.type === 'company').length})
            </Button>
            <Button
              variant={currentFilter === 'role' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFilter('role')}
            >
              Puesto ({questions.filter((q) => q.type === 'role').length})
            </Button>
          </div>
        </div>

        {/* Lista de preguntas */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <Card key={question.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          question.type === 'technical'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {question.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Pregunta {index + 1}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-relaxed">
                      {question.question}
                    </CardTitle>
                  </div>

                  <Button
                    variant={
                      studiedQuestions.has(question.id) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMarkAsStudied(question.id)}
                    className="ml-4"
                  >
                    {studiedQuestions.has(question.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Estudiada
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-1" />
                        Marcar
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {question.context && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Contexto:
                    </p>
                    <p className="text-sm text-blue-700">{question.context}</p>
                  </div>
                )}

                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Respuesta esperada:
                  </p>
                  <p className="text-sm text-green-700">
                    {question.expectedAnswer}
                  </p>
                </div>

                {question.evaluationCriteria &&
                  question.evaluationCriteria.length > 0 && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 mb-2">
                        Criterios de evaluación:
                      </p>
                      <ul className="text-sm text-purple-700 space-y-1">
                        {question.evaluationCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {question.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p>No hay preguntas que coincidan con el filtro seleccionado</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Estado por defecto
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando preparación para entrevista...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewPreparation;
