'use server';

import React from 'react';
import { ReactNode } from "react";
import { getSectionWithItems } from "@/lib/config";
import { SectionType } from "@prisma/client";
import { getGlobalConfig } from "@/lib/config-server";

// Importar los componentes con acceso directo a la base de datos
import DirectHeader from "@/components/public/DirectHeader";
import DirectFooter from "@/components/public/DirectFooter";
import DirectSidebar from "@/components/public/DirectSidebar";
import { LoadingSpinnerContainer } from "@/components/core/LoadingSpinnerContainer";

interface DirectTestLayoutProps {
  children: ReactNode;
}

export default async function DirectTestLayout({ children }: DirectTestLayoutProps) {
  console.log("Rendering Direct Test Layout...");
  
  // Obtener configuración global (mismo que en componentes individuales, pero aquí es para logging)
  const globalConfig = await getGlobalConfig();
  console.log('Global config loaded in direct test layout:', !!globalConfig);

  // Fetch sections data for header, footer
  const [headerSection, footerSection] = await Promise.all([
    getSectionWithItems(SectionType.HEADER),
    getSectionWithItems(SectionType.FOOTER),
  ]);
  
  console.log('Sections loaded:', {
    header: !!headerSection,
    footer: !!footerSection,
  });

  // Extraer opciones del sidebar desde globalConfig
  let sidebarConfig: any = {
    position: 'right',
    visible: true,
  };

  // Intentar parsear la configuración JSON del sidebar si existe
  if (globalConfig?.sidebar) {
    try {
      if (typeof globalConfig.sidebar === 'object') {
        sidebarConfig = { ...sidebarConfig, ...globalConfig.sidebar };
      } else if (typeof globalConfig.sidebar === 'string') {
        const parsedConfig = JSON.parse(globalConfig.sidebar);
        sidebarConfig = { ...sidebarConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing sidebar config:', error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Componente de spinner controlado por servidor */}
      <LoadingSpinnerContainer />
      
      {/* Header con acceso directo a base de datos */}
      <DirectHeader 
        menuItems={headerSection?.menuItems || []}
        pathname="/direct-test"
      />
      
      {/* Contenido principal con soporte para sidebar */}
      <div className="flex flex-1">
        {/* Sidebar izquierdo (condicional) */}
        {sidebarConfig.position === 'left' && sidebarConfig.visible !== false && (
          <DirectSidebar 
            position="left"
            className="hidden md:block"
            pathname="/direct-test"
          />
        )}
        
        {/* Contenido principal */}
        <main className="flex-grow px-4 py-8">
          <div className="w-full">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-center">Prueba de Componentes con Acceso Directo a Base de Datos</h1>
              <p className="text-center text-gray-500 mt-2">
                Esta página demuestra componentes que acceden directamente a la configuración global
              </p>
            </header>
            
            <div className="p-4 border border-gray-300 rounded-lg bg-white text-black">
              {children}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-xl font-semibold mb-2">¿Cómo funciona esto?</h2>
              <p className="mb-2">
                Cada componente (Header, Footer, Sidebar, LoadingSpinner) obtiene su configuración 
                directamente de la base de datos utilizando <code>getGlobalConfig()</code> de <code>@/lib/config-server</code>.
              </p>
              <p>
                Esto elimina las capas intermedias que podrían transformar incorrectamente los datos 
                o perder información durante el paso de props.
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-auto">
                {`
// Obtener configuración global directamente de la base de datos
const globalConfig = await getGlobalConfig();
                
// Extraer y procesar configuración específica del componente
let componentConfig = { /* valores por defecto */ };
                
// Intentar parsear la configuración JSON si existe
if (globalConfig.componentName) {
  // Procesar la configuración...
}

// Aplicar temas si están asignados
if (globalConfig.themeAssignments) {
  // Obtener y aplicar tema asignado...
}
                `}
              </pre>
            </div>
          </div>
        </main>
        
        {/* Sidebar derecho (condicional) */}
        {sidebarConfig.position === 'right' && sidebarConfig.visible !== false && (
          <DirectSidebar 
            position="right"
            className="hidden md:block"
            pathname="/direct-test"
          />
        )}
      </div>
      
      {/* Footer con acceso directo a base de datos */}
      <DirectFooter 
        widgets={footerSection?.widgets || []}
        pathname="/direct-test"
      />
    </div>
  );
}
