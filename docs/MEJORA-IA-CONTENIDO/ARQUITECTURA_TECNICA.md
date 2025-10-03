# Arquitectura Técnica: Mejora de Generación de Contenido con IA

## 🏗️ Visión General de la Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                  │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │ Summary  │  │Experience│  │ Skills (Nuevo)     │   │
│  │ Component│  │Component │  │ Component          │   │
│  └────┬─────┘  └────┬─────┘  └─────────┬──────────┘   │
└───────┼─────────────┼──────────────────┼──────────────┘
        │             │                  │
        │             │                  │
┌───────┼─────────────┼──────────────────┼──────────────┐
│       │      CAPA DE LÓGICA DE NEGOCIO │              │
│  ┌────▼─────────────▼──────────────────▼────────┐     │
│  │        AIContentEnhancer Service             │     │
│  │  • detectContentMode()                        │     │
│  │  • enhanceContent()                           │     │
│  │  • expandContent()                            │     │
│  │  • parseSkillsFromText()                      │     │
│  └────────────────────┬──────────────────────────┘     │
└─────────────────────┼───────────────────────────────┘
                      │
                      │
┌─────────────────────▼───────────────────────────────┐
│                 CAPA DE SERVICIOS IA                 │
│  ┌──────────────────────────────────────────┐       │
│  │         AIModal.js (Extendido)           │       │
│  │  • AIChatSession()                        │       │
│  │  • AIChatSessionText()                    │       │
│  │  • AIChatSessionEnhanced() (Nuevo)        │       │
│  └────────────────────┬──────────────────────┘       │
└─────────────────────┼───────────────────────────────┘
                      │
                      │
┌─────────────────────▼───────────────────────────────┐
│            PROMPTS & CONFIGURACIÓN                   │
│  ┌────────────────────────────────────────┐         │
│  │  enhancementPrompts.js (Nuevo)         │         │
│  │  • summaryEnhancementPrompt            │         │
│  │  • experienceEnhancementPrompt         │         │
│  │  • skillsParserPrompt                  │         │
│  │  • contentExpansionPrompt              │         │
│  └────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────┘
```

---

## 📦 Estructura de Archivos

### Archivos Nuevos

```
src/
├── services/
│   ├── AIContentEnhancer.js        (NUEVO)
│   └── prompts/
│       ├── enhancementPrompts.js   (NUEVO)
│       └── skillsPrompts.js        (NUEVO)
│
├── dashboard/resume/components/
│   ├── AIOptionsDialog.jsx         (NUEVO)
│   ├── AIPreviewPanel.jsx          (NUEVO)
│   └── forms/
│       ├── SkillsGeneratorInput.jsx (NUEVO)
│       └── GeneratedSkillsPreview.jsx (NUEVO)
│
└── hooks/
    ├── useAIContentEnhancement.js  (NUEVO)
    └── useSkillsGenerator.js       (NUEVO)
```

### Archivos Modificados

```
src/dashboard/resume/components/forms/
├── Summary.jsx                     (MODIFICAR)
├── Experience.jsx                  (MODIFICAR)
├── Skills.jsx                      (MODIFICAR)
└── RichTextEditor.jsx              (MODIFICAR)

service/
└── AIModal.js                      (EXTENDER)
```

---

## 🔧 Servicios y Utilidades

### 1. AIContentEnhancer.js (Nuevo Servicio)

```javascript
/**
 * Servicio central para mejora de contenido con IA
 * Maneja toda la lógica de detección y mejora de contenido
 */

import { AIChatSession } from '../../service/AIModal';
import {
  summaryEnhancementPrompt,
  summaryExpansionPrompt,
  summaryGenerationPrompt,
  experienceEnhancementPrompt,
  experienceExpansionPrompt,
  experienceGenerationPrompt,
} from './prompts/enhancementPrompts';
import {
  skillsParserPrompt,
  skillsCategorizationPrompt,
} from './prompts/skillsPrompts';

class AIContentEnhancer {
  /**
   * Detecta si el contenido está vacío o tiene texto significativo
   */
  hasSignificantContent(text) {
    if (!text) return false;
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const wordCount = cleanText.split(/\s+/).filter((w) => w.length > 0).length;
    return cleanText.length > 10 && wordCount > 3;
  }

  /**
   * Determina el modo de operación basado en el contenido
   */
  detectContentMode(content) {
    return this.hasSignificantContent(content) ? 'enhance' : 'generate';
  }

  /**
   * Mejora el resumen profesional existente
   */
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

