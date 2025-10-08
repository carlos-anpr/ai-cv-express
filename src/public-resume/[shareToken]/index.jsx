import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import LocalDatabase from '@/services/LocalDatabase';
import ResumePreview from '@/dashboard/resume/components/ResumePreview';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { Loader2, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicResumePDF() {
  const { shareToken } = useParams();
  const [resumeInfo, setResumeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [autoDownloadDone, setAutoDownloadDone] = useState(false);
  const resumeRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Pasar trackView=true para registrar la visualización
        const response = await LocalDatabase.GetResumeByShareToken(
          shareToken,
          true
        );
        if (!response?.data) throw new Error('CV no encontrado');
        if (!mounted) return;
        setResumeInfo(response.data);

        // Wait a short time for images/fonts to load, then auto-download once
        setTimeout(() => {
          if (!autoDownloadDone) {
            void handleDownloadPDF();
            setAutoDownloadDone(true);
          }
        }, 1200);
      } catch (err) {
        console.error('Error cargando CV público:', err);
        if (mounted) setError('Este enlace no es válido o ha expirado');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareToken]);

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;

    setIsDownloading(true);

    try {
      // Usar la API nativa de impresión del navegador
      // Esto genera un PDF de alta calidad con texto seleccionable

      // Ocultar temporalmente los botones y elementos de UI
      const uiElements = document.querySelectorAll('.no-print, button, .btn');
      uiElements.forEach((el) => (el.style.display = 'none'));

      // Aplicar estilos de impresión temporalmente
      const printStyle = document.createElement('style');
      printStyle.id = 'temp-print-style';
      printStyle.textContent = `
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview, #resume-preview * {
            visibility: visible !important;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `;
      document.head.appendChild(printStyle);

      // Trigger print dialog
      setTimeout(() => {
        window.print();

        // Restaurar UI después de imprimir
        setTimeout(() => {
          uiElements.forEach((el) => (el.style.display = ''));
          const style = document.getElementById('temp-print-style');
          if (style) style.remove();
          setIsDownloading(false);
        }, 100);
      }, 100);
    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('No se pudo generar el PDF. Intenta descargar manualmente.');
      setIsDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando currículum...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enlace no válido
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center">
            {isDownloading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <p className="text-gray-700 font-medium">Generando PDF...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-700">
                  {autoDownloadDone
                    ? '✅ Descarga completada'
                    : '⬇️ La descarga comenzará automáticamente'}
                </p>
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {autoDownloadDone ? 'Descargar nuevamente' : 'Descargar PDF'}
                </Button>
              </div>
            )}
          </div>

          <div
            ref={resumeRef}
            id="resume-preview"
            className="bg-white shadow-lg rounded-lg overflow-hidden pdf-safe-colors"
          >
            <ResumePreview />
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              CV compartido por {resumeInfo?.firstName} {resumeInfo?.lastName}
            </p>
          </div>
        </div>
      </div>
    </ResumeInfoContext.Provider>
  );
}
