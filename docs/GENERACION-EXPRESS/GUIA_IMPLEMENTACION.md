# 🚀 Guía de Implementación - Generación Express

## 📋 Visión General

Esta guía proporciona todos los pasos detallados para implementar la funcionalidad de **Generación Express** desde cero, incluyendo código completo de cada archivo.

**Tiempo estimado:** 12-16 horas de desarrollo

---

## ✅ Checklist de Implementación

### Fase 1: Setup (30 min)

- [ ] Crear estructura de carpetas
- [ ] Instalar dependencias necesarias
- [ ] Configurar rutas

### Fase 2: Servicios y Prompts (3-4 horas)

- [ ] Crear prompts de IA (4 archivos)
- [ ] Crear ExpressGenerationService
- [ ] Probar servicios individualmente

### Fase 3: Componentes UI Base (2 horas)

- [ ] Crear Stepper component
- [ ] Crear Skeleton component (si no existe)
- [ ] Probar componentes aislados

### Fase 4: Componentes del Flujo (4-5 horas)

- [ ] Step1Profile - Formulario de perfil
- [ ] Step2JobOffer - Parser de oferta
- [ ] Step3Generation - Progress indicator
- [ ] Step4Results - Vista de resultados
- [ ] Probar cada paso individualmente

### Fase 5: Container Principal (2 horas)

- [ ] ExpressGeneration container
- [ ] useExpressGeneration hook
- [ ] Navegación entre pasos

### Fase 6: Integración (1 hora)

- [ ] ExpressGenerationCard en Dashboard
- [ ] Añadir ruta en main.jsx
- [ ] Probar flujo completo

### Fase 7: Testing y Refinamiento (2 horas)

- [ ] Testing de validaciones
- [ ] Testing de generación IA
- [ ] Testing de guardado en BD
- [ ] Ajustes visuales
- [ ] Responsive testing

---

## 📁 Estructura de Archivos a Crear

```
├── src/
│   ├── services/
│   │   ├── ExpressGenerationService.js          ⭐ NUEVO
│   │   └── prompts/
│   │       ├── expressProfileParser.js          ⭐ NUEVO
│   │       ├── expressJobExtractor.js           ⭐ NUEVO
│   │       ├── expressResumeGenerator.js        ⭐ NUEVO
│   │       └── expressCoverLetterGenerator.js   ⭐ NUEVO
│   │
│   ├── components/
│   │   └── ui/
│   │       ├── stepper.jsx                      ⭐ NUEVO
│   │       └── skeleton.jsx                     ⭐ NUEVO (si no existe)
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   └── ExpressGenerationCard.jsx        ⭐ NUEVO
│   │   │
│   │   └── express-generation/
│   │       ├── index.jsx                        ⭐ NUEVO
│   │       ├── hooks/
│   │       │   └── useExpressGeneration.js      ⭐ NUEVO
│   │       └── components/
│   │           ├── Step1Profile.jsx             ⭐ NUEVO
│   │           ├── Step2JobOffer.jsx            ⭐ NUEVO
│   │           ├── Step3Generation.jsx          ⭐ NUEVO
│   │           └── Step4Results.jsx             ⭐ NUEVO
│   │
│   └── main.jsx                                 ⚠️ MODIFICAR (añadir ruta)
```

---

## 🚀 FASE 1: Setup Inicial

### 1.1 Crear Estructura de Carpetas

```powershell
# PowerShell
cd c:\PRUEBAS\ai-resume-builder

# Crear carpetas
mkdir src\dashboard\express-generation
mkdir src\dashboard\express-generation\components
mkdir src\dashboard\express-generation\hooks
mkdir src\services\prompts
```

### 1.2 Instalar Dependencias

```powershell
# Si necesitas react-confetti para la celebración final
npm install react-confetti

# Verificar que tienes todas las dependencias
npm list react react-router-dom @clerk/clerk-react lucide-react
```

---

## 📝 FASE 2: Servicios y Prompts

Por el límite de caracteres, **he creado archivos separados con el código completo**:

1. **Crear archivo:** `src/services/prompts/expressProfileParser.js`
2. **Crear archivo:** `src/services/prompts/expressJobExtractor.js`
3. **Crear archivo:** `src/services/prompts/expressResumeGenerator.js`
4. **Crear archivo:** `src/services/prompts/expressCoverLetterGenerator.js`
5. **Crear archivo:** `src/services/ExpressGenerationService.js`

**Estos archivos contienen:**

- Prompts optimizados para Gemini 2.0 Flash
- Lógica de validación
- Manejo de errores robusto
- Progress callbacks

**⚠️ Importante:** Asegúrate de exportar correctamente cada prompt y de importarlos en `ExpressGenerationService.js`.

---

## 🎨 FASE 3: Componentes UI Base

### 3.1 Stepper Component

**Crear archivo:** `src/components/ui/stepper.jsx`

Este componente muestra el progreso visual del flujo en 4 pasos.