    const chatSession = AIChatSession();
    const result = await chatSession.sendMessage(prompt);
    return JSON.parse(result.response.text());
  }

  /**
   * Mejora la descripción de experiencia laboral
   */
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
      // Extraer puntos del HTML
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

    const chatSession = AIChatSession();
    const result = await chatSession.sendMessage(prompt);
    const response = JSON.parse(result.response.text());

    // Convertir puntos a HTML
    return this.pointsToHTML(response.points);
  }

  /**
   * Extrae puntos de texto de HTML
   */
  extractPointsFromHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const listItems = tempDiv.querySelectorAll('li');
    return Array.from(listItems).map((li) => li.textContent.trim());
  }

  /**
   * Convierte array de puntos a HTML con formato
   */
  pointsToHTML(points) {
    const listItems = points.map((point) => `<li>${point}</li>`).join('');
    return `<ul>${listItems}</ul>`;
  }

  /**
   * Parsea descripción de habilidades en lenguaje natural
   */
  async parseSkillsFromText(description, jobTitle) {
    const prompt = skillsParserPrompt(description, jobTitle);
    const chatSession = AIChatSession();
    const result = await chatSession.sendMessage(prompt);
    const response = JSON.parse(result.response.text());

    // Normalizar ratings
    return response.skills.map((skill) => ({
      name: skill.name,
      rating: this.normalizeSkillRating(skill.level),
    }));
  }

  /**
   * Normaliza el nivel de habilidad a rating numérico (1-5)
   */
  normalizeSkillRating(level) {
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
    return levelMap[normalizedLevel] || 3; // Default a intermedio
  }

  /**
   * Categoriza habilidades automáticamente
   */
  async categorizeSkills(skills) {
    const prompt = skillsCategorizationPrompt(skills);
    const chatSession = AIChatSession();
    const result = await chatSession.sendMessage(prompt);
    return JSON.parse(result.response.text());
  }
}

export default new AIContentEnhancer();
```

---

## 📝 Prompts Detallados

### enhancementPrompts.js

```javascript
/**
 * Prompts para mejora de contenido
 */

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

### skillsPrompts.js

```javascript
/**
 * Prompts para generación y clasificación de habilidades
 */

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

export const skillsCategorizationPrompt = (skills) => `
Eres un experto en categorización de habilidades técnicas. Tu tarea es organizar habilidades en categorías profesionales.

HABILIDADES A CATEGORIZAR:
${skills.map((s) => `- ${s.name} (${s.rating}/5)`).join('\n')}

INSTRUCCIONES:
1. Agrupa las habilidades en categorías relevantes:
   - Lenguajes de Programación
   - Frameworks y Librerías
   - Bases de Datos
   - DevOps y Cloud
   - Herramientas y Metodologías
   - Otras
2. Ordena skills dentro de cada categoría por rating (mayor a menor)
3. Identifica posibles gaps o skills complementarias que deberían considerarse

FORMATO DE RESPUESTA:
Devuelve un JSON con la siguiente estructura:
{
  "categorized": {
    "categoria1": [
      { "name": "skill", "rating": 5 }
    ]
  },
  "suggested_additions": ["skills que complementarían el perfil"],
  "skill_gaps": ["áreas donde podría fortalecer"]
}

Toda la respuesta debe estar en castellano (español).
`;

export const skillsNormalizationMap = {
  // JavaScript Ecosystem
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

  // Python Ecosystem
  python: 'Python',
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',

  // Databases
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mongo: 'MongoDB',
  mongodb: 'MongoDB',

  // DevOps
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud',

  // Others
  git: 'Git',
  github: 'GitHub',
  gitlab: 'GitLab',
  jira: 'Jira',
  agile: 'Agile',
  scrum: 'Scrum',
};

/**
 * Normaliza el nombre de una skill usando el mapa
 */
export const normalizeSkillName = (skillName) => {
  const normalized = skillName.toLowerCase().trim();
  return (
    skillsNormalizationMap[normalized] ||
    skillName.charAt(0).toUpperCase() + skillName.slice(1)
  );
};
```

---

## 🎣 Custom Hooks

### useAIContentEnhancement.js

```javascript
import { useState } from 'react';
import AIContentEnhancer from '../services/AIContentEnhancer';
import { toast } from 'sonner';

/**
 * Hook personalizado para mejora de contenido con IA
 */
export const useAIContentEnhancement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  /**
   * Detecta el modo basado en el contenido
   */
  const detectMode = (content) => {
    return AIContentEnhancer.detectContentMode(content);
  };

  /**
   * Mejora un resumen profesional
   */
  const enhanceSummary = async (currentText, jobTitle, option = 'improve') => {
    setIsLoading(true);
    setOriginalContent(currentText);

    try {
      const result = await AIContentEnhancer.enhanceSummary(
        currentText,
        jobTitle,
        option
      );

      setImprovedContent(result.improved || result[0]?.summary);
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

  /**
   * Mejora experiencia laboral
   */
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

  /**
   * Aplica el contenido mejorado
   */
  const applyImprovedContent = () => {
    setShowPreview(false);
    return improvedContent;
  };

  /**
   * Cancela la mejora
   */
  const cancelImprovement = () => {
    setShowPreview(false);
    setImprovedContent('');
    return originalContent;
  };

  /**
   * Regenera el contenido
   */
  const regenerateContent = async (type, ...params) => {
    if (type === 'summary') {
      return await enhanceSummary(...params, 'regenerate');
    } else if (type === 'experience') {
      return await enhanceExperience(...params, 'regenerate');
    }
  };

  return {
    isLoading,
    showOptions,
    showPreview,
    improvedContent,
    originalContent,
    setShowOptions,
    detectMode,
    enhanceSummary,
    enhanceExperience,
    applyImprovedContent,
    cancelImprovement,
    regenerateContent,
  };
};
```

