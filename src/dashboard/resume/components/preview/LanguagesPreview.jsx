import { Languages as LanguagesIcon } from 'lucide-react';
import React from 'react';

function LanguagesPreview({ resumeInfo }) {
  // Log temporal para depuración
  console.log(
    '[LanguagesPreview] resumeInfo.languages:',
    resumeInfo?.languages
  );
  // Función para obtener el color según el nivel
  const getLevelColor = (level) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return 'text-red-600';
      case 'B1':
      case 'B2':
        return 'text-yellow-600';
      case 'C1':
      case 'C2':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Función para obtener el porcentaje visual del nivel
  const getLevelPercentage = (level) => {
    if (!level) return 0;
    const norm = level.trim().toUpperCase();
    if (
      norm === 'NATIVO' ||
      norm === 'NATIVE' ||
      /nativo|native/.test(level.trim().toLowerCase())
    ) {
      return 100;
    }
    const percentages = {
      A1: 20,
      A2: 35,
      B1: 50,
      B2: 70,
      C1: 85,
      C2: 100,
    };
    return percentages[norm] || 0;
  };

  // Función para obtener la bandera del idioma
  const getLanguageFlag = (languageName) => {
    const flags = {
      español: '🇪🇸',
      inglés: '🇬🇧',
      francés: '🇫🇷',
      alemán: '🇩🇪',
      italiano: '🇮🇹',
      portugués: '🇵🇹',
      chino: '🇨🇳',
      japonés: '🇯🇵',
      coreano: '🇰🇷',
      árabe: '🇸🇦',
      ruso: '🇷🇺',
      neerlandés: '🇳🇱',
      sueco: '🇸🇪',
      polaco: '🇵🇱',
      turco: '🇹🇷',
    };
    return flags[languageName?.toLowerCase()] || '🌐';
  };

  return (
    <div className="my-6">
      <h2
        className="text-center font-bold text-sm mb-2 flex items-center justify-center gap-2"
        style={{ color: resumeInfo?.themeColor }}
      >
        <LanguagesIcon className="h-4 w-4" />
        Idiomas
      </h2>
      <hr
        style={{ borderColor: resumeInfo?.themeColor }}
        className="border-[1.5px] my-2"
      />

      {resumeInfo?.languages && resumeInfo.languages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {resumeInfo.languages.map((language, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 bg-gray-50 rounded-lg p-2 border border-gray-200"
            >
              {/* Idioma con bandera */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm">
                  {getLanguageFlag(language.name)}
                </span>
                <h3 className="text-xs font-semibold text-gray-800">
                  {language.name}
                </h3>
              </div>

              {/* Nivel con barra de progreso */}
              {language.level && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-medium ${getLevelColor(
                        language.level
                      )}`}
                    >
                      {language.level}
                    </span>
                    {language.certification && (
                      <span className="text-[9px] text-gray-500">✓ Cert.</span>
                    )}
                  </div>

                  {/* Barra de progreso visual */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${getLevelPercentage(language.level)}%`,
                        backgroundColor: resumeInfo?.themeColor || '#3b82f6',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Certificación si existe */}
              {language.certification && (
                <p className="text-[9px] text-gray-600 mt-0.5 line-clamp-1">
                  📜 {language.certification}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-center text-gray-400 my-2">
          Añade idiomas para destacar tus habilidades lingüísticas
        </p>
      )}
    </div>
  );
}

export default LanguagesPreview;
