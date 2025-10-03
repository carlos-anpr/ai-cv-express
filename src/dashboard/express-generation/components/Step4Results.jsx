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
  } = generatedData;

  // Ocultar confetti después de 5 segundos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Guardar y navegar al editor
  const handleEditResume = async () => {
    try {
      setIsSaving(true);

      // Guardar en IndexedDB
      const savedResume = await LocalDatabase.CreateNewResume(resumeForDB);

      toast.success('CV guardado exitosamente');

      // Navegar al editor
      navigate(`/dashboard/resume/${savedResume.documentId}/edit`);
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

      // Guardar en IndexedDB
      await LocalDatabase.CreateNewResume(resumeForDB);

      toast.success('CV guardado en tu Dashboard');

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
            Tu CV y carta de presentación han sido generados con éxito. Revisa
            los resultados y decide tu siguiente paso.
          </p>
        </div>
      </div>

      {/* Success Message with stats */}
      <SuccessMessage title="Todo listo para aplicar">
        <div className="grid grid-cols-2 gap-4 mt-4">
          <StatCard
            icon={FileText}
            label="CV Completo"
            value="100%"
            color="text-blue-600"
          />
          <StatCard
            icon={Mail}
            label="Carta Lista"
            value="100%"
            color="text-green-600"
          />
        </div>
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
