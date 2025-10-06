/**
 * webResumeUtils.js - VERSIÓN PROFESIONAL ELEGANTE
 * Basado en diseño moderno con navegación sticky, hero section, timeline y skills premium
 * Sistema híbrido: Iconos predefinidos + matching inteligente
 */

import { AIChatSession } from '../../service/AIModal';

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

  return ICON_LIBRARY['default'];
};

/**
 * Esquema de colores según perfil
 */
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
 */
const getRatingData = (rating) => {
  const numRating = parseFloat(rating) || 0;
  if (numRating >= 4.5) return { level: 'Experto', percentage: 95 };
  if (numRating >= 4.0) return { level: 'Experto', percentage: 90 };
  if (numRating >= 3.5) return { level: 'Avanzado', percentage: 85 };
  if (numRating >= 3.0) return { level: 'Avanzado', percentage: 80 };
  if (numRating >= 2.5) return { level: 'Intermedio', percentage: 75 };
  return { level: 'Básico', percentage: 65 };
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
 * Genera el HTML PROFESIONAL Y ELEGANTE del CV
 */
export const generateResumeHTML = async (resumeInfo, theme) => {
  console.log('🎨 Generando CV web profesional...');

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

  const colorScheme = getColorScheme(jobTitle);
  const primaryColor = colorScheme.primary;
  const secondaryColor = colorScheme.secondary;
  const accentColor = colorScheme.accent;

  const sectionTitles = getSectionTitles(jobTitle);
  const groupedSkills = groupSkillsByCategory(skills);

  // Mapear iconos
  const groupedSkillsWithIcons = await Promise.all(
    groupedSkills.map(async (group) => {
      const icon = await findBestMatchIcon(group.category);
      return { ...group, icon };
    })
  );

  // Estadísticas
  const yearsExp =
    experience?.length > 0
      ? Math.max(
          ...experience
            .map((exp) => {
              const start = exp.startDate
                ? parseInt(exp.startDate.split('-')[0])
                : 0;
              const end = exp.currentlyWorking
                ? new Date().getFullYear()
                : exp.endDate
                ? parseInt(exp.endDate.split('-')[0])
                : 0;
              return end - start;
            })
            .filter((y) => y > 0)
        )
      : 0;

  const projectsCount = experience?.length * 4 || 5;
  const techCount = skills?.length || 0;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fullName} - ${jobTitle || 'Currículum Vitae'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --color-primary: ${primaryColor};
            --color-secondary: ${secondaryColor};
            --color-accent: ${accentColor};
            --color-bg: #fafafa;
            --color-surface: #ffffff;
            --color-text: #1e293b;
            --color-text-light: #64748b;
            --color-text-lighter: #94a3b8;
            --color-border: #e2e8f0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--color-bg);
            color: var(--color-text);
            line-height: 1.6;
            font-size: 15px;
            overflow-x: hidden;
        }

        /* Navigation */
        .nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--color-border);
            z-index: 1000;
            transition: all 0.3s ease;
        }

        .nav.scrolled {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 70px;
        }

        .nav-logo {
            font-family: 'Playfair Display', serif;
            font-size: 1.25rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .nav-menu {
            display: flex;
            gap: 2rem;
            list-style: none;
        }

        .nav-link {
            text-decoration: none;
            color: var(--color-text-light);
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            position: relative;
            padding: 0.25rem 0;
        }

        .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
            transition: width 0.3s ease;
        }

        .nav-link:hover {
            color: var(--color-primary);
        }

        .nav-link:hover::after,
        .nav-link.active::after {
            width: 100%;
        }

        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        /* Hero Section */
        .hero {
            padding: calc(70px + 4rem) 2rem 4rem;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e0e7ff 100%);
            position: relative;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, 30px) scale(1.1); }
        }

        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 2rem;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--color-primary);
            margin-bottom: 1.5rem;
        }

        .hero-badge::before {
            content: '';
            width: 8px;
            height: 8px;
            background: var(--color-accent);
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
        }

        .hero-title {
            font-family: 'Playfair Display', serif;
            font-size: 3.5rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, var(--color-text) 0%, var(--color-primary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero-subtitle {
            font-size: 1.25rem;
            color: var(--color-text-light);
            margin-bottom: 2rem;
            font-weight: 400;
        }

        .hero-description {
            font-size: 1rem;
            color: var(--color-text-light);
            line-height: 1.8;
            margin-bottom: 3rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .hero-stats {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin-top: 3rem;
        }

        .stat {
            text-align: center;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: block;
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.85rem;
            color: var(--color-text-light);
            font-weight: 500;
        }

        /* Contact Info */
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            margin-top: 2rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--color-text-light);
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            padding: 0.5rem 1rem;
            border-radius: 0.75rem;
        }

        .contact-item:hover {
            color: var(--color-primary);
            background: rgba(99, 102, 241, 0.05);
            transform: translateY(-2px);
        }

        .contact-icon {
            width: 18px;
            height: 18px;
            stroke: currentColor;
            stroke-width: 2;
            fill: none;
        }

        /* Section */
        section {
            padding: 4rem 0;
        }

        .section-header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            display: inline-block;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -0.5rem;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
            border-radius: 2px;
        }

        .section-subtitle {
            color: var(--color-text-light);
            font-size: 1rem;
            margin-top: 1.5rem;
        }

        /* Timeline */
        .timeline {
            position: relative;
            max-width: 900px;
            margin: 0 auto;
        }

        .timeline-item {
            position: relative;
            padding-left: 3rem;
            padding-bottom: 3rem;
        }

        .timeline-item:last-child {
            padding-bottom: 0;
        }

        .timeline-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: -3rem;
            width: 2px;
            background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent) 100%);
            opacity: 0.3;
        }

        .timeline-item:last-child::before {
            background: linear-gradient(180deg, var(--color-primary) 0%, transparent 100%);
        }

        .timeline-dot {
            position: absolute;
            left: -6px;
            top: 0.5rem;
            width: 14px;
            height: 14px;
            background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
            border: 3px solid var(--color-surface);
            border-radius: 50%;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            transition: all 0.3s ease;
        }

        .timeline-item:hover .timeline-dot {
            transform: scale(1.3);
            box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.15);
        }

        .timeline-content {
            background: var(--color-surface);
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            border: 1px solid var(--color-border);
        }

        .timeline-item:hover .timeline-content {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transform: translateX(4px);
            border-color: rgba(99, 102, 241, 0.2);
        }

        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .timeline-title {
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--color-text);
            margin-bottom: 0.25rem;
        }

        .timeline-company {
            font-size: 0.95rem;
            color: var(--color-primary);
            font-weight: 500;
        }

        .timeline-date {
            font-size: 0.85rem;
            color: var(--color-text-lighter);
            font-weight: 500;
            padding: 0.25rem 0.75rem;
            background: rgba(99, 102, 241, 0.05);
            border-radius: 0.5rem;
        }

        .timeline-description {
            color: var(--color-text-light);
            line-height: 1.7;
            margin-bottom: 1rem;
        }

        /* Skills Grid */
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            max-width: 1000px;
            margin: 0 auto;
        }

        .skill-category {
            background: var(--color-surface);
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            border: 1px solid var(--color-border);
        }

        .skill-category:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transform: translateY(-4px);
            border-color: rgba(99, 102, 241, 0.2);
        }

        .skill-category-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: var(--color-text);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .skill-category-icon {
            width: 24px;
            height: 24px;
            stroke: var(--color-primary);
            stroke-width: 2;
            fill: none;
        }

        .skill-item {
            margin-bottom: 1.5rem;
        }

        .skill-item:last-child {
            margin-bottom: 0;
        }

        .skill-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .skill-name {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--color-text);
        }

        .skill-level {
            font-size: 0.8rem;
            color: var(--color-text-lighter);
            font-weight: 500;
        }

        .skill-bar {
            height: 6px;
            background: var(--color-border);
            border-radius: 3px;
            overflow: hidden;
        }

        .skill-progress {
            height: 100%;
            background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
            border-radius: 3px;
            transition: width 1s ease-out;
        }

        /* Education */
        .education-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            max-width: 900px;
            margin: 0 auto;
        }

        .education-card {
            background: var(--color-surface);
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            border: 1px solid var(--color-border);
        }

        .education-card:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transform: translateY(-4px);
            border-color: rgba(99, 102, 241, 0.2);
        }

        .education-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--color-text);
            margin-bottom: 0.5rem;
        }

        .education-institution {
            font-size: 0.95rem;
            color: var(--color-primary);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .education-date {
            font-size: 0.85rem;
            color: var(--color-text-lighter);
            font-weight: 500;
        }

        /* Footer */
        footer {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: #e2e8f0;
            padding: 3rem 0;
            text-align: center;
        }

        .footer-content {
            max-width: 800px;
            margin: 0 auto;
        }

        .footer-text {
            color: #cbd5e1;
            margin-bottom: 2rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .nav-menu { display: none; }
            .hero-title { font-size: 2.5rem; }
            .hero-stats { flex-direction: column; gap: 1.5rem; }
            .section-title { font-size: 2rem; }
            .timeline-item { padding-left: 2rem; }
            .skills-grid, .education-grid { grid-template-columns: 1fr; }
            .contact-info { flex-direction: column; }
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
            </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="inicio" class="hero">
        <div class="hero-content">
            <div class="hero-badge">
                Disponible para nuevas oportunidades
            </div>
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
                <div class="stat">
                    <span class="stat-value">${yearsExp}+</span>
                    <span class="stat-label">Años de experiencia</span>
                </div>
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
                  .map(
                    (exp) => `
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
                              exp.workSummery
                                ? `<p class="timeline-description">${exp.workSummery}</p>`
                                : ''
                            }
                        </div>
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
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const navHeight = document.querySelector('.nav').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });

        // Active nav link
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('nav');
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });

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
</body>
</html>
  `.trim();
};