### useSkillsGenerator.js

```javascript
import { useState } from 'react';
import AIContentEnhancer from '../services/AIContentEnhancer';
import { toast } from 'sonner';

/**
 * Hook personalizado para generación de skills con IA
 */
export const useSkillsGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSkills, setGeneratedSkills] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [skillsDescription, setSkillsDescription] = useState('');

  /**
   * Genera skills desde descripción en lenguaje natural
   */
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

  /**
   * Edita una skill generada
   */
  const editGeneratedSkill = (index, updates) => {
    const updated = [...generatedSkills];
    updated[index] = { ...updated[index], ...updates };
    setGeneratedSkills(updated);
  };

  /**
   * Elimina una skill generada
   */
  const removeGeneratedSkill = (index) => {
    const updated = generatedSkills.filter((_, i) => i !== index);
    setGeneratedSkills(updated);
  };

  /**
   * Aplica todas las skills generadas
   */
  const applyGeneratedSkills = () => {
    setShowPreview(false);
    return generatedSkills;
  };

  /**
   * Cancela la generación
   */
  const cancelGeneration = () => {
    setShowPreview(false);
    setGeneratedSkills([]);
    setSkillsDescription('');
  };

  /**
   * Categoriza las skills
   */
  const categorizeSkills = async (skills) => {
    setIsLoading(true);
    try {
      const result = await AIContentEnhancer.categorizeSkills(skills);
      return result;
    } catch (error) {
      console.error('Error categorizing skills:', error);
      toast.error('Error al categorizar habilidades.');
      throw error;
    } finally {
      setIsLoading(false);
    }
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
    categorizeSkills,
  };
};
```

---

## 🔌 Integración con Componentes Existentes

### Modificaciones en Summary.jsx

```javascript
// Imports adicionales
import { useAIContentEnhancement } from '@/hooks/useAIContentEnhancement';
import AIOptionsDialog from '../AIOptionsDialog';
import AIPreviewPanel from '../AIPreviewPanel';

// Dentro del componente
const {
  isLoading: isEnhancing,
  showOptions,
  showPreview,
  improvedContent,
  setShowOptions,
  detectMode,
  enhanceSummary,
  applyImprovedContent,
  cancelImprovement,
  regenerateContent,
} = useAIContentEnhancement();

// Detectar modo del botón
const mode = detectMode(summary);
const buttonText = mode === 'enhance' ? 'Mejorar con IA' : 'Generar con IA';

// Handler mejorado
const handleAIAction = () => {
  if (mode === 'enhance') {
    setShowOptions(true); // Mostrar opciones de mejora
  } else {
    GenerateSummaryFromAI(); // Generar desde cero
  }
};
```

---

## 📊 Diagrama de Flujo de Datos

```
Usuario Input
     ↓
[Component State]
     ↓
[Custom Hook]
     ↓
[AIContentEnhancer Service]
     ↓
[Prompt Generator]
     ↓
[AIModal Service]
     ↓
[Gemini API]
     ↓
[Response Parser]
     ↓
[Preview Component]
     ↓
[User Approval]
     ↓
[Apply to State]
     ↓
[LocalDatabase Save]
```

---

## 🧪 Testing Considerations

### Unit Tests

```javascript
// AIContentEnhancer.test.js
describe('AIContentEnhancer', () => {
  test('detecta contenido significativo correctamente', () => {
    expect(AIContentEnhancer.hasSignificantContent('text')).toBe(false);
    expect(AIContentEnhancer.hasSignificantContent('This is valid text')).toBe(
      true
    );
  });

  test('normaliza ratings correctamente', () => {
    expect(AIContentEnhancer.normalizeSkillRating('experto')).toBe(5);
    expect(AIContentEnhancer.normalizeSkillRating('intermedio')).toBe(3);
  });
});
```

---

**Próximo Documento**: [GUIA_IMPLEMENTACION.md](./GUIA_IMPLEMENTACION.md)
