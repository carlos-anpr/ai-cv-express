# Guía de Implementación: Mejora de Generación de Contenido con IA

## 📋 Plan de Implementación

### Orden de Ejecución

```
FASE 1: Servicios Base
  └─ 1.1. Crear servicio AIContentEnhancer
  └─ 1.2. Crear prompts de mejora
  └─ 1.3. Crear prompts de skills
  └─ 1.4. Crear custom hooks

FASE 2: Componentes UI Compartidos
  └─ 2.1. Crear AIOptionsDialog
  └─ 2.2. Crear AIPreviewPanel
  └─ 2.3. Crear SkillsGeneratorInput
  └─ 2.4. Crear GeneratedSkillsPreview

FASE 3: Integración en Summary
  └─ 3.1. Modificar Summary.jsx
  └─ 3.2. Testing funcional

FASE 4: Integración en Experience
  └─ 4.1. Modificar RichTextEditor.jsx
  └─ 4.2. Testing funcional

FASE 5: Integración en Skills
  └─ 5.1. Modificar Skills.jsx
  └─ 5.2. Testing funcional

FASE 6: Testing Final y Documentación
  └─ 6.1. Testing de integración
  └─ 6.2. Ajustes de UX
  └─ 6.3. Documentación de usuario
```

---

## 🚀 FASE 1: Servicios Base

### Paso 1.1: Crear AIContentEnhancer.js

**Ubicación**: `src/services/AIContentEnhancer.js`

```javascript
import { AIChatSession } from '../../service/AIModal';
import {
  summaryEnhancementPrompt,
  summaryExpansionPrompt,
  summaryGenerationPrompt,
  experienceEnhancementPrompt,
  experienceExpansionPrompt,
  experienceGenerationPrompt,
} from './prompts/enhancementPrompts';
import { skillsParserPrompt } from './prompts/skillsPrompts';

class AIContentEnhancer {
  hasSignificantContent(text) {
    if (!text) return false;
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const wordCount = cleanText.split(/\s+/).filter((w) => w.length > 0).length;
    return cleanText.length > 10 && wordCount > 3;
  }

  detectContentMode(content) {
    return this.hasSignificantContent(content) ? 'enhance' : 'generate';
  }

  async enhanceSummary(currentText, jobTitle, option = 'improve') {
    const mode = this.detectContentMode(currentText);

    let prompt;
    if (mode === 'generate') {
      prompt = summaryGenerationPrompt(jobTitle);
    } else {
      switch (option) {
        case 'improve':
          prompt = summaryEnhancementPrompt(currentText, jobTitle);
          break;
        case 'expand':
          prompt = summaryExpansionPrompt(currentText, jobTitle);
          break;
        case 'regenerate':
          prompt = summaryGenerationPrompt(jobTitle);
          break;
        default:
          prompt = summaryEnhancementPrompt(currentText, jobTitle);
      }
    }

    try {
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const response = JSON.parse(result.response.text());
      return response;
    } catch (error) {
      console.error('Error in enhanceSummary:', error);
      throw error;
    }
  }

  async enhanceExperience(
    currentText,
    jobTitle,
    companyName,
    option = 'improve'
  ) {
    const mode = this.detectContentMode(currentText);

    let prompt;
    if (mode === 'generate') {
      prompt = experienceGenerationPrompt(jobTitle);
    } else {
      const points = this.extractPointsFromHTML(currentText);

      switch (option) {
        case 'improve':
          prompt = experienceEnhancementPrompt(points, jobTitle, companyName);
          break;
        case 'expand':
          prompt = experienceExpansionPrompt(points, jobTitle, companyName);
          break;
        case 'reorganize':
          prompt = experienceEnhancementPrompt(
            points,
            jobTitle,
            companyName,
            true
          );
          break;
        default:
          prompt = experienceEnhancementPrompt(points, jobTitle, companyName);
      }
    }

    try {
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const response = JSON.parse(result.response.text());

      return this.pointsToHTML(response.points);
    } catch (error) {
      console.error('Error in enhanceExperience:', error);
      throw error;
    }
  }

  extractPointsFromHTML(html) {
    if (!html) return [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const listItems = tempDiv.querySelectorAll('li');
    return Array.from(listItems).map((li) => li.textContent.trim());
  }

  pointsToHTML(points) {
    if (!points || points.length === 0) return '';
    const listItems = points.map((point) => `<li>${point}</li>`).join('');
    return `<ul>${listItems}</ul>`;
  }

  async parseSkillsFromText(description, jobTitle) {
    const prompt = skillsParserPrompt(description, jobTitle);

    try {
      const chatSession = AIChatSession();
      const result = await chatSession.sendMessage(prompt);
      const response = JSON.parse(result.response.text());

      return response.skills.map((skill) => ({
        name: skill.name,
        rating: this.normalizeSkillRating(skill.level),
      }));
    } catch (error) {
      console.error('Error in parseSkillsFromText:', error);
      throw error;
    }
  }

  normalizeSkillRating(level) {
    if (typeof level === 'number') return Math.min(Math.max(level, 0), 5);

    const levelMap = {
      experto: 5,
      avanzado: 5,
      expert: 5,
      advanced: 5,
      intermedio: 3,
      medio: 3,
      intermediate: 3,
      básico: 2,
      basico: 2,
      basic: 2,
      principiante: 2,
      beginner: 2,
      conocimientos: 1,
      familiar: 1,
      knowledge: 1,
    };

    const normalizedLevel = level.toLowerCase().trim();
    return levelMap[normalizedLevel] || 3;
  }
}

export default new AIContentEnhancer();
```

