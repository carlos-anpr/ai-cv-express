import { Loader2, Plus, Sparkles, Edit3, FileText } from 'lucide-react';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LocalDatabase from '../../services/LocalDatabase';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function AddResume() {
  const [openDialog, setOpenDialog] = useState(false);
  const [resumeTitle, setResumeTitle] = useState();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigate();

  const onCreate = async () => {
    if (!resumeTitle || !user?.primaryEmailAddress?.emailAddress) {
      toast.error('Título del CV y usuario son requeridos');
      return;
    }

    const data = {
      title: resumeTitle,
      userEmail: user.primaryEmailAddress.emailAddress,
      userName: user.fullName,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      jobTitle: '',
      themeColor: '#3b82f6',
    };

    setLoading(true);

    try {
      const response = await LocalDatabase.CreateNewResume(data);
      console.log('✅ CV creado:', response.data);

      if (response.data.documentId) {
        toast.success('CV creado correctamente');
        setOpenDialog(false);
        navigation(`/dashboard/resume/${response.data.documentId}/edit`);
      }
    } catch (error) {
      console.error('❌ Error creando CV:', error);
      toast.error(error.message || 'Error al crear el CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative h-full">
      <div
        className="bg-white rounded-xl border-2 border-dashed 
                   border-gray-300 hover:border-gray-500 
                   shadow-sm hover:shadow-xl transition-all duration-300
                   cursor-pointer h-full flex flex-col"
        onClick={() => setOpenDialog(true)}
      >
        {/* Header decorativo oscuro */}
        <div className="h-2 w-full bg-gradient-to-r from-gray-700 to-gray-900 rounded-t-xl" />

        {/* Contenido principal */}
        <div className="flex-1 p-5 flex flex-col items-center justify-center gap-4">
          {/* Icono central con 3 capas - tema oscuro */}
          <div className="relative">
            {/* Capa 1: Pulso animado de fondo */}
            <div className="absolute inset-0 bg-gray-300 rounded-full animate-ping opacity-20" />

            {/* Capa 2: Círculo principal con gradiente oscuro */}
            <div
              className="relative w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 
                         rounded-full flex items-center justify-center 
                         shadow-lg group-hover:scale-110 transition-transform duration-300"
            >
              <Plus className="h-8 w-8 text-white" strokeWidth={3} />
            </div>

            {/* Capa 3: Badge decorativo amarillo */}
            <div
              className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 
                         rounded-full flex items-center justify-center shadow-md
                         group-hover:rotate-12 transition-transform duration-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
          </div>

          {/* Textos con tema claro */}
          <div className="text-center space-y-2">
            <h3 className="font-bold text-lg text-gray-900">Crear CV Nuevo</h3>
            <p className="text-sm text-gray-600 max-w-[200px] mx-auto leading-relaxed">
              Crea tu currículum desde cero con control total
            </p>
          </div>

          {/* Features list con iconos oscuros */}
          <div className="flex flex-col gap-2 text-xs text-gray-700">
            <div className="flex items-center gap-1.5 justify-center">
              <Edit3 className="h-3.5 w-3.5 text-gray-700 flex-shrink-0" />
              <span className="truncate">100% personalizable</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <FileText className="h-3.5 w-3.5 text-gray-700 flex-shrink-0" />
              <span className="truncate">Múltiples plantillas</span>
            </div>
          </div>
        </div>

        {/* Footer CTA con tema claro */}
        <div
          className="px-5 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl
                     group-hover:bg-gray-100 transition-colors duration-300"
        >
          <span
            className="text-xs font-medium text-gray-700 
                       group-hover:text-gray-900 transition-colors
                       flex items-center justify-center gap-2"
          >
            Click para comenzar
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          </span>
        </div>
      </div>

      {/* Dialog mejorado */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-700" />
              </div>
              Crear Nuevo Currículum
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Título del currículum
                  </label>
                  <Input
                    autoFocus
                    className="w-full"
                    placeholder="Ej. CV Desarrollador Full Stack"
                    value={resumeTitle || ''}
                    onChange={(e) => setResumeTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && resumeTitle && !loading) {
                        onCreate();
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes cambiarlo después en cualquier momento
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setOpenDialog(false)} variant="outline">
              Cancelar
            </Button>
            <Button
              disabled={!resumeTitle || loading}
              onClick={() => onCreate()}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear CV
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddResume;
