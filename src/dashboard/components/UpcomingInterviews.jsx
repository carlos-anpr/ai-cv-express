import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  MapPin,
  Video,
  Building,
  ExternalLink,
  Clock,
  Star,
} from 'lucide-react';
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
      <Card className="border-border sticky top-4">
        <CardHeader className="border-b border-border py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-black/5">
              <Star className="w-4 h-4" />
            </div>
            Top 10 Próximas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">
              No tienes entrevistas programadas
            </p>
            <p className="text-xs mt-1">
              Las entrevistas futuras aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border sticky top-4">
      <CardHeader className="border-b border-border py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-black/5">
              <Star className="w-4 h-4 text-foreground" />
            </div>
            <span>Top 10 Próximas</span>
          </CardTitle>
          <Badge variant="outline" className="bg-secondary text-xs">
            {upcomingInterviews.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {upcomingInterviews.map((interview) => {
          const daysUntil = getDaysUntil(interview.interviewDate);

          return (
            <div
              key={interview.id}
              onClick={() => handleInterviewClick(interview)}
              className={`
                group relative p-3 rounded-lg border transition-all duration-300 cursor-pointer
                ${
                  daysUntil.urgent
                    ? 'bg-red-50/50 border-red-200 hover:bg-red-50 hover:border-red-300 hover:shadow-lg'
                    : 'bg-secondary/30 border-border hover:bg-secondary hover:border-black/20 hover:shadow-lg'
                }
                hover:scale-[1.02] hover:-translate-y-0.5
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-black transition-colors">
                    {interview.jobTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Building className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{interview.companyName}</span>
                  </p>
                </div>
                <Badge
                  className={`flex-shrink-0 text-xs h-5 ${
                    daysUntil.urgent
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-black hover:bg-black/90'
                  }`}
                >
                  {daysUntil.text}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {formatDate(interview.interviewDate)}
                  </span>
                </div>

                {interview.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{interview.location}</span>
                  </div>
                )}

                {interview.interviewLink && (
                  <a
                    href={interview.interviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-black hover:text-black/80 font-medium group/link"
                  >
                    <Video className="w-3 h-3 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
                    <span className="truncate">Unirse</span>
                    <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
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
