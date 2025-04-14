"use client";

import { useState, useEffect } from 'react';
import { t } from '@/app/translations';

// Placeholder: Este componente necesitará lógica más compleja para
// interactuar con cookies o un contexto para persistir y aplicar el tema.
// Por ahora, solo simula el cambio visual.

export default function ThemeSwitcher() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Efecto para aplicar la clase al montar (simulado)
  useEffect(() => {
    // TODO: Leer preferencia de tema (e.g., de cookie)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark); // Inicializar basado en preferencia del sistema (ejemplo)
  }, []);

  // Aplicar clase al cambiar estado
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // TODO: Guardar preferencia (e.g., en cookie)
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg"
      // Usar traducciones sin default
      aria-label={isDarkMode ? t('theme', 'switchToLight') : t('theme', 'switchToDark')}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
}