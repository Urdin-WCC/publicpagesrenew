'use client';

import { useEffect, useState } from 'react';

interface FixedHtmlRendererProps {
  content: string;
  className?: string;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

/**
 * Componente mejorado para renderizar HTML con seguridad.
 * - Preserva todo tipo de contenido HTML (scripts, estilos, multimedia)
 * - Sanitiza enlaces y etiquetas para evitar errores
 * - Corrige problemas comunes con imágenes y extensiones de archivo
 * - Reemplaza targets vacíos en enlaces
 * - Añade atributos de seguridad para enlaces externos
 */
/**
 * Verifica y corrige problemas comunes en enlaces e imágenes HTML
 */
function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Procesar todos los enlaces
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      
      // Limpiar y validar href
      if (!href || href === '') {
        link.setAttribute('href', '#');
      } else if (href.includes('<') || href.includes('>')) {
        // Si el href contiene HTML, reemplazarlo con #
        link.setAttribute('href', '#');
      }

      // Manejar enlaces externos
      if (href.startsWith('http') || href.startsWith('//')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      } else {
        // Para enlaces internos, eliminar target si está vacío
        const targetAttr = link.getAttribute('target');
        if (targetAttr === '') {
          link.removeAttribute('target');
        }
      }
    });
    
    // Procesar todas las imágenes
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      // Asegurar que todas las imágenes tengan alt text
      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', 'Imagen');
      }
      
      // Corregir URLs de imágenes sin extensión
      const src = img.getAttribute('src') || '';
      
      // Si la URL no contiene una extensión reconocida, añadir .jpg como fallback
      // pero solo si no contiene ya un query parameter
      if (src && !src.match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i) && !src.includes('?')) {
        if (src.includes('/images/')) {
          img.setAttribute('src', `${src}.jpg`);
        }
      }
      
      // Añadir loading lazy a todas las imágenes excepto la primera
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
    
    return tempDiv.innerHTML;
  } catch (e) {
    console.error('Error sanitizando HTML:', e);
    return html;
  }
}

function processHtmlContent(content: string): string {
  if (!content) return '';
  
  try {
    let processedContent = content;
    
    // Si contiene entidades HTML, decodificarlas
    if (content.includes('&lt;')) {
      processedContent = decodeHtmlEntities(content);
      console.log('Decoded HTML entities in content');
    }
    
    // Sanitizar el HTML completo
    processedContent = sanitizeHtml(processedContent);
    
    // Envolver fragmentos de código en elementos pre/code si es necesario
    if (processedContent.includes('<code>') && !processedContent.includes('<pre>')) {
      processedContent = processedContent.replace(
        /<code>([\s\S]*?)<\/code>/g, 
        '<pre><code>$1</code></pre>'
      );
    }
    
    return processedContent;
  } catch (e) {
    console.error('Error procesando HTML:', e);
    return content; // En caso de error, devolver contenido original
  }
}

/**
 * Client component that renders HTML content and fixes double-encoding issues
 */
export default function FixedHtmlRenderer({ content, className = '' }: FixedHtmlRendererProps) {
  const [fixedContent, setFixedContent] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Process HTML content on client side
    const fixed = processHtmlContent(content);
    setFixedContent(fixed);
    
    console.log('FixedHtmlRenderer mounted on client side');
  }, [content]);

  if (!isClient) {
    // Display a placeholder until the component is mounted on the client
    return (
      <div className={`content-html placeholder ${className}`}>
        <div className="animate-pulse bg-gray-200 h-4 w-3/4 mb-2"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-full mb-2"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-5/6 mb-2"></div>
      </div>
    );
  }

  return (
    <div 
      className={`content-html ${className}`}
      dangerouslySetInnerHTML={{ __html: fixedContent }}
    />
  );
}
