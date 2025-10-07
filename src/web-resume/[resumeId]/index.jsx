import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LocalDatabase from '../../../src/services/LocalDatabase';
import { Loader2 } from 'lucide-react';
import { generateResumeHTML } from '@/lib/webResumeUtils';

/**
 * Página pública para visualizar CV como web
 * URL: /web-resume/:resumeId
 */
function PublicWebResume() {
  const { resumeId } = useParams();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await LocalDatabase.GetResumeById(resumeId);
        const resume = response.data;
        // Prefer stored hex color `themeColor` when available (user selection) before presets
        const rawTheme =
          resume?.themeColor ??
          resume?.theme ??
          resume?.webPageConfig?.theme ??
          null;
        const themeToUse = rawTheme?.colors || rawTheme || null;
        console.debug &&
          console.debug('[PUBLIC PAGE] theme resolution', {
            resolvedRawTheme: rawTheme,
            hasThemeColor: !!resume?.themeColor,
          });
        const html = await generateResumeHTML(resume, themeToUse);
        setHtmlContent(html + `\n<!-- theme=${JSON.stringify(themeToUse)} -->`);
      } catch (err) {
        console.error('Error cargando CV:', err);
        setError('No se pudo cargar el CV');
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      className="min-h-screen"
    />
  );
}

export default PublicWebResume;
