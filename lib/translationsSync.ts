"use client";

import { useState, useEffect } from 'react';
import { loadTranslations, TranslationOptions } from './translations';

// Default translations to use while loading
const defaultTranslations: Record<string, Record<string, string>> = {
  common: {
    loading: "Cargando...",
    error: "Error",
    save: "Guardar",
    cancel: "Cancelar"
  }
};

let translationsLoaded = false;
let translations: Record<string, Record<string, string>> = { ...defaultTranslations };

// Load translations on module initialization
loadTranslations().then(result => {
  translations = result;
  translationsLoaded = true;
}).catch(error => {
  console.error("Failed to load translations:", error);
});

/**
 * Synchronous translation function
 * 
 * @param group - The translation group (e.g., 'common', 'auth')
 * @param key - The translation key
 * @param options - Translation options (e.g., parameters to replace)
 * @returns The translated string, or the key if the translation is not found
 */
export function tSync(group: string, key: string, options?: TranslationOptions): string {
  // Get the translation
  const groupTranslations = translations[group] || {};
  let translation = groupTranslations[key] || `${group}.${key}`;

  // Replace parameters if provided
  if (options?.params) {
    options.params.forEach((param, index) => {
      translation = translation.replace(`{${index}}`, String(param));
    });
  }

  return translation;
}

/**
 * Create a synchronous translator for a specific group
 * 
 * @param group - The translation group (e.g., 'common', 'auth')
 * @returns A function that gets translations from the specified group
 */
export function createTranslatorSync(group: string) {
  return (key: string, options?: TranslationOptions) => tSync(group, key, options);
}

/**
 * React hook for translations
 * 
 * @returns An object with translation functions and loading state
 */
export function useTranslations() {
  const [isLoaded, setIsLoaded] = useState(translationsLoaded);
  
  useEffect(() => {
    if (!translationsLoaded) {
      const checkLoaded = setInterval(() => {
        if (translationsLoaded) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      
      return () => clearInterval(checkLoaded);
    }
  }, []);
  
  return {
    t: tSync,
    createTranslator: createTranslatorSync,
    isLoaded
  };
}

export default useTranslations;
