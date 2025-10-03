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
    if (normalizedRating >= 90) return 'Experto';
    if (normalizedRating >= 75) return 'Avanzado';
    if (normalizedRating >= 50) return 'Intermedio';
    if (normalizedRating >= 25) return 'Básico';
    return 'Principiante';
  };

  return (
    <div className="my-6">
      <h2
        className="text-center font-bold text-sm mb-2"
        style={{
          color: resumeInfo?.themeColor,
        }}
      >
        Habilidades
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

          return (
            <div key={index} className="skill-item">
              {/* Encabezado con nombre y nivel */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800">
                  {skill.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: resumeInfo?.themeColor + '15',
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

              {/* Barra de progreso principal */}
              <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    backgroundColor: resumeInfo?.themeColor,
                    width: normalizedRating + '%',
                  }}
                ></div>
              </div>

              {/* Indicador visual adicional - Bloques de nivel */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const isActive = level <= Math.ceil(normalizedRating / 20);
                    return (
                      <div
                        key={level}
                        className="w-4 h-1.5 rounded-sm"
                        style={{
                          backgroundColor: isActive
                            ? resumeInfo?.themeColor
                            : '#e5e7eb',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Escala visual textual */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                </div>
              </div>

              {/* Línea separadora sutil */}
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
