"use client";

import { useState } from "react";
import useTranslation from "@/lib/hooks/useTranslation";

/**
 * Example component showing how to use the useTranslation hook
 * 
 * This component demonstrates how to use the useTranslation hook
 * to translate strings and change the language.
 * 
 * @returns The example component
 */
export default function TranslationHookExample() {
  const { t, tGroup, language, changeLanguage } = useTranslation();
  
  // Create group-specific translators
  const tCommon = tGroup("common");
  const tAdmin = tGroup("admin");
  
  // Example of a dynamic parameter
  const [userName, setUserName] = useState("Usuario");
  
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-4">Ejemplo del Hook useTranslation</h2>
      
      <div className="space-y-2">
        <p>
          <strong>Idioma actual:</strong> {language}
        </p>
        
        <p>
          <strong>Traducciones:</strong>
        </p>
        <ul className="list-disc pl-5">
          <li>common.loading: {tCommon("loading")}</li>
          <li>common.save: {tCommon("save")}</li>
          <li>admin.welcome con parámetro: {tAdmin("welcome", { params: [userName] })}</li>
        </ul>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cambiar nombre de usuario:
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md w-full max-w-xs"
          />
        </div>
        
        {/* This would be used in a real multilanguage app */}
        {/*
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cambiar idioma:
          </label>
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md w-full max-w-xs"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
        */}
      </div>
      
      <div className="mt-6 p-3 bg-gray-100 rounded">
        <p className="text-sm">
          <strong>Nota:</strong> El hook useTranslation facilita el uso de traducciones en componentes
          del lado del cliente y permite cambiar el idioma dinámicamente.
        </p>
      </div>
    </div>
  );
}
