'use client';

import { useState, useEffect } from 'react';

interface ThemeSwitcherProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'inline';
  style?: 'icon-only' | 'icon-text' | 'text-only';
}

export default function ThemeSwitcherClient({ 
  position = 'bottom-right',
  style = 'icon-only'
}: ThemeSwitcherProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Detectar modo oscuro en la carga inicial
  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);
  
  // No renderizar nada durante el montaje para evitar hidratación incorrecta
  if (!mounted) {
    return null;
  }
  
  // Cambiar el tema
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };
  
  // Clases de posición
  let positionClasses = '';
  if (position !== 'inline') {
    positionClasses = `fixed ${position.includes('bottom') ? 'bottom-4' : 'top-4'} ${position.includes('right') ? 'right-4' : 'left-4'} z-50`;
  } else {
    positionClasses = 'relative';
  }
  
  // Renderizar el interruptor de tema
  return (
    <button
      onClick={toggleTheme}
      className={`${positionClasses} p-2 bg-gray-200 dark:bg-gray-800 rounded-full transition-colors`}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {style === 'icon-only' && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isDark ? (
            // Icono de sol para modo oscuro
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          ) : (
            // Icono de luna para modo claro
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          )}
        </svg>
      )}
      
      {style === 'icon-text' && (
        <div className="flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isDark ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            )}
          </svg>
          <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
        </div>
      )}
      
      {style === 'text-only' && (
        <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
      )}
    </button>
  );
}