**Testing**:

```javascript
// En consola del navegador
import AIContentEnhancer from './services/AIContentEnhancer';
console.log(AIContentEnhancer.hasSignificantContent('Hola mundo test'));
// Debería devolver: true
```

---

### Paso 1.2: Crear enhancementPrompts.js

**Ubicación**: `src/services/prompts/enhancementPrompts.js`

```javascript
export const summaryEnhancementPrompt = (currentText, jobTitle) => `
Eres un experto en redacción de currículums profesionales. Tu tarea es mejorar el siguiente resumen profesional manteniendo la esencia y experiencias específicas del usuario.

CONTEXTO:
- Puesto de trabajo: ${jobTitle}
- Resumen actual del usuario: "${currentText}"

INSTRUCCIONES:
1. Mantén todas las experiencias y logros específicos mencionados por el usuario
2. Mejora la redacción haciéndola más profesional y atractiva
3. Asegúrate de que el tono sea apropiado para el puesto
4. Mantén una longitud similar al original (±20%)
5. Usa verbos de acción y lenguaje impactante
6. NO inventes experiencias que no estén en el texto original

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "improved": "resumen mejorado aquí",
  "original_length": número de palabras del original,
  "improved_length": número de palabras de la mejora,
  "changes_made": ["lista de mejoras aplicadas"]
}

Toda la respuesta debe estar en castellano (español).
`;

export const summaryExpansionPrompt = (currentText, jobTitle) => `
Eres un experto en redacción de currículums profesionales. Tu tarea es ampliar y hacer más atractivo el siguiente resumen profesional.

CONTEXTO:
- Puesto de trabajo: ${jobTitle}
- Resumen actual del usuario: "${currentText}"

INSTRUCCIONES:
1. Mantén todas las experiencias mencionadas por el usuario
2. Amplía cada punto con más detalles profesionales
3. Añade elementos que hagan el perfil más atractivo:
   - Menciona posibles metodologías o frameworks relevantes
   - Destaca habilidades blandas implícitas
   - Añade contexto sobre el impacto del trabajo
4. Amplía el texto en un 50-80% más que el original
5. Mantén coherencia y fluidez
6. NO inventes logros específicos o números

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "expanded": "resumen ampliado aquí",
  "additions": ["lista de elementos añadidos"],
  "length_increase": "porcentaje de aumento"
}

Toda la respuesta debe estar en castellano (español).
`;

export const summaryGenerationPrompt = (jobTitle) => `
Puesto de Trabajo: ${jobTitle}. 

Según el puesto de trabajo, genera 3 resúmenes profesionales para diferentes niveles de experiencia:
- Senior (7+ años): 6-7 líneas
- Nivel Medio (3-6 años): 5-6 líneas  
- Junior/Principiante (0-2 años): 4-5 líneas

INSTRUCCIONES:
1. Cada resumen debe ser único y específico para el nivel
2. Usa verbos de acción y lenguaje impactante
3. Menciona tecnologías y metodologías relevantes para el puesto
4. Enfoca en logros y valor aportado
5. Mantén tono profesional pero accesible

