import React, { useEffect, useState } from 'react';
import AddResume from './components/AddResume';
import AddExpressCard from './components/AddExpressCard';
import { useUser } from '@clerk/clerk-react';
import LocalDatabase from '../services/LocalDatabase';
import ResumeCardItem from './components/ResumeCardItem';
import { toast } from 'sonner';
import { Loader2Icon } from 'lucide-react';

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
      <h2 className="font-bold text-3xl">Mis Currículums</h2>
      <p className="text-gray-600 mt-1">Comienza a crear tu currículum con IA para tu próximo trabajo</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-10">
        {/* Express Generation Card - Destacada */}
        <AddExpressCard />

        {/* Create Resume Card - Original */}
        <AddResume />

        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <Loader2Icon className="animate-spin h-5 w-5" />
              <p>Cargando CVs...</p>
            </div>
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
