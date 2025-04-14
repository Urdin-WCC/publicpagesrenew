import fs from 'fs';
import path from 'path';

/**
 * Translation cache to avoid reading the JSON file on every request
 */
let translationsCache: Record<string, Record<string, Record<string, string>>> = {};
let currentLanguage = 'es'; // Default language

/**
 * Interface for translation options
 *
 * @public
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
 * Load translations from a JSON file
 *
 * @param language - The language code (e.g., 'es', 'en')
 * @returns A record of translation groups, keys and values
 *
 * @example
 * ```ts
 * const translations = loadTranslations('es');
 * // Returns { common: { loading: 'Cargando...' }, auth: { login: 'Iniciar sesión' } }
 * ```
 *
 * @public
 */
export function loadTranslations(language: string = 'es'): Record<string, Record<string, string>> {
  // If translations are already cached, return them
  if (translationsCache[language]) {
    return translationsCache[language];
  }

  try {
    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'lib', 'translations', `${language}.json`);
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');

    // Parse the JSON
    const translations = JSON.parse(jsonContent);

    // Cache the translations
    translationsCache[language] = translations;
    return translations;
  } catch (error) {
    console.error(`Error loading translations for language ${language}:`, error);
    return {};
  }
}

/**
 * Set the current language
 *
 * @param language - The language code (e.g., 'es', 'en')
 *
 * @example
 * ```ts
 * setLanguage('en');
 * ```
 *
 * @public
 */
export function setLanguage(language: string): void {
  currentLanguage = language;
  // Load translations for the new language if they're not already cached
  if (!translationsCache[language]) {
    loadTranslations(language);
  }
}

/**
 * Get the current language
 *
 * @returns The current language code
 *
 * @example
 * ```ts
 * const language = getLanguage(); // 'es'
 * ```
 *
 * @public
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
 * const text = t('common', 'save'); // "Guardar"
 *
 * // Get a translation with parameters
 * const text = t('admin', 'welcome', { params: ['John'] }); // "Bienvenido, John"
 * ```
 *
 * @public
 */
export function t(group: string, key: string, options?: TranslationOptions): string {
  // Load translations if they're not already cached
  if (!translationsCache[currentLanguage]) {
    loadTranslations(currentLanguage);
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
 * Create a translation function for a specific group
 *
 * @param group - The translation group (e.g., 'common', 'auth')
 * @returns A function that gets translations from the specified group
 *
 * @example
 * ```ts
 * const tCommon = createTranslator('common');
 * const text = tCommon('save'); // "Guardar"
 * ```
 *
 * @public
 */
export function createTranslator(group: string) {
  return (key: string, options?: TranslationOptions) => t(group, key, options);
}

// Initialize translations
loadTranslations();
