import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Calendar,
  Briefcase,
  Search,
  Filter,
  MessageSquare,
  FileText,
} from 'lucide-react';
import JobApplicationCard from './components/JobApplicationCard';
import StatusBadge from './components/StatusBadge';
import LocalDatabase from '@/services/LocalDatabase';
import { toast } from 'sonner';

function JobApplications() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeInfo, setResumeInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coverLetterStats, setCoverLetterStats] = useState(0);

  const loadCoverLetterStats = React.useCallback(async (apps) => {
    try {
      let coverLetterCount = 0;

      // Verificar cada candidatura para ver si tiene carta
      for (const app of apps) {
        const coverLetterResponse =
          await LocalDatabase.GetCoverLetterByApplication(app.id);
        if (coverLetterResponse.success && coverLetterResponse.data) {
          coverLetterCount++;
        }
      }

      console.log(
        `📊 Cartas encontradas: ${coverLetterCount} de ${apps.length} candidaturas`
      );
      setCoverLetterStats(coverLetterCount);
    } catch (error) {
      console.error('❌ Error cargando estadísticas de cartas:', error);
      setCoverLetterStats(0);
    }
  }, []);

  const loadApplications = React.useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setLoading(true);
      const response = await LocalDatabase.GetJobApplicationsByResume(
        resumeId,
        user.primaryEmailAddress.emailAddress
      );
      console.log('✅ Candidaturas cargadas:', response.data);
      const apps = response.data || [];

      // Debug: ver el estado de coverLetterGenerated en cada candidatura
      console.log('🔍 Estado coverLetterGenerated por candidatura:');
      apps.forEach((app, index) => {
        console.log(
          `  ${index + 1}. ${app.companyName} - coverLetterGenerated: ${
            app.coverLetterGenerated
          }`
        );
      });

      setApplications(apps);
      setFilteredApplications(apps);

      // Cargar estadísticas de cartas de presentación
      await loadCoverLetterStats(apps);
    } catch (error) {
      console.error('❌ Error cargando candidaturas:', error);
      toast.error('Error al cargar las candidaturas');
    } finally {
      setLoading(false);
    }
  }, [resumeId, user?.primaryEmailAddress?.emailAddress, loadCoverLetterStats]);

  const loadResumeInfo = React.useCallback(async () => {
    try {
      const response = await LocalDatabase.GetResumeById(resumeId);
      setResumeInfo(response.data);
    } catch (error) {
      console.error('❌ Error cargando información del CV:', error);
    }
  }, [resumeId]);

  useEffect(() => {
    loadApplications();
    loadResumeInfo();
  }, [loadApplications, loadResumeInfo]);

  // Filtrado y búsqueda
  useEffect(() => {
    let filtered = applications;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.location &&
            app.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter]);

  const handleDeleteApplication = async (applicationId) => {
    try {
      await LocalDatabase.DeleteJobApplication(applicationId);
      loadApplications();
    } catch (error) {
      console.error('❌ Error eliminando candidatura:', error);
      throw error;
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await LocalDatabase.UpdateJobApplication(applicationId, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      loadApplications();
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando candidaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidaturas</h1>
          <p className="text-gray-600 mt-2">
            {resumeInfo?.firstName && resumeInfo?.lastName
              ? `CV de ${resumeInfo.firstName} ${resumeInfo.lastName}`
              : 'Gestiona tus candidaturas de trabajo'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="border-gray-300 hover:bg-gray-100"
          >
            Volver al Dashboard
          </Button>
          <Button
            onClick={() =>
              navigate(`/dashboard/resume/${resumeId}/job-applications/new`)
            }
            className="bg-black hover:bg-black/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Candidatura
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      {applications.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por empresa, puesto o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('draft')}
            >
              Borradores
            </Button>
            <Button
              variant={statusFilter === 'applied' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('applied')}
            >
              Enviadas
            </Button>
            <Button
              variant={statusFilter === 'interview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('interview')}
            >
              Entrevistas
            </Button>
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-gray-600 text-sm">Total Candidaturas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {
                    applications.filter((app) => app.status === 'applied')
                      .length
                  }
                </p>
                <p className="text-gray-600 text-sm">Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {
                    applications.filter((app) => app.status === 'interview')
                      .length
                  }
                </p>
                <p className="text-gray-600 text-sm">Entrevistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{coverLetterStats}</p>
                <p className="text-gray-600 text-sm">Con Carta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de candidaturas */}
      {filteredApplications.length === 0 && applications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes candidaturas aún
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza creando tu primera candidatura para un puesto de trabajo
            </p>
            <Button
              onClick={() =>
                navigate(`/dashboard/resume/${resumeId}/job-applications/new`)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Candidatura
            </Button>
          </CardContent>
        </Card>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron candidaturas
            </h3>
            <p className="text-gray-600 mb-6">
              Prueba a cambiar los filtros o el término de búsqueda
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <JobApplicationCard
              key={application.id}
              application={application}
              resumeId={resumeId}
              onDelete={handleDeleteApplication}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default JobApplications;
