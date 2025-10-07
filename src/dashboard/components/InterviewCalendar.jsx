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
      days.push(<div key={`empty-${i}`} className="p-2 h-24" />);
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
            p-2 h-24 border border-gray-200 rounded-lg transition-all
            ${
              hasInterviews
                ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                : 'bg-white'
            }
            ${isToday ? 'ring-2 ring-blue-500' : ''}
          `}
          onClick={() => hasInterviews && handleDayClick(day)}
        >
          <div
            className={`text-sm font-medium ${
              isToday ? 'text-blue-600' : 'text-gray-900'
            }`}
          >
            {day}
          </div>
          {hasInterviews && (
            <div className="mt-1 space-y-1">
              {interviewsByDay[day].slice(0, 2).map((interview, idx) => (
                <div
                  key={idx}
                  className="text-xs p-1 bg-blue-600 text-white rounded truncate"
                  title={`${interview.companyName} - ${interview.jobTitle}`}
                >
                  {interview.companyName}
                </div>
              ))}
              {interviewsByDay[day].length > 2 && (
                <div className="text-xs text-blue-600 font-medium">
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {MONTHS[month]} {year}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 p-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
        </CardContent>
      </Card>

      <InterviewDayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        interviews={selectedDayInterviews}
        date={selectedDate}
      />
    </>
  );
}

export default InterviewCalendar;
