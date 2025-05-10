"use client";

/**
 * Translation cache to avoid fetching translations on every request
 */
let translationsCache: Record<string, Record<string, Record<string, string>>> = {};
let currentLanguage = 'es'; // Default language

/**
 * Interface for translation options
 */
export interface TranslationOptions {
  /**
   * Parameters to replace in the translation string
   * For example, if the translation is "Hello, {0}", and params is ["World"],
   * the result will be "Hello, World"
   */
  params?: (string | number)[];
}

/**
 * Load translations for a specific language
 * 
 * @param language - The language code (e.g., 'es', 'en')
 * @returns A promise that resolves to the translations
 */
export async function loadTranslations(language: string = 'es'): Promise<Record<string, Record<string, string>>> {
  // If translations are already cached, return them
  if (translationsCache[language]) {
    return translationsCache[language];
  }

  try {
    // Fetch the translations from the public directory
    const response = await fetch(`/translations/${language}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${language}`);
    }
    
    const translations = await response.json();
    
    // Cache the translations
    translationsCache[language] = translations;
    return translations;
  } catch (error) {
    console.error(`Error loading translations for language ${language}:`, error);
    
    // If we can't load the requested language, try to load Spanish as fallback
    if (language !== 'es') {
      console.warn(`Falling back to Spanish translations`);
      return loadTranslations('es');
    }
    
    // If we can't even load Spanish, return an empty object
    return {};
  }
}

/**
 * Set the current language
 * 
 * @param language - The language code (e.g., 'es', 'en')
 */
export async function setLanguage(language: string): Promise<void> {
  currentLanguage = language;
  // Load translations for the new language if they're not already cached
  if (!translationsCache[language]) {
    await loadTranslations(language);
  }
}

/**
 * Get the current language
 * 
 * @returns The current language code
 */
export function getLanguage(): string {
  return currentLanguage;
}

/**
 * Get a translation by key
 * 
 * @param group - The translation group (e.g., 'common', 'auth')
 * @param key - The translation key
 * @param options - Translation options (e.g., parameters to replace)
 * @returns The translated string, or the key if the translation is not found
 * 
 * @example
 * ```ts
 * // Get a simple translation
 * const text = await t('common', 'save'); // "Guardar"
 * 
 * // Get a translation with parameters
 * const text = await t('admin', 'welcome', { params: ['John'] }); // "Bienvenido, John"
 * ```
 */
export async function t(group: string, key: string, options?: TranslationOptions): Promise<string> {
  // Load translations if they're not already cached
  if (!translationsCache[currentLanguage]) {
    await loadTranslations(currentLanguage);
  }

  // Get the translation
  const groupTranslations = translationsCache[currentLanguage]?.[group] || {};
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
 * Create a translator for a specific group
 * 
 * @param group - The translation group (e.g., 'common', 'auth')
 * @returns A function that gets translations from the specified group
 * 
 * @example
 * ```ts
 * const tCommon = createTranslator('common');
 * const text = await tCommon('save'); // "Guardar"
 * ```
 */
export function createTranslator(group: string) {
  return (key: string, options?: TranslationOptions) => t(group, key, options);
}

// Initialize translations
loadTranslations();
