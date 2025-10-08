import React, { useContext, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import LocalDatabase from '../../../services/LocalDatabase';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

function ThemeColor() {
  // Paleta profesional de colores para CVs corporativos
  const colors = [
    // Grises y neutros profesionales
    '#1a1a1a', // Negro profesional
    '#2d3748', // Gris oscuro
    '#4a5568', // Gris medio
    '#718096', // Gris claro

    // Azules corporativos
    '#1e3a8a', // Azul oscuro corporativo
    '#2563eb', // Azul rey
    '#3b82f6', // Azul vibrante
    '#0ea5e9', // Azul cielo

    // Verdes profesionales
    '#065f46', // Verde bosque
    '#059669', // Verde esmeralda
    '#10b981', // Verde profesional
    '#14b8a6', // Verde azulado (teal)

    // Tonos tierra y cálidos profesionales
    '#92400e', // Marrón oscuro
    '#b45309', // Naranja tierra
    '#d97706', // Ámbar profesional
    '#dc2626', // Rojo corporativo

    // Púrpuras y violetas elegantes
    '#4c1d95', // Púrpura oscuro
    '#7c3aed', // Violeta profesional
    '#a855f7', // Púrpura medio
    '#ec4899', // Rosa corporativo
  ];

  // Añadimos 3 filas más (15 colores) con tonos profesionales, sobrios y actuales.
  // No son colores fosforitos ni chillones — buscan ser llamativos pero discretos para un CV.
  const extendedColors = [
    // Row 5: dark/navy/steel
    '#0f172a', // Charcoal very dark
    '#0b2447', // Deep navy
    '#12263a', // Steel navy
    '#203864', // Soft indigo/steel
    '#264653', // Muted teal-steel

    // Row 6: muted teals/olives
    '#2a6f6f', // Muted teal
    '#31524b', // Olive-teal
    '#16697a', // Deep teal
    '#5a3e2b', // Bronze brown
    '#7a4a2e', // Warm brown

    // Row 7: warm neutrals and muted accents
    '#9b6b47', // Sandy brown
    '#6b1f1f', // Deep burgundy
    '#4a2f4a', // Plum muted
    '#7b8794', // Muted blue-gray
    '#b08968', // Muted gold / tan
  ];

  const allColors = colors.concat(extendedColors);

  const [isOpen, setIsOpen] = useState(false);
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  // Inicializamos la selección con el color guardado en el contexto (si existe)
  const [selectedColor, setSelectedColor] = useState(
    resumeInfo?.themeColor || allColors[0]
  );
  const { resumeId } = useParams();
  const onColorSelect = async (color) => {
    setSelectedColor(color);
    setResumeInfo({
      ...resumeInfo,
      themeColor: color,
    });

    if (!resumeId) {
      toast.error('ID del CV no válido');
      return;
    }

    try {
      const response = await LocalDatabase.UpdateResumeDetail(resumeId, {
        themeColor: color,
      });

      console.log('✅ Color de tema actualizado:', response);
      // theme update persisted
      toast.success('Color de tema actualizado');
      setIsOpen(false);
    } catch (error) {
      console.error('❌ Error actualizando color:', error);
      toast.error('Error al actualizar color: ' + error.message);
      setIsOpen(false);
    }
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="flex gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <LayoutGrid /> Theme
      </Button>
      {isOpen && (
        <div className="absolute z-50 p-4 bg-white border rounded shadow">
          <h2 className="mb-2 text-sm font-bold">Select Theme Color</h2>
          <div className="grid grid-cols-5 gap-3">
            {allColors.map((item, index) => (
              <div
                key={index}
                onClick={() => onColorSelect(item)}
                className={`h-5 w-5 rounded-full cursor-pointer
                           hover:border-black border
                           ${selectedColor === item && 'border border-black'}`}
                style={{ background: item }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeColor;
