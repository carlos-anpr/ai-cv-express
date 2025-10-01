import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import LocalDatabase from '../../../../services/LocalDatabase';
import { useUser } from '@clerk/clerk-react';
import CoverLetterForm from '../../components/CoverLetterForm';

function CoverLettersManager() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [coverLetters, setCoverLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLetter, setEditingLetter] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null);

  useEffect(() => {
    if (user && resumeId) {
      loadCoverLetters();
      loadResumeInfo();
    }
  }, [user, resumeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCoverLetters = async () => {
    try {
      setLoading(true);
      const letters = await LocalDatabase.GetCoverLettersByResume(resumeId);
      setCoverLetters(letters);
    } catch (error) {
      console.error('Error cargando cartas:', error);
      toast.error('Error al cargar las cartas de presentación');
    } finally {
      setLoading(false);
    }
  };

  const loadResumeInfo = async () => {
    try {
      const resume = await LocalDatabase.GetResumeById(resumeId);
      setResumeInfo(resume);
    } catch (error) {
      console.error('Error cargando información del CV:', error);
    }
  };

  const handleDelete = async (letterId) => {
    if (
      !confirm(
        '¿Estás seguro de que quieres eliminar esta carta de presentación?'
      )
    ) {
      return;
    }

    try {
      await LocalDatabase.DeleteCoverLetter(letterId);
      toast.success('Carta eliminada correctamente');
      loadCoverLetters();
    } catch (error) {
      console.error('Error eliminando carta:', error);
      toast.error('Error al eliminar la carta');
    }
  };

  const handleEdit = (letter) => {
    setEditingLetter(letter);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLetter(null);
    loadCoverLetters();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando cartas de presentación...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Cartas de Presentación</h1>
            <p className="text-gray-600">
              CV: {resumeInfo?.title || 'Sin título'} - {resumeInfo?.firstName}{' '}
              {resumeInfo?.lastName}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Carta
        </Button>
      </div>

      {/* Lista de cartas */}
      {coverLetters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No hay cartas de presentación
            </h3>
            <p className="text-gray-600 mb-4">
              Crea tu primera carta de presentación personalizada para una
              empresa específica.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Carta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coverLetters.map((letter) => (
            <Card key={letter.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{letter.companyName}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(letter)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(letter.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <p className="text-sm text-gray-600">{letter.jobTitle}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {letter.content?.substring(0, 150)}...
                  </p>
                  <div className="text-xs text-gray-500">
                    Creada: {new Date(letter.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Actualizada:{' '}
                    {new Date(letter.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(letter)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(letter.content);
                      toast.success('Carta copiada al portapapeles');
                    }}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal del formulario */}
      {showForm && (
        <CoverLetterForm
          resumeId={resumeId}
          resumeInfo={resumeInfo}
          editingLetter={editingLetter}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

export default CoverLettersManager;
