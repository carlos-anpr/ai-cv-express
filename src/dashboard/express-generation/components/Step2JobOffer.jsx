import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ClipboardPaste,
} from 'lucide-react';
import {
  ValidationMessages,
  AIGeneratedMessage,
} from '@/components/ui/result-message';
import ExpressGenerationService from '@/services/ExpressGenerationService';

/**
 * Step2JobOffer Component
 *
 * Segundo paso: Usuario pega la información de la oferta de trabajo
 */

const Step2JobOffer = ({ onNext, onBack, initialData }) => {
  const [rawText, setRawText] = useState(initialData?.rawText || '');
  const [extractedData, setExtractedData] = useState(
    initialData?.extractedData || null
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [validation, setValidation] = useState({
    isValid: true, // Cambiado: Siempre válido porque es opcional
    errors: [],
    warnings: [],
    completeness: null,
  });

  // Validación básica del texto (ahora opcional)
  useEffect(() => {
    const length = rawText.length;
    const errors = [];
    const warnings = [];

    if (length > 0 && length < 100) {
      warnings.push(
        'La descripción es corta. Añade más información para generar carta y candidatura.'
      );
    }

    if (length >= 100 && length < 200) {
      warnings.push(
        'Añade más detalles para obtener mejor carta de presentación'
      );
    }

    // CAMBIO: Solo validar si NO hay datos extraídos aún
    if (length >= 100 && !extractedData) {
      // Validar solo si no se ha extraído nada todavía
      const hasCompany = /empresa|company|organization/i.test(rawText);
      const hasPosition = /puesto|position|cargo|rol|role|job/i.test(rawText);

      if (!hasCompany) {
        warnings.push(
          'Verifica que incluyas el nombre de la empresa en la descripción.'
        );
      }
      if (!hasPosition) {
        warnings.push('Verifica que incluyas el título del puesto.');
      }
    }

    // Si YA hay datos extraídos, validar con ellos
    if (extractedData?.data) {
      if (
        !extractedData.data.companyName ||
        extractedData.data.companyName === 'No especificado'
      ) {
        warnings.push(
          'No se detectó nombre de empresa. Sin empresa no se creará candidatura.'
        );
      }
      if (
        !extractedData.data.jobTitle ||
        extractedData.data.jobTitle === 'No especificado'
      ) {
        warnings.push(
          'No se detectó título del puesto. Añádelo para mejor resultado.'
        );
      }
    }

    setValidation({
      isValid: true, // Siempre válido porque el paso es opcional
      errors,
      warnings,
      completeness: extractedData?.validation?.completeness || null,
    });
  }, [rawText, extractedData]);

  // Auto-extracción con debounce cuando hay suficiente texto
  const extractJobOffer = useCallback(async () => {
    if (rawText.length < 200 || isExtracting) return;

    setIsExtracting(true);

    try {
      const result = await ExpressGenerationService.extractJobOffer(
        rawText,
        (progress) => {
          console.log('Extraction progress:', progress);
        }
      );

      if (result.success) {
        setExtractedData(result);
        setValidation((prev) => ({
          ...prev,
          completeness: result.validation.completeness,
        }));
      } else {
        console.error('Extraction failed:', result.error);
      }
    } catch (error) {
      console.error('Error extracting job offer:', error);
    } finally {
      setIsExtracting(false);
    }
  }, [rawText, isExtracting]);

  // Trigger auto-extraction después de 2 segundos de inactividad
  useEffect(() => {
    if (rawText.length >= 200 && !extractedData) {
      const timer = setTimeout(() => {
        extractJobOffer();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [rawText, extractedData, extractJobOffer]);

  const handleSubmit = () => {
    if (rawText.length >= 100 && extractedData) {
      // Tiene oferta válida y extraída
      onNext({
        rawText,
        extractedData: extractedData.data,
        validation: extractedData.validation,
      });
    } else if (rawText.length >= 100 && !extractedData) {
      // Tiene texto pero no extraído, forzar extracción
      extractJobOffer();
    } else {
      // No tiene oferta o es muy corta, continuar sin ella
      onNext({
        rawText: '',
        extractedData: null,
        validation: null,
        skipped: true,
      });
    }
  };

  const handleSkip = () => {
    // Saltar directamente sin oferta
    onNext({
      rawText: '',
      extractedData: null,
      validation: null,
      skipped: true,
    });
  };

  const characterCount = rawText.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right duration-300">
      {/* Columna Izquierda: Entrada de datos */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              Información de la Oferta
            </h2>
            <Badge variant="outline" className="text-xs">
              Paso Opcional
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Pega la información de la oferta de trabajo para generar carta y
            candidatura personalizadas
          </p>
        </div>

        {/* Banner Informativo */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-gray-900">
                ¿Qué se genera según tus datos?
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Con oferta de trabajo:
                    </p>
                    <p className="text-gray-700">
                      ✓ CV personalizado • ✓ Carta de presentación • ✓
                      Candidatura automática
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Sin oferta:</p>
                    <p className="text-gray-700">
                      ✓ CV genérico basado en tu perfil
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Textarea Principal */}
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setExtractedData(null); // Reset extracted data on edit
              }}
              placeholder="Pega aquí toda la información de la oferta:

Senior React Developer - Tech Corp
Madrid, España (Híbrido)
Salario: 45.000€ - 55.000€/año

Sobre nosotros:
Tech Corp es una empresa líder en desarrollo de software...

Requisitos:
• 5+ años de experiencia con React
• Experiencia con TypeScript
• Conocimientos de Node.js
• Experiencia con Git y metodologías ágiles

Responsabilidades:
• Liderar el desarrollo frontend
• Mentoría de desarrolladores junior
• Colaborar con equipos de diseño

Beneficios:
• Horario flexible
• Trabajo remoto 3 días/semana
• Seguro médico privado
• Formación continua"
              className="min-h-[400px] resize-none font-mono text-sm"
              maxLength={5000}
            />

            {/* Indicador de caracteres */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {isExtracting && (
                <Badge variant="secondary" className="text-xs animate-pulse">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Extrayendo...
                </Badge>
              )}
              <Badge
                variant={characterCount >= 200 ? 'default' : 'outline'}
                className="text-xs"
              >
                {characterCount} / 5000
              </Badge>
            </div>
          </div>

          {/* Ayuda rápida */}
          {characterCount === 0 && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-300 rounded-md">
              <ClipboardPaste className="w-4 h-4 text-gray-700 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                Copia la oferta completa desde LinkedIn, InfoJobs, Indeed o
                cualquier fuente
              </p>
            </div>
          )}

          {/* Mensajes de validación */}
          <ValidationMessages
            errors={validation.errors}
            warnings={validation.warnings}
          />

          {/* Indicador de extracción IA */}
          {isExtracting && (
            <AIGeneratedMessage
              title="Analizando oferta con IA"
              message="Extrayendo y categorizando la información..."
            />
          )}
        </div>

        {/* Botones de navegación */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              size="lg"
              className="group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Atrás
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isExtracting}
              size="lg"
              className="flex-1 group"
              variant={rawText.length >= 100 ? 'default' : 'outline'}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  {rawText.length >= 100
                    ? 'Continuar con Oferta'
                    : 'Generar Solo CV'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>

          {/* Botón alternativo para omitir */}
          {rawText.length === 0 && (
            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors py-2"
            >
              Omitir este paso y generar solo el CV →
            </button>
          )}

          {/* Mensaje informativo según estado */}
          {rawText.length > 0 && rawText.length < 100 && (
            <p className="text-xs text-center text-orange-600">
              ⚠️ Texto muy corto. Se generará solo el CV sin carta ni
              candidatura.
            </p>
          )}
        </div>
      </div>

      {/* Columna Derecha: Preview de datos extraídos */}
      <div className="space-y-6">
        {!extractedData && !isExtracting && characterCount < 100 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Detección Automática
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Al pegar la información, la IA detectará automáticamente:
              </p>
              <DetectionItem icon={Building2} text="Nombre de la empresa" />
              <DetectionItem icon={Briefcase} text="Título del puesto" />
              <DetectionItem icon={MapPin} text="Ubicación y modalidad" />
              <DetectionItem
                icon={CheckCircle}
                text="Requisitos y habilidades"
              />
              <DetectionItem
                icon={DollarSign}
                text="Rango salarial (si está disponible)"
              />
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {isExtracting && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Extrayendo información...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-24 w-full mt-4" />
            </CardContent>
          </Card>
        )}

        {/* Datos extraídos */}
        {extractedData && !isExtracting && (
          <>
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Información Extraída
                  </CardTitle>
                  {validation.completeness && (
                    <Badge
                      variant={
                        validation.completeness.level === 'excelente'
                          ? 'default'
                          : validation.completeness.level === 'bueno'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {validation.completeness.percentage.toFixed(0)}% completo
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ExtractedField
                  label="Empresa"
                  value={extractedData.data.companyName}
                  icon={Building2}
                />
                <ExtractedField
                  label="Puesto"
                  value={extractedData.data.jobTitle}
                  icon={Briefcase}
                />
                <ExtractedField
                  label="Ubicación"
                  value={`${extractedData.data.location.city}, ${extractedData.data.location.country} (${extractedData.data.location.workMode})`}
                  icon={MapPin}
                />
                {extractedData.data.salaryRange.display !==
                  'No especificado' && (
                  <ExtractedField
                    label="Salario"
                    value={extractedData.data.salaryRange.display}
                    icon={DollarSign}
                  />
                )}
              </CardContent>
            </Card>

            {/* Requisitos detectados */}
            {extractedData.data.requirements?.essential?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Requisitos Esenciales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {extractedData.data.requirements.essential
                      .slice(0, 5)
                      .map((req, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    {extractedData.data.requirements.essential.length > 5 && (
                      <li className="text-xs text-muted-foreground italic">
                        +{extractedData.data.requirements.essential.length - 5}{' '}
                        más...
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Habilidades técnicas */}
            {extractedData.data.technicalSkills?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Habilidades Técnicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.data.technicalSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Componentes auxiliares

// eslint-disable-next-line no-unused-vars
const DetectionItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className="w-4 h-4 text-primary" />
    <span className="text-muted-foreground">{text}</span>
  </div>
);

// eslint-disable-next-line no-unused-vars
const ExtractedField = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-green-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium break-words">{value}</p>
    </div>
  </div>
);

export default Step2JobOffer;
