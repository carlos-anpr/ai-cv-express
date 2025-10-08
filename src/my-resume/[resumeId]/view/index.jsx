import Header from '@/components/custom/Header';
import { Button } from '@/components/ui/button';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import ResumePreview from '@/dashboard/resume/components/ResumePreview';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LocalDatabase from '../../../services/LocalDatabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Share2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Globe,
  Eye,
  Users,
  TrendingUp,
} from 'lucide-react';
import { RWebShare } from 'react-web-share';

function ResumeView() {
  const [resumeInfo, setResumeinfo] = useState();
  const [loading, setLoading] = useState(false);
  const { resumeId } = useParams();

  useEffect(() => {
    const getResumeInfo = async () => {
      if (!resumeId) {
        toast.error('ID del CV no válido');
        return;
      }

      setLoading(true);
      try {
        const response = await LocalDatabase.GetResumeById(resumeId);
        console.log('✅ CV cargado para vista previa:', response.data);
        setResumeinfo(response.data);
      } catch (error) {
        console.error('❌ Error cargando CV:', error);
        toast.error('Error al cargar el CV: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    getResumeInfo();
  }, [resumeId]);

  const handleDownload = () => {
    window.print();
  };

  // Compartir: generar token (crypto) y actualizar el resume
  const [shareToken, setShareToken] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareStats, setShareStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    // Si resumeInfo ya tiene shareToken, cargarlo
    if (resumeInfo?.shareToken) {
      setShareToken(resumeInfo.shareToken);
    }
  }, [resumeInfo]);

  // Cargar estadísticas cuando se abre el diálogo y hay shareToken
  useEffect(() => {
    const loadStats = async () => {
      if (shareDialogOpen && shareToken && resumeId) {
        setLoadingStats(true);
        try {
          const stats = await LocalDatabase.GetShareStats(resumeId);
          setShareStats(stats);
        } catch (error) {
          console.error('Error cargando estadísticas:', error);
        } finally {
          setLoadingStats(false);
        }
      }
    };

    loadStats();
  }, [shareDialogOpen, shareToken, resumeId]);

  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    try {
      // Generación segura de token
      const newToken =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

      await LocalDatabase.UpdateResumeDetail(resumeId, {
        shareToken: newToken,
      });
      setShareToken(newToken);
      // actualizar estado local
      setResumeinfo((prev) => ({ ...(prev || {}), shareToken: newToken }));
      toast.success('Enlace generado correctamente');
    } catch (error) {
      console.error('Error generando enlace:', error);
      toast.error('Error al generar enlace');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async () => {
    const url = `${window.location.origin}/share/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando enlace:', err);
      toast.error('No se pudo copiar el enlace');
    }
  };

  const openShareLink = () => {
    const url = `${window.location.origin}/share/${shareToken}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando vista previa...</p>
        </div>
      </div>
    );
  }

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeinfo }}>
      <div id="no-print">
        <Header />
        <div className="mt-10 mx-10 md:mx-20 lg:mx-36">
          <h2 className="text-center text-2xl font-medium">
            ¡Felicidades! Tu CV generado con IA está listo!
            <p className="text-center text-gray-400">
              Ahora puedes descargar tu CV y compartir la URL con amigos y
              familia
            </p>
          </h2>
          <div className="flex justify-between px-44 my-10">
            <Button onClick={handleDownload}>Descargar</Button>

            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Compartir CV</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {!shareToken ? (
                    <div className="text-center space-y-3">
                      <Globe className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Genera un enlace público para compartir tu CV con
                        cualquiera
                      </p>
                      <Button
                        onClick={generateShareLink}
                        disabled={isGeneratingLink}
                        className="w-full"
                      >
                        {isGeneratingLink ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 mr-2" />
                            Generar enlace
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Estadísticas de visualizaciones */}
                      {shareStats && shareStats.totalViews > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            Estadísticas del enlace
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white rounded-lg p-3 text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Eye className="w-3 h-3 text-blue-600" />
                              </div>
                              <div className="text-2xl font-bold text-gray-900">
                                {shareStats.totalViews}
                              </div>
                              <div className="text-xs text-gray-600">
                                Visualizaciones
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="w-3 h-3 text-purple-600" />
                              </div>
                              <div className="text-2xl font-bold text-gray-900">
                                {shareStats.uniqueVisitors}
                              </div>
                              <div className="text-xs text-gray-600">
                                Visitantes únicos
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Globe className="w-3 h-3 text-green-600" />
                              </div>
                              <div className="text-2xl font-bold text-gray-900">
                                {Object.keys(shareStats.viewsByDate).length}
                              </div>
                              <div className="text-xs text-gray-600">
                                Días activos
                              </div>
                            </div>
                          </div>

                          {shareStats.lastView && (
                            <div className="text-xs text-gray-600 text-center pt-2 border-t">
                              Última visualización:{' '}
                              {new Date(shareStats.lastView).toLocaleString(
                                'es-ES'
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {loadingStats && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                          <p className="text-xs text-gray-600 mt-2">
                            Cargando estadísticas...
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`${window.location.origin}/share/${shareToken}`}
                          readOnly
                          className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyToClipboard}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          ℹ️ Al acceder a este enlace, el PDF se descargará
                          automáticamente sin necesidad de iniciar sesión.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={openShareLink}
                          className="flex-1"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Abrir enlace
                        </Button>

                        <RWebShare
                          data={{
                            text: `CV de ${resumeInfo?.firstName} ${resumeInfo?.lastName}`,
                            url: `${window.location.origin}/share/${shareToken}`,
                            title: 'Compartir CV',
                          }}
                        >
                          <Button variant="outline" className="flex-1">
                            <Share2 className="w-4 h-4 mr-2" />
                            Compartir
                          </Button>
                        </RWebShare>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateShareLink}
                        disabled={isGeneratingLink}
                        className="w-full text-gray-600"
                      >
                        {isGeneratingLink ? (
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        ) : null}
                        Generar nuevo enlace
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div className="my-10 mx-10 md:mx-20 lg:mx-80">
        <div id="print-area">
          <ResumePreview />
        </div>
      </div>
    </ResumeInfoContext.Provider>
  );
}

export default ResumeView;
