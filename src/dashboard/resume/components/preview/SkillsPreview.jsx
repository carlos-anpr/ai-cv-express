import React from 'react';

function SkillsPreview({ resumeInfo }) {
  // Función para normalizar el rating a porcentaje (0-100)
  const normalizeRating = (rating) => {
    if (!rating) return 0;
    // Si el rating está entre 0-5 (sistema de estrellas), convertir a porcentaje
    if (rating <= 5) {
      return (rating / 5) * 100;
    }
    // Si ya está en porcentaje (0-100), usar tal como está
    return Math.min(rating, 100);
  };

  // Función para obtener el nivel textual
  const getRatingText = (rating) => {
    const normalizedRating = normalizeRating(rating);
    if (normalizedRating >= 90) return 'Expert';
    if (normalizedRating >= 75) return 'Advanced';
    if (normalizedRating >= 50) return 'Intermediate';
    if (normalizedRating >= 25) return 'Basic';
    return 'Beginner';
  };

  return (
    <div className="my-6">
      <h2
        className="text-center font-bold text-sm mb-2"
        style={{
          color: resumeInfo?.themeColor,
        }}
      >
        Skills
      </h2>
      <hr
        style={{
          borderColor: resumeInfo?.themeColor,
        }}
      />

      <div className="space-y-4 my-4">
        {resumeInfo?.skills?.map((skill, index) => {
          const normalizedRating = normalizeRating(skill?.rating);
          const ratingText = getRatingText(skill?.rating);
          const skillLevel = Math.ceil(normalizedRating / 20);

          return (
            <div key={index} className="skill-item">
              {/* Encabezado limpio con nombre y nivel */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800">
                  {skill.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full border"
                    style={{
                      borderColor: resumeInfo?.themeColor,
                      color: resumeInfo?.themeColor,
                    }}
                  >
                    {ratingText}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: resumeInfo?.themeColor }}
                  >
                    {Math.round(normalizedRating)}%
                  </span>
                </div>
              </div>

              {/* Barra de progreso principal - Compatible con PDF */}
              <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: resumeInfo?.themeColor,
                    width: normalizedRating + '%',
                  }}
                ></div>
              </div>

              {/* Indicador visual de nivel - Sistema de círculos sólidos CORREGIDO */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }, (_, i) => {
                    const level = i + 1;
                    const isActive = level <= skillLevel;
                    const circleColor = isActive
                      ? resumeInfo?.themeColor || '#3b82f6'
                      : '#e5e7eb';

                    return (
                      <div
                        key={level}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: circleColor,
                          display: 'inline-block',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Nivel numérico simple */}
                <span className="text-xs text-gray-500 font-medium">
                  Level {skillLevel}/5
                </span>
              </div>

              {/* Separador entre skills */}
              {index < (resumeInfo?.skills?.length || 0) - 1 && (
                <div className="mt-3 border-b border-gray-100"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SkillsPreview;
