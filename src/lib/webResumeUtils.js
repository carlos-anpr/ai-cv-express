/**
 * webResumeUtils.js - VERSIÓN PROFESIONAL ELEGANTE
 * Basado en diseño moderno con navegación sticky, hero section, timeline y skills premium
 * Sistema híbrido: Iconos predefinidos + matching inteligente
 */

import { AIChatSession } from '../../service/AIModal';

// (debug logs removed for production)

// Simple in-memory cache to avoid repeating AI calls for identical experience text
// Key format: `${jobTitleTarget}::${baseText}`
const skillCache = new Map();
const SKILL_CACHE_KEY = 'ai_resume_skill_cache_v1';

// Load cache from sessionStorage if present
function loadSkillCacheFromSession() {
  try {
    const raw = sessionStorage.getItem(SKILL_CACHE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([k, v]) => {
        if (Array.isArray(v) && v.length > 0) skillCache.set(k, v);
      });
    }
  } catch {
    // ignore parsing/session errors
  }
}

function saveSkillCacheToSession() {
  try {
    const obj = {};
    for (const [k, v] of skillCache.entries()) {
      if (Array.isArray(v) && v.length > 0) obj[k] = v;
    }
    sessionStorage.setItem(SKILL_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // ignore storage errors
  }
}

function getSkillCache(key) {
  return skillCache.get(key) || null;
}

function setSkillCache(key, value) {
  if (!key) return;
  if (!Array.isArray(value) || value.length === 0) return;
  skillCache.set(key, value);
  try {
    saveSkillCacheToSession();
  } catch {
    // ignore save errors
  }
}

// initialize cache from sessionStorage
try {
  loadSkillCacheFromSession();
} catch {
  /* ignore */
}

/**
 * Biblioteca de iconos SVG paths (Lucide) por categoría
 */
const ICON_LIBRARY = {
  // TECNOLOGÍA
  Backend: '<path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>',
  'Backend & APIs': '<path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>',
  Frontend:
    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>',
  Database:
    '<path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>',
  'Bases de Datos':
    '<path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>',
  Cloud:
    '<path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>',
  'DevOps & Cloud':
    '<path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>',

  // ELECTRICIDAD & OFICIOS
  Electricidad: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  Instalaciones: '<path d="M9 21V3m6 18V3M3 9h18M3 15h18"/>',
  Mantenimiento:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  Herramientas:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',

  // SALUD
  Salud:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',

  // DEFAULT
  default:
    '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
};

/**
 * Matching inteligente de iconos
 */
const findBestMatchIcon = async (category) => {
  const normalized = category?.trim() || 'default';

  // Match directo
  if (ICON_LIBRARY[normalized]) {
    return ICON_LIBRARY[normalized];
  }

  // Match por keywords
  const keywords = normalized.toLowerCase();
  for (const [key, icon] of Object.entries(ICON_LIBRARY)) {
    if (
      keywords.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(keywords)
    ) {
      return icon;
    }
  }
  // fallback
  return ICON_LIBRARY.default;
};
const getColorScheme = (jobTitle) => {
  const title = (jobTitle || '').toLowerCase();

  if (
    title.includes('developer') ||
    title.includes('programador') ||
    title.includes('software')
  ) {
    return { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' };
  }
  if (title.includes('electric') || title.includes('técnico')) {
    return { primary: '#f97316', secondary: '#ea580c', accent: '#fbbf24' };
  }
  if (title.includes('diseñ') || title.includes('creativ')) {
    return { primary: '#ec4899', secondary: '#a855f7', accent: '#f59e0b' };
  }

  return { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' };
};

/**
 * Normaliza la entrada de tema del usuario en una paleta { primary, secondary, accent }
 */
function normalizeTheme(inputTheme, jobTitle) {
  // Support theme objects that wrap colors under `.colors`
  if (
    inputTheme?.colors &&
    (inputTheme.colors.primary || inputTheme.colors.hex)
  ) {
    return normalizeTheme(inputTheme.colors, jobTitle);
  }

  // If a plain string is provided, treat it as a hex base
  if (inputTheme && typeof inputTheme === 'string') {
    inputTheme = { hex: inputTheme };
  }
  // If input is an object but uses alternate key names, normalize them to primary/secondary/accent
  if (inputTheme && typeof inputTheme === 'object') {
    const pick = (obj, ...keys) => {
      for (const k of keys) {
        if (obj[k]) return obj[k];
      }
      return undefined;
    };

    const maybePrimary = pick(
      inputTheme,
      'primary',
      'primaryColor',
      'primary_color',
      'main',
      'colorPrimary',
      'color'
    );
    const maybeSecondary = pick(
      inputTheme,
      'secondary',
      'secondaryColor',
      'secondary_color',
      'colorSecondary'
    );
    const maybeAccent = pick(
      inputTheme,
      'accent',
      'accentColor',
      'accent_color',
      'colorAccent'
    );

    // If the object didn't already provide the canonical keys but had variants, rebuild
    if (!inputTheme.primary && maybePrimary) {
      inputTheme = {
        primary: maybePrimary,
        secondary: maybeSecondary || maybePrimary,
        accent: maybeAccent || maybePrimary,
        // preserve original colors sub-object if present
        ...inputTheme,
      };
    }
  }
  const fallbackByTitle = getColorScheme(jobTitle);
  if (!inputTheme || typeof inputTheme !== 'object') return fallbackByTitle;

  // Caso 1: paleta completa
  if (inputTheme.primary && inputTheme.secondary && inputTheme.accent) {
    return {
      primary: String(inputTheme.primary),
      secondary: String(inputTheme.secondary),
      accent: String(inputTheme.accent),
    };
  }

  // Caso 2: un solo color base (primary) -> derivar secundarios
  const base =
    inputTheme.hex || inputTheme.primary || inputTheme.color || inputTheme.base;
  if (base) {
    const lighten = (hex, p = 0.15) => {
      try {
        const n = String(hex).replace('#', '');
        const bigint = parseInt(n, 16);
        let r = (bigint >> 16) & 255,
          g = (bigint >> 8) & 255,
          b = bigint & 255;
        r = Math.min(255, Math.round(r + (255 - r) * p));
        g = Math.min(255, Math.round(g + (255 - g) * p));
        b = Math.min(255, Math.round(b + (255 - b) * p));
        return `#${[r, g, b]
          .map((x) => x.toString(16).padStart(2, '0'))
          .join('')}`;
      } catch {
        return fallbackByTitle.secondary;
      }
    };
    const saturate = (hex) => String(hex);
    const primary = String(base);
    const secondary = lighten(primary, 0.18);
    const accent = lighten(primary, 0.3);
    return { primary, secondary: saturate(secondary), accent };
  }

  // Caso 3: solo nombre de tema -> mapea a colores
  if (inputTheme.name) {
    const name = String(inputTheme.name).toLowerCase();
    const presets = {
      ocean: { primary: '#0ea5e9', secondary: '#6366f1', accent: '#22d3ee' },
      forest: { primary: '#16a34a', secondary: '#065f46', accent: '#22c55e' },
      sunset: { primary: '#f97316', secondary: '#ef4444', accent: '#f59e0b' },
      orchid: { primary: '#8b5cf6', secondary: '#6366f1', accent: '#06b6d4' },
    };
    return presets[name] || fallbackByTitle;
  }

  return fallbackByTitle;
}

/**
 * Títulos personalizados según perfil
 */
const getSectionTitles = (jobTitle) => {
  const title = (jobTitle || '').toLowerCase();

  if (title.includes('electric') || title.includes('técnico')) {
    return {
      experience: 'Experiencia Laboral',
      skills: 'Competencias Técnicas',
      education: 'Certificaciones y Formación',
    };
  }

  return {
    experience: 'Experiencia Profesional',
    skills: 'Habilidades Técnicas',
    education: 'Educación',
  };
};

/**
 * Rating a nivel y porcentaje
 * Accepts numbers (1-5), decimals, fractions like "3/5", star strings (★★★),
 * or textual levels ("Experto", "Avanzado", "Intermedio", "Básico").
 */
const getRatingData = (rating) => {
  let val = 0;

  if (rating == null) {
    val = 0;
  } else if (typeof rating === 'number') {
    val = rating;
  } else {
    const s = String(rating).trim();
    // Stars like ★★★ -> count
    const starMatches = s.match(/[★⭐]/g);
    if (starMatches) {
      val = Math.min(5, starMatches.length);
    } else if (/^\d+(?:\.\d+)?\s*\/\s*\d+$/.test(s)) {
      // fraction like 3/5
      try {
        const [a, b] = s.split('/').map((x) => parseFloat(x.trim()));
        if (!Number.isNaN(a) && !Number.isNaN(b) && b > 0) {
          // normalize to 5-point scale
          val = (a / b) * 5;
        }
      } catch {
        val = 0;
      }
    } else if (/^\d+(?:\.\d+)?$/.test(s)) {
      // plain numeric string
      val = parseFloat(s);
    } else {
      // textual mapping
      const low = s.toLowerCase();
      if (
        low.includes('exper') ||
        low.includes('senior') ||
        low.includes('pro')
      ) {
        val = 5;
      } else if (low.includes('avanz') || low.includes('advanced')) {
        val = 4;
      } else if (low.includes('inter') || low.includes('mid')) {
        val = 3;
      } else if (
        low.includes('inic') ||
        low.includes('bas') ||
        low.includes('junior')
      ) {
        val = 1;
      } else {
        // fallback: try parse float again
        const maybe = parseFloat(s);
        val = Number.isNaN(maybe) ? 0 : maybe;
      }
    }
  }

  // Clamp to 0..5
  val = Math.max(0, Math.min(5, Number(val)));

  // Level labels (five distinct categories for 1..5 stars)
  // 0..1.49 -> Principiante (1), 1.5..2.49 -> Básico (2), 2.5..3.49 -> Intermedio (3), 3.5..4.49 -> Avanzado (4), 4.5+ -> Experto (5)
  let level = 'Principiante';
  if (val >= 4.5) level = 'Experto';
  else if (val >= 3.5) level = 'Avanzado';
  else if (val >= 2.5) level = 'Intermedio';
  else if (val >= 1.5) level = 'Básico';

  // Percentage mapping: map 0..5 => 10..100 linearly (so 1->20%, 2->40%, etc.)
  // We'll map exactly: percentage = round((val/5)*100), but ensure a reasonable min so bars are visible
  let percentage = Math.round((val / 5) * 100);
  if (percentage < 10) percentage = 10;

  return { level, percentage };
};

/**
 * Agrupa skills por categoría
 */
export const groupSkillsByCategory = (skills) => {
  if (!skills || skills.length === 0) return [];

  const grouped = skills.reduce((acc, skill) => {
    const category = skill.category || 'Otros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  return Object.entries(grouped).map(([category, skills]) => ({
    category,
    skills,
  }));
};

/**
 * Categorización de habilidades por texto (misma IA del editor)
 */
async function categorizeSkillsByText(freeText, jobTitleTarget) {
  const sysPrompt = `
Eres un experto en extracción y categorización de habilidades para CVs técnicos.
Dado el TEXTO, devuelve un JSON:
[
  { "category": "Backend", "skills": [ { "name": "Node.js" }, { "name": "Express" } ] },
  { "category": "Bases de Datos", "skills": [ { "name": "PostgreSQL" } ] }
]
- No inventes tecnologías.
- Usa categorías: Backend, Frontend, Bases de Datos, DevOps/Cloud, Testing, Arquitectura, Seguridad, Data/AI, Metodologías, Soft Skills, Otros.
- Responde SOLO el JSON.
  `.trim();

  const composed = [
    jobTitleTarget ? `Puesto objetivo: ${jobTitleTarget}` : '',
    freeText || '',
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    // Obtener la sesión (misma forma que el editor) y enviar mensaje
    const chat = AIChatSession();
    const result = await chat.sendMessage(`${sysPrompt}\n\n${composed}`);

    // Reuse centralized raw extraction and parsing helpers
    const raw = extractRawFromResult(result);
    const cleansed = String(raw || '')
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();
    const parsed = parseCategoriesFromCleansed(cleansed);
    return parsed;
  } catch (e) {
    console.error('Error categorizando skills:', e);
    return [];
  }
}

/**
 * Extrae el texto raw de la respuesta del adaptador (soporta varias formas)
 */
function extractRawFromResult(result) {
  // 1) Adaptador “editor”: cuando viene “response” del SDK con candidates
  if (result?.response && Array.isArray(result.response.candidates)) {
    return result.response.candidates[0]?.content?.parts?.[0]?.text || '';
  }
  // 2) Adaptador llano: result.text ya es string
  if (typeof result?.text === 'string') return result.text;
  // 3) Degradar a candidates a nivel raíz si existiera
  if (Array.isArray(result?.candidates)) {
    return result.candidates[0]?.content?.parts?.[0]?.text || '';
  }
  // 4) String directo
  if (typeof result === 'string') return result;
  return '';
}

/**
 * Parsea el contenido 'cleansed' hacia un array de categorías en el formato esperado
 */
function parseCategoriesFromCleansed(cleansed) {
  let parsed = null;
  try {
    parsed = JSON.parse(cleansed);
  } catch {
    parsed = null;
  }

  // Fallback: soportar formato "Categoría: a, b, c" por línea
  if (!Array.isArray(parsed)) {
    const lines = String(cleansed || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    parsed = lines
      .map((line) => {
        const i = line.indexOf(':');
        if (i === -1) return null;
        const cat = line.slice(0, i).trim();
        const skills = line
          .slice(i + 1)
          .split(',')
          .map((s) => ({ name: s.trim() }))
          .filter((s) => s.name);
        return cat && skills.length ? { category: cat, skills } : null;
      })
      .filter(Boolean);
  }

  if (!Array.isArray(parsed)) parsed = [];
  parsed = parsed.filter(
    (c) =>
      c &&
      c.category &&
      Array.isArray(c.skills) &&
      c.skills.some((s) => s?.name)
  );
  return parsed;
}

/**
 * Envío batch: recibe un array de textos (baseText) y devuelve un array con el mismo orden
 * donde cada entrada es un array de categorías para esa experiencia.
 */
async function categorizeSkillsBatch(baseTextArray, jobTitleTarget) {
  if (!Array.isArray(baseTextArray) || baseTextArray.length === 0) return [];

  const sysPrompt = `
Eres un experto en extracción y categorización de habilidades para CVs técnicos.
Recibirás un ARRAY de EXPERIENCIAS indexadas. Devuelve SOLO un JSON con formato:
[
  { "index": 0, "categories": [ {"category":"Backend","skills":[{"name":"Node.js"}] }, ... ] },
  { "index": 1, "categories": [ ... ] }
]
- Asegúrate de mantener el orden por índice.
- No inventes tecnologías.
- Usa categorías: Backend, Frontend, Bases de Datos, DevOps/Cloud, Testing, Arquitectura, Seguridad, Data/AI, Metodologías, Soft Skills, Otros.
`.trim();

  const composedList = baseTextArray
    .map((t, i) => `EXPERIENCIA ${i}: ${String(t || '').slice(0, 1200)}`)
    .join('\n\n---\n\n');

  const composed = [
    jobTitleTarget ? `Puesto objetivo: ${jobTitleTarget}` : '',
    composedList,
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const chat = AIChatSession();
    const result = await chat.sendMessage(`${sysPrompt}\n\n${composed}`);
    const raw = extractRawFromResult(result);
    const cleansed = String(raw || '')
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = (() => {
      try {
        return JSON.parse(cleansed);
      } catch {
        return null;
      }
    })();

    // If parser returns array of {index, categories}
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (p) => p && typeof p.index === 'number' && Array.isArray(p.categories)
      )
    ) {
      // Map to results array
      const out = Array.from({ length: baseTextArray.length }, () => []);
      for (const item of parsed) {
        const idx = Number(item.index);
        if (Number.isInteger(idx) && idx >= 0 && idx < out.length) {
          out[idx] = (
            Array.isArray(item.categories) ? item.categories : []
          ).filter((c) => c && c.category && Array.isArray(c.skills));
        }
      }
      return out.map((cats) =>
        cats.filter(
          (c) =>
            c &&
            c.category &&
            Array.isArray(c.skills) &&
            c.skills.some((s) => s?.name)
        )
      );
    }

    // If parsed is an array of arrays (assume same order)
    if (
      Array.isArray(parsed) &&
      parsed.length === baseTextArray.length &&
      parsed.every((p) => Array.isArray(p))
    ) {
      return parsed.map((arr) =>
        Array.isArray(arr)
          ? arr.filter(
              (c) =>
                c &&
                c.category &&
                Array.isArray(c.skills) &&
                c.skills.some((s) => s?.name)
            )
          : []
      );
    }

    // If parsed is a flat array of category objects and length matches one experience => treat as first
    if (Array.isArray(parsed) && baseTextArray.length === 1) {
      // Prefer to reuse the single-item categorizer as a fallback (keeps behavior consistent)
      try {
        const single = await categorizeSkillsByText(
          baseTextArray[0],
          jobTitleTarget
        );
        return [single];
      } catch {
        return [parseCategoriesFromCleansed(cleansed)];
      }
    }

    // Last resort: try to parse using the generic parser expecting an array of categories for each
    const fallback = parseCategoriesFromCleansed(cleansed);
    // return fallback for first experience and empty arrays for rest
    return [fallback].concat(
      Array.from({ length: Math.max(0, baseTextArray.length - 1) }, () => [])
    );
  } catch (err) {
    console.warn('[BATCH] error', err);
    return baseTextArray.map(() => []);
  }
}

/**
 * Render de chips de habilidades categorizadas
 */
function renderExperienceSkillTags(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return '';
  const chips = [];
  for (const cat of categories) {
    const list = (cat?.skills || [])
      .map((s) => s?.name)
      .filter(Boolean)
      .join(', ');
    if (!cat?.category || !list) continue;
    chips.push(`<span class="tag">${cat.category}: ${list}</span>`);
  }
  if (chips.length === 0) return '';
  // Keep only production-safe output
  return `<div class="timeline-tags">${chips.join('')}</div>`;
}

/**
 * Genera el HTML PROFESIONAL Y ELEGANTE del CV
 */
export const generateResumeHTML = async (resumeInfo, theme) => {
  const {
    firstName = '',
    lastName = '',
    jobTitle = '',
    address = '',
    phone = '',
    email = '',
    summary = '',
    experience = [],
    education = [],
    skills = [],
    languages = [],
  } = resumeInfo || {};

  const fullName = `${firstName} ${lastName}`.trim() || 'Tu Nombre';
  const initials = `${firstName?.charAt(0) || ''}${
    lastName?.charAt(0) || ''
  }`.toUpperCase();

  // 1) Resolve rawThemeInput from props or resumeInfo (caller preferred)
  const rawThemeInput =
    theme ??
    resumeInfo?.webPageConfig?.theme ??
    resumeInfo?.theme ??
    resumeInfo?.themeColor ??
    null;

  // 2) Accept a plain hex string directly (e.g. "#92400e") by converting to { hex }
  const rawTheme =
    typeof rawThemeInput === 'string' ? { hex: rawThemeInput } : rawThemeInput;

  // If no theme was provided, warn loudly. In development we throw to force callers
  // to pass a resolved theme; in production we keep a console.error but continue
  // using the fallback color palette derived from the job title.
  if (!rawTheme) {
    try {
      console.error(
        '[THEME] No theme provided to generateResumeHTML; falling back to colors derived from jobTitle.',
        { jobTitle, resumeInfo }
      );
    } catch {
      // ignore console errors
    }

    // Detect development-like environments: NODE_ENV=development or running on localhost
    const isDev =
      (typeof globalThis !== 'undefined' &&
        globalThis.process &&
        globalThis.process.env &&
        globalThis.process.env.NODE_ENV === 'development') ||
      (typeof window !== 'undefined' &&
        window.location &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1'));

    if (isDev) {
      // Throw a noisy error in dev to make it obvious that callers should pass a theme
      throw new Error(
        '[THEME] generateResumeHTML was called without a theme. Pass a theme object (e.g. { primary, secondary, accent }) or set resumeInfo.webPageConfig.theme. This error is thrown in development to surface incorrect usage.'
      );
    }
  }

  // Normalize accepting { colors: { primary... } } or direct palette
  const normalized = normalizeTheme(
    rawTheme?.colors || rawTheme,
    resumeInfo?.jobTitle
  );
  // theme resolved; normalized palette available
  const primaryColor = normalized.primary;
  const secondaryColor = normalized.secondary;
  const accentColor = normalized.accent;

  // For debug in the generated HTML we keep rawThemeInput (the original input before normalization)

  // helper: return 'r, g, b' string for CSS rgba() vars
  function hexToRgbString(hex) {
    try {
      const c = String(hex || '#6366f1')
        .replace('#', '')
        .padStart(6, '0');
      const bigint = parseInt(c, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `${r}, ${g}, ${b}`;
    } catch {
      return '99, 102, 241';
    }
  }

  // Helpers para conversión y mezcla de colores (hex)
  const hexToRgb = (hex) => {
    try {
      const h = String(hex).replace('#', '').padStart(6, '0');
      const bigint = parseInt(h, 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    } catch {
      return { r: 0, g: 0, b: 0 };
    }
  };

  const mixHex = (hexA, hexB, weightB = 0.2) => {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const w = Number(weightB) || 0.2;
    const r = Math.round(a.r * (1 - w) + b.r * w);
    const g = Math.round(a.g * (1 - w) + b.g * w);
    const bl = Math.round(a.b * (1 - w) + b.b * w);
    return `#${[r, g, bl]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')}`;
  };
  // Derived CSS color values handled via CSS variables (rgba fallbacks defined in :root)
  const colorTextHex = '#1e293b';
  const footerGradStart = mixHex(colorTextHex, primaryColor, 0.2);
  const footerGradEnd = mixHex('#334155', secondaryColor, 0.2);

  const sectionTitles = getSectionTitles(jobTitle);
  const groupedSkills = groupSkillsByCategory(skills);

  // theme hash to force HTML differences when theme changes
  const themeHash =
    typeof btoa === 'function'
      ? btoa(
          unescape(
            encodeURIComponent(
              `${primaryColor}|${secondaryColor}|${accentColor}`
            )
          )
        )
      : `${primaryColor}|${secondaryColor}|${accentColor}`;

  // Mapear iconos
  const groupedSkillsWithIcons = await Promise.all(
    groupedSkills.map(async (group) => {
      const icon = await findBestMatchIcon(group.category);
      return { ...group, icon };
    })
  );

  // Languages section uses simple name + level cards (no flags/progress)

  // Render simple language cards without progress bars in a two-column grid
  const languagesSection =
    languages && Array.isArray(languages) && languages.length > 0
      ? `
    <!-- Languages Section -->
    <section id="idiomas">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Idiomas</h2>
          <p class="section-subtitle">Competencias lingüísticas</p>
        </div>
        <div class="languages-grid">
          ${languages
            .map((language) => {
              const name = language?.name || '';
              const level = language?.level || '';
              return `
                <div class="language-card">
                  <h3 class="language-name">${name}</h3>
                  <p class="language-level">${level}</p>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    </section>
  `
      : '';

  // Estadísticas (parseo seguro año) - Calcula experiencia TOTAL sumando periodos
  const calculateTotalExperience = () => {
    if (!experience || experience.length === 0) return 0;

    const parseYear = (val) => {
      try {
        if (!val) return 0;
        const parts = String(val).split('-');
        const y = parseInt(parts[0], 10);
        return Number.isFinite(y) &&
          y >= 1970 &&
          y <= new Date().getFullYear() + 1
          ? y
          : 0;
      } catch {
        return 0;
      }
    };

    const totalYears = experience
      .map((exp) => {
        const start = parseYear(exp.startDate);
        const end = exp.currentlyWorking
          ? new Date().getFullYear()
          : parseYear(exp.endDate);

        // Si las fechas son válidas y end >= start, calcular diferencia
        if (start > 0 && end > 0 && end >= start) {
          return end - start;
        }
        return 0;
      })
      .reduce((acc, years) => acc + years, 0);

    return totalYears;
  };

  const yearsExp = calculateTotalExperience();

  const projectsCount = experience?.length * 4 || 5;
  const techCount = skills?.length || 0;

  // Categorización por experiencia usando batch prompt para reducir llamadas
  const jobTitleTarget = jobTitle || '';
  // Experience count logged in dev previously; removed for production
  // Caché simple en memoria por hash del texto para reducir llamadas
  // (skillCache está definido en módulo)
  const stripHtml = (t) =>
    String(t || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Prepare arrays
  const baseTexts = [];
  const keys = [];
  const themeKey = `${primaryColor}|${secondaryColor}|${accentColor}`;
  for (const exp of experience || []) {
    const baseTextRaw = [
      exp?.title,
      exp?.companyName,
      exp?.workSummery || exp?.workSummary,
    ]
      .filter(Boolean)
      .join('. ');
    const baseText = stripHtml(baseTextRaw);
    baseTexts.push(baseText);
    keys.push(`${themeKey}::${jobTitleTarget}::${baseText}`);
  }

  // Check cache and collect missing
  const categoriesPerExp = Array.from({ length: baseTexts.length }, () => []);
  const toFetch = [];
  const toFetchIdx = [];
  baseTexts.forEach((bt, i) => {
    if (!bt) return; // leave empty
    const k = keys[i];
    const cached = getSkillCache(k);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      categoriesPerExp[i] = cached;
    } else {
      toFetch.push(bt);
      toFetchIdx.push(i);
    }
  });

  // If there are items to fetch, call the batch prompt once
  if (toFetch.length > 0) {
    const batchResults = await categorizeSkillsBatch(toFetch, jobTitleTarget);
    // AI batch results processed
    batchResults.forEach((cats, j) => {
      const idx = toFetchIdx[j];
      const key = keys[idx];
      const safeCats = Array.isArray(cats) ? cats : [];
      categoriesPerExp[idx] = safeCats;
      if (safeCats.length > 0) {
        setSkillCache(key, safeCats);
      }
    });
  }

  // Build final categorizedByExperience with rendered tags
  const categorizedByExperience = baseTexts.map((bt, idx) => {
    const cats = categoriesPerExp[idx] || [];
    const tagsHTML = bt ? renderExperienceSkillTags(cats) : '';
    return { tagsHTML };
  });

  // Build the final HTML in a variable so we can debug its content before returning

  const htmlOut = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fullName} - ${jobTitle || 'Currículum Vitae'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
  <meta name="x-theme-hash" content="${themeHash}" />
  <meta name="x-build-ts" content="${Date.now()}" />
  <script>try{/* theme applied */}catch(e){}
  </script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --color-primary: ${primaryColor};
      --color-primary-rgb: ${hexToRgbString(primaryColor)};
      --color-secondary: ${secondaryColor};
      --color-secondary-rgb: ${hexToRgbString(secondaryColor)};
      --color-accent: ${accentColor};
      --color-accent-rgb: ${hexToRgbString(accentColor)};
      --color-primary-8: rgba(var(--color-primary-rgb), 0.08);
      --color-primary-12: rgba(var(--color-primary-rgb), 0.12);
      --color-primary-20: rgba(var(--color-primary-rgb), 0.20);
      --color-primary-40: rgba(var(--color-primary-rgb), 0.40);
      --color-secondary-12: rgba(var(--color-secondary-rgb), 0.12);
      --color-accent-15: rgba(var(--color-accent-rgb), 0.15);
      --color-bg: #fafafa;
      --color-surface: #ffffff;
      --color-text: #1e293b;
      --color-text-light: #64748b;
      --color-text-lighter: #94a3b8;
      --color-border: #e2e8f0;
    }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--color-bg); color: var(--color-text); line-height: 1.6; font-size: 15px; overflow-x: hidden; }
        /* Navigation */
        .nav { position: fixed; top:0; left:0; right:0; background: rgba(255,255,255,.95); backdrop-filter: blur(10px); border-bottom: 1px solid var(--color-border); z-index:1000; transition: all .3s ease; }
        .nav.scrolled { box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); }
        .nav-container { max-width:1200px; margin:0 auto; padding:0 2rem; display:flex; justify-content:space-between; align-items:center; height:70px; }
  .nav-logo { font-family:'Playfair Display', serif; font-size:1.25rem; font-weight:700; background: linear-gradient(135deg,var(--color-primary),var(--color-secondary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .nav-menu { display:flex; gap:2rem; list-style:none; }
        .nav-link { text-decoration:none; color:var(--color-text-light); font-weight:500; font-size:.9rem; transition:all .3s ease; position:relative; padding:.25rem 0; }
        .nav-link::after { content:''; position:absolute; bottom:0; left:0; width:0; height:2px; background: linear-gradient(90deg,var(--color-primary),var(--color-accent)); transition:width .3s ease; }
        .nav-link:hover { color:var(--color-primary); }
        .nav-link:hover::after, .nav-link.active::after { width:100%; }
        /* Container */
        .container { max-width:1200px; margin:0 auto; padding:0 2rem; }
        /* Hero */
  .hero { padding: calc(70px + 4rem) 2rem 4rem; background: linear-gradient(135deg,var(--color-primary-8) 0%, var(--color-secondary-12) 50%, rgba(0,0,0,0.02) 100%); position:relative; overflow:hidden; }
  .hero::before { content:''; position:absolute; top:-50%; right:-20%; width:600px; height:600px; background: radial-gradient(circle, var(--color-primary-8) 0%, transparent 70%); border-radius:50%; animation: float 20s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px,30px) scale(1.1);} }
        .hero-content { position:relative; z-index:1; max-width:800px; margin:0 auto; text-align:center; animation: fadeInUp .8s ease-out; }
        @keyframes fadeInUp { from{opacity:0; transform: translateY(30px);} to{opacity:1; transform: translateY(0);} }
  .hero-badge { display:inline-flex; align-items:center; gap:.5rem; padding:.5rem 1rem; background: linear-gradient(135deg, var(--color-primary-8), var(--color-secondary-12)); border:1px solid var(--color-primary-20); border-radius:2rem; font-size:.85rem; font-weight:500; color:var(--color-primary); margin-bottom:1.5rem; }
        .hero-badge::before { content:''; width:8px; height:8px; background: var(--color-accent); border-radius:50%; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1; transform: scale(1);} 50%{opacity:.5; transform: scale(1.2);} }
        .hero-title { font-family:'Playfair Display', serif; font-size:3.5rem; font-weight:700; line-height:1.2; margin-bottom:1.5rem; background: linear-gradient(135deg, var(--color-text) 0%, var(--color-primary) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .hero-subtitle { font-size:1.25rem; color:var(--color-text-light); margin-bottom:2rem; font-weight:400; }
        .hero-description { font-size:1rem; color:var(--color-text-light); line-height:1.8; margin-bottom:3rem; max-width:600px; margin-left:auto; margin-right:auto; }
        .hero-stats { display:flex; justify-content:center; gap:3rem; margin-top:3rem; }
        .stat { text-align:center; }
        .stat-value { font-size:2rem; font-weight:700; background: linear-gradient(135deg,var(--color-primary),var(--color-secondary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; display:block; margin-bottom:.25rem; }
        .stat-label { font-size:.85rem; color:var(--color-text-light); font-weight:500; }
        /* Contact Info */
        .contact-info { display:flex; justify-content:center; gap:2rem; flex-wrap:wrap; margin-top:2rem; }
        .contact-item { display:flex; align-items:center; gap:.5rem; color:var(--color-text-light); text-decoration:none; font-size:.9rem; transition:all .3s ease; padding:.5rem 1rem; border-radius:.75rem; }
  .contact-item:hover { color:var(--color-primary); background: var(--color-primary-8); transform: translateY(-2px); }
        .contact-icon { width:18px; height:18px; stroke: currentColor; stroke-width:2; fill:none; }
        /* Section */
        section { padding:4rem 0; }
        .section-header { text-align:center; margin-bottom:3rem; }
        .section-title { font-family:'Playfair Display', serif; font-size:2.5rem; font-weight:700; margin-bottom:1rem; position:relative; display:inline-block; }
  .section-title::after { content:''; position:absolute; bottom:-.5rem; left:50%; transform: translateX(-50%); width:60px; height:3px; background: linear-gradient(90deg,var(--color-primary),var(--color-accent)); border-radius:2px; }
        .section-subtitle { color:var(--color-text-light); font-size:1rem; margin-top:1.5rem; }
        /* Timeline */
        .timeline { position:relative; max-width:900px; margin:0 auto; }
        .timeline-item { position:relative; padding-left:3rem; padding-bottom:3rem; }
        .timeline-item:last-child { padding-bottom:0; }
  .timeline-item::before { content:''; position:absolute; left:0; top:0; bottom:-3rem; width:2px; background: linear-gradient(180deg,var(--color-primary) 0%, var(--color-accent) 100%); opacity:.3; }
        .timeline-item:last-child::before { background: linear-gradient(180deg, var(--color-primary) 0%, transparent 100%); }
  .timeline-dot { position:absolute; left:-6px; top:.5rem; width:14px; height:14px; background: linear-gradient(135deg,var(--color-primary),var(--color-accent)); border:3px solid var(--color-surface); border-radius:50%; box-shadow:0 0 0 4px var(--color-primary-8); transition:all .3s ease; }
  .timeline-item:hover .timeline-dot { transform: scale(1.3); box-shadow:0 0 0 6px var(--color-primary-12); }
        .timeline-content { background: var(--color-surface); padding:2rem; border-radius:1rem; box-shadow:0 1px 2px 0 rgba(0,0,0,.05); transition:all .3s ease; border:1px solid var(--color-border); }
  .timeline-item:hover .timeline-content { box-shadow:0 10px 15px -3px rgba(0,0,0,.1); transform: translateX(4px); border-color: var(--color-primary-20); }
        .timeline-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; flex-wrap:wrap; gap:1rem; }
        .timeline-title { font-size:1.15rem; font-weight:600; color:var(--color-text); margin-bottom:.25rem; }
  .timeline-company { font-size:.95rem; color:var(--color-primary); font-weight:500; }
  .timeline-date { font-size:.85rem; color:var(--color-text-lighter); font-weight:500; padding:.25rem .75rem; background: var(--color-primary-8); border-radius:.5rem; }
        .timeline-description { color:var(--color-text-light); line-height:1.7; margin-bottom:1rem; }
        .timeline-tags { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--color-border); }
      .tag { display:inline-block; font-size:.75rem; font-weight:500; padding:.35rem .75rem; background: linear-gradient(135deg, var(--color-primary-8), var(--color-secondary-12)); color: var(--color-primary); border: 1px solid var(--color-primary-20); border-radius:.5rem; transition: all .2s ease; line-height:1.4; }
  .tag:hover { background: linear-gradient(135deg, var(--color-primary-12), var(--color-secondary-12)); border-color: var(--color-primary-40); transform: translateY(-1px); }
        /* Skills Grid */
        .skills-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap:2rem; max-width:1000px; margin:0 auto; }
        .skill-category { background: var(--color-surface); padding:2rem; border-radius:1rem; box-shadow:0 1px 2px 0 rgba(0,0,0,.05); transition:all .3s ease; border:1px solid var(--color-border); }
  .skill-category:hover { box-shadow:0 10px 15px -3px rgba(0,0,0,.1); transform: translateY(-4px); border-color: var(--color-primary-20); }
        .skill-category-title { font-size:1.1rem; font-weight:600; margin-bottom:1.5rem; color:var(--color-text); display:flex; align-items:center; gap:.5rem; }
  .skill-category-icon { width:24px; height:24px; stroke: var(--color-primary); stroke-width:2; fill:none; }
        .skill-item { margin-bottom:1.5rem; }
        .skill-item:last-child { margin-bottom:0; }
        .skill-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
        .skill-name { font-size:.9rem; font-weight:500; color:var(--color-text); }
        .skill-level { font-size:.8rem; color:var(--color-text-lighter); font-weight:500; }
        .skill-bar { height:6px; background: var(--color-border); border-radius:3px; overflow:hidden; }
  .skill-progress { height:100%; background: linear-gradient(90deg,var(--color-primary),var(--color-accent)); border-radius:3px; transition: width 1s ease-out; }
  /* Languages grid */
  .languages-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap:1rem; max-width:1000px; margin:0 auto; }
  .language-card { background: var(--color-surface); padding:1rem; border-radius:.75rem; border:1px solid var(--color-border); box-shadow:0 1px 2px rgba(0,0,0,.04); }
  .language-name { font-size:1rem; font-weight:600; color:var(--color-text); margin-bottom:.25rem; }
  .language-level { font-size:.9rem; color:var(--color-text-light); }
        /* Education */
        .education-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap:2rem; max-width:900px; margin:0 auto; }
        .education-card { background: var(--color-surface); padding:2rem; border-radius:1rem; box-shadow:0 1px 2px 0 rgba(0,0,0,.05); transition:all .3s ease; border:1px solid var(--color-border); }
  .education-card:hover { box-shadow:0 10px 15px -3px rgba(0,0,0,.1); transform: translateY(-4px); border-color: var(--color-primary-20); }
        .education-title { font-size:1.1rem; font-weight:600; color:var(--color-text); margin-bottom:.5rem; }
        .education-institution { font-size:.95rem; color:var(--color-primary); font-weight:500; margin-bottom:.5rem; }
        .education-date { font-size:.85rem; color:var(--color-text-lighter); font-weight:500; }
        /* Footer */
  footer { background: linear-gradient(135deg, ${footerGradStart}, ${footerGradEnd}); color:#e2e8f0; padding:3rem 0; text-align:center; }
        .footer-content { max-width:800px; margin:0 auto; }
        .footer-text { color:#cbd5e1; margin-bottom:2rem; }
        /* Responsive */
        @media (max-width: 768px) {
          .nav-menu { display:none; }
          .hero-title { font-size:2.5rem; }
          .hero-stats { flex-direction:column; gap:1.5rem; }
          .section-title { font-size:2rem; }
          .timeline-item { padding-left:2rem; }
          .skills-grid, .education-grid { grid-template-columns:1fr; }
          .contact-info { flex-direction:column; }
          .timeline-tags { gap:.4rem; }
          .tag { font-size:.7rem; padding:.3rem .6rem; }
        }
        /* --- Print tweaks: preserve theme color and adjust heavy borders/padding --- */
        @media print {
          :root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Make any element using Tailwind-like "border-t-[...]" use theme primary color and moderate thickness */
          [class*="border-t-"] {
            border-top-width: 6px !important;
            border-top-style: solid !important;
            border-top-color: var(--color-primary) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Reduce large paddings used for screen previews to more compact values for print */
          [class*="p-14"], .p-14 {
            padding: 12px !important;
          }

          /* Ensure hr and other divider lines use theme color */
          hr, hr[class*="border-"] {
            border-color: var(--color-primary) !important;
            border-width: 1px !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Avoid box-shadows in print */
          [class*="shadow-"] {
            box-shadow: none !important;
          }
        }
    </style>
    <!-- Theme variables (placed last to win cascade) -->
    <style id="theme-vars">
      :root {
        --color-primary: ${primaryColor};
        --color-secondary: ${secondaryColor};
        --color-accent: ${accentColor};
        --color-primary-rgb: ${hexToRgbString(primaryColor)};
        --color-secondary-rgb: ${hexToRgbString(secondaryColor)};
        --color-accent-rgb: ${hexToRgbString(accentColor)};
        --color-primary-8: rgba(var(--color-primary-rgb), 0.08);
        --color-primary-12: rgba(var(--color-primary-rgb), 0.12);
        --color-primary-20: rgba(var(--color-primary-rgb), 0.20);
        --color-primary-40: rgba(var(--color-primary-rgb), 0.40);
        --color-secondary-12: rgba(var(--color-secondary-rgb), 0.12);
        --color-accent-15: rgba(var(--color-accent-rgb), 0.15);
      }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav" id="nav">
        <div class="nav-container">
            <div class="nav-logo">${initials}</div>
      <ul class="nav-menu">
        <li><a href="#inicio" class="nav-link active">Inicio</a></li>
        <li><a href="#experiencia" class="nav-link">Experiencia</a></li>
        <li><a href="#habilidades" class="nav-link">Habilidades</a></li>
        <li><a href="#educacion" class="nav-link">Educación</a></li>
        <li><a href="#idiomas" class="nav-link">Idiomas</a></li>
      </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="inicio" class="hero">
        <div class="hero-content">
            <div class="hero-badge">Disponible para nuevas oportunidades</div>
            <h1 class="hero-title">${fullName}</h1>
            <p class="hero-subtitle">${jobTitle || 'Profesional'}</p>
            ${summary ? `<p class="hero-description">${summary}</p>` : ''}
            <div class="contact-info">
                ${
                  email
                    ? `
                <a href="mailto:${email}" class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    ${email}
                </a>
                `
                    : ''
                }
                ${
                  phone
                    ? `
                <a href="tel:${phone}" class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    ${phone}
                </a>
                `
                    : ''
                }
                ${
                  address
                    ? `
                <span class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    ${address}
                </span>
                `
                    : ''
                }
            </div>

            <div class="hero-stats">
                ${
                  // Mostrar años de experiencia solo si es razonable (entre 1 y 50 años)
                  yearsExp > 0 && yearsExp <= 50
                    ? `<div class="stat">
                    <span class="stat-value">${yearsExp}+</span>
                    <span class="stat-label">Años de experiencia</span>
                </div>`
                    : `<div class="stat">
                    <span class="stat-value">${experience?.length || 0}</span>
                    <span class="stat-label">Posiciones</span>
                </div>`
                }
                <div class="stat">
                    <span class="stat-value">${projectsCount}+</span>
                    <span class="stat-label">Proyectos completados</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${techCount}</span>
                    <span class="stat-label">Competencias</span>
                </div>
            </div>
        </div>
    </section>

    ${
      experience && experience.length > 0
        ? `
    <!-- Experience Section -->
    <section id="experiencia">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">${sectionTitles.experience}</h2>
                <p class="section-subtitle">Mi trayectoria profesional</p>
            </div>
            
            <div class="timeline">
                ${experience
                  .map((exp, idx) => {
                    const desc = exp.workSummery || exp.workSummary || '';
                    const tagsHTML =
                      categorizedByExperience[idx]?.tagsHTML || '';
                    // render-time debug removed for production
                    return `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-header">
                                <div>
                                    <h3 class="timeline-title">${
                                      exp.title || 'Posición'
                                    }</h3>
                                    <p class="timeline-company">${
                                      exp.companyName || 'Empresa'
                                    }</p>
                                </div>
                                <span class="timeline-date">${
                                  exp.startDate || ''
                                } - ${
                      exp.currentlyWorking ? 'Presente' : exp.endDate || ''
                    }</span>
                            </div>
                            ${
                              desc
                                ? `<p class="timeline-description">${desc}</p>`
                                : ''
                            }
                            ${tagsHTML}
                        </div>
                    </div>
                    `;
                  })
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    ${
      groupedSkillsWithIcons.length > 0
        ? `
    <!-- Skills Section -->
    <section id="habilidades">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">${sectionTitles.skills}</h2>
                <p class="section-subtitle">Tecnologías y herramientas que domino</p>
            </div>
            
            <div class="skills-grid">
                ${groupedSkillsWithIcons
                  .map(
                    (group) => `
                    <div class="skill-category">
                        <h3 class="skill-category-title">
                            <svg class="skill-category-icon" viewBox="0 0 24 24">
                                ${group.icon}
                            </svg>
                            ${group.category}
                        </h3>
                        ${group.skills
                          .map((skill) => {
                            const { level, percentage } = getRatingData(
                              skill.rating
                            );
                            return `
                                <div class="skill-item">
                                    <div class="skill-header">
                                        <span class="skill-name">${skill.name}</span>
                                        <span class="skill-level">${level}</span>
                                    </div>
                                    <div class="skill-bar">
                                        <div class="skill-progress" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            `;
                          })
                          .join('')}
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }
    ${
      education && education.length > 0
        ? `
    <!-- Education Section -->
    <section id="educacion">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">${sectionTitles.education}</h2>
                <p class="section-subtitle">Formación académica y certificaciones</p>
            </div>
            
            <div class="education-grid">
                ${education
                  .map(
                    (edu) => `
                    <div class="education-card">
                        <h3 class="education-title">${
                          edu.degree || 'Título'
                        }</h3>
                        <p class="education-institution">${
                          edu.universityName || 'Universidad'
                        }</p>
                        <p class="education-date">${edu.startDate || ''} - ${
                      edu.endDate || ''
                    }</p>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

  ${languagesSection}

  <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <p class="footer-text">© ${new Date().getFullYear()} ${fullName}. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>

    <script>
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        // immediate active toggle for UX
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const navHeight = document.querySelector('.nav').offsetHeight;
          const targetPosition = target.offsetTop - navHeight;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      });
    });

    // Active nav link and scrolled state
    (function () {
      const nav = document.getElementById('nav');
      const links = Array.from(document.querySelectorAll('.nav-link'));
      const sections = links
        .map(l => {
          try {
            const href = l.getAttribute('href');
            if (!href || !href.startsWith('#')) return null;
            const el = document.querySelector(href);
            return el ? { link: l, el } : null;
          } catch { return null; }
        })
        .filter(Boolean);

      function updateActive() {
        const scrollY = window.scrollY;
        const navHeight = nav ? nav.offsetHeight : 0;
        // find the section closest to top but not below
        let current = sections[0];
        for (const s of sections) {
          const top = s.el.offsetTop - navHeight - 10;
          if (scrollY >= top) current = s;
        }
        links.forEach(l => l.classList.remove('active'));
        if (current && current.link) current.link.classList.add('active');

        if (scrollY > 50) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
      }

  // update on scroll and on load
  window.addEventListener('scroll', updateActive);
  window.addEventListener('load', updateActive);
  // update when hash changes (back/forward or manual fragment)
  window.addEventListener('hashchange', updateActive);

      // Also update after smooth scroll programmatic calls (fallback)
      const originalScrollTo = window.scrollTo;
      window.scrollTo = function (opts) {
        if (typeof opts === 'object' && opts.behavior === 'smooth') {
          // call original, then schedule update
          originalScrollTo.call(window, opts);
          setTimeout(updateActive, 250);
        } else {
          originalScrollTo.apply(window, arguments);
          setTimeout(updateActive, 10);
        }
      };
    })();

        // Animate skills
        const observerOptions = { threshold: 0.5 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBars = entry.target.querySelectorAll('.skill-progress');
                    progressBars.forEach(bar => {
                        const width = bar.style.width;
                        bar.style.width = '0';
                        setTimeout(() => { bar.style.width = width; }, 100);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.skill-category').forEach(category => {
            observer.observe(category);
        });
    </script>
        <script>
          try {
            // Informational: theme applied
          } catch (e) { /* noop */ }
        </script>
</body>
</html>
  `.trim();
  // returning generated html

  // Production: no verbose HTML dump. Errors will still surface via console.error/console.warn.

  return htmlOut;
};
