'use client';

/**
 * Widget para renderizar contenido HTML personalizado por un administrador Master.
 * 
 * Este componente utiliza FixedHtmlRenderer para renderizar HTML personalizado
 * de forma segura y con soporte para todo tipo de contenido (scripts, styles, multimedia, etc).
 */

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Importar FixedHtmlRenderer solo en el cliente
const FixedHtmlRenderer = dynamic(() => import('@/components/public/FixedHtmlRenderer'), { 
  ssr: false 
});

interface WidgetProps {
  // Se puede extender con propiedades adicionales si es necesario
}

/**
 * Componente para renderizar HTML personalizado ingresado por un administrador Master
 * 
 * Este widget se puede utilizar en el sidebar, footer u otras secciones del sitio.
 * El contenido HTML es completamente arbitrario y se renderiza con FixedHtmlRenderer.
 */
export function WidgetDeveloperHTML({}: WidgetProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cargar la configuración en el efecto del cliente
  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        setHtmlContent(data?.developerHtmlContent || null);
      } catch (error) {
        console.error('Error loading developer HTML content:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadContent();
  }, []);

  // Mostrar cargando durante la carga
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 h-32 rounded"></div>
    );
  }
  
  // Solo renderizar si hay contenido HTML
  if (!htmlContent) {
    return null;
  }

  return (
    <div className="widget-developer-html">
      <FixedHtmlRenderer content={htmlContent} className="w-full" />
    </div>
  );
}

export default WidgetDeveloperHTML;
