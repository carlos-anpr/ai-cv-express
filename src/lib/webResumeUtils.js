/**
 * Utilidades para generar HTML del CV como página web.
 */
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

export const generateResumeHTML = (resumeInfo, theme) => {
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
    themeColor = '#3b82f6',
  } = resumeInfo || {};

  const fullName = `${firstName} ${lastName}`.trim() || 'Tu Nombre';
  const primaryColor = theme?.primary || themeColor;
  const secondaryColor = theme?.secondary || primaryColor;

  return `
<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="CV de ${fullName} - ${jobTitle}">
  <title>${fullName} - Currículum Vitae</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary-color: ${primaryColor};
      --secondary-color: ${secondaryColor};
      --text-dark: #1f2937;
      --text-light: #6b7280;
      --bg-light: #f9fafb;
      --border-color: #e5e7eb;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: var(--text-dark);
      background: white;
    }

    /* Navegación Sticky */
    .nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 2rem;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      animation: slideDown 0.5s ease-out;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-brand {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
    }

    .nav-links a {
      color: var(--text-dark);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.3s;
      position: relative;
    }

    .nav-links a:hover {
      color: var(--primary-color);
    }

    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary-color);
      transition: width 0.3s;
    }

    .nav-links a:hover::after {
      width: 100%;
    }

    /* Hero Section */
    .hero {
      margin-top: 70px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      padding: 4rem 2rem;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 500px;
      height: 500px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(5deg);
      }
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hero h1 {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      animation: fadeInUp 0.6s ease-out;
    }

    .hero .job-title {
      font-size: 1.5rem;
      font-weight: 300;
      margin-bottom: 1.5rem;
      opacity: 0.95;
      animation: fadeInUp 0.6s ease-out 0.2s both;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      margin-top: 2rem;
      animation: fadeInUp 0.6s ease-out 0.4s both;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }

    .contact-item::before {
      content: '●';
      color: rgba(255, 255, 255, 0.7);
    }

    /* Secciones con scroll reveal */
    .section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 2rem;
      opacity: 0;
      transform: translateY(30px);
      animation: fadeInUp 0.6s ease-out forwards;
    }

    .section:nth-child(even) {
      background: var(--bg-light);
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 3px solid var(--primary-color);
      position: relative;
      animation: slideInLeft 0.6s ease-out;
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 80px;
      height: 3px;
      background: var(--secondary-color);
    }

    /* Summary con diseño destacado */
    .summary {
      font-size: 1.1rem;
      line-height: 1.9;
      color: var(--text-dark);
      padding: 2rem;
      background: white;
      border-left: 4px solid var(--primary-color);
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    /* Timeline moderna */
    .timeline-item {
      position: relative;
      padding-left: 3rem;
      margin-bottom: 3rem;
      border-left: 2px solid var(--border-color);
      transition: all 0.3s;
    }

    .timeline-item:hover {
      border-left-color: var(--primary-color);
      transform: translateX(5px);
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: -8px;
      top: 0;
      width: 16px;
      height: 16px;
      background: var(--primary-color);
      border-radius: 50%;
      box-shadow: 0 0 0 4px white, 0 0 0 8px var(--primary-color);
      transition: all 0.3s;
    }

    .timeline-item:hover::before {
      transform: scale(1.2);
      box-shadow: 0 0 0 4px white, 0 0 0 12px var(--primary-color);
    }

    .timeline-item h3 {
      font-size: 1.3rem;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }

    .timeline-item .company {
      font-size: 1.1rem;
      color: var(--primary-color);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .timeline-item .date {
      font-size: 0.9rem;
      color: var(--text-light);
      margin-bottom: 1rem;
    }

    /* Skills Grid Moderno */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .skill-category {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      border: 1px solid var(--border-color);
      transition: all 0.3s;
      cursor: pointer;
    }

    .skill-category:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
      border-color: var(--primary-color);
    }

    .skill-category h4 {
      color: var(--primary-color);
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
    }

    .skill-item {
      margin-bottom: 1.2rem;
    }

    .skill-name {
      font-size: 0.95rem;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
    }

    .skill-level {
      height: 10px;
      background: var(--border-color);
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }

    .skill-progress {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
      border-radius: 10px;
      transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .skill-progress::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    /* Footer moderno */
    .footer {
      background: linear-gradient(135deg, #1f2937, #111827);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
    }

    .footer p {
      opacity: 0.8;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }

      .hero h1 {
        font-size: 2rem;
      }

      .hero .job-title {
        font-size: 1.2rem;
      }

      .contact-info {
        flex-direction: column;
        gap: 1rem;
      }

      .section {
        padding: 3rem 1.5rem;
      }

      .section-title {
        font-size: 1.5rem;
      }

      .skills-grid {
        grid-template-columns: 1fr;
      }
    }

    @media print {
      .nav {
        position: relative;
      }

      .hero {
        margin-top: 0;
      }
    }
  </style>
</head>
<body>
  <!-- Navegación Sticky -->
  <nav class="nav">
    <div class="nav-content">
      <div class="nav-brand">${fullName}</div>
      <ul class="nav-links">
        <li><a href="#about">Sobre Mí</a></li>
        <li><a href="#experience">Experiencia</a></li>
        <li><a href="#education">Formación</a></li>
        <li><a href="#skills">Habilidades</a></li>
      </ul>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="hero">
    <div class="hero-content">
      <h1>${fullName}</h1>
      <p class="job-title">${jobTitle || 'Profesional'}</p>
      <div class="contact-info">
        ${email ? `<span class="contact-item">${email}</span>` : ''}
        ${phone ? `<span class="contact-item">${phone}</span>` : ''}
        ${address ? `<span class="contact-item">${address}</span>` : ''}
      </div>
    </div>
  </header>

  <!-- Main Content -->
  ${
    summary
      ? `
  <section id="about" class="section">
    <h2 class="section-title">Sobre Mí</h2>
    <div class="summary">${summary}</div>
  </section>
  `
      : ''
  }

  ${
    experience && experience.length > 0
      ? `
  <section id="experience" class="section">
    <h2 class="section-title">Experiencia Profesional</h2>
    ${experience
      .map(
        (exp) => `
      <div class="timeline-item">
        <h3>${exp.title || 'Posición'}</h3>
        <p class="company">${exp.companyName || 'Empresa'}</p>
        <p class="date">${exp.startDate || ''} - ${
          exp.currentlyWorking ? 'Presente' : exp.endDate || ''
        }</p>
        ${
          exp.workSummery
            ? `<div class="description">${exp.workSummery}</div>`
            : ''
        }
      </div>
    `
      )
      .join('')}
  </section>
  `
      : ''
  }

  ${
    education && education.length > 0
      ? `
  <section id="education" class="section">
    <h2 class="section-title">Formación Académica</h2>
    ${education
      .map(
        (edu) => `
      <div class="timeline-item">
        <h3>${edu.degree || 'Título'}</h3>
        <p class="company">${edu.universityName || 'Universidad'}</p>
        <p class="date">${edu.startDate || ''} - ${edu.endDate || ''}</p>
        ${
          edu.description
            ? `<div class="description">${edu.description}</div>`
            : ''
        }
      </div>
    `
      )
      .join('')}
  </section>
  `
      : ''
  }

  ${
    skills && skills.length > 0
      ? `
  <section id="skills" class="section">
    <h2 class="section-title">Habilidades</h2>
    <div class="skills-grid">
      ${groupSkillsByCategory(skills)
        .map(
          (group) => `
        <div class="skill-category">
          <h4>${group.category}</h4>
          ${group.skills
            .map(
              (skill) => `
            <div class="skill-item">
              <div class="skill-name">
                <span>${skill.name}</span>
                <span class="skill-rating">${skill.rating || 0}/5</span>
              </div>
              <div class="skill-level">
                <div class="skill-progress" data-width="${
                  (skill.rating || 0) * 20
                }%" style="width: 0"></div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `
        )
        .join('')}
    </div>
  </section>
  `
      : ''
  }

  <!-- Footer -->
  <footer class="footer">
    <p>Generado con CV Builder • ${new Date().getFullYear()}</p>
  </footer>

  <script>
    // Animación de barras de progreso con Intersection Observer
    document.addEventListener('DOMContentLoaded', function() {
      const progressBars = document.querySelectorAll('.skill-progress');
            
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
              bar.style.width = width;
            }, 100);
            observer.unobserve(bar);
          }
        });
      }, { threshold: 0.5 });

      progressBars.forEach(bar => observer.observe(bar));

      // Animación de secciones al hacer scroll
      const sections = document.querySelectorAll('.section');
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });

      sections.forEach(section => sectionObserver.observe(section));
    });

    // Smooth scroll mejorado
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  </script>
</body>
</html>
  `.trim();
};

export default generateResumeHTML;
