import React from 'react';
import Link from 'next/link';

export default function DirectTestPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Componentes con Acceso Directo a Base de Datos</h2>
      
      <p>
        Esta página utiliza componentes que acceden directamente a la base de datos para obtener
        su configuración, en lugar de recibirla a través de props desde el layout.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-xl mb-2">Ventajas</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Acceso directo a datos sin transformaciones intermedias</li>
            <li>Cada componente es autónomo y responsable de su propia configuración</li>
            <li>Menos props que pasar entre componentes</li>
            <li>Más fácil de depurar con paneles informativos dedicados</li>
            <li>Aplicación consistente de temas desde la fuente original</li>
          </ul>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-xl mb-2">Detalles Técnicos</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Cada componente es un <code>Server Component</code></li>
            <li>Utilizan <code>getGlobalConfig</code> de <code>lib/config-server</code></li>
            <li>Procesan automáticamente campos JSON</li>
            <li>Compatibles con múltiples formatos de configuración</li>
            <li>Incluyen valores por defecto para mayor robustez</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
        <h3 className="font-semibold text-lg mb-2">Componentes Implementados</h3>
        <ul className="list-disc pl-5">
          <li><strong>DirectHeader</strong>: Header con soporte completo para temas y configuración</li>
          <li><strong>DirectFooter</strong>: Footer con widgets y tema personalizado</li>
          <li><strong>DirectSidebar</strong>: Barra lateral con posicionamiento configurable</li>
          <li><strong>DirectLoadingSpinner</strong>: Spinner de carga con soporte para imágenes personalizadas</li>
        </ul>
      </div>
      
      <div className="flex justify-center mt-8">
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors">
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
