import React from 'react';
import { Calendar } from 'lucide-react';

function InterviewsHeader({ interviews = [] }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

  const monthInterviewsCount = interviews.filter((interview) => {
    try {
      const interviewDate = new Date(interview.interviewDate);
      return (
        interviewDate >= today &&
        interviewDate <= endOfMonth &&
        interviewDate.getMonth() === currentMonth &&
        interviewDate.getFullYear() === currentYear
      );
    } catch {
      return false;
    }
  }).length;

  const monthName = today.toLocaleDateString('es-ES', { month: 'long' });

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Entrevistas Programadas</h2>
          <p className="text-blue-100">
            Gestiona y prepara tus próximas entrevistas
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Calendar className="w-5 h-5" />
            <span className="text-blue-100 capitalize">
              Este mes ({monthName})
            </span>
          </div>
          <div className="text-5xl font-bold">{monthInterviewsCount}</div>
          <p className="text-blue-100 text-sm mt-1">
            {monthInterviewsCount === 1
              ? 'entrevista por hacer'
              : 'entrevistas por hacer'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default InterviewsHeader;
