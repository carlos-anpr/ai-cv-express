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
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  FileText,
  MessageSquare,
  Brain,
  ExternalLink,
  Calendar,
  MapPin,
  Euro,
  User,
  Mail,
  Building,
  Briefcase,
  Phone,
  Sparkles,
} from 'lucide-react';
import LocalDatabase from '@/services/LocalDatabase';
import { getStatusLabel, getStatusColor } from '@/services/types';
import { toast } from 'sonner';

function JobApplicationDetail() {
  const { resumeId, applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasInterviewSimulation, setHasInterviewSimulation] = useState(false);

  const loadApplication = React.useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setLoading(true);
      const response = await LocalDatabase.GetJobApplicationById(
        applicationId,
        user.primaryEmailAddress.emailAddress
      );
      console.log('✅ Candidatura cargada:', response.data);
      setApplication(response.data);

      // Verificar si existe una simulación de entrevista
      const simulationResponse =
        await LocalDatabase.GetInterviewSimulationByJobApplication(
          applicationId,
          user.primaryEmailAddress.emailAddress
        );
      setHasInterviewSimulation(!!simulationResponse.data);
    } catch (error) {
      console.error('❌ Error cargando candidatura:', error);
      toast.error('Error al cargar la candidatura');
    } finally {
      setLoading(false);
    }
  }, [applicationId, user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleGoBack = () => {
    navigate(`/dashboard/resume/${resumeId}/job-applications`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando candidatura...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Candidatura no encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              La candidatura que buscas no existe o ha sido eliminada
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al listado
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
              {application.jobTitle}
            </h1>
            <p className="text-xl text-gray-600 mt-1">
              {application.companyName}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                `/dashboard/resume/${resumeId}/job-applications/${applicationId}/edit`
              )
            }
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            onClick={() =>
              navigate(
                `/dashboard/resume/${resumeId}/job-applications/${applicationId}/cover-letter`
              )
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Carta de Presentación
          </Button>
          <Button
            onClick={() =>
              navigate(
                `/dashboard/resume/${resumeId}/job-applications/${applicationId}/interview-simulation`
              )
            }
            className={
              hasInterviewSimulation
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }
          >
            {hasInterviewSimulation ? (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Ver Test de Preparación
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generar Test de Preparación
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estado y detalles básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Candidatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getStatusColor(
                      application.status
                    )} text-white`}
                  >
                    {getStatusLabel(application.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Candidatura: {formatDate(application.applicationDate)}
                  </span>
                </div>
                {application.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{application.location}</span>
                  </div>
                )}
                {application.salary && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Euro className="w-4 h-4" />
                    <span>{application.salary.toLocaleString()}€/año</span>
                  </div>
                )}
                {application.workMode && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span className="capitalize">{application.workMode}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Descripción del puesto */}
          {application.jobDescription && (
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {application.jobDescription}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requisitos */}
          {application.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {application.requirements}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Beneficios */}
          {application.benefits && (
            <Card>
              <CardHeader>
                <CardTitle>Beneficios y Ventajas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {application.benefits}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {application.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Barra lateral */}
        <div className="space-y-6">
          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.contactPerson && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{application.contactPerson}</span>
                </div>
              )}
              {application.contactEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a
                    href={`mailto:${application.contactEmail}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {application.contactEmail}
                  </a>
                </div>
              )}
              {application.contactPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a
                    href={`tel:${application.contactPhone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {application.contactPhone}
                  </a>
                </div>
              )}
              {application.jobUrl && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver oferta original
                  </a>
                </div>
              )}
              {application.interviewDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Entrevista: {formatDate(application.interviewDate)}
                  </span>
                </div>
              )}
              {application.interviewLink && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  <a
                    href={application.interviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Unirse a la entrevista
                  </a>
                </div>
              )}
              {!application.contactPerson &&
                !application.contactEmail &&
                !application.contactPhone &&
                !application.jobUrl && (
                  <p className="text-sm text-gray-500 italic">
                    No se ha añadido información de contacto
                  </p>
                )}
            </CardContent>
          </Card>

          {/* Herramientas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Herramientas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  navigate(
                    `/dashboard/resume/${resumeId}/job-applications/${applicationId}/cover-letter`
                  )
                }
              >
                <FileText className="w-4 h-4 mr-2" />
                Carta de Presentación
                {application.coverLetterGenerated && (
                  <Badge variant="outline" className="ml-auto">
                    Generada
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  navigate(
                    `/dashboard/resume/${resumeId}/job-applications/${applicationId}/interview-simulation`
                  )
                }
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Simulación Entrevista
                {application.interviewSimulated && (
                  <Badge variant="outline" className="ml-auto">
                    Realizada
                  </Badge>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Metadatos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <div>
                <strong>Creada:</strong> {formatDate(application.createdAt)}
              </div>
              {application.updatedAt !== application.createdAt && (
                <div>
                  <strong>Actualizada:</strong>{' '}
                  {formatDate(application.updatedAt)}
                </div>
              )}
              <div>
                <strong>Nivel detectado:</strong>{' '}
                {application.candidateLevel || 'No detectado'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default JobApplicationDetail;
