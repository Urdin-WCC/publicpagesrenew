"use client";

import { useState, useEffect } from "react";
import { t, createTranslator, getLanguage, setLanguage, TranslationOptions } from "@/lib/translations";

/**
 * Hook for using translations in client components
 * 
 * This hook provides functions for translating strings and changing the language.
 * 
 * @returns An object with translation functions and language utilities
 * 
 * @example
 * ```tsx
 * const { t, tGroup, language, changeLanguage } = useTranslation();
 * 
 * // Use t function
 * const saveText = t('common', 'save');
 * 
 * // Use tGroup function
 * const tCommon = tGroup('common');
 * const cancelText = tCommon('cancel');
 * 
 * // Change language
 * const handleLanguageChange = () => {
 *   changeLanguage('en');
 * };
 * ```
 * 
 * @public
 */
export function useTranslation() {
  const [language, setCurrentLanguage] = useState(getLanguage());

  /**
   * Change the current language
   * 
   * @param newLanguage - The new language code
   */
  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
  };

  /**
   * Translate a string
   * 
   * @param group - The translation group
   * @param key - The translation key
   * @param options - Translation options
   * @returns The translated string
   */
  const translate = (group: string, key: string, options?: TranslationOptions) => {
    return t(group, key, options);
  };

  /**
   * Create a translator for a specific group
   * 
   * @param group - The translation group
   * @returns A function that translates strings from the specified group
   */
  const translateGroup = (group: string) => {
    return createTranslator(group);
  };

  return {
    t: translate,
    tGroup: translateGroup,
    language,
    changeLanguage,
  };
}

export default useTranslation;
