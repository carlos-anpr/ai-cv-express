import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { InfoMessage } from '@/components/ui/result-message';
import { cn } from '@/lib/utils';

/**
 * Step1Profile Component
 *
 * Primer paso: Usuario describe su perfil profesional en texto libre
 */

const Step1Profile = ({ onNext, initialData }) => {
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [isFocused, setIsFocused] = useState(false);
  const [validation, setValidation] = useState({
    isValid: false,
    minChars: 50,
    recommendedChars: 150,
    errors: [],
    warnings: [],
  });

  const textareaRef = useRef(null);

  // Auto-focus al montar
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Validación en tiempo real
  useEffect(() => {
    const length = description.length;
    const errors = [];
    const warnings = [];
    const minChars = 50;
    const recommendedChars = 150;

    // Validación de longitud mínima
    if (length > 0 && length < minChars) {
      errors.push(`Necesitas al menos ${minChars} caracteres para continuar`);
    }

    // Advertencia si es muy corto para buena calidad
    if (length >= minChars && length < recommendedChars) {
      warnings.push('Añade más detalles para mejorar la calidad del CV');
    }

    // Advertencia si es muy largo
    if (length > 3000) {
      warnings.push('Descripción muy larga. Intenta ser más conciso.');
    }

    setValidation({
      minChars,
      recommendedChars,
      isValid: length >= minChars && length <= 3000,
      errors,
      warnings,
    });
  }, [description]);

  const handleSubmit = () => {
    if (validation.isValid) {
      onNext({ description });
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter para enviar
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const characterCount = description.length;
  const progressPercentage = Math.min(
    (characterCount / validation.recommendedChars) * 100,
    100
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right duration-300">
      {/* Columna Izquierda: Formulario */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Tu Perfil Profesional
          </h2>
          <p className="text-muted-foreground">
            Describe tu experiencia, formación y habilidades en tus propias
            palabras
          </p>
        </div>

        {/* Textarea Principal */}
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Ejemplo:

Soy graduado en Ingeniería Informática con 3 años de experiencia en desarrollo web. He trabajado principalmente con React, Node.js y MongoDB en proyectos de e-commerce y aplicaciones SaaS.

Tengo experiencia en metodologías ágiles, CI/CD, y trabajo en equipo. Me apasiona crear interfaces de usuario intuitivas y código limpio y mantenible..."
              className={cn(
                'min-h-[300px] resize-none font-sans text-base transition-all duration-200',
                isFocused && 'ring-2 ring-primary/50',
                validation.errors.length > 0 &&
                  characterCount > 0 &&
                  'border-destructive focus-visible:ring-destructive'
              )}
              maxLength={3000}
            />

            {/* Indicador de caracteres flotante */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Badge
                variant={
                  characterCount >= validation.recommendedChars
                    ? 'default'
                    : characterCount >= validation.minChars
                    ? 'secondary'
                    : 'outline'
                }
                className="text-xs"
              >
                {characterCount} / 3000
              </Badge>
            </div>
          </div>

          {/* Barra de progreso */}
          {characterCount > 0 &&
            characterCount < validation.recommendedChars && (
              <div className="space-y-1">
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      progressPercentage >= 100
                        ? 'bg-green-500'
                        : progressPercentage >= 33
                        ? 'bg-primary'
                        : 'bg-yellow-500'
                    )}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {validation.recommendedChars - characterCount} caracteres más
                  para calidad óptima
                </p>
              </div>
            )}

          {/* Mensajes de validación */}
          {validation.errors.length > 0 && characterCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/10 rounded-md animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-destructive/80 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-destructive/80">
                {validation.errors[0]}
              </div>
            </div>
          )}

          {validation.warnings.length > 0 &&
            characterCount >= validation.minChars && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-700">
                  {validation.warnings[0]}
                </div>
              </div>
            )}
        </div>

        {/* Sugerencias rápidas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Sugerencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SuggestionItem text="Menciona tu formación académica (título, universidad)" />
            <SuggestionItem text="Indica tu sector o industria principal" />
            <SuggestionItem text="Especifica años de experiencia laboral" />
            <SuggestionItem text="Lista tus habilidades técnicas más relevantes" />
            <SuggestionItem text="Menciona idiomas si son relevantes" />
          </CardContent>
        </Card>

        {/* Botón de acción */}
        <Button
          onClick={handleSubmit}
          disabled={!validation.isValid}
          size="lg"
          className="w-full group"
        >
          Continuar
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Presiona{' '}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> +{' '}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>{' '}
          para continuar
        </p>
      </div>

      {/* Columna Derecha: Preview y Consejos */}
      <div className="space-y-6">
        {/* Panel de información */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              ¿Qué generaremos?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PreviewItem
              icon={CheckCircle2}
              title="Resumen profesional"
              description="3-4 líneas destacando tu experiencia"
            />
            <PreviewItem
              icon={CheckCircle2}
              title="Experiencia laboral"
              description="2-4 posiciones con logros específicos"
            />
            <PreviewItem
              icon={CheckCircle2}
              title="Formación académica"
              description="Estudios relevantes con fechas"
            />
            <PreviewItem
              icon={CheckCircle2}
              title="Habilidades"
              description="8-12 skills priorizadas por relevancia"
            />
          </CardContent>
        </Card>

        {/* Ejemplos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💡 Ejemplo de descripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ExampleProfile
              level="Junior"
              text="Recién graduado en Diseño Gráfico con conocimientos en Adobe Suite (Photoshop, Illustrator, InDesign). He realizado prácticas en una agencia de marketing digital donde creé contenido visual para redes sociales y diseñé materiales promocionales. Manejo herramientas de prototipado como Figma."
            />
            <ExampleProfile
              level="Mid"
              text="Desarrollador Full Stack con 4 años de experiencia en React, Node.js y PostgreSQL. He trabajado en startups tecnológicas liderando el desarrollo de aplicaciones web. Experiencia en arquitectura de microservicios, Docker, y metodologías ágiles. Inglés fluido."
            />
            <ExampleProfile
              level="Senior"
              text="Ingeniero de Software con 8+ años liderando equipos de desarrollo. Especializado en arquitectura de sistemas escalables con AWS, Kubernetes y servicios cloud. He dirigido la migración de monolitos a microservicios en empresas Fortune 500. Certificaciones AWS Solutions Architect y Scrum Master."
            />
          </CardContent>
        </Card>

        {/* Consejos adicionales */}
        <InfoMessage
          title="Consejo"
          className="animate-in fade-in duration-500 delay-300"
        >
          <p className="text-sm">
            No te preocupes por el formato o la estructura. La IA procesará tu
            descripción y generará un CV profesional adaptado a la oferta de
            trabajo.
          </p>
        </InfoMessage>
      </div>
    </div>
  );
};

// Componentes auxiliares

const SuggestionItem = ({ text }) => (
  <div className="flex items-start gap-2 text-sm text-muted-foreground">
    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

// eslint-disable-next-line no-unused-vars
const PreviewItem = ({ icon: IconComponent, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <IconComponent className="w-4 h-4 text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

const ExampleProfile = ({ level, text }) => (
  <div className="space-y-2">
    <Badge variant="outline" className="text-xs">
      {level}
    </Badge>
    <p className="text-xs text-muted-foreground italic leading-relaxed">
      "{text}"
    </p>
  </div>
);

export default Step1Profile;