FORMATO DE RESPUESTA:
Devuelve un JSON array con la siguiente estructura:
[
  {
    "summary": "texto del resumen",
    "experience_level": "Senior|Nivel Medio|Junior"
  }
]

Toda la respuesta debe estar en castellano (español).
`;

export const experienceEnhancementPrompt = (
  points,
  jobTitle,
  companyName,
  reorganize = false
) => `
Eres un experto en redacción de experiencia laboral para currículums. Tu tarea es mejorar los siguientes puntos de experiencia.

CONTEXTO:
- Puesto: ${jobTitle}
- Empresa: ${companyName}
- Puntos actuales:
${points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

INSTRUCCIONES:
1. Mejora la redacción de cada punto haciéndola más profesional
2. Usa la metodología CAR (Contexto, Acción, Resultado) cuando sea posible
3. Añade verbos de acción fuertes al inicio de cada punto
4. Mantén las experiencias específicas del usuario
5. ${
  reorganize
    ? 'Reorganiza los puntos por orden de impacto/relevancia'
    : 'Mantén el orden original'
}
6. Si un punto puede mejorarse con métricas sugeridas, indícalo entre [paréntesis]
7. NO inventes logros o responsabilidades que no estén implícitas en el texto

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "points": ["punto 1 mejorado", "punto 2 mejorado", ...],
  "improvements": ["lista de mejoras aplicadas a cada punto"]
}

Toda la respuesta debe estar en castellano (español).
`;

export const experienceExpansionPrompt = (points, jobTitle, companyName) => `
Eres un experto en redacción de experiencia laboral para currículums. Tu tarea es ampliar y enriquecer los siguientes puntos de experiencia.

CONTEXTO:
- Puesto: ${jobTitle}
- Empresa: ${companyName}
- Puntos actuales:
${points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

INSTRUCCIONES:
1. Amplía cada punto con más detalles y contexto
2. Añade sub-puntos específicos cuando sea apropiado
3. Incluye metodologías, tecnologías o frameworks relevantes
4. Sugiere métricas cuantificables entre [paréntesis] como: [ej: "aumentando productividad en X%"]
5. Menciona impacto y resultados del trabajo
6. Expande el contenido en un 50-70% más
7. Mantén coherencia entre todos los puntos
8. NO inventes responsabilidades completamente nuevas

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "points": ["punto 1 expandido", "punto 2 expandido", ...],
  "expansions_made": ["lista de expansiones aplicadas"]
}

Toda la respuesta debe estar en castellano (español).
`;

export const experienceGenerationPrompt = (jobTitle) => `
Puesto de Trabajo: ${jobTitle}. 

Según el título del puesto, genera entre 5-7 puntos clave para describir experiencia profesional en un currículum.

INSTRUCCIONES:
1. Usa verbos de acción al inicio de cada punto
2. Enfoca en responsabilidades típicas del puesto
3. Incluye tecnologías y metodologías relevantes
4. Menciona resultados e impacto cuando sea apropiado
5. Haz los puntos específicos pero aplicables
6. NO uses formato JSON array

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "jobTitle": "${jobTitle}",
  "points": ["punto 1", "punto 2", ...]
}

Toda la respuesta debe estar en castellano (español).
`;
```

---

### Paso 1.3: Crear skillsPrompts.js

**Ubicación**: `src/services/prompts/skillsPrompts.js`

```javascript
export const skillsParserPrompt = (description, jobTitle) => `
Eres un experto en análisis de habilidades técnicas y profesionales. Tu tarea es extraer y clasificar habilidades de una descripción en lenguaje natural.

CONTEXTO:
- Puesto de trabajo: ${jobTitle}
- Descripción del usuario: "${description}"

INSTRUCCIONES:
1. Identifica todas las habilidades técnicas mencionadas
2. Normaliza los nombres de tecnologías/herramientas a su forma estándar
   - Ejemplos: "nodejs" → "Node.js", "react js" → "React", "javascript" → "JavaScript"
3. Detecta el nivel de dominio basado en keywords:
   - Experto/Avanzado/Domino: nivel "experto"
   - Intermedio/Medio/Sólido: nivel "intermedio"
   - Básico/Principiante/Conocimientos: nivel "básico"
