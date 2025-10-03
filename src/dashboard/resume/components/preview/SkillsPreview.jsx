import React from 'react';

function SkillsPreview({ resumeInfo }) {
  // Agrupar skills por categoría
  const groupSkillsByCategory = (skills) => {
    if (!skills || skills.length === 0) return {};

    const grouped = {};

    skills.forEach((skill) => {
      const category = skill.category || 'Habilidades Técnicas';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });

    return grouped;
  };

  // Renderizar indicadores de nivel (círculos rellenos según rating)
  const renderLevelDots = (rating, themeColor) => {
    const maxDots = 5;
    const filledDots = Math.round(rating || 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(maxDots)].map((_, index) => (
          <div
            key={index}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: index < filledDots ? themeColor : '#e5e7eb',
            }}
          />
        ))}
      </div>
    );
  };

  const skillsByCategory = groupSkillsByCategory(resumeInfo?.skills);
  const hasCategories = Object.keys(skillsByCategory).length > 0;

  return (
    <div className="my-6">
      <h2
        className="text-center font-bold text-sm mb-2"
        style={{
          color: resumeInfo?.themeColor,
        }}
      >
        Habilidades Técnicas
      </h2>
      <hr
        className="mb-4"
        style={{
          borderColor: resumeInfo?.themeColor,
        }}
      />

      {hasCategories && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} className="bg-gray-50 rounded-sm p-3">
              {/* Título de la categoría */}
              <h3 className="font-bold text-[11px] text-gray-900 mb-2">
                {category}
              </h3>

              {/* Lista de skills con indicadores de nivel */}
              <div className="space-y-1.5">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-[10px] text-gray-700 flex-1">
                      {skill.name}
                    </span>
                    {renderLevelDots(skill.rating, resumeInfo?.themeColor)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje si no hay habilidades */}
      {!hasCategories && (
        <p className="text-xs text-gray-400 text-center my-4">
          No hay habilidades añadidas
        </p>
      )}
    </div>
  );
}

export default SkillsPreview;
