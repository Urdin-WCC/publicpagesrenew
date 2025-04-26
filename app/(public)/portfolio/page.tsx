import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { SectionType } from '@prisma/client';
import { getPortfolioConfig } from '@/lib/config-server';
import { getGlobalConfig, getSectionWithItems } from '@/lib/config';
import { getThemeConfigsForRoute, generateCssFromThemeConfigs } from '@/lib/themeUtils';
import { translations } from '@/app/translations';
import PaginationControls from '@/components/public/PaginationControls';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import PortfolioSidebar from '@/components/public/PortfolioSidebar';

// Componente cliente para la lista de proyectos
import PortfolioListClient from './PortfolioListClient';

// Parámetros de la página
interface PageProps {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
  };
}

export default async function PortfolioPage({ searchParams }: PageProps) {
  // Obtener configuración del portfolio
  let portfolioConfig;
  try {
    portfolioConfig = await getPortfolioConfig();
  } catch (error) {
    console.error('Error fetching portfolio config:', error);
    portfolioConfig = {
      projectsPerPage: 12,
      defaultDisplayType: 'GALLERY',
      showSidebarInList: true,
      showSidebarInProject: true,
      layoutMode: 'grid',
    };
  }

  // Obtener configuración global y de la barra lateral
  const globalConfig = await getGlobalConfig();
  const sidebarConfig = globalConfig?.sidebar as { 
    position?: 'left' | 'right', 
    width?: string,
    widgets?: any[] 
  } || {
    position: 'right',
    width: '320px',
    widgets: []
  };

  // Obtener temas específicos para la ruta de portfolio
  const { lightConfig, darkConfig } = await getThemeConfigsForRoute('/portfolio', globalConfig);
  
  // Generar CSS para los temas específicos de portfolio
  const portfolioThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.portfolio-page');

  return (
    <>
      {/* Inyectar CSS para los temas específicos de portfolio */}
      {portfolioThemeCSS && (
        <style id="portfolio-theme-css" dangerouslySetInnerHTML={{ __html: portfolioThemeCSS }} />
      )}
      
      <div 
        className="portfolio-page w-full px-4 py-8"
        style={{
          backgroundColor: 'var(--background-value, white)',
          color: 'var(--typography-paragraph-color, inherit)',
          maxWidth: "100%"
        }}
      >
        <h1 
          className="text-3xl font-bold mb-8"
          style={{
            fontFamily: 'var(--typography-heading-fontFamily, inherit)',
            color: 'var(--typography-heading-color, inherit)',
            fontWeight: 'var(--typography-heading-fontWeight, 600)',
            fontSize: 'var(--typography-heading-fontSize, 1.875rem)'
          }}
        >
          {translations.public.portfolioPublic}
        </h1>

        <div className={`flex flex-col lg:flex-row gap-8 ${sidebarConfig.position === 'right' ? '' : 'lg:flex-row-reverse'}`}>
          {/* Contenido principal */}
          <div 
            className="w-full lg:flex-1"
            style={{
              fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
              fontSize: 'var(--typography-paragraph-fontSize, inherit)'
            }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <PortfolioListClient />
            </Suspense>
          </div>

          {/* Barra lateral (condicional) */}
          {portfolioConfig.showSidebarInList && (
            <div
              className="w-full"
              style={{ 
                width: '100%', 
                maxWidth: sidebarConfig.width || '320px',
                fontFamily: 'var(--typography-paragraph-fontFamily, inherit)'
              }}
            >
              <Suspense fallback={<div className="w-full animate-pulse bg-gray-100 h-64"></div>}>
                <PortfolioSidebar />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