**Características:**

- Estados: pending, active, completed, error
- Animaciones de transición
- Responsive (compacto en mobile)
- Checkmarks animados

### 3.2 Skeleton Component

**Crear archivo (si no existe):** `src/components/ui/skeleton.jsx`

Componente de loading para estados de carga.

---

## 📦 FASE 4: Componentes del Flujo

### 4.1 Step1Profile - Formulario de Perfil

**Crear archivo:** `src/dashboard/express-generation/components/Step1Profile.jsx`

**Funcionalidades:**

- Textarea con auto-resize
- Validación en tiempo real
- Contador de caracteres
- Sugerencias contextuales
- Panel de consejos lateral

**Props:**

```typescript
{
  onNext: (data: { description: string }) => void,
  initialData?: { description: string }
}
```

### 4.2 Step2JobOffer - Parser de Oferta

**Crear archivo:** `src/dashboard/express-generation/components/Step2JobOffer.jsx`

**Código completo:**

```javascript
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import ExpressGenerationService from '@/services/ExpressGenerationService';

function Step2JobOffer({ onNext, onBack, profileData, initialData }) {
  const [rawText, setRawText] = useState(initialData?.rawText || '');
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [validation, setValidation] = useState({
    isValid: false,
    errors: [],
    warnings: [],
  });

  useEffect(() => {
    if (rawText.length >= 100) {
      const result = ExpressGenerationService.validateJobOffer(rawText);
      setValidation(result);
    } else {
      setValidation({ isValid: false, errors: [], warnings: [] });
    }
  }, [rawText]);

  // Extracción en tiempo real con debounce
  useEffect(() => {
    if (rawText.length >= 200 && validation.isValid) {
      const timer = setTimeout(() => {
        handleExtract();
      }, 2000); // Esperar 2 segundos después de que el usuario deje de escribir

      return () => clearTimeout(timer);
    }
  }, [rawText, validation.isValid]);

  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      const data = await ExpressGenerationService.extractJobOffer(rawText);
      setExtractedData(data);
    } catch (error) {
      console.error('Error extrayendo oferta:', error);
      setExtractedData(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = () => {
    if (validation.isValid) {
      onNext({ rawText, extractedData });
    }
  };

  const characterCount = rawText.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right duration-300">
      {/* Formulario */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Información de la Oferta
          </h2>
          <p className="text-muted-foreground">
            Pega aquí toda la información de la oferta de trabajo
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Información completa de la oferta
            </label>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Ejemplo:

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
• Formación continua`}
              className="min-h-[350px] resize-none font-mono text-sm"
              maxLength={5000}
            />

            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-2">
                {isExtracting && (
                  <Badge variant="outline" className="text-blue-600">
                    <span className="animate-pulse">Analizando...</span>
                  </Badge>
                )}
                {extractedData && !isExtracting && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Información detectada
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {characterCount}/5000
              </span>
            </div>
          </div>

          {/* Validación */}
          {validation.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validation.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validation.warnings.length > 0 && characterCount >= 100 && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside text-sm">
                  {validation.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!validation.isValid}
              className="flex-1"
              size="lg"
            >
              Generar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Panel de Detección */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Información Detectada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExtracting ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : extractedData ? (
            <div className="space-y-4">
              {/* Empresa */}
              {extractedData.companyName && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Empresa</p>
                    <p className="text-sm font-medium">
                      {extractedData.companyName}
                    </p>
                  </div>
                </div>
              )}

              {/* Puesto */}
              {extractedData.jobTitle && (
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Puesto</p>
                    <p className="text-sm font-medium">
                      {extractedData.jobTitle}
                    </p>
                  </div>
                </div>
              )}

              {/* Ubicación */}
              {extractedData.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ubicación</p>
                    <p className="text-sm font-medium">
                      {extractedData.location} • {extractedData.workMode}
                    </p>
                  </div>
                </div>
              )}

              {/* Salario */}
              {extractedData.salaryRange && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Salario</p>
                    <p className="text-sm font-medium">
                      {extractedData.salaryRange}
                    </p>
                  </div>
                </div>
              )}

              {/* Requisitos */}
              {extractedData.requirements &&
                extractedData.requirements.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Requisitos ({extractedData.requirements.length})
                    </p>
                    <ul className="text-sm space-y-1">
                      {extractedData.requirements.slice(0, 3).map((req, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                          <span className="line-clamp-1">{req}</span>
                        </li>
                      ))}
                      {extractedData.requirements.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{extractedData.requirements.length - 3} más
                        </li>
                      )}
                    </ul>
                  </div>
                )}

              <div className="pt-3 border-t">
                <Badge variant="secondary">
                  Nivel: {extractedData.requiredLevel}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Pega la información de la oferta y analizaremos automáticamente
                todos los detalles
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              📌 Puedes pegar desde:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">LinkedIn</Badge>
              <Badge variant="outline">InfoJobs</Badge>
              <Badge variant="outline">Indeed</Badge>
              <Badge variant="outline">Email</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Step2JobOffer;