4. Si no se menciona nivel explícito, asume "intermedio"
5. Incluye solo habilidades técnicas relevantes para el puesto
6. Ordena por relevancia para el puesto

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "skills": [
    {
      "name": "nombre normalizado de la skill",
      "level": "experto|intermedio|básico",
      "detected_from": "texto donde se detectó"
    }
  ],
  "unrecognized": ["términos que no se pudieron clasificar"],
  "suggestions": ["sugerencias de skills relacionadas al puesto"]
}

EJEMPLOS:
Input: "Domino Node.js a nivel experto, React conocimientos básicos"
Output: {
  "skills": [
    { "name": "Node.js", "level": "experto", "detected_from": "Domino Node.js a nivel experto" },
    { "name": "React", "level": "básico", "detected_from": "React conocimientos básicos" }
  ]
}

Toda la respuesta debe estar en castellano (español).
`;

export const skillsNormalizationMap = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  react: 'React',
  reactjs: 'React',
  'react.js': 'React',
  vue: 'Vue.js',
  vuejs: 'Vue.js',
  angular: 'Angular',
  next: 'Next.js',
  nextjs: 'Next.js',
  python: 'Python',
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mongo: 'MongoDB',
  mongodb: 'MongoDB',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud',
  git: 'Git',
  github: 'GitHub',
  gitlab: 'GitLab',
};

export const normalizeSkillName = (skillName) => {
  const normalized = skillName.toLowerCase().trim();
  return (
    skillsNormalizationMap[normalized] ||
    skillName.charAt(0).toUpperCase() + skillName.slice(1)
  );
};
```

---

### Paso 1.4: Crear Custom Hooks

**Ubicación**: `src/hooks/useAIContentEnhancement.js`

```javascript
import { useState } from 'react';
import AIContentEnhancer from '../services/AIContentEnhancer';
import { toast } from 'sonner';

export const useAIContentEnhancement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  const detectMode = (content) => {
    return AIContentEnhancer.detectContentMode(content);
  };

  const enhanceSummary = async (currentText, jobTitle, option = 'improve') => {
    setIsLoading(true);
    setOriginalContent(currentText);

    try {
      const result = await AIContentEnhancer.enhanceSummary(
        currentText,
        jobTitle,
        option
      );

      // Manejar diferentes estructuras de respuesta
      const content =
        result.improved || result.expanded || result[0]?.summary || '';
      setImprovedContent(content);
      setShowPreview(true);
      return result;
    } catch (error) {
      console.error('Error enhancing summary:', error);
      toast.error('Error al mejorar el resumen. Por favor intenta de nuevo.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceExperience = async (
    currentText,
    jobTitle,
    companyName,
    option = 'improve'
  ) => {
    setIsLoading(true);
    setOriginalContent(currentText);

    try {
      const result = await AIContentEnhancer.enhanceExperience(
        currentText,
        jobTitle,
        companyName,
        option
      );

      setImprovedContent(result);
      setShowPreview(true);
      return result;
    } catch (error) {
      console.error('Error enhancing experience:', error);
      toast.error(
        'Error al mejorar la experiencia. Por favor intenta de nuevo.'
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const applyImprovedContent = () => {
    setShowPreview(false);
    return improvedContent;
  };

  const cancelImprovement = () => {
    setShowPreview(false);
    setImprovedContent('');
    return originalContent;
  };

  const regenerateContent = async (type, ...params) => {
    if (type === 'summary') {
      return await enhanceSummary(params[0], params[1], 'regenerate');
    } else if (type === 'experience') {
      return await enhanceExperience(
        params[0],
        params[1],
        params[2],
        'regenerate'
      );
    }
  };

  return {
    isLoading,
    showOptions,
    showPreview,
    improvedContent,
    originalContent,
    setShowOptions,
    setShowPreview,
    detectMode,
    enhanceSummary,
    enhanceExperience,
    applyImprovedContent,
    cancelImprovement,
    regenerateContent,
  };
};
```

**Ubicación**: `src/hooks/useSkillsGenerator.js`

