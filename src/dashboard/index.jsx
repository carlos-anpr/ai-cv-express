import React, { useEffect, useState } from 'react';
import AddResume from './components/AddResume';
import { useUser } from '@clerk/clerk-react';
import LocalDatabase from '../services/LocalDatabase';
import ResumeCardItem from './components/ResumeCardItem';
import { toast } from 'sonner';

function Dashboard() {
  const { user } = useUser();
  const [resumeList, setResumeList] = useState([]);
  const [loading, setLoading] = useState(false);

  const GetResumeList = React.useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      return;
    }

    setLoading(true);
    try {
      // Debug: Verificar estado de la base de datos
      await LocalDatabase.DebugDatabaseStatus();
      await LocalDatabase.DebugListAllResumes();

      const response = await LocalDatabase.GetUserResumes(
        user.primaryEmailAddress.emailAddress
      );
      console.log('✅ CVs cargados:', response.data);
      setResumeList(response.data || []);
    } catch (error) {
      console.error('❌ Error cargando CVs:', error);
      toast.error('Error al cargar los CVs');
      setResumeList([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    GetResumeList();
  }, [GetResumeList]);

  return (
    <div className="p-10 md:px-20 lg:px-32">
      <h2 className="font-bold text-3xl">My Resume</h2>
      <p>Start Creating AI resume to your next Job role</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10">
        <AddResume />
        {loading ? (
          <div className="col-span-4 text-center py-8">
            <p>Cargando CVs...</p>
          </div>
        ) : (
          resumeList.length > 0 &&
          resumeList.map((resume, index) => (
            <ResumeCardItem
              resume={resume}
              key={index}
              refreshData={GetResumeList}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
