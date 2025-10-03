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

      {/* Diseño en grid de 2 columnas - Compacto y profesional */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 my-4">
        {resumeInfo?.skills?.map((skill, index) => {
          const normalizedRating = normalizeRating(skill?.rating);

          return (
            <div key={index} className="flex items-center justify-between">
              {/* Nombre de la habilidad */}
              <span className="text-xs font-medium text-gray-700 flex-shrink-0 mr-2">
                {skill.name}
              </span>

              {/* Barra de progreso minimalista */}
              <div className="flex items-center gap-1 flex-grow">
                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      backgroundColor: resumeInfo?.themeColor,
                      width: normalizedRating + '%',
                    }}
                  ></div>
                </div>
                {/* Porcentaje pequeño */}
                <span
                  className="text-[10px] font-bold flex-shrink-0"
                  style={{ color: resumeInfo?.themeColor }}
                >
                  {Math.round(normalizedRating)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SkillsPreview;