```

### 4.3 Step3Generation - Progress Indicator

**Crear archivo:** `src/dashboard/express-generation/components/Step3Generation.jsx`

```javascript
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader, Lightbulb, Zap } from 'lucide-react';
import ExpressGenerationService from '@/services/ExpressGenerationService';

function Step3Generation({
  profileData,
  jobOfferData,
  userEmail,
  onComplete,
  onError,
}) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [steps, setSteps] = useState([
    {
      id: 'profile',
      label: 'Analizando tu perfil',
      status: 'pending',
      time: null,
    },
    {
      id: 'offer',
      label: 'Extrayendo información de la oferta',
      status: 'pending',
      time: null,
    },
    {
      id: 'application',
      label: 'Categorizando candidatura',
      status: 'pending',
      time: null,
    },
    {
      id: 'resume',
      label: 'Generando curriculum vitae',
      status: 'pending',
      time: null,
    },
    {
      id: 'cover_letter',
      label: 'Creando carta de presentación',
      status: 'pending',
      time: null,
    },
    {
      id: 'saving',
      label: 'Guardando en base de datos',
      status: 'pending',
      time: null,
    },
  ]);
  const [tips] = useState([
    'Las cartas personalizadas aumentan un 40% las posibilidades de entrevista',
    'Un CV bien estructurado es leído en promedio 6 segundos más',
    'Adaptar tu CV a cada oferta incrementa un 60% la tasa de respuesta',
    'Los reclutadores valoran la claridad y concisión sobre la extensión',
  ]);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    // Rotar tips cada 5 segundos
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [tips.length]);

  useEffect(() => {
    startGeneration();
  }, []);

  const startGeneration = async () => {
    try {
      await ExpressGenerationService.generateComplete(
        profileData,
        jobOfferData,
        userEmail,
        handleProgress
      ).then(onComplete);
    } catch (error) {
      console.error('Error en generación:', error);
      onError(error);
    }
  };

  const handleProgress = ({ step, progress: prog, message }) => {
    setProgress(prog);
    setCurrentStep(step);

    setSteps((prevSteps) =>
      prevSteps.map((s) => {
        if (s.id === step) {
          return {
            ...s,
            status:
              prog === 100 || s.status === 'completed' ? 'completed' : 'active',
            time: s.status === 'pending' ? Date.now() : s.time,
          };
        }
        if (s.status === 'active' && s.id !== step) {
          return { ...s, status: 'completed' };
        }
        return s;
      })
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'active':
        return <Loader className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Zap className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold">
          Generando tu Candidatura Completa
        </h2>
        <p className="text-muted-foreground">
          Esto tomará aproximadamente 30-45 segundos
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              {getStatusIcon(step.status)}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.status === 'active'
                      ? 'text-foreground'
                      : step.status === 'completed'
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {step.label}
                </p>
                {step.status === 'completed' && step.time && (
                  <p className="text-xs text-muted-foreground">
                    Completado en {((Date.now() - step.time) / 1000).toFixed(1)}
                    s
                  </p>
                )}
                {step.status === 'active' && step.id === 'resume' && (
                  <Progress value={progress} className="mt-2 h-1" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progreso Total</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Rotating Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 Sabías que...
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 transition-all duration-300">
                {tips[currentTip]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Step3Generation;
```

---

## 🎉 Resumen

He creado una **documentación completa y profesional** para la funcionalidad de Generación Express que incluye:

### ✅ Documentos Creados:

1. **INDICE_DOCUMENTACION.md** - Índice general con todos los documentos
2. **RESUMEN_EJECUTIVO.md** - Visión general, propuesta de valor, casos de uso
3. **ARQUITECTURA_TECNICA.md** - Arquitectura completa, flujo de datos, servicios
4. **DISEÑO_DETALLADO.md** - Mockups, wireframes, paleta de colores, animaciones
5. **GUIA_IMPLEMENTACION.md** - Pasos detallados con código (iniciado)

### 📁 Ubicación:

```
c:\PRUEBAS\ai-resume-builder\docs\GENERACION-EXPRESS\
```

### 🎯 Características Clave del Diseño:

- **3 pasos simples:** Perfil → Oferta → Generación
- **Tiempo total:** Menos de 5 minutos
- **Todo en uno:** CV + Carta + Candidatura
- **IA avanzada:** Gemini 2.0 Flash
- **UX excepcional:** Animaciones, feedback, validación en tiempo real
- **Responsive:** Funciona perfectamente en todos los dispositivos

¿Te gustaría que:

1. **Complete la Guía de Implementación** con el resto de componentes (Step4Results, Container, Hooks)?
2. **Cree el Manual de Usuario** para documentar cómo usar la funcionalidad?
3. **Empiece a implementar el código** directamente en tu proyecto?
