import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import LocalDatabase from '@/services/LocalDatabase';
import InterviewsHeader from '../components/InterviewsHeader';
import InterviewCalendar from '../components/InterviewCalendar';
import UpcomingInterviews from '../components/UpcomingInterviews';
import { toast } from 'sonner';

function InterviewsPage() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    const loadInterviews = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        setLoading(true);
        const response = await LocalDatabase.GetAllInterviews(
          user.primaryEmailAddress.emailAddress
        );

        if (response.success) {
          setInterviews(response.data || []);
        }
      } catch (error) {
        console.error('Error cargando entrevistas:', error);
        toast.error('Error al cargar las entrevistas');
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, [user]);

  const handleMonthChange = (year, month) => {
    setSelectedMonth(new Date(year, month, 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando entrevistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 space-y-4 max-w-7xl">
        <InterviewsHeader
          interviews={interviews}
          selectedMonth={selectedMonth}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <InterviewCalendar
              interviews={interviews}
              onMonthChange={handleMonthChange}
            />
          </div>

          <div>
            <UpcomingInterviews interviews={interviews} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewsPage;
