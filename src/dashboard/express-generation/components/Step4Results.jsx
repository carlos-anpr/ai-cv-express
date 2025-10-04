import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Download,
  Edit,
  FileText,
  Mail,
  Sparkles,
  ArrowRight,
  Home,
  AlertCircle,
} from 'lucide-react';
import {
  SuccessMessage,
  QualityIndicator,
} from '@/components/ui/result-message';
import { useNavigate } from 'react-router-dom';
import LocalDatabase from '@/services/LocalDatabase';
import { toast } from 'sonner';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

/**
 * Step4Results Component
 *
 * Cuarto paso: Mostrar resultados y opciones finales
 */

const Step4Results = ({ generatedData, onStartOver }) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();

  const {
    resume,
    resumeForDB,
    coverLetter,
    coverLetterText,
    resumeQuality,
    coverLetterQuality,
    jobOfferData, // Datos de la oferta extraídos
  } = generatedData;

  // Validar si hay oferta real
  const hasValidJobOffer = React.useMemo(() => {
    return (
      jobOfferData &&
      jobOfferData.companyName !== 'No especificado' &&
      jobOfferData.jobTitle !== 'No especificado'
    );
  }, [jobOfferData]);

  // Debug: Ver qué datos tenemos
  React.useEffect(() => {
    console.log('🎯 Step4Results - Datos recibidos:', {
      hasResume: !!resume,
      hasResumeForDB: !!resumeForDB,
      hasCoverLetter: !!coverLetter,
      hasJobOfferData: !!jobOfferData,
      hasValidJobOffer,
      jobOfferData: jobOfferData,
      generatedData: generatedData,
    });
  }, [
    resume,
    resumeForDB,
    coverLetter,
    jobOfferData,
    hasValidJobOffer,
    generatedData,
  ]);

  // Ocultar confetti después de 5 segundos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Transformar datos de Express a formato del editor
  const transformToEditorFormat = (data) => {
    // Parsear si vienen como strings JSON
    const experience =
      typeof data.experience === 'string'
        ? JSON.parse(data.experience)
        : Array.isArray(data.experience)
        ? data.experience
        : [];

    const education =
      typeof data.education === 'string'
        ? JSON.parse(data.education)
        : Array.isArray(data.education)
        ? data.education
        : [];

    const skills =
      typeof data.skills === 'string'
        ? JSON.parse(data.skills)
        : Array.isArray(data.skills)
        ? data.skills
        : [];

    return {
      ...data,
      experience: experience.map((exp) => ({
        title: exp.title || '',
        companyName: exp.company || '',
        city: exp.location?.split(',')[0]?.trim() || '',
        state: exp.location?.split(',')[1]?.trim() || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        currentlyWorking: exp.current || false,
        workSummary: [exp.description || '', ...(exp.achievements || [])]
          .filter(Boolean)
          .map((item, idx) => `${idx === 0 ? '' : '• '}${item}`)
          .join('\n'),
      })),
      education: education.map((edu) => ({
        universityName: edu.institution || '',
        degree: edu.degree || '',
        major: '',
        startDate: edu.graduationYear ? `${edu.graduationYear - 4}` : '',
        endDate: edu.graduationYear?.toString() || '',
        description: edu.description || '',
      })),
      skills: skills,
    };
  };

  // Crear candidatura automáticamente con carta de presentación
  const createJobApplication = async (resumeId, userEmail) => {
    try {
      console.log('📝 Creando candidatura automática...');
      console.log('📋 Datos disponibles:', {
        hasJobOfferData: !!jobOfferData,
        jobOfferData,
        hasResume: !!resume,
        resumeId,
        userEmail,
      });

      // Validar si hay datos reales de la oferta (no solo "No especificado")
      const hasRealJobOffer =
        jobOfferData &&
        jobOfferData.companyName !== 'No especificado' &&
        jobOfferData.jobTitle !== 'No especificado';

      if (!hasRealJobOffer) {
        console.log(
          '⚠️ No hay oferta de trabajo real, saltando creación de candidatura'
        );
        console.log(
          '💡 El usuario solo describió su perfil sin pegar una oferta'
        );
        return null;
      }

      // Extraer datos de la oferta con validación
      const companyName =
        jobOfferData?.companyName || jobOfferData?.company || 'Empresa';
      const jobTitle =
        jobOfferData?.jobTitle ||
        jobOfferData?.title ||
        resume?.personalInfo?.jobTitle ||
        'Puesto';
      const jobDescription =
        jobOfferData?.description || jobOfferData?.jobDescription || '';

      // Manejar requirements de diferentes formatos
      let requirements = '';
      if (Array.isArray(jobOfferData?.requirements?.essential)) {
        requirements = jobOfferData.requirements.essential.join('\n');
      } else if (typeof jobOfferData?.requirements === 'string') {
        requirements = jobOfferData.requirements;
      }

      // Manejar responsibilities de diferentes formatos
      let responsibilities = '';
      if (Array.isArray(jobOfferData?.responsibilities)) {
        responsibilities = jobOfferData.responsibilities.join('\n');
      } else if (typeof jobOfferData?.responsibilities === 'string') {
        responsibilities = jobOfferData.responsibilities;
      }

      const companyWebsite =
        jobOfferData?.companyWebsite || jobOfferData?.website || '';
      const jobUrl = jobOfferData?.jobUrl || jobOfferData?.url || '';

      // Crear candidatura
      const applicationData = {
        resumeId: resumeId,
        userEmail: userEmail,
        companyName: companyName,
        jobTitle: jobTitle,
        jobDescription: jobDescription,
        requirements: requirements,
        responsibilities: responsibilities,
        companyWebsite: companyWebsite,
        jobUrl: jobUrl,
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'draft',
        notes: 'Candidatura generada automáticamente con Generación Express',
      };

      console.log('📤 Enviando datos de candidatura:', applicationData);
      const applicationResult = await LocalDatabase.CreateJobApplication(
        applicationData
      );

      console.log('📥 Resultado de creación:', applicationResult);

      if (applicationResult.success) {
        console.log('✅ Candidatura creada con ID:', applicationResult.data.id);

        // Guardar carta de presentación asociada
        if (coverLetter && coverLetterText) {
          const coverLetterData = {
            resumeId: resumeId,
            jobApplicationId: applicationResult.data.id,
            userEmail: userEmail,
            content: coverLetterText,
            style: coverLetter.metadata?.tone || 'professional',
            length:
              coverLetter.metadata?.wordCount ||
              coverLetterText.split(/\s+/).length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await LocalDatabase.CreateCoverLetter(coverLetterData);
          console.log('✅ Carta de presentación guardada');
        }

        return applicationResult.data.id;
      } else {
        console.error('❌ Error: CreateJobApplication no fue exitoso');
        return null;
      }
    } catch (error) {
      console.error('⚠️ Error creando candidatura automática:', error);
      console.error('⚠️ Stack trace:', error.stack);
      console.error('⚠️ Error details:', {
        message: error.message,
        name: error.name,
        cause: error.cause,
      });
      // No lanzar error para no interrumpir el guardado del CV
      return null;
    }
  };

  // Guardar y navegar al editor
  const handleEditResume = async () => {
    try {
      setIsSaving(true);

      // Transformar al formato del editor
      const transformedData = transformToEditorFormat(resumeForDB);

      // Guardar en IndexedDB
      const savedResume = await LocalDatabase.CreateNewResume(transformedData);

      // Crear candidatura automática (solo si hay oferta real)
      const applicationId = await createJobApplication(
        savedResume.data.id,
        savedResume.data.userEmail
      );

      if (applicationId) {
        toast.success('✅ CV y candidatura guardados exitosamente', {
          description: 'Puedes gestionar tu candidatura desde el editor',
        });
      } else {
        toast.success('✅ CV guardado exitosamente', {
          description:
            'Añade una oferta de trabajo real para crear una candidatura',
        });
      }

      // Navegar al editor usando el ID numérico
      navigate(`/dashboard/resume/${savedResume.data.id}/edit`);
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Error al guardar el CV. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Guardar y volver al dashboard
  const handleSaveAndDashboard = async () => {
    try {
      setIsSaving(true);

      // Transformar al formato del editor
      const transformedData = transformToEditorFormat(resumeForDB);

      // Guardar en IndexedDB
      const savedResume = await LocalDatabase.CreateNewResume(transformedData);

      // Crear candidatura automática (solo si hay oferta real)
      const applicationId = await createJobApplication(
        savedResume.data.id,
        savedResume.data.userEmail
      );

      if (applicationId) {
        toast.success('✅ CV y candidatura guardados en tu Dashboard', {
          description: 'Puedes gestionar tu candidatura desde el CV',
        });
      } else {
        toast.success('✅ CV guardado en tu Dashboard', {
          description:
            'Para crear candidaturas, genera el CV con una oferta real',
        });
      }

      // Navegar al dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Error al guardar el CV. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Confetti celebration */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 animate-in zoom-in duration-300">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold">¡Generación Completa!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {hasValidJobOffer
              ? 'Tu CV y carta de presentación han sido generados con éxito. Revisa los resultados y decide tu siguiente paso.'
              : 'Tu CV ha sido generado con éxito. Revisa el resultado y decide tu siguiente paso.'}
          </p>
          {!hasValidJobOffer && (
            <p className="text-sm text-orange-600 max-w-md mx-auto">
              💡 No se generó carta de presentación porque no se proporcionó una
              oferta de trabajo válida. Agrega una oferta real para obtener
              carta y candidatura automática.
            </p>
          )}
        </div>
      </div>

      {/* Success Message with stats */}
      <SuccessMessage
        title={
          hasValidJobOffer
            ? 'Todo listo para aplicar'
            : 'CV generado exitosamente'
        }
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <StatCard
            icon={FileText}
            label="CV Completo"
            value="100%"
            color="text-blue-600"
          />
          <StatCard
            icon={Mail}
            label={hasValidJobOffer ? 'Carta Lista' : 'Sin Carta'}
            value={hasValidJobOffer ? '100%' : 'N/A'}
            color={hasValidJobOffer ? 'text-green-600' : 'text-gray-400'}
          />
        </div>
        {!hasValidJobOffer && (
          <p className="text-sm text-muted-foreground mt-3">
            Para generar carta de presentación y candidatura, necesitas pegar
            una oferta de trabajo real en el Paso 2.
          </p>
        )}
      </SuccessMessage>

      {/* Quality Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resumeQuality && (
          <QualityIndicator
            score={resumeQuality.score}
            maxScore={resumeQuality.maxScore}
            level={resumeQuality.qualityLevel}
            feedback={resumeQuality.feedback}
          />
        )}
        {coverLetterQuality && (
          <QualityIndicator
            score={coverLetterQuality.score}
            maxScore={coverLetterQuality.maxScore}
            level={coverLetterQuality.qualityLevel}
            feedback={coverLetterQuality.feedback}
          />
        )}
      </div>

      {/* Preview Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Vista Previa del Contenido
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasValidJobOffer && coverLetter ? (
            <Tabs defaultValue="cv" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cv">
                  <FileText className="w-4 h-4 mr-2" />
                  Currículum
                </TabsTrigger>
                <TabsTrigger value="cover-letter">
                  <Mail className="w-4 h-4 mr-2" />
                  Carta de Presentación
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cv" className="space-y-4 mt-6">
                <ResumePreview resume={resume} />
              </TabsContent>

              <TabsContent value="cover-letter" className="space-y-4 mt-6">
                <CoverLetterPreview
                  coverLetter={coverLetter}
                  coverLetterText={coverLetterText}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4 mt-6">
              <ResumePreview resume={resume} />
              {!hasValidJobOffer && (
                <div className="mt-6 p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="font-bold text-orange-900 text-lg">
                          Carta y Candidatura No Generadas
                        </h4>
                        <p className="text-sm text-orange-800 mt-1">
                          No se proporcionó información de la oferta de trabajo
                          en el Paso 2
                        </p>
                      </div>

                      <div className="bg-white/60 p-3 rounded-lg border border-orange-200">
                        <p className="text-sm font-medium text-orange-900 mb-2">
                          📝 Para generar en el futuro:
                        </p>
                        <ul className="text-sm text-orange-800 space-y-1.5">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                            <span>
                              <strong>Carta de presentación</strong>{' '}
                              personalizada
                            </span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                            <span>
                              <strong>Candidatura automática</strong> con todos
                              los datos
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-300">
                        <p className="text-xs font-medium text-gray-900 mb-1">
                          💡 Tip para la próxima vez:
                        </p>
                        <p className="text-xs text-gray-800">
                          En el Paso 2, pega la oferta completa con:{' '}
                          <strong>
                            empresa, puesto, requisitos y responsabilidades
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleEditResume}
          disabled={isSaving}
          size="lg"
          className="group"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar CV
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <Button
          onClick={handleSaveAndDashboard}
          disabled={isSaving}
          variant="outline"
          size="lg"
          className="group"
        >
          <Home className="w-4 h-4 mr-2" />
          Guardar y Volver
        </Button>

        <Button onClick={onStartOver} variant="ghost" size="lg">
          Crear Otro CV
        </Button>
      </div>

      {/* Info Footer */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          💾 Tu CV se guardará automáticamente en tu Dashboard al hacer clic en
          cualquier opción
        </p>
        <p>
          ✏️ Podrás editar todo el contenido más tarde desde el editor completo
        </p>
        {hasValidJobOffer && (
          <p className="text-primary font-medium">
            ✅ Se creará automáticamente una candidatura con la carta de
            presentación anexada
          </p>
        )}
        {!hasValidJobOffer && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded-lg max-w-2xl mx-auto">
            <p className="text-gray-900 font-medium text-sm">
              💡 Para aprovechar al máximo la Generación Express:
            </p>
            <p className="text-gray-700 text-xs mt-1">
              Pega una oferta de trabajo completa en el Paso 2 para generar:
              <br />• Carta de presentación personalizada • Candidatura
              automática con todos los datos • Mejor alineación del CV con
              requisitos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componentes auxiliares

const StatCard = ({ icon: IconComponent, label, value, color }) => {
  const Icon = IconComponent;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
};

const ResumePreview = ({ resume }) => (
  <div className="space-y-6">
    {/* Header */}
    <div className="border-b pb-4">
      <h3 className="text-2xl font-bold">
        {resume.personalInfo.firstName} {resume.personalInfo.lastName}
      </h3>
      <p className="text-lg text-primary font-medium mt-1">
        {resume.personalInfo.jobTitle}
      </p>
      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
        {resume.personalInfo.email && (
          <span>📧 {resume.personalInfo.email}</span>
        )}
        {resume.personalInfo.phone && (
          <span>📱 {resume.personalInfo.phone}</span>
        )}
        {resume.personalInfo.address && (
          <span>📍 {resume.personalInfo.address}</span>
        )}
      </div>
    </div>

    {/* Summary */}
    {resume.summary && (
      <Section title="Resumen Profesional">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {resume.summary}
        </p>
      </Section>
    )}

    {/* Experience */}
    {resume.experience && resume.experience.length > 0 && (
      <Section title="Experiencia Laboral">
        <div className="space-y-4">
          {resume.experience.map((exp, index) => (
            <ExperienceItem key={index} experience={exp} />
          ))}
        </div>
      </Section>
    )}

    {/* Education */}
    {resume.education && resume.education.length > 0 && (
      <Section title="Formación Académica">
        <div className="space-y-3">
          {resume.education.map((edu, index) => (
            <EducationItem key={index} education={edu} />
          ))}
        </div>
      </Section>
    )}

    {/* Skills */}
    {resume.skills && resume.skills.length > 0 && (
      <Section title="Habilidades">
        <div className="flex flex-wrap gap-2">
          {resume.skills.slice(0, 12).map((skill, index) => (
            <Badge key={index} variant="secondary">
              {skill.name}
              {skill.rating && (
                <span className="ml-1">
                  {'⭐'.repeat(Math.min(skill.rating, 5))}
                </span>
              )}
            </Badge>
          ))}
        </div>
      </Section>
    )}
  </div>
);

const CoverLetterPreview = ({ coverLetter, coverLetterText }) => (
  <div className="space-y-4">
    <div className="prose prose-sm max-w-none">
      <p className="font-medium">{coverLetter.greeting}</p>

      <p className="mt-4">{coverLetter.opening}</p>

      {coverLetter.body.map((paragraph, index) => (
        <p key={index} className="mt-4">
          {paragraph.content}
        </p>
      ))}

      <p className="mt-4">{coverLetter.closing}</p>

      <p className="mt-4 font-medium whitespace-pre-line">
        {coverLetter.signature}
      </p>
    </div>

    {/* Metadata */}
    {coverLetter.metadata && (
      <div className="border-t pt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Tono:</span>
          <Badge variant="outline">{coverLetter.metadata.tone}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Palabras:</span>
          <Badge variant="outline">
            {coverLetter.metadata.wordCount ||
              coverLetterText?.split(/\s+/).length}
          </Badge>
        </div>
      </div>
    )}

    {/* Download button */}
    <Button variant="outline" className="w-full">
      <Download className="w-4 h-4 mr-2" />
      Descargar Carta (TXT)
    </Button>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <h4 className="text-lg font-semibold mb-3 border-b pb-2">{title}</h4>
    {children}
  </div>
);

const ExperienceItem = ({ experience }) => (
  <div className="space-y-2">
    <div>
      <h5 className="font-medium">{experience.title}</h5>
      <p className="text-sm text-muted-foreground">
        {experience.company} • {experience.location}
      </p>
      <p className="text-xs text-muted-foreground">
        {experience.startDate} -{' '}
        {experience.current ? 'Presente' : experience.endDate}
      </p>
    </div>
    {experience.description && (
      <p className="text-sm text-muted-foreground italic">
        {experience.description}
      </p>
    )}
    {experience.achievements && experience.achievements.length > 0 && (
      <ul className="space-y-1 text-sm">
        {experience.achievements.map((achievement, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span className="text-muted-foreground">{achievement}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const EducationItem = ({ education }) => (
  <div>
    <h5 className="font-medium">{education.degree}</h5>
    <p className="text-sm text-muted-foreground">
      {education.institution} • {education.location}
    </p>
    <p className="text-xs text-muted-foreground">{education.graduationYear}</p>
    {education.description && (
      <p className="text-sm text-muted-foreground mt-1">
        {education.description}
      </p>
    )}
  </div>
);

export default Step4Results;
