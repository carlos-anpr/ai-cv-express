import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return null;
    return new Intl.NumberFormat('es-ES').format(salary) + '€';
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

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group relative">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0" onClick={handleCardClick}>
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {application.jobTitle}
              </h3>
            </div>
            <p className="text-gray-600 font-medium mb-1">
              {application.companyName}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(application.applicationDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{getDaysAgo(application.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={application.status} showIcon={true} />
            <QuickActions
              application={application}
              resumeId={resumeId}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div onClick={handleCardClick}>
          {/* Información adicional */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
            {application.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{application.location}</span>
              </div>
            )}
            {application.salary && (
              <div className="flex items-center gap-1">
                <Euro className="w-3 h-3" />
                <span>{formatSalary(application.salary)}</span>
              </div>
            )}
            {application.workMode && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="capitalize">{application.workMode}</span>
              </div>
            )}
          </div>

          {/* Descripción truncada */}
          {application.jobDescription && (
            <p className="text-sm text-gray-700 line-clamp-2 mb-3">
              {application.jobDescription.substring(0, 120)}
              {application.jobDescription.length > 120 && '...'}
            </p>
          )}
        </div>

        {/* Indicadores de herramientas */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            {application.coverLetterGenerated && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                <FileText className="w-3 h-3" />
                <span>Carta</span>
              </div>
            )}
            {application.interviewSimulated && (
              <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                <MessageSquare className="w-3 h-3" />
                <span>Entrevista</span>
              </div>
            )}
          </div>

          {application.jobUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 p-1"
              onClick={(e) => {
                e.stopPropagation();
                window.open(application.jobUrl, '_blank');
              }}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobApplicationCard;
