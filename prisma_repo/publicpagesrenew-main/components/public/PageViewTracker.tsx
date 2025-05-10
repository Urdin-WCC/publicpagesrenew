'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Componente para registrar vistas de página
 * 
 * Este componente se encarga de registrar cada vista de página en la API
 * de estadísticas. Se ejecuta en el lado del cliente y detecta cambios
 * en la ruta y los parámetros de búsqueda.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPathRef = useRef<string>('');

  useEffect(() => {
    // Crear URL completa con params
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // No registrar si es la misma URL (evitar duplicados al hacer fast refresh)
    if (url === previousPathRef.current) {
      return;
    }
    
    previousPathRef.current = url;
    
    // Obtener referrer si está disponible
    const referrer = document.referrer || null;
    
    // Registrar vista de página
    const logPageView = async () => {
      try {
        console.log('Registrando vista de página:', url);
        
        const response = await fetch('/api/stats/log-page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, referrer }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          // Error silencioso para no interrumpir experiencia del usuario
          console.error('Error registrando vista de página:', response.status, errorData);
        } else {
          console.log('Vista de página registrada correctamente');
        }
      } catch (error) {
        // Error silencioso para no interrumpir experiencia del usuario
        console.error('Error al enviar datos de vista de página:', error);
      }
    };

    // Ejecutar la función de registro
    logPageView();
    
    // No necesitamos una función de limpieza aquí
  }, [pathname, searchParams]); // Se ejecuta cuando cambia la ruta o los parámetros

  // Este componente no renderiza nada visible
  return null;
}
