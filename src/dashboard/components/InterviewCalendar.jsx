import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import InterviewDayModal from './InterviewDayModal';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function InterviewCalendar({ interviews = [], onMonthChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calcular días del mes
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  // Agrupar entrevistas por día
  const interviewsByDay = interviews.reduce((acc, interview) => {
    try {
      const date = new Date(interview.interviewDate);
      if (date.getMonth() === month && date.getFullYear() === year) {
        const day = date.getDate();
        if (!acc[day]) acc[day] = [];
        acc[day].push(interview);
      }
    } catch {
      // ignore invalid dates
    }
    return acc;
  }, {});

  // Modal state
  const [selectedDayInterviews, setSelectedDayInterviews] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Navegación de meses
  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth());
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth());
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onMonthChange?.(today.getFullYear(), today.getMonth());
  };

  const handleDayClick = (day) => {
    const dayInterviews = interviewsByDay[day];

    if (dayInterviews?.length === 1) {
      navigate(
        `/dashboard/resume/${dayInterviews[0].resumeId}/job-applications/${dayInterviews[0].id}`
      );
    } else if (dayInterviews?.length > 1) {
      setSelectedDayInterviews(dayInterviews);
      setSelectedDate(new Date(year, month, day));
      setIsModalOpen(true);
    }
  };

  // Renderizar días del calendario
  const renderCalendarDays = () => {
    const days = [];

    // Días vacíos al inicio
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-1.5 h-20" />);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const hasInterviews = interviewsByDay[day]?.length > 0;
      const isToday =
        new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={`
            group relative p-1.5 h-20 border rounded-lg transition-all duration-300
            ${
              hasInterviews
                ? 'bg-secondary/30 border-border hover:bg-secondary hover:border-black/20 hover:shadow-md cursor-pointer hover:scale-105'
                : 'bg-background border-border'
            }
            ${isToday ? 'ring-2 ring-black' : ''}
          `}
          onClick={() => hasInterviews && handleDayClick(day)}
        >
          <div
            className={`text-xs font-semibold ${
              isToday
                ? 'text-foreground'
                : hasInterviews
                ? 'text-foreground group-hover:text-black'
                : 'text-muted-foreground'
            }`}
          >
            {day}
          </div>
          {hasInterviews && (
            <div className="mt-0.5 space-y-0.5">
              {interviewsByDay[day].slice(0, 2).map((interview, idx) => (
                <div
                  key={idx}
                  className="text-[10px] p-1 bg-black text-white rounded transition-all group-hover:bg-black/90 truncate"
                  title={`${interview.companyName} - ${interview.jobTitle}`}
                >
                  {interview.companyName}
                </div>
              ))}
              {interviewsByDay[day].length > 2 && (
                <div className="text-[10px] text-foreground font-semibold">
                  +{interviewsByDay[day].length - 2} más
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      {/* Calendario */}
      <Card className="border-border">
        <CardHeader className="border-b border-border py-3 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl font-bold">
              {MONTHS[month]} {year}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="hover:bg-black hover:text-white transition-all h-8 text-xs"
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousMonth}
                className="hover:bg-black hover:text-white transition-all h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                className="hover:bg-black hover:text-white transition-all h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-muted-foreground p-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1.5">{renderCalendarDays()}</div>
        </CardContent>
      </Card>

      <InterviewDayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        interviews={selectedDayInterviews}
        date={selectedDate}
      />
    </div>
  );
}

export default InterviewCalendar;