```javascript
import { useState } from 'react';
import AIContentEnhancer from '../services/AIContentEnhancer';
import { toast } from 'sonner';

export const useSkillsGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSkills, setGeneratedSkills] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [skillsDescription, setSkillsDescription] = useState('');

  const generateSkills = async (description, jobTitle) => {
    if (!description || description.trim().length < 10) {
      toast.error(
        'Por favor escribe una descripción más detallada de tus habilidades'
      );
      return;
    }

    setIsLoading(true);
    setSkillsDescription(description);

    try {
      const result = await AIContentEnhancer.parseSkillsFromText(
        description,
        jobTitle
      );

      setGeneratedSkills(result);
      setShowPreview(true);

      toast.success(`Se generaron ${result.length} habilidades`);
      return result;
    } catch (error) {
      console.error('Error generating skills:', error);
      toast.error('Error al generar habilidades. Por favor intenta de nuevo.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const editGeneratedSkill = (index, updates) => {
    const updated = [...generatedSkills];
    updated[index] = { ...updated[index], ...updates };
    setGeneratedSkills(updated);
  };

  const removeGeneratedSkill = (index) => {
    const updated = generatedSkills.filter((_, i) => i !== index);
    setGeneratedSkills(updated);
  };

  const applyGeneratedSkills = () => {
    setShowPreview(false);
    return generatedSkills;
  };

  const cancelGeneration = () => {
    setShowPreview(false);
    setGeneratedSkills([]);
    setSkillsDescription('');
  };

  return {
    isLoading,
    generatedSkills,
    showPreview,
    skillsDescription,
    setSkillsDescription,
    generateSkills,
    editGeneratedSkill,
    removeGeneratedSkill,
    applyGeneratedSkills,
    cancelGeneration,
  };
};
```

---

## 🎨 FASE 2: Componentes UI Compartidos

### Paso 2.1: Crear AIOptionsDialog.jsx

**Ubicación**: `src/dashboard/resume/components/AIOptionsDialog.jsx`

```javascript
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const AIOptionsDialog = ({ isOpen, onClose, onSelect, options, title }) => {
  const handleSelect = (optionId) => {
    onSelect(optionId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || '¿Qué deseas hacer?'}</DialogTitle>
          <DialogDescription>
            Selecciona cómo quieres que la IA te ayude con tu contenido
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="w-full justify-start text-left h-auto py-4"
              onClick={() => handleSelect(option.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <div className="font-semibold">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIOptionsDialog;
```

---

### Paso 2.2: Crear AIPreviewPanel.jsx

**Ubicación**: `src/dashboard/resume/components/AIPreviewPanel.jsx`

```javascript
import React from 'react';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Check, X, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const AIPreviewPanel = ({
  isOpen,
  title,
  content,
  originalContent,
  onApply,
  onRegenerate,
  onCancel,
  isLoading,
  showComparison = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || '✨ Versión Mejorada'}</DialogTitle>
          <DialogDescription>
            Revisa el contenido generado y aplícalo si te gusta
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {showComparison && originalContent && (
            <div>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                Original:
              </h4>
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-muted">
                <div
                  dangerouslySetInnerHTML={{ __html: originalContent }}
                  className="text-sm opacity-70"
                />
              </div>
            </div>
          )}

          <div>
            {showComparison && (
              <h4 className="font-semibold text-sm mb-2 text-primary">
                Mejorado:
              </h4>
            )}
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerar
          </Button>
          <Button
            onClick={onApply}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            <Check className="h-4 w-4 mr-2" />
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIPreviewPanel;
```

---

### Paso 2.3 y 2.4: Componentes de Skills

Se implementarán en la Fase 5 junto con la integración completa de Skills.

---

## ✏️ FASE 3: Integración en Summary

### Paso 3.1: Modificar Summary.jsx

**Archivo**: `src/dashboard/resume/components/forms/Summary.jsx`

**Cambios a realizar**:

1. Añadir imports nuevos
2. Integrar hook de mejora
3. Detectar modo del botón
4. Añadir diálogo de opciones
5. Añadir panel de preview

