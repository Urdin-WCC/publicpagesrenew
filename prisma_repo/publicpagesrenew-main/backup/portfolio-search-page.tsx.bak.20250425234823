import React, { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getPortfolioConfig } from '@/lib/config-server';
import { getGlobalConfig } from '@/lib/config';
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
  const sidebarConfig = globalConfig?.sidebar || {
    position: 'right',
    width: '320px',
    widgets: []
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/portfolio" className="text-primary hover:underline">
          ← {translations.public.allProjects}
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">
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
  );
}
