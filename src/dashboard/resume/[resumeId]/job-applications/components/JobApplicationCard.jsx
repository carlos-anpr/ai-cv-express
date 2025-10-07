import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from './StatusBadge';
import QuickActions from './QuickActions';
import {
  MapPin,
  Euro,
  Calendar,
  Building,
  Clock,
  FileText,
  MessageSquare,
  ExternalLink,
  Video,
  Bell,
} from 'lucide-react';

const JobApplicationCard = ({
  application,
  resumeId,
  onDelete,
  onStatusChange,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return null;
    return new Intl.NumberFormat('es-ES').format(salary);
  };

  const handleCardClick = () => {
    navigate(
      `/dashboard/resume/${resumeId}/job-applications/${application.id}`
    );
  };

  const getDaysAgo = (date) => {
    const diffTime = Date.now() - new Date(date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  // Calcular si la entrevista es próxima (dentro de 3 días)
  const getInterviewUrgency = (interviewDate) => {
    if (!interviewDate) return null;
    const diff = new Date(interviewDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { status: 'past', label: 'Realizada', urgent: false };
    if (days === 0) return { status: 'today', label: 'Hoy', urgent: true };
    if (days === 1)
      return { status: 'tomorrow', label: 'Mañana', urgent: true };
    if (days <= 3)
      return { status: 'soon', label: `En ${days} días`, urgent: true };
    return {
      status: 'scheduled',
      label: formatDate(interviewDate),
      urgent: false,
    };
  };

  const interviewInfo = getInterviewUrgency(application.interviewDate);

  return (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-200 bg-white">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex items-start gap-3 flex-1 min-w-0"
            onClick={handleCardClick}
          >
            {/* Icono Empresa */}
            <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0">
              <Building className="w-5 h-5 text-gray-600" />
            </div>

            {/* Título y Empresa */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-black line-clamp-2 leading-tight mb-1">
                {application.jobTitle}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {application.companyName}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions
            application={application}
            resumeId={resumeId}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        </div>

        {/* Estado */}
        <div className="mb-4" onClick={handleCardClick}>
          <StatusBadge status={application.status} showIcon={false} size="sm" />
        </div>

        {/* ALERTA DE ENTREVISTA - Integrada con elegancia */}
        {application.interviewDate && interviewInfo && (
          <div
            className={`mb-4 p-3 rounded-lg border transition-all ${
              interviewInfo.urgent
                ? 'bg-black text-white border-black'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {interviewInfo.urgent ? (
                  <Bell className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Calendar className="w-4 h-4 flex-shrink-0 text-gray-600" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold mb-0.5 ${
                      interviewInfo.urgent ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Entrevista
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      interviewInfo.urgent ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {interviewInfo.label}
                  </p>
                </div>
              </div>

              {/* Botón Enlace */}
              {application.interviewLink && interviewInfo.status !== 'past' && (
                <a
                  href={application.interviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                    interviewInfo.urgent
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Unirse
                </a>
              )}
            </div>
          </div>
        )}

        {/* Información Adicional */}
        <div className="space-y-2 mb-4" onClick={handleCardClick}>
          {/* Ubicación y Salario */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {application.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{application.location}</span>
              </div>
            )}
            {application.salary && (
              <div className="flex items-center gap-1.5">
                <Euro className="w-3.5 h-3.5 text-gray-400" />
                <span>{formatSalary(application.salary)}</span>
              </div>
            )}
          </div>

          {/* Modalidad */}
          {application.workMode && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded text-xs text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              <span className="capitalize font-medium">
                {application.workMode}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="pt-3 border-t border-gray-100"
          onClick={handleCardClick}
        >
          <div className="flex items-center justify-between">
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {application.coverLetterGenerated && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  <FileText className="w-3 h-3" />
                  Carta
                </span>
              )}
              {application.interviewSimulated && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  <MessageSquare className="w-3 h-3" />
                  Test
                </span>
              )}
              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Oferta
                </a>
              )}
            </div>

            {/* Fecha */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{getDaysAgo(application.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobApplicationCard;
