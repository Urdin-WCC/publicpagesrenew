'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface DirectLoadingSpinnerProps {
  globalConfig: any; // Configuración global pasada desde el componente servidor
}

export default function DirectLoadingSpinner({ globalConfig }: DirectLoadingSpinnerProps) {
  const [visible, setVisible] = useState(true);

  // Extraer configuración del spinner de carga
  let spinnerConfig: any = {
    backgroundColor: 'bg-black bg-opacity-50',
    spinnerColor: 'border-primary',
    spinnerImage: '',
    size: 'h-16 w-16',
    textColor: 'text-white',
    text: 'Cargando...',
    enabled: true,
    overlay: true
  };

  // Intentar parsear la configuración JSON del spinner si existe en globalConfig
  if (globalConfig?.loadingSpinnerConfig) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.loadingSpinnerConfig === 'object') {
        spinnerConfig = { ...spinnerConfig, ...globalConfig.loadingSpinnerConfig };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.loadingSpinnerConfig === 'string') {
        const parsedConfig = JSON.parse(globalConfig.loadingSpinnerConfig);
        spinnerConfig = { ...spinnerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing loading spinner config:', error);
    }
  }

  useEffect(() => {
    // Ocultar spinner cuando la página esté cargada
    const handlePageLoad = () => {
      console.log('DirectLoadingSpinner: Page fully loaded');
      setVisible(false);
    };

    // Si la página ya está cargada, ocultar el spinner
    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
      
      // Fallback de seguridad para asegurar que el spinner desaparezca
      const fallbackTimer = setTimeout(() => {
        console.log('DirectLoadingSpinner: Fallback timer triggered');
        setVisible(false);
      }, 8000);
      
      return () => {
        window.removeEventListener('load', handlePageLoad);
        clearTimeout(fallbackTimer);
      };
    }
    
    // Si el spinner está deshabilitado, ocultarlo inmediatamente
    if (spinnerConfig.enabled === false) {
      setVisible(false);
    }
  }, [spinnerConfig.enabled]);

  // No mostrar si está deshabilitado o ya no es visible
  if (!spinnerConfig.enabled || !visible) {
    return null;
  }

  return (
    <div 
      id="loading-spinner" 
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      role="status"
      aria-live="polite"
      data-component="loading-spinner"
      data-visible="true"
      style={{
        backgroundColor: (spinnerConfig.overlayColor ||
                          spinnerConfig.backgroundColor ||
                          "rgba(0,0,0,0.5)")
      }}
    >
      {/* Spinner personalizado o el predeterminado */}
      {spinnerConfig.spinnerImage ? (
        <div>
          <Image 
            src={spinnerConfig.spinnerImage}
            alt={spinnerConfig.text}
            width={100}
            height={100}
            className={spinnerConfig.size}
            unoptimized // Necesario para GIFs animados
          />
        </div>
      ) : (
        <div className={`animate-spin rounded-full ${spinnerConfig.size} border-t-2 border-b-2 ${spinnerConfig.spinnerColor}`}></div>
      )}
      
      {/* Texto de carga */}
      <div className={`mt-4 font-medium ${spinnerConfig.textColor}`}>{spinnerConfig.text}</div>
      
      {/* Panel de depuración */}
      <div className="absolute bottom-4 left-4 text-xs bg-white bg-opacity-80 text-black p-2 rounded border border-purple-500">
        <p className="font-bold">Loading Spinner Configuration:</p>
        <ul className="list-disc list-inside">
          <li>Background: {spinnerConfig.backgroundColor}</li>
          <li>Spinner Color: {spinnerConfig.spinnerColor}</li>
          <li>Custom Image: {spinnerConfig.spinnerImage ? 'Yes' : 'No'}</li>
          <li>Auto-hide: {spinnerConfig.enabled ? 'Yes (on page load)' : 'No'}</li>
        </ul>
      </div>
    </div>
  );
}
