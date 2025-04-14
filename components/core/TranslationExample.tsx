"use client";

import { t, createTranslator } from "@/lib/translations";

/**
 * Example component showing how to use translations
 * 
 * This component demonstrates different ways to use the translation system.
 * 
 * @returns The example component
 */
export default function TranslationExample() {
  // Method 1: Using the t function directly
  const saveText = t("common", "save");
  const welcomeText = t("admin", "welcome", { params: ["Usuario"] });
  
  // Method 2: Creating a translator for a specific group
  const tAuth = createTranslator("auth");
  const loginText = tAuth("login");
  const logoutText = tAuth("logout");
  
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-4">Ejemplos de Traducciones</h2>
      
      <div className="space-y-2">
        <p>
          <strong>Método 1 - Usando la función t directamente:</strong>
        </p>
        <ul className="list-disc pl-5">
          <li>common.save: {saveText}</li>
          <li>admin.welcome con parámetro: {welcomeText}</li>
        </ul>
        
        <p className="mt-4">
          <strong>Método 2 - Usando un traductor específico para un grupo:</strong>
        </p>
        <ul className="list-disc pl-5">
          <li>auth.login: {loginText}</li>
          <li>auth.logout: {logoutText}</li>
        </ul>
      </div>
      
      <div className="mt-6 p-3 bg-gray-100 rounded">
        <p className="text-sm">
          <strong>Nota:</strong> Este sistema de traducciones facilita la internacionalización futura
          de la aplicación. Todos los textos fijos de la interfaz están centralizados en archivos JSON.
        </p>
      </div>
    </div>
  );
}
