import React, { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getPortfolioConfig } from '@/lib/config-server';
import { getGlobalConfig } from '@/lib/config';
import { getThemeConfigsForRoute, generateCssFromThemeConfigs } from '@/lib/themeUtils';
import { translations } from '@/app/translations';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import PortfolioSidebar from '@/components/public/PortfolioSidebar';
import SearchResultsClient from './SearchResultsClient';

// Parámetros de la página
interface PageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

// Generar metadatos para la página
export function generateMetadata({ searchParams }: PageProps) {
  const searchQuery = searchParams.q || '';

  return {
    title: `Búsqueda: ${searchQuery} - Portfolio`,
    description: `Resultados de búsqueda para "${searchQuery}" en el portfolio`,
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const searchQuery = searchParams.q || '';

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

  // Obtener configuración de la barra lateral
  const globalConfig = await getGlobalConfig();
  // Usar tipo explícito para sidebarConfig para evitar errores de TypeScript
  const sidebarConfig = globalConfig?.sidebar as { 
    position?: 'left' | 'right', 
    width?: string,
    widgets?: any[] 
  } || {
    position: 'right',
    width: '320px',
    widgets: []
  };
  
  // Obtener temas específicos para la ruta de búsqueda de portafolio
  const { lightConfig, darkConfig } = await getThemeConfigsForRoute('/portfolio/search', globalConfig);
  
  // Generar CSS para los temas específicos de la página de búsqueda con un selector específico
  const searchPageThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.portfolio-search-page');

  return (
    <>
      {/* Inyectar CSS para los temas específicos de esta página de búsqueda */}
      {searchPageThemeCSS && (
        <style id="portfolio-search-theme-css" dangerouslySetInnerHTML={{ __html: searchPageThemeCSS }} />
      )}
      
      <div 
        className="portfolio-search-page w-full px-4 py-8"
        style={{
          backgroundColor: 'var(--background-value, white)',
          color: 'var(--typography-paragraph-color, inherit)',
          maxWidth: "100%"
        }}
      >
      <div className="mb-6">
        <Link href="/portfolio" className="text-primary hover:underline">
          ← {translations.public.allProjects}
        </Link>
      </div>

      <h1 
        className="text-3xl font-bold mb-8"
        style={{
          fontFamily: 'var(--typography-heading-fontFamily, inherit)',
          color: 'var(--typography-heading-color, inherit)',
          fontWeight: 'var(--typography-heading-fontWeight, 600)',
          fontSize: 'var(--typography-heading-fontSize, 1.875rem)'
        }}
      >
        {searchQuery
          ? translations.public.searchPortfolioResultsFor.replace('{0}', searchQuery)
          : translations.public.searchPortfolio}
      </h1>

      <div className={`flex flex-col lg:flex-row gap-8 ${sidebarConfig.position === 'right' ? '' : 'lg:flex-row-reverse'}`}>
        {/* Contenido principal */}
        <div className="w-full lg:flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <SearchResultsClient searchQuery={searchQuery} />
          </Suspense>
        </div>

        {/* Barra lateral (condicional) */}
        {portfolioConfig.showSidebarInList && (
          <div
            className="w-full"
            style={{ width: '100%', maxWidth: sidebarConfig.width || '320px' }}
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
