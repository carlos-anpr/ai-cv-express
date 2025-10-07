import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building, Calendar, MapPin, Video } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
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

        <div className="space-y-3 mt-4">
          {interviews?.map((interview) => (
            <div
              key={interview.id}
              onClick={() => handleSelectInterview(interview)}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {interview.jobTitle}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Building className="w-3.5 h-3.5" />
                    {interview.companyName}
                  </p>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {formatTime(interview.interviewDate)}
                </span>
              </div>

              {interview.location && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {interview.location}
                </p>
              )}

              {interview.interviewLink && (
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <Video className="w-3.5 h-3.5" />
                  <span>Videollamada programada</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InterviewDayModal;
