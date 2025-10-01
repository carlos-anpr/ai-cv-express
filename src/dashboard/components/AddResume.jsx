import { Loader2, PlusSquare } from 'lucide-react';
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
    <div>
      <div
        className="p-14 py-24 border items-center flex justify-center bg-secondary rounded-lg h-[280px]
      hover:scale-105 transition-all hover:shadow-md
      cursor-pointer border-dashed"
        onClick={() => setOpenDialog(true)}
      >
        <PlusSquare />
      </div>

      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
            <DialogDescription>
              <span>Add title for your new resume</span>
              <Input
                className="my-2"
                placeholder="Ex.Full Stack resume"
                onChange={(e) => setResumeTitle(e.target.value)}
              />
            </DialogDescription>
            <div className="flex justify-end">
              <Button onClick={() => setOpenDialog(false)} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={!resumeTitle || loading}
                onClick={() => onCreate()}
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Create'}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddResume;
