import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, MessageSquare, Brain } from 'lucide-react';

function InterviewSimulation() {
  const { resumeId, applicationId } = useParams();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(`/dashboard/resume/${resumeId}/job-applications/${applicationId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Simulación de Entrevista
          </h1>
          <p className="text-gray-600 mt-2">
            Prepárate con preguntas personalizadas para esta candidatura
          </p>
        </div>
      </div>

      {/* Contenido placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Simulación de Entrevista Inteligente
          </CardTitle>
          <CardDescription>
            Esta funcionalidad estará disponible en la Fase 5 de implementación
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Próximamente Disponible
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            La simulación de entrevistas personalizadas estará disponible
            pronto. Esta herramienta generará preguntas específicas basadas en
            tu CV, el puesto solicitado y el nivel profesional detectado.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-green-900 mb-2">
              Características que incluirá:
            </h4>
            <ul className="text-sm text-green-800 text-left space-y-1">
              <li>• 40+ preguntas personalizadas por entrevista</li>
              <li>• Detección automática del nivel (Junior, Mid, Senior)</li>
              <li>• Categorías: Técnicas, Comportamentales, Empresa</li>
              <li>• Respuestas sugeridas inteligentes</li>
              <li>• Análisis de habilidades faltantes</li>
              <li>• Consejos de preparación específicos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InterviewSimulation;
