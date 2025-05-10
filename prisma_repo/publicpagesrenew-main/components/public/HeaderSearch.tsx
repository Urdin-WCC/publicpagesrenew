'use client';

import { useState } from 'react';
import GlobalSearch from './GlobalSearch';

export default function HeaderSearch() {
  const [showSearch, setShowSearch] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="p-2 ml-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Buscar en el sitio"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      
      {showSearch && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Búsqueda</h3>
            <button 
              onClick={() => setShowSearch(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Cerrar búsqueda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <GlobalSearch showIcon={false} placeholder="Buscar..." />
        </div>
      )}
    </div>
  );
}
