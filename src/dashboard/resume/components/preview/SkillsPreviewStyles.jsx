import React from 'react';

/**
 * Componente con múltiples estilos para mostrar habilidades en     <div className="space-y-2 my-4">
      {resumeInfo?.skills?.map((skill, index) => {
        const // ESTILO 5: Minimalista (Solo texto - perfecto para ATS)
export const SkillsStyleMinimal = ({ resumeInfo }) => (
  <div className="my-6">
    <h2
      className="text-center font-bold text-sm mb-2"
      style={{ color: resumeInfo?.themeColor }}
    >
      Habilidades
    </h2>dRating = normalizeRating(skill?.rating);
        
        return (
          <div key={index} className="flex items-center justify-between border-b border-gray-100 py-2"> Todos los estilos están optimizados para ser compatibles con generación de PDF
 */

// Función utilitaria para normalizar rating
const normalizeRating = (rating) => {
  if (!rating) return 0;
  if (rating <= 5) return (rating / 5) * 100;
  return Math.min(rating, 100);
};

const getRatingText = (rating) => {
  const normalizedRating = normalizeRating(rating);
  if (normalizedRating >= 90) return 'Experto';
  if (normalizedRating >= 75) return 'Avanzado';
  if (normalizedRating >= 50) return 'Intermedio';
  if (normalizedRating >= 25) return 'Básico';
  return 'Principiante';
};

// ESTILO 1: Barras horizontales con texto (Actual mejorado)
export const SkillsStyleBars = ({ resumeInfo }) => (
  <div className="my-6">
    <h2
      className="text-center font-bold text-sm mb-2"
      style={{ color: resumeInfo?.themeColor }}
    >
      Habilidades
    </h2>
    <hr style={{ borderColor: resumeInfo?.themeColor }} />

    <div className="space-y-3 my-4">
      {resumeInfo?.skills?.map((skill, index) => {
        const normalizedRating = normalizeRating(skill?.rating);
        return (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{skill.name}</span>
              <span
                className="text-xs font-bold"
                style={{ color: resumeInfo?.themeColor }}
              >
                {getRatingText(skill?.rating)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div
                className="h-2 rounded"
                style={{
                  backgroundColor: resumeInfo?.themeColor,
                  width: normalizedRating + '%',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ESTILO 2: Círculos con porcentaje (Muy limpio para PDF)
export const SkillsStyleCircles = ({ resumeInfo }) => (
  <div className="my-6">
    <h2
      className="text-center font-bold text-sm mb-2"
      style={{ color: resumeInfo?.themeColor }}
    >
      Habilidades
    </h2>
    <hr style={{ borderColor: resumeInfo?.themeColor }} />

    <div className="grid grid-cols-2 gap-4 my-4">
      {resumeInfo?.skills?.map((skill, index) => {
        const normalizedRating = normalizeRating(skill?.rating);
        return (
          <div key={index} className="text-center">
            <div
              className="w-16 h-16 rounded-full border-4 flex items-center justify-center mx-auto mb-2"
              style={{
                borderColor: resumeInfo?.themeColor,
                backgroundColor: resumeInfo?.themeColor + '10',
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: resumeInfo?.themeColor }}
              >
                {Math.round(normalizedRating)}%
              </span>
            </div>
            <div className="text-xs font-medium">{skill.name}</div>
            <div className="text-xs text-gray-600">
              {getRatingText(skill?.rating)}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ESTILO 3: Lista con iconos de nivel (Muy compatible PDF)
export const SkillsStyleList = ({ resumeInfo }) => (
  <div className="my-6">
    <h2
      className="text-center font-bold text-sm mb-2"
      style={{ color: resumeInfo?.themeColor }}
    >
      Habilidades
    </h2>
    <hr style={{ borderColor: resumeInfo?.themeColor }} />

    <div className="space-y-2 my-4">
      {resumeInfo?.skills?.map((skill, index) => {
        const normalizedRating = normalizeRating(skill?.rating);
        const level = Math.ceil(normalizedRating / 20);

        return (
          <div key={index} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium flex-1">{skill.name}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className="w-2 h-2"
                    style={{
                      backgroundColor:
                        dot <= level ? resumeInfo?.themeColor : '#e5e7eb',
                      borderRadius: '50%',
                    }}
                  />
                ))}
              </div>
            </div>
            <span
              className="text-xs font-semibold ml-4"
              style={{ color: resumeInfo?.themeColor }}
            >
              {getRatingText(skill?.rating)}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

// ESTILO 4: Cuadrícula con bloques de color (Muy original)
export const SkillsStyleBlocks = ({ resumeInfo }) => (
  <div className="my-6">
    <h2
      className="text-center font-bold text-sm mb-2"
      style={{ color: resumeInfo?.themeColor }}
    >
      Habilidades
    </h2>
    <hr style={{ borderColor: resumeInfo?.themeColor }} />

    <div className="space-y-3 my-4">
      {resumeInfo?.skills?.map((skill, index) => {
        const normalizedRating = normalizeRating(skill?.rating);

        return (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{skill.name}</span>
              <span
                className="text-xs"
                style={{ color: resumeInfo?.themeColor }}
              >
                {Math.round(normalizedRating)}% • {getRatingText(skill?.rating)}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((block) => (
                <div
                  key={block}
                  className="flex-1 h-3"
                  style={{
                    backgroundColor:
                      block <= normalizedRating / 10
                        ? resumeInfo?.themeColor
                        : '#e5e7eb',
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ESTILO 5: Minimalista con solo texto (Máxima compatibilidad PDF)
export const SkillsStyleMinimal = ({ resumeInfo }) => (
  <div className="my-6">
    <h2
      className="text-center font-bold text-sm mb-2"
      style={{ color: resumeInfo?.themeColor }}
    >
      Habilidades
    </h2>
    <hr style={{ borderColor: resumeInfo?.themeColor }} />

    <div className="space-y-2 my-4">
      {resumeInfo?.skills?.map((skill, index) => {
        const normalizedRating = normalizeRating(skill?.rating);
        return (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-100 py-2"
          >
            <span className="text-sm font-medium">{skill.name}</span>
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-bold px-2 py-1 rounded"
                style={{
                  backgroundColor: resumeInfo?.themeColor + '20',
                  color: resumeInfo?.themeColor,
                }}
              >
                {getRatingText(skill?.rating)}
              </span>
              <span className="text-xs text-gray-600">
                {Math.round(normalizedRating)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default {
  SkillsStyleBars,
  SkillsStyleCircles,
  SkillsStyleList,
  SkillsStyleBlocks,
  SkillsStyleMinimal,
};
