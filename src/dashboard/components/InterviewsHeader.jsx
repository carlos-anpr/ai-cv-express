import React from 'react';
import { Calendar, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

function InterviewsHeader({ interviews = [], selectedMonth }) {
  const today = new Date();
  const displayMonth = selectedMonth || today;
  const currentMonth = displayMonth.getMonth();
  const currentYear = displayMonth.getFullYear();

  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // Entrevistas del mes seleccionado
  const monthInterviews = interviews.filter((interview) => {
    try {
      const interviewDate = new Date(interview.interviewDate);
      return (
        interviewDate >= startOfMonth &&
        interviewDate <= endOfMonth &&
        interviewDate.getMonth() === currentMonth &&
        interviewDate.getFullYear() === currentYear
      );
    } catch {
      return false;
    }
  });

  const pendingCount = monthInterviews.filter((interview) => {
    const interviewDate = new Date(interview.interviewDate);
    return interviewDate >= today;
  }).length;

  // Total de entrevistas próximas (todas las futuras)
  const upcomingTotal = interviews.filter((interview) => {
    try {
      const interviewDate = new Date(interview.interviewDate);
      return interviewDate >= today;
    } catch {
      return false;
    }
  }).length;

  const monthName = displayMonth.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-background border border-border rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Título compacto */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Entrevistas Programadas
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona y prepara tus próximas entrevistas
          </p>
        </div>

        {/* Stats Cards Compactas */}
        <div className="flex flex-wrap gap-3">
          {/* Este mes */}
          <div className="group relative px-4 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-black/5 group-hover:bg-black/10 transition-colors">
                <Calendar className="w-4 h-4 text-foreground" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium capitalize">
                  {monthName}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold">{monthInterviews.length}</p>
                  <span className="text-xs text-muted-foreground">
                    ({pendingCount} pend.)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total próximas */}
          <div className="group relative px-4 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-black/5 group-hover:bg-black/10 transition-colors">
                <TrendingUp
                  className="w-4 h-4 text-foreground"
                  strokeWidth={2}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Total Próximas
                </p>
                <p className="text-2xl font-bold">{upcomingTotal}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewsHeader;
