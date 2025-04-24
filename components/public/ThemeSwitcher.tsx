"use client";

import { useState, useEffect } from 'react';
import { translations } from '@/app/translations';

type ThemeSwitcherPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type ThemeSwitcherStyle = 'icon-only' | 'icon-text';

export interface ThemeSwitcherProps {
  position?: ThemeSwitcherPosition;
  style?: ThemeSwitcherStyle;
}

export default function ThemeSwitcher({ 
  position = 'bottom-right',
  style = 'icon-only' 
}: ThemeSwitcherProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for stored preference first
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
    } else {
      // Otherwise, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply theme
    const applyTheme = () => {
      console.log(`Applying theme: ${isDarkMode ? 'dark' : 'light'}`);
      
      // Apply to HTML element for CSS variables
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Apply to body for global styles
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        document.body.setAttribute('data-theme', 'light');
      }
      
      // Broadcast theme change event for other components
      const themeEvent = new CustomEvent('theme-change', { 
        detail: { theme: isDarkMode ? 'dark' : 'light' } 
      });
      window.dispatchEvent(themeEvent);
      
      // Store preference
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    };
    
    // Apply immediately
    applyTheme();
    
    // Apply again after a short delay to ensure it's applied after any other scripts
    const timeoutId = setTimeout(applyTheme, 100);
    
    // Clean up
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Map position to CSS classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }[position];

  return (
    <button
      onClick={toggleTheme}
      className={`fixed ${positionClasses} p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg flex items-center`}
      aria-label={isDarkMode ? translations.admin.switchToLight : translations.admin.switchToDark}
    >
      {isDarkMode ? '☀️' : '🌙'}
      {style === 'icon-text' && (
        <span className="ml-2 text-sm hidden sm:inline">
          {isDarkMode ? translations.admin.switchToLight : translations.admin.switchToDark}
        </span>
      )}
    </button>
  );
}
