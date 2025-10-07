import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Monitor,
  Smartphone,
  Tablet,
  Download,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateResumeHTML } from '@/lib/webResumeUtils';

const WebPagePreview = ({ resumeInfo }) => {
  const [viewMode, setViewMode] = useState('desktop');
  const [htmlContent, setHtmlContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const generateHTML = async () => {
      if (!resumeInfo) return;
      setIsGenerating(true);
      try {
        const rawTheme =
          resumeInfo?.themeColor ??
          resumeInfo?.theme ??
          resumeInfo?.webPageConfig?.theme ??
          null;
        const themeToUse = rawTheme?.colors || rawTheme || null;
        const html = await generateResumeHTML(resumeInfo, themeToUse);
        const themeIdentifier =
          typeof themeToUse === 'string'
            ? themeToUse
            : JSON.stringify(themeToUse);
        setHtmlContent(html + `\n<!-- theme:${themeIdentifier} -->`);
      } catch (error) {
        console.error('Error generando HTML:', error);
        toast.error(
          'Error al generar la página web: ' + (error?.message || error)
        );
      } finally {
        setIsGenerating(false);
      }
    };

    generateHTML();
  }, [
    resumeInfo,
    resumeInfo?.firstName,
    resumeInfo?.lastName,
    resumeInfo?.jobTitle,
    resumeInfo?.summary,
    resumeInfo?.experience,
    resumeInfo?.education,
    resumeInfo?.skills,
    resumeInfo?.themeColor,
    resumeInfo?.webPageConfig?.theme,
    resumeInfo?.theme,
  ]);

  const getIframeScale = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px' };
      case 'tablet':
        return { width: '768px' };
      default:
        return { width: '100%' };
    }
  };

  const dimensions = getIframeScale();

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      toast.success('HTML copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar el HTML');
    }
  };

  const handleDownloadHTML = () => {
    if (!htmlContent) {
      toast.error('No hay contenido para descargar');
      return;
    }

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeInfo?.firstName || 'CV'}_${
      resumeInfo?.lastName || 'Resume'
    }_Web.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Página web descargada');
  };

  const handleOpenInNewWindow = () => {
    if (!htmlContent) {
      toast.error('No hay contenido para mostrar');
      return;
    }
    const win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
  };

  if (!resumeInfo) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-muted/30 rounded-lg border border-border">
        <div className="text-center space-y-3">
          <Globe className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground text-lg">
            Cargando información del CV...
          </p>
        </div>
      </div>
    );
  }

  if (isGenerating || !htmlContent) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-muted/30 rounded-lg border border-border">
        <div className="text-center space-y-3">
          <Globe className="w-12 h-12 mx-auto text-primary animate-spin" />
          <p className="text-muted-foreground text-lg font-medium">
            Generando diseño personalizado...
          </p>
          <p className="text-xs text-muted-foreground">
            Adaptando colores, iconos y estructura según tu perfil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 h-full">
      <aside className="space-y-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Globe className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">Vista Web</CardTitle>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Preview interactivo de tu CV
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('desktop')}
              className={cn(
                'w-full justify-start gap-2 transition-all font-normal',
                viewMode !== 'desktop' &&
                  'text-muted-foreground hover:text-foreground'
              )}
            >
              <Monitor className="w-4 h-4" />
              <span>Escritorio</span>
            </Button>

            <Button
              variant={viewMode === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tablet')}
              className={cn(
                'w-full justify-start gap-2 transition-all font-normal',
                viewMode !== 'tablet' &&
                  'text-muted-foreground hover:text-foreground'
              )}
            >
              <Tablet className="w-4 h-4" />
              <span>Tablet</span>
            </Button>

            <Button
              variant={viewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('mobile')}
              className={cn(
                'w-full justify-start gap-2 transition-all font-normal',
                viewMode !== 'mobile' &&
                  'text-muted-foreground hover:text-foreground'
              )}
            >
              <Smartphone className="w-4 h-4" />
              <span>Móvil</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Exportar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyHTML}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground font-normal"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copied ? 'Copiado!' : 'Copiar HTML'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadHTML}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground font-normal"
            >
              <Download className="w-4 h-4" />
              <span>Descargar HTML</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenInNewWindow}
              className="w-full justify-start gap-2 font-normal"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir en Pestaña</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium text-foreground">Información</p>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground pl-6">
              <p>• HTML completamente standalone</p>
              <p>• Funciona sin conexión a internet</p>
              <p>• Diseño adaptado a tu perfil</p>
              <p>• Compatible con todos los navegadores</p>
            </div>
          </CardContent>
        </Card>
      </aside>

      <div className="relative">
        <div className="sticky top-4">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/20 flex justify-center p-6 overflow-auto min-h-[calc(100vh-200px)]">
                <div
                  className={cn(
                    'bg-white shadow-xl transition-all duration-300 overflow-hidden border border-border/50',
                    viewMode !== 'desktop' && 'rounded-lg'
                  )}
                  style={{
                    width: dimensions.width,
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    srcDoc={htmlContent}
                    className="w-full border-0"
                    style={{
                      height: 'calc(100vh - 180px)',
                      minHeight: '700px',
                    }}
                    title="CV Preview"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WebPagePreview;
