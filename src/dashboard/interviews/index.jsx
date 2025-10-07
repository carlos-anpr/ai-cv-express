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

  const handleMonthChange = () => {
    // Placeholder: calendar month change is handled inside the calendar component
    // and could be used here in future if needed.
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando entrevistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <InterviewsHeader interviews={interviews} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
  );
}

export default InterviewsPage;