```javascript
// AÑADIR IMPORTS
import { useAIContentEnhancement } from '../../../../hooks/useAIContentEnhancement';
import AIOptionsDialog from '../AIOptionsDialog';
import AIPreviewPanel from '../AIPreviewPanel';

// DENTRO DEL COMPONENTE, DESPUÉS DE LOS ESTADOS EXISTENTES
const {
  isLoading: isEnhancing,
  showOptions,
  showPreview,
  improvedContent,
  setShowOptions,
  setShowPreview,
  detectMode,
  enhanceSummary,
  applyImprovedContent,
  cancelImprovement,
  regenerateContent,
} = useAIContentEnhancement();

// DETECTAR MODO DEL BOTÓN
const contentMode = detectMode(summary);
const aiButtonText =
  contentMode === 'enhance' ? 'Mejorar con IA' : 'Generar con IA';

// MODIFICAR handleAIAction
const handleAIAction = () => {
  if (!resumeInfo?.jobTitle) {
    toast.error('Por favor añade primero el título del puesto');
    return;
  }

  if (contentMode === 'enhance') {
    // Mostrar opciones de mejora
    setShowOptions(true);
  } else {
    // Generar desde cero
    GenerateSummaryFromAI();
  }
};

// HANDLER PARA SELECCIÓN DE OPCIÓN
const handleOptionSelect = async (option) => {
  try {
    await enhanceSummary(summary, resumeInfo.jobTitle, option);
  } catch (error) {
    console.error('Error:', error);
  }
};

// HANDLER PARA APLICAR CONTENIDO MEJORADO
const handleApplyImproved = () => {
  const newContent = applyImprovedContent();
  setSummary(newContent);
  toast.success('Contenido aplicado correctamente');
};

// HANDLER PARA REGENERAR
const handleRegenerate = async () => {
  try {
    await regenerateContent('summary', summary, resumeInfo.jobTitle);
  } catch (error) {
    console.error('Error:', error);
  }
};

// EN EL RETURN, MODIFICAR EL BOTÓN
<Button
  type="button"
  variant="outline"
  size="sm"
  className="border-primary text-primary"
  onClick={handleAIAction}
  disabled={loading || isEnhancing}
>
  {isEnhancing ? (
    <LoaderCircle className="animate-spin h-4 w-4" />
  ) : (
    <WandSparkles className="h-4 w-4" />
  )}
  {aiButtonText}
</Button>;

// AL FINAL DEL RETURN, ANTES DEL CIERRE DEL DIV PRINCIPAL
{
  /* Diálogo de opciones */
}
<AIOptionsDialog
  isOpen={showOptions}
  onClose={() => setShowOptions(false)}
  onSelect={handleOptionSelect}
  title="¿Cómo quieres mejorar tu resumen?"
  options={[
    {
      id: 'improve',
      icon: '✨',
      label: 'Mejorar mi texto actual',
      description: 'Mantiene tu contenido pero lo hace más profesional',
    },
    {
      id: 'expand',
      icon: '📈',
      label: 'Ampliar y hacer más atractivo',
      description: 'Añade más detalles y contexto profesional',
    },
    {
      id: 'regenerate',
      icon: '🎯',
      label: 'Generar nuevas opciones',
      description: 'Crea versiones completamente nuevas',
    },
  ]}
/>;

{
  /* Panel de preview */
}
<AIPreviewPanel
  isOpen={showPreview}
  title="✨ Resumen Mejorado"
  content={improvedContent}
  originalContent={summary}
  onApply={handleApplyImproved}
  onRegenerate={handleRegenerate}
  onCancel={() => {
    cancelImprovement();
    setShowPreview(false);
  }}
  isLoading={isEnhancing}
  showComparison={true}
/>;
```

---

**Continuará en el siguiente mensaje con las Fases 4, 5 y 6...**

---

## 📝 Checklist de Validación

### Fase 1 - Servicios ✅

- [ ] AIContentEnhancer.js creado y funcional
- [ ] enhancementPrompts.js creado
- [ ] skillsPrompts.js creado
- [ ] useAIContentEnhancement.js creado
- [ ] useSkillsGenerator.js creado

### Fase 2 - Componentes UI ✅

- [ ] AIOptionsDialog.jsx creado
- [ ] AIPreviewPanel.jsx creado

### Fase 3 - Summary ⏳

- [ ] Summary.jsx modificado
- [ ] Botón cambia de texto según contenido
- [ ] Diálogo de opciones funciona
- [ ] Preview panel funciona
- [ ] Aplicar contenido funciona

---

**Próximo Documento**: Continuación con Fases 4, 5 y 6
