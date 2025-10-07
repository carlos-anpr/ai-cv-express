import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Video, Building, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function UpcomingInterviews({ interviews = [] }) {
  const navigate = useNavigate();

  const upcomingInterviews = interviews
    .filter((interview) => {
      try {
        const interviewDate = new Date(interview.interviewDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return interviewDate >= today;
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
    .slice(0, 10);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntil = (dateString) => {
    const interviewDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    interviewDate.setHours(0, 0, 0, 0);

    const diffTime = interviewDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Hoy', urgent: true };
    if (diffDays === 1) return { text: 'Mañana', urgent: true };
    if (diffDays <= 3) return { text: `En ${diffDays} días`, urgent: true };
    return { text: `En ${diffDays} días`, urgent: false };
  };

  const handleInterviewClick = (interview) => {
    navigate(
      `/dashboard/resume/${interview.resumeId}/job-applications/${interview.id}`
    );
  };

  if (upcomingInterviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Entrevistas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tienes entrevistas programadas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Próximas Entrevistas</CardTitle>
          <Badge variant="outline">
            {upcomingInterviews.length} entrevistas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingInterviews.map((interview) => {
          const daysUntil = getDaysUntil(interview.interviewDate);

          return (
            <div
              key={interview.id}
              onClick={() => handleInterviewClick(interview)}
              className={`
                p-4 rounded-lg border transition-all cursor-pointer
                ${
                  daysUntil.urgent
                    ? 'bg-red-50 border-red-200 hover:bg-red-100'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 line-clamp-1">
                    {interview.jobTitle}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Building className="w-3.5 h-3.5" />
                    {interview.companyName}
                  </p>
                </div>
                <Badge
                  className={daysUntil.urgent ? 'bg-red-600' : 'bg-blue-600'}
                >
                  {daysUntil.text}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(interview.interviewDate)}</span>
                </div>

                {interview.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{interview.location}</span>
                  </div>
                )}

                {interview.interviewLink && (
                  <a
                    href={interview.interviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Unirse a la entrevista</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default UpcomingInterviews;
