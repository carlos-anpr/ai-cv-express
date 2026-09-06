import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Briefcase,
  FileText,
  MessageSquare,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import JobApplicationCard from './components/JobApplicationCard';
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
      for (const app of apps) {
        const coverLetterResponse =
          await LocalDatabase.GetCoverLetterByApplication(app.id);
        if (coverLetterResponse.success && coverLetterResponse.data) {
          coverLetterCount++;
        }
      }
      setCoverLetterStats(coverLetterCount);
    } catch (error) {
      console.error('Error cargando estadísticas de cartas:', error);
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

      const apps = response.data || [];
      setApplications(apps);
      setFilteredApplications(apps);

      await loadCoverLetterStats(apps);
    } catch (error) {
      console.error('Error cargando candidaturas:', error);
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
      console.error('Error cargando información del CV:', error);
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
      await LocalDatabase.DeleteJobApplication(
        applicationId,
        user.primaryEmailAddress.emailAddress
      );
      await loadApplications();
    } catch (error) {
      console.error('Error eliminando candidatura:', error);
      throw error;
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await LocalDatabase.UpdateJobApplication(
        applicationId,
        {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        },
        user.primaryEmailAddress.emailAddress
      );
      await loadApplications();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Cargando candidaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Título */}
            <div className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-black -ml-3 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al dashboard
              </Button>

              <h1 className="text-3xl font-bold text-black mb-2">
                Mis Candidaturas
              </h1>
              <p className="text-gray-600">
                {resumeInfo?.firstName && resumeInfo?.lastName
                  ? `CV de ${resumeInfo.firstName} ${resumeInfo.lastName}`
                  : 'Gestiona y realiza seguimiento de tus candidaturas'}
              </p>
            </div>

            {/* Botón Nueva Candidatura */}
            <Button
              onClick={() =>
                navigate(`/dashboard/resume/${resumeId}/job-applications/new`)
              }
              className="bg-black text-white hover:bg-gray-900 px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Candidatura
            </Button>
          </div>

          {/* Estadísticas Minimalistas */}
          {applications.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Total
                  </span>
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-black">
                  {applications.length}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Enviadas
                  </span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <p className="text-2xl font-bold text-black">
                  {
                    applications.filter((app) => app.status === 'applied')
                      .length
                  }
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Entrevistas
                  </span>
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-black">
                  {
                    applications.filter((app) => app.status === 'interview')
                      .length
                  }
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Con Carta
                  </span>
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-black">
                  {coverLetterStats}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros Minimalistas */}
        {applications.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por empresa, puesto o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-11 border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-lg bg-white"
                />
              </div>

              {/* Filtros Estado */}
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className={
                    statusFilter === 'all'
                      ? 'bg-black text-white hover:bg-gray-900 border-0'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                  }
                >
                  Todas
                </Button>
                <Button
                  variant={statusFilter === 'draft' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('draft')}
                  className={
                    statusFilter === 'draft'
                      ? 'bg-black text-white hover:bg-gray-900 border-0'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                  }
                >
                  Borradores
                </Button>
                <Button
                  variant={statusFilter === 'applied' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('applied')}
                  className={
                    statusFilter === 'applied'
                      ? 'bg-black text-white hover:bg-gray-900 border-0'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                  }
                >
                  Enviadas
                </Button>
                <Button
                  variant={statusFilter === 'interview' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('interview')}
                  className={
                    statusFilter === 'interview'
                      ? 'bg-black text-white hover:bg-gray-900 border-0'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                  }
                >
                  Entrevistas
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Candidaturas */}
        {filteredApplications.length === 0 && applications.length === 0 ? (
          // Estado Vacío Minimalista
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-6">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-3">
              No tienes candidaturas aún
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Crea tu primera candidatura y comienza a realizar seguimiento
              profesional
            </p>
            <Button
              onClick={() =>
                navigate(`/dashboard/resume/${resumeId}/job-applications/new`)
              }
              className="bg-black text-white hover:bg-gray-900 px-6 py-2.5 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Candidatura
            </Button>
          </div>
        ) : filteredApplications.length === 0 ? (
          // No hay resultados
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">
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
              className="border-gray-200 bg-white"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          // Grid de Cards
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
    </div>
  );
}

export default JobApplications;
