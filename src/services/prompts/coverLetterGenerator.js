// src/services/prompts/coverLetterGenerator.js

import { getStylePrompt } from './stylePrompts.js';
import { getLengthPrompt } from './lengthPrompts.js';

export class CoverLetterGenerator {
  static generatePrompt(
    resumeData,
    jobApplication,
    style = 'friendly',
    length = 'medium'
  ) {
    const styleConfig = getStylePrompt(style);
    const lengthConfig = getLengthPrompt(length);

    const basePrompt = `
Eres un experto en redacción de cartas de presentación profesionales. 

INFORMACIÓN DEL CANDIDATO:
- Nombre: ${resumeData.firstName} ${resumeData.lastName}
- Email: ${resumeData.email}
- Teléfono: ${resumeData.phone || 'No especificado'}
- Ubicación: ${resumeData.address || 'No especificada'}

EXPERIENCIA PROFESIONAL:
${this.formatExperience(resumeData.experience)}

EDUCACIÓN:
${this.formatEducation(resumeData.education)}

HABILIDADES:
${this.formatSkills(resumeData.skills)}

RESUMEN PROFESIONAL:
${resumeData.summery || 'No especificado'}

INFORMACIÓN DEL PUESTO:
- Empresa: ${jobApplication.companyName}
- Puesto: ${jobApplication.jobTitle}
- Ubicación: ${jobApplication.location || 'No especificada'}
- Descripción: ${jobApplication.jobDescription || 'No disponible'}
- Requisitos: ${jobApplication.requirements || 'No especificados'}

CONFIGURACIÓN DE ESTILO:
${styleConfig.prompt}

CONFIGURACIÓN DE LONGITUD:
${lengthConfig.prompt}

INSTRUCCIONES FINALES:
1. Crea una carta de presentación personalizada que conecte específicamente la experiencia del candidato con los requisitos del puesto
2. Menciona la empresa por nombre y muestra conocimiento específico sobre ella cuando sea relevante
3. Destaca las habilidades y experiencias más relevantes para este puesto específico
4. Mantén un tono ${styleConfig.name.toLowerCase()} según las especificaciones de estilo
5. Respeta estrictamente la longitud ${lengthConfig.name.toLowerCase()} (${
      lengthConfig.wordCount
    } palabras)
6. Estructura la carta con ${lengthConfig.structure.length} párrafos principales
7. NO incluyas información de contacto (dirección, teléfono, email) en la carta
8. NO incluyas fecha ni "Estimado Sr./Sra." genérico - usa el nombre de la empresa cuando sea apropiado
9. Enfócate en el valor que el candidato puede aportar a la empresa específica
10. Termina con una llamada a la acción apropiada para el estilo elegido

Responde SOLO con el texto de la carta de presentación, sin añadir explicaciones adicionales.
`;

    return basePrompt.trim();
  }

  static formatExperience(experience) {
    if (!experience || !Array.isArray(experience)) {
      return 'No se ha especificado experiencia profesional';
    }

    return experience
      .map(
        (exp) =>
          `- ${exp.title} en ${exp.companyName} (${exp.startDate} - ${
            exp.endDate
          }): ${exp.workSummary || 'Sin descripción'}`
      )
      .join('\n');
  }

  static formatEducation(education) {
    if (!education || !Array.isArray(education)) {
      return 'No se ha especificado educación';
    }

    return education
      .map(
        (edu) =>
          `- ${edu.degree} en ${edu.universityName} (${edu.startDate} - ${edu.endDate})`
      )
      .join('\n');
  }

  static formatSkills(skills) {
    if (!skills || !Array.isArray(skills)) {
      return 'No se han especificado habilidades';
    }

    return skills
      .map((skill) => `- ${skill.name} (${skill.rating}/5)`)
      .join('\n');
  }

  static validateConfiguration(style, length) {
    const validStyles = ['formal', 'friendly', 'humanized', 'informal'];
    const validLengths = ['short', 'medium', 'long'];

    const errors = [];

    if (!validStyles.includes(style)) {
      errors.push(
        `Estilo inválido: ${style}. Debe ser uno de: ${validStyles.join(', ')}`
      );
    }

    if (!validLengths.includes(length)) {
      errors.push(
        `Longitud inválida: ${length}. Debe ser uno de: ${validLengths.join(
          ', '
        )}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static getAvailableStyles() {
    return Object.keys(getStylePrompt.STYLE_PROMPTS || {});
  }

  static getAvailableLengths() {
    return Object.keys(getLengthPrompt.LENGTH_PROMPTS || {});
  }
}

export default CoverLetterGenerator;
