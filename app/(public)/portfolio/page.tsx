import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ProjectStatus } from '@prisma/client';
import { getPortfolioConfig } from '@/lib/config-server';
import { getGlobalConfig, getSectionWithItems } from '@/lib/config';
import { SectionType } from '@prisma/client';
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

  // Obtener configuración de la barra lateral
  const globalConfig = await getGlobalConfig();
  const sidebarConfig = globalConfig?.sidebar || {
    position: 'right',
    width: '320px',
    widgets: []
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{translations.public.portfolioPublic}</h1>

      <div className={`flex flex-col lg:flex-row gap-8 ${sidebarConfig.position === 'right' ? '' : 'lg:flex-row-reverse'}`}>
        {/* Contenido principal */}
        <div className="w-full lg:flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <PortfolioListClient />
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
