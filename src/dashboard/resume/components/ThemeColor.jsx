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

  const [isOpen, setIsOpen] = useState(false);
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [selectedColor, setSelectedColor] = useState();
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
            {colors.map((item, index) => (
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
