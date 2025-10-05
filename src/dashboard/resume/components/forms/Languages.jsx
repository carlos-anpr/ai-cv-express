import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import {
  LoaderCircle,
  Plus,
  Trash2,
  Languages as LanguagesIcon,
  Globe,
  Award,
  X,
} from 'lucide-react';
import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import LocalDatabase from '../../../../services/LocalDatabase';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Niveles de idioma según el Marco Común Europeo de Referencia (CEFR)
const LANGUAGE_LEVELS = [
  { value: 'A1', label: 'A1 - Básico', description: 'Principiante' },
  { value: 'A2', label: 'A2 - Elemental', description: 'Elemental' },
  { value: 'B1', label: 'B1 - Intermedio', description: 'Intermedio' },
  {
    value: 'B2',
    label: 'B2 - Intermedio Alto',
    description: 'Intermedio Alto',
  },
  { value: 'C1', label: 'C1 - Avanzado', description: 'Avanzado' },
  { value: 'C2', label: 'C2 - Muy Avanzado', description: 'Muy Avanzado' },
  {
    value: 'NATIVO',
    label: 'Nativo (lengua materna)',
    description: 'Lengua materna',
  },
];

// Idiomas comunes con sus códigos y banderas emoji
const COMMON_LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'Inglés', flag: '🇬🇧' },
  { code: 'fr', name: 'Francés', flag: '🇫🇷' },
  { code: 'de', name: 'Alemán', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugués', flag: '🇵🇹' },
  { code: 'zh', name: 'Chino', flag: '🇨🇳' },
  { code: 'ja', name: 'Japonés', flag: '🇯🇵' },
  { code: 'ko', name: 'Coreano', flag: '🇰🇷' },
  { code: 'ar', name: 'Árabe', flag: '🇸🇦' },
  { code: 'ru', name: 'Ruso', flag: '🇷🇺' },
  { code: 'nl', name: 'Neerlandés', flag: '🇳🇱' },
  { code: 'sv', name: 'Sueco', flag: '🇸🇪' },
  { code: 'pl', name: 'Polaco', flag: '🇵🇱' },
  { code: 'tr', name: 'Turco', flag: '🇹🇷' },
];

