 import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { SectionType } from '@/lib/section-client';
import { getPortfolioConfig } from '@/lib/config-server';
import { getGlobalConfig, getSectionWithItems } from '@/lib/config';
import { translations } from '@/app/translations';
import PaginationControls from '@/components/public/PaginationControls';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import PortfolioSearchForm from './PortfolioSearchForm';
import PortfolioCategoryDropdown from './PortfolioCategoryDropdown';
import ThemeStyleManager from '@/components/ThemeStyleManager';

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

  // Los estilos de tema ahora se manejan con el componente ThemeStyleManager

  return (
    <>
      {/* Gestor de tema para la página del portfolio */}
      <ThemeStyleManager
        pathname="/portfolio"
        globalConfig={globalConfig}
        selector=".portfolio-page"
      />
      
      <div 
        className="portfolio-page w-full h-full"
        style={{
          backgroundColor: 'var(--background-value, white)',
          backgroundImage: 'var(--background-image)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'var(--foreground, inherit)',
          padding: 'var(--spacing-padding)',
          margin: 'var(--spacing-margin)',
          maxWidth: "100%",
          minHeight: "100%",
          flex: "1 1 auto"
        }}
      >
        {/* Page title removed as requested */}

        {/* Búsqueda y filtros */}
        <div className="mb-8 space-y-4">
          <div className="w-full">
            <PortfolioSearchForm />
          </div>
          
          <div className="sm:flex items-center gap-4">
            <div className="sm:w-64 mb-4 sm:mb-0">
              <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded" />}>
                <PortfolioCategoryDropdown />
              </Suspense>
            </div>
          </div>
        </div>
        
        <div className="w-full min-h-[calc(100vh-16rem)]">
          {/* Contenido principal */}
          <div 
            className="w-full"
            style={{
              fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
              fontSize: 'var(--typography-paragraph-fontSize, inherit)'
            }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <PortfolioListClient 
                displayMode={portfolioConfig.layoutMode as 'grid' | 'list'} 
                projectsPerPage={portfolioConfig.projectsPerPage}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
