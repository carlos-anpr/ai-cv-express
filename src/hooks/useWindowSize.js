import { useState, useEffect } from 'react';

/**
 * useWindowSize Hook
 *
 * Detecta y actualiza el tamaño de la ventana
 */

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    // Handler para actualizar el tamaño
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Agregar event listener
    window.addEventListener('resize', handleResize);

    // Llamar handler inmediatamente para obtener tamaño actual
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default useWindowSize;