function Languages() {
  const [loading, setLoading] = useState(false);
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const params = useParams();
  // Solo inicializar una vez desde el contexto
  const [languagesList, setLanguagesList] = useState(() => {
    if (resumeInfo?.languages && resumeInfo.languages.length > 0) {
      return resumeInfo.languages.map((lang, idx) => ({
        ...lang,
        id: lang.id || `lang-${Date.now()}-${idx}`,
      }));
    }
    return [
      {
        id: `lang-${Date.now()}-0`,
        name: '',
        level: '',
        certification: '',
      },
    ];
  });

  const handleChange = (index, name, value) => {
    setLanguagesList((prevList) => {
      const newEntries = [...prevList];
      newEntries[index] = {
        ...newEntries[index],
        [name]: value,
      };
      return newEntries;
    });
  };

  const AddNewLanguage = () => {
    setLanguagesList((prevList) => [
      ...prevList,
      {
        id: `lang-${Date.now()}-${prevList.length}`,
        name: '',
        level: '',
        certification: '',
      },
    ]);
  };

  const RemoveLanguage = () => {
    setLanguagesList((languagesList) => languagesList.slice(0, -1));
  };

  const RemoveLanguageByIndex = async (index) => {
    try {
      const updatedLanguages = languagesList.filter((_, i) => i !== index);
      const cleanLanguages = updatedLanguages
        .filter((lang) => lang.name && lang.name.trim() !== '' && lang.level)
        .map((lang) => {
          // eslint-disable-next-line no-unused-vars
          const { id, ...rest } = lang;
          return rest;
        });
      setLanguagesList(updatedLanguages);
      setResumeInfo((prev) => ({ ...prev, languages: cleanLanguages }));
      await LocalDatabase.UpdateResumeDetail(params.resumeId, {
        languages: cleanLanguages,
      });
      toast.success('Idioma eliminado');
    } catch {
      toast.error('Error al eliminar el idioma');
    }
  };

  const onSave = async () => {
    if (!params?.resumeId) {
      toast.error('ID del CV no válido');
      return;
    }
    setLoading(true);
    try {
      const validLanguages = languagesList.filter(
        (lang) => lang.name && lang.name.trim() !== '' && lang.level
      );
      const cleanLanguages = validLanguages.map((lang) => {
        // eslint-disable-next-line no-unused-vars
        const { id, ...rest } = lang;
        return rest;
      });
      await LocalDatabase.UpdateResumeDetail(params.resumeId, {
        languages: cleanLanguages,
      });
      setResumeInfo((prev) => ({ ...prev, languages: cleanLanguages }));
      toast.success('Idiomas actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar idiomas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener la bandera del idioma
  const getLanguageFlag = (languageName) => {
    const lang = COMMON_LANGUAGES.find(
      (l) => l.name.toLowerCase() === languageName.toLowerCase()
    );
    return lang?.flag || null;
  };

  // Función para obtener el color según el nivel (tema oscuro)
  const getLevelColor = (level) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return 'bg-red-900/10 text-red-700 border-red-800/20';
      case 'B1':
      case 'B2':
        return 'bg-yellow-900/10 text-yellow-700 border-yellow-800/20';
      case 'C1':
      case 'C2':
        return 'bg-green-900/10 text-green-700 border-green-800/20';
      default:
        return 'bg-gray-900/10 text-gray-700 border-gray-800/20';
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 bg-white">
      {/* Header con icono y descripción - tema oscuro */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg">
          <LanguagesIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-gray-900">Idiomas</h2>
          <p className="text-sm text-gray-600">
            Añade los idiomas que dominas y tu nivel de competencia
          </p>
        </div>
      </div>

      {/* Info box con sugerencia - tema oscuro suave */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-5 flex items-start gap-2">
        <Globe className="h-4 w-4 text-gray-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-700">
          <strong>💡 Consejo:</strong> Los idiomas son clave en procesos de
          selección internacionales. Usa los niveles CEFR estándar (A1-C2) o
          indica si eres nativo. Si tienes certificaciones oficiales (TOEFL,
          DELE, DELF, etc.), añádelas para mayor credibilidad.
        </div>
      </div>

      <div className="space-y-4">
        {languagesList?.map((item, index) => (
          <div
            key={item.id || index}
            className="border-2 border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-all bg-white shadow-sm hover:shadow-md"
          >
            {/* Header de la card con badge de número - tema oscuro */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {index + 1}
                </div>
                {item.name && getLanguageFlag(item.name) ? (
                  <span className="text-lg">{getLanguageFlag(item.name)}</span>
                ) : (
                  <Globe className="h-5 w-5 text-gray-700" />
                )}
                {item.level && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getLevelColor(
                      item.level
                    )}`}
                  >
                    {item.level}
                  </span>
                )}
              </div>
              {languagesList.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => RemoveLanguageByIndex(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selector de idioma con autocompletado visual */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-800 mb-1.5 flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-gray-700" />
                  Idioma *
                </label>
                <Select
                  value={item.name}
                  onValueChange={(value) => handleChange(index, 'name', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un idioma">
                      {item.name && (
                        <span className="flex items-center gap-2">
                          <span className="text-lg">
                            {getLanguageFlag(item.name)}
                          </span>
                          {item.name}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.name}>
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{lang.flag}</span>
                          {lang.name}
                        </span>
                      </SelectItem>
                    ))}
                    <SelectItem value="Otro">
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-700" />
                        Otro idioma...
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {item.name === 'Otro' && (
                  <Input
                    placeholder="Escribe el nombre del idioma"
                    className="mt-2"
                    onChange={(e) =>
                      handleChange(index, 'name', e.target.value)
                    }
                  />
                )}
              </div>

              {/* Selector de nivel CEFR */}
              <div>
                <label className="text-sm font-medium text-gray-800 mb-1.5 flex items-center gap-1">
                  <LanguagesIcon className="h-3.5 w-3.5 text-gray-700" />
                  Nivel de dominio *
                </label>
                <Select
                  value={item.level}
                  onValueChange={(value) => handleChange(index, 'level', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona nivel">
                      {item.level && (
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.level.startsWith('A')
                                ? 'bg-red-500'
                                : item.level.startsWith('B')
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                          />
                          {
                            LANGUAGE_LEVELS.find((l) => l.value === item.level)
                              ?.label
                          }
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-b">
                      Marco Común Europeo (CEFR)
                    </div>
                    {LANGUAGE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              level.value === 'NATIVO'
                                ? 'bg-blue-600'
                                : level.value.startsWith('A')
                                ? 'bg-red-500'
                                : level.value.startsWith('B')
                                ? 'bg-yellow-500'
                                : level.value.startsWith('C')
                                ? 'bg-green-500'
                                : 'bg-gray-400'
                            }`}
                          />
                          <span className="font-medium">{level.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campo de certificación opcional */}
              <div>
                <label className="text-sm font-medium text-gray-800 mb-1.5 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-gray-700" />
                  Certificación
                  <span className="text-xs text-gray-500 font-normal">
                    (opcional)
                  </span>
                </label>
                <Input
                  name="certification"
                  placeholder="Ej: TOEFL 110, DELE C1, DELF B2"
                  onChange={(e) =>
                    handleChange(index, 'certification', e.target.value)
                  }
                  value={item.certification || ''}
                  className="w-full"
                />
              </div>
            </div>

            {/* Guía visual del nivel seleccionado */}
            {item.level && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600">
                  <strong>
                    {
                      LANGUAGE_LEVELS.find((l) => l.value === item.level)
                        ?.description
                    }
                    :
                  </strong>{' '}
                  {item.level === 'A1' &&
                    'Puedo comprender y usar expresiones cotidianas muy básicas.'}
                  {item.level === 'A2' &&
                    'Puedo comunicarme en tareas simples y rutinarias.'}
                  {item.level === 'B1' &&
                    'Puedo desenvolverme en la mayoría de situaciones que pueden surgir durante un viaje.'}
                  {item.level === 'B2' &&
                    'Puedo interactuar con hablantes nativos con fluidez y naturalidad.'}
                  {item.level === 'C1' &&
                    'Puedo expresarme de forma fluida y espontánea sin esfuerzo.'}
                  {item.level === 'C2' &&
                    'Dominio total del idioma, similar a un hablante nativo.'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botones de acción - tema oscuro */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={AddNewLanguage}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Idioma
        </Button>
        {languagesList.length > 1 && (
          <Button
            variant="outline"
            onClick={RemoveLanguage}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          >
            <X className="h-4 w-4 mr-2" />
            Quitar Último
          </Button>
        )}
      </div>

      {/* Botón de guardar principal - tema oscuro profesional */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button
          disabled={loading}
          onClick={onSave}
          className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white"
          size="lg"
        >
          {loading ? (
            <>
              <LoaderCircle className="animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 mr-2" />
              Guardar Idiomas
            </>
          )}
        </Button>
      </div>

      {/* Footer con contador */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          {languagesList.filter((l) => l.name && l.level).length} de{' '}
          {languagesList.length} idioma(s) completo(s)
        </p>
      </div>
    </div>
  );
}

export default Languages;
