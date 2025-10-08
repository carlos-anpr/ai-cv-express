import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, MapPin, Video, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function InterviewDayModal({ isOpen, onClose, interviews, date }) {
  const navigate = useNavigate();

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectInterview = (interview) => {
    navigate(
      `/dashboard/resume/${interview.resumeId}/job-applications/${interview.id}`
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 rounded-lg bg-black/5">
              <Calendar className="w-5 h-5" />
            </div>
            Entrevistas del{' '}
            {date?.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
            })}
          </DialogTitle>
          <DialogDescription>
            Tienes {interviews?.length} entrevista
            {interviews?.length !== 1 ? 's' : ''} programada
            {interviews?.length !== 1 ? 's' : ''} este día
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4 max-h-[500px] overflow-y-auto pr-2">
          {interviews?.map((interview) => (
            <div
              key={interview.id}
              onClick={() => handleSelectInterview(interview)}
              className="group relative p-5 border border-border rounded-xl hover:bg-secondary hover:border-black/20 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-3">
                  <h4 className="font-semibold text-foreground text-lg group-hover:text-black transition-colors">
                    {interview.jobTitle}
                  </h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Building className="w-4 h-4" />
                    {interview.companyName}
                  </p>
                </div>
                <Badge className="bg-black hover:bg-black/90 flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(interview.interviewDate)}
                </Badge>
              </div>

              <div className="space-y-2">
                {interview.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {interview.location}
                  </p>
                )}

                {interview.interviewLink && (
                  <div className="flex items-center gap-2 text-sm text-black font-medium">
                    <Video className="w-4 h-4" />
                    <span>Videollamada programada</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-black hover:text-white transition-all"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InterviewDayModal;
