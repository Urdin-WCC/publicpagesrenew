"use client";

import { useState } from 'react';
import { t, createTranslator } from '@/app/translations';

export default function TranslationDemo() {
  const [name, setName] = useState('Usuario');

  // Create a translator for the common group
  const tCommon = createTranslator('common');

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-4">Ejemplos de Traducciones</h2>

      <div className="space-y-2">
        <p>
          <strong>Método 1 - Usando la función t directamente:</strong>
        </p>
        <ul className="list-disc pl-5">
          <li>common.save: {t('common', 'save')}</li>
          <li>admin.welcome con parámetro: {t('admin', 'welcome', { params: [name] })}</li>
        </ul>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cambiar nombre:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md w-full max-w-xs"
          />
        </div>

        <p className="mt-4">
          <strong>Método 2 - Usando un traductor específico para un grupo:</strong>
        </p>
        <ul className="list-disc pl-5">
          <li>common.loading: {tCommon('loading')}</li>
          <li>common.error: {tCommon('error')}</li>
          <li>common.success: {tCommon('success')}</li>
        </ul>
      </div>

      <div className="mt-6 p-3 bg-gray-100 rounded">
        <p className="text-sm">
          <strong>Nota:</strong> Este sistema de traducciones facilita la internacionalización futura
          de la aplicación. Todos los textos fijos de la interfaz están centralizados en un archivo.
        </p>
      </div>
    </div>
  );
}
