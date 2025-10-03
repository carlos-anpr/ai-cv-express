import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  MessageSquare,
  Brain,
  ExternalLink,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const QuickActions = ({ application, resumeId, onDelete, onStatusChange }) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete(application.id);
      setShowDeleteDialog(false);
      toast.success('Candidatura eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando candidatura:', error);
      toast.error('Error al eliminar la candidatura');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onStatusChange(application.id, newStatus);
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={stopPropagation}>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={(e) => {
              stopPropagation(e);
              navigate(
                `/dashboard/resume/${resumeId}/job-applications/${application.id}`
              );
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              stopPropagation(e);
              navigate(
                `/dashboard/resume/${resumeId}/job-applications/${application.id}/edit`
              );
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar candidatura
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              stopPropagation(e);
              navigate(
                `/dashboard/resume/${resumeId}/job-applications/${application.id}/cover-letter`
              );
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            {application.coverLetterGenerated ? 'Ver carta' : 'Crear carta'}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              stopPropagation(e);
              navigate(
                `/dashboard/resume/${resumeId}/job-applications/${application.id}/interview-simulation`
              );
            }}
          >
            <Brain className="mr-2 h-4 w-4" />
            Test de preparación
          </DropdownMenuItem>

          {application.jobUrl && (
            <DropdownMenuItem
              onClick={(e) => {
                stopPropagation(e);
                window.open(application.jobUrl, '_blank');
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver oferta original
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Cambio rápido de estado */}
          {application.status === 'draft' && (
            <DropdownMenuItem
              onClick={(e) => {
                stopPropagation(e);
                handleStatusChange('applied');
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Marcar como enviada
            </DropdownMenuItem>
          )}

          {application.status === 'applied' && (
            <DropdownMenuItem
              onClick={(e) => {
                stopPropagation(e);
                handleStatusChange('interview');
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Marcar entrevista
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              stopPropagation(e);
              setShowDeleteDialog(true);
            }}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={stopPropagation}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar candidatura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              candidatura para <strong>{application.jobTitle}</strong> en{' '}
              <strong>{application.companyName}</strong>, incluyendo todas las
              cartas de presentación y simulaciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuickActions;
