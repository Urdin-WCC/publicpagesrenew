'use client';

import { useEffect, useState } from 'react';
import { translations } from '@/app/translations';
import Image from 'next/image';

interface LoadingSpinnerConfig {
  backgroundColor?: string;
  spinnerColor?: string;
  spinnerImage?: string;
  text?: string;
  enabled?: boolean;
  textColor?: string;
  size?: string;
  overlay?: boolean;
}

interface LoadingSpinnerProps {
  config?: LoadingSpinnerConfig;
}

export default function LoadingSpinner({ config }: LoadingSpinnerProps) {
  const [visible, setVisible] = useState(true);
  
  // Parse configuration with defaults
  const spinnerConfig = {
    backgroundColor: config?.backgroundColor || 'rgba(0, 0, 0, 0.5)', // Usar rgba para mejor control de opacidad
    spinnerColor: config?.spinnerColor || 'border-primary',
    spinnerImage: config?.spinnerImage || '/images/spinner.gif', // Usar ruta fija por defecto
    size: config?.size || 'h-16 w-16',
    textColor: config?.textColor || 'text-white',
    text: config?.text || translations.common.loading,
    enabled: config?.enabled !== false, // Default to true
    overlay: config?.overlay !== false // Default to true
  };
  
  // Funciones para convertir clases Tailwind a valores CSS
  
  // Convertir clase de tamaño a dimensiones específicas
  const getSizeStyle = () => {
    // Si ya es un valor numérico con unidades, usarlo directamente
    if (typeof spinnerConfig.size === 'string' && 
        (spinnerConfig.size.endsWith('px') || 
         spinnerConfig.size.endsWith('rem') || 
         spinnerConfig.size.endsWith('%') || 
         spinnerConfig.size.endsWith('vh') || 
         spinnerConfig.size.endsWith('vw'))) {
      return {
        width: spinnerConfig.size,
        height: spinnerConfig.size
      };
    }
    
    // Convertir clases Tailwind comunes a valores específicos
    if (spinnerConfig.size.includes('h-16') || spinnerConfig.size.includes('w-16')) {
      return {
        width: '4rem',
        height: '4rem'
      };
    } else if (spinnerConfig.size.includes('h-12') || spinnerConfig.size.includes('w-12')) {
      return {
        width: '3rem',
        height: '3rem'
      };
    } else if (spinnerConfig.size.includes('h-20') || spinnerConfig.size.includes('w-20')) {
      return {
        width: '5rem',
        height: '5rem'
      };
    } else if (spinnerConfig.size.includes('h-24') || spinnerConfig.size.includes('w-24')) {
      return {
        width: '6rem',
        height: '6rem'
      };
    }
    
    // Valor por defecto
    return {
      width: '4rem',
      height: '4rem'
    };
  };
  
  // Convertir la clase de Tailwind a un estilo CSS para el fondo
  const getBackgroundStyle = () => {
    // Si ya es un valor CSS (rgba, hex, etc.), usarlo directamente
    if (spinnerConfig.backgroundColor.startsWith('rgba') || 
        spinnerConfig.backgroundColor.startsWith('rgb') ||
        spinnerConfig.backgroundColor.startsWith('#')) {
      return spinnerConfig.backgroundColor;
    }
    
    // Para clases Tailwind, convertir a valores aproximados
    if (spinnerConfig.backgroundColor.includes('bg-black')) {
      // Extraer el valor de opacidad si existe
      const opacityMatch = spinnerConfig.backgroundColor.match(/bg-opacity-(\d+)/);
      const opacity = opacityMatch ? parseInt(opacityMatch[1], 10) / 100 : 0.5;
      return `rgba(0, 0, 0, ${opacity})`;
    } else if (spinnerConfig.backgroundColor.includes('bg-white')) {
      const opacityMatch = spinnerConfig.backgroundColor.match(/bg-opacity-(\d+)/);
      const opacity = opacityMatch ? parseInt(opacityMatch[1], 10) / 100 : 0.5;
      return `rgba(255, 255, 255, ${opacity})`;
    }
    
    // Valor por defecto
    return 'rgba(0, 0, 0, 0.5)';
  };
  
  // Convertir la clase de Tailwind a un color CSS para el texto
  const getTextColorStyle = () => {
    // Si ya es un valor CSS, usarlo directamente
    if (spinnerConfig.textColor.startsWith('rgba') || 
        spinnerConfig.textColor.startsWith('rgb') ||
        spinnerConfig.textColor.startsWith('#')) {
      return spinnerConfig.textColor;
    }
    
    // Para clases Tailwind comunes
    if (spinnerConfig.textColor.includes('text-white')) {
      return 'white';
    } else if (spinnerConfig.textColor.includes('text-black')) {
      return 'black';
    } else if (spinnerConfig.textColor.includes('text-primary')) {
      return 'var(--primary, #3b82f6)'; // Color primario del tema o fallback a azul
    }
    
    // Valor por defecto
    return 'white';
  };
  
  useEffect(() => {
    // Hide spinner when page is fully loaded
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        handlePageLoad();
      } else {
        window.addEventListener('load', handlePageLoad);
        
        // Fallback timeout to prevent spinner from being stuck
        const fallbackTimer = setTimeout(() => {
          console.log('LoadingSpinner: Fallback triggered after 8s');
          setVisible(false);
        }, 8000);
        
        return () => {
          window.removeEventListener('load', handlePageLoad);
          clearTimeout(fallbackTimer);
        };
      }
    }
    
    // If spinner is disabled in config, hide it immediately
    if (!spinnerConfig.enabled) {
      setVisible(false);
    }
  }, [spinnerConfig.enabled]);
  
  // Handle page load event
  const handlePageLoad = () => {
    console.log('LoadingSpinner: Page fully loaded');
    setVisible(false);
  };
  
  // Don't render if spinner is disabled or not visible
  if (!spinnerConfig.enabled || !visible) {
    return null;
  }
  
  return (
    <div 
      id="loading-spinner" 
      className={`fixed inset-0 flex flex-col items-center justify-center z-50`}
      style={{
        backgroundColor: getBackgroundStyle()
      }}
      role="status"
      aria-live="polite"
    >
      {/* Custom spinner image or default animated spinner */}
      {spinnerConfig.spinnerImage ? (
        <div>
          <Image 
            src={spinnerConfig.spinnerImage}
            alt={spinnerConfig.text}
            width={100}
            height={100}
            style={getSizeStyle()}
            unoptimized // For GIFs to animate
          />
        </div>
      ) : (
        <div 
          className="animate-spin rounded-full border-t-2 border-b-2"
          style={{
            ...getSizeStyle(),
            borderColor: spinnerConfig.spinnerColor.includes('border-primary') 
              ? 'var(--primary, #3b82f6)' 
              : (spinnerConfig.spinnerColor.replace('border-', '') || 'currentColor')
          }}
        ></div>
      )}
      
      {/* Loading text */}
      <div 
        className="mt-4 font-medium"
        style={{
          color: getTextColorStyle()
        }}
      >
        {spinnerConfig.text}
      </div>
    </div>
  );
}
