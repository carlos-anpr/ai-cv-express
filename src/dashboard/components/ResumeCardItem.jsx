import {
  Loader2Icon,
  MoreVertical,
  Briefcase,
  FileText,
  Calendar,
  User,
  Eye,
  Edit3,
  Download,
  Trash2,
  ExternalLink,
  Globe,
  Zap,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import LocalDatabase from '../../services/LocalDatabase';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';

function ResumeCardItem({ resume, refreshData }) {
  const navigation = useNavigate();
  const { user } = useUser();
  const [openAlert, setOpenAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    applications: 0,
    coverLetters: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [nextInterview, setNextInterview] = useState(null);

  // Cargar estadísticas del CV
  useEffect(() => {
    const loadStats = async () => {
      if (!resume?.id || !user?.primaryEmailAddress?.emailAddress) {
        setLoadingStats(false);
        return;
      }

      try {
        // Obtener candidaturas
        const applicationsResponse =
          await LocalDatabase.GetJobApplicationsByResume(
            resume.id,
            user.primaryEmailAddress.emailAddress
          );

        const applications = applicationsResponse?.data || [];

        // Contar cartas de presentación: cada candidatura puede tener una carta
        let coverLettersCount = 0;
        for (const app of applications) {
          try {
            const coverLetterResponse =
              await LocalDatabase.GetCoverLetterByApplication(app.id);
            if (coverLetterResponse?.data) {
              coverLettersCount++;
            }
          } catch {
            // Ignorar errores individuales (candidatura sin carta)
          }
        }

        // Buscar la próxima entrevista (fecha más cercana en el futuro)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingInterviews = applications
          .filter((app) => {
            if (!app.interviewDate) return false;
            const interviewDate = new Date(app.interviewDate);
            return interviewDate >= today;
          })
          .sort(
            (a, b) => new Date(a.interviewDate) - new Date(b.interviewDate)
          );

        if (upcomingInterviews.length > 0) {
          setNextInterview(upcomingInterviews[0]);
        }

        setStats({
          applications: applications.length,
          coverLetters: coverLettersCount,
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        setStats({ applications: 0, coverLetters: 0 });
        setNextInterview(null);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [resume, user]);

  const onDelete = async () => {
    setLoading(true);

    try {
      const response = await LocalDatabase.DeleteResumeById(resume.documentId);
      console.log('✅ CV eliminado:', response);
      toast.success('CV eliminado correctamente');
      refreshData();
      setOpenAlert(false);
    } catch (error) {
      console.error('❌ Error eliminando CV:', error);
      toast.error(error.message || 'Error al eliminar el CV');
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Obtener nombre completo
  const fullName =
    [resume.firstName, resume.lastName].filter(Boolean).join(' ') ||
    'Sin nombre';

  // Detectar si es generación Express
  const isExpressGeneration =
    resume.title?.includes('Express') || resume.isExpress || false;

  return (
    <div className="group relative">
      {/* Card Principal */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Header con color temático */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: resume?.themeColor || '#3b82f6' }}
        />

        {/* Contenido Principal */}
        <Link
          to={'/dashboard/resume/' + resume.documentId + '/edit'}
          className="flex-1 p-5 hover:bg-gray-50/50 transition-colors"
        >
          {/* Título y Dropdown (superpuesto) */}
          <div className="flex items-start justify-between mb-4 relative">
            <div className="flex-1 pr-8">
              <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                <h3 className="font-semibold text-gray-900 text-base line-clamp-2 leading-tight flex-1 min-w-0">
                  {resume.title}
                </h3>
              </div>
              {isExpressGeneration && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-900 text-gray-100 flex-shrink-0 mb-1.5 border border-gray-700"
                  title="Generado con IA Express"
                >
                  <Zap className="h-2.5 w-2.5 text-yellow-400" />
                  <span>Express</span>
                </span>
              )}
              <p className="text-xs text-gray-500 font-medium">
                {resume.jobTitle || 'Sin puesto'}
              </p>
            </div>

            {/* Dropdown Menu - mantiene su posición */}
            <div
              className="absolute top-0 right-0 z-10"
              onClick={(e) => e.preventDefault()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      navigation(
                        '/dashboard/resume/' + resume.documentId + '/edit'
                      )
                    }
                    className="cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      navigation('/my-resume/' + resume.documentId + '/view')
                    }
                    className="cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Vista previa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      navigation(
                        '/dashboard/resume/' +
                          resume.documentId +
                          '/job-applications'
                      )
                    }
                    className="cursor-pointer"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Candidaturas
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      navigation('/my-resume/' + resume.documentId + '/view')
                    }
                    className="cursor-pointer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      navigation(
                        `/dashboard/resume/${resume.documentId}/edit?tab=webpage`
                      )
                    }
                    className="cursor-pointer"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Ver como Página Web
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setOpenAlert(true)}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Información del Candidato */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium truncate">{fullName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span>Actualizado {formatDate(resume.updatedAt)}</span>
            </div>

            {/* Próxima Entrevista */}
            {!loadingStats && nextInterview && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigation(
                    `/dashboard/resume/${resume.documentId}/job-applications/${nextInterview.id}`
                  );
                }}
                className="flex items-center gap-2 text-xs font-semibold mt-2 px-2 py-1.5 rounded-md border hover:shadow-sm transition-all cursor-pointer w-full"
                style={{
                  backgroundColor: `${resume?.themeColor || '#3b82f6'}10`,
                  borderColor: `${resume?.themeColor || '#3b82f6'}30`,
                  color: resume?.themeColor || '#3b82f6',
                }}
              >
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  Entrevista: {formatDate(nextInterview.interviewDate)}
                </span>
              </button>
            )}

            {/* Estadísticas compactas */}
            {!loadingStats && stats.applications > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigation(
                    '/dashboard/resume/' +
                      resume.documentId +
                      '/job-applications'
                  );
                }}
                className="flex items-center gap-2 text-xs font-semibold mt-2 px-2 py-1.5 rounded-md border hover:shadow-sm transition-all cursor-pointer w-full"
                style={{
                  backgroundColor: `${resume?.themeColor || '#3b82f6'}10`,
                  borderColor: `${resume?.themeColor || '#3b82f6'}30`,
                  color: resume?.themeColor || '#3b82f6',
                }}
              >
                <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  {stats.applications}{' '}
                  {stats.applications === 1 ? 'Candidatura' : 'Candidaturas'}
                </span>
              </button>
            )}

            {!loadingStats && stats.coverLetters > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigation(
                    '/dashboard/resume/' +
                      resume.documentId +
                      '/job-applications'
                  );
                }}
                className="flex items-center gap-2 text-xs font-semibold mt-2 px-2 py-1.5 rounded-md border hover:shadow-sm transition-all cursor-pointer w-full"
                style={{
                  backgroundColor: `${resume?.themeColor || '#3b82f6'}10`,
                  borderColor: `${resume?.themeColor || '#3b82f6'}30`,
                  color: resume?.themeColor || '#3b82f6',
                }}
              >
                <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  {stats.coverLetters}{' '}
                  {stats.coverLetters === 1 ? 'Carta' : 'Cartas'}
                </span>
              </button>
            )}
          </div>
        </Link>

        {/* Footer con color temático */}
        <div
          className="px-5 py-3 flex items-center justify-between border-t border-gray-100"
          style={{
            backgroundColor: `${resume?.themeColor || '#3b82f6'}08`,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
              style={{ backgroundColor: resume?.themeColor || '#3b82f6' }}
            />
            <span className="text-xs font-medium text-gray-600">
              Color del tema
            </span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              navigation('/dashboard/resume/' + resume.documentId + '/edit');
            }}
            className="text-xs font-medium hover:underline flex items-center gap-1 transition-colors"
            style={{ color: resume?.themeColor || '#3b82f6' }}
          >
            Editar
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Alert Dialog para Eliminar */}
      <AlertDialog open={openAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              tu currículum <strong>"{resume.title}"</strong> y todos los datos
              asociados (candidaturas, cartas de presentación, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlert(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <Loader2Icon className="animate-spin h-4 w-4" />
              ) : (
                'Eliminar definitivamente'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ResumeCardItem;
