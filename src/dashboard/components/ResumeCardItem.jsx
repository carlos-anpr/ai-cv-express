import { Loader2Icon, MoreVertical, Notebook } from 'lucide-react';
import React, { useState } from 'react';
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

function ResumeCardItem({ resume, refreshData }) {
  const navigation = useNavigate();
  const [openAlert, setOpenAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  // const onMenuClick=(url)=>{
  //   navigation(url)
  // }

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
  return (
    <div className="">
      <Link to={'/dashboard/resume/' + resume.documentId + '/edit'}>
        <div
          className="p-14  bg-gradient-to-b
          from-pink-100 via-purple-200 to-blue-200
        h-[280px] 
          rounded-t-lg border-t-4
        "
          style={{
            borderColor: resume?.themeColor,
          }}
        >
          <div
            className="flex 
        items-center justify-center h-[180px] "
          >
            {/* <Notebook/> */}
            <img src="/cv.png" width={80} height={80} />
          </div>
        </div>
      </Link>
      <div
        className="border p-3 flex justify-between  text-white rounded-b-lg shadow-lg"
        style={{
          background: resume?.themeColor,
        }}
      >
        <h2 className="text-sm">{resume.title}</h2>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="h-4 w-4 cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                navigation('/dashboard/resume/' + resume.documentId + '/edit')
              }
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigation('/my-resume/' + resume.documentId + '/view')
              }
            >
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigation(
                  '/dashboard/resume/' + resume.documentId + '/job-applications'
                )
              }
            >
              Candidaturas
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigation('/my-resume/' + resume.documentId + '/view')
              }
            >
              Descargar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenAlert(true)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={openAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente
                tu currículum y los datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpenAlert(false)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} disabled={loading}>
                {loading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  'Eliminar'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default ResumeCardItem;
