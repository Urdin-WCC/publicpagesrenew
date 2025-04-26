import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getPortfolioConfig } from '@/lib/config-server';
import { getGlobalConfig } from '@/lib/config';
import { translations } from '@/app/translations';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import PortfolioSidebar from '@/components/public/PortfolioSidebar';
import CategoryProjectsClient from './CategoryProjectsClient';

// Parámetros de la página
interface PageProps {
  params: {
    slug: string;
  };
}

// Generar metadatos para la página
export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;

  const category = await prisma.projectCategory.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
    },
  });

  if (!category) {
    return {
      title: 'Categoría no encontrada',
      description: 'La categoría que buscas no existe.',
    };
  }

  return {
    title: `${category.name} - Portfolio`,
    description: category.description || `Proyectos en la categoría ${category.name}`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = params;

  // Verificar si el modelo ProjectCategory existe
  if (!prisma.projectCategory) {
    return (
      <div className="w-full px-4 py-8 text-center" style={{ maxWidth: "100%" }}>
        <h1 className="text-3xl font-bold mb-4">Módulo de Portfolio no disponible</h1>
        <p className="text-gray-600 mb-6">El módulo de Portfolio aún no está configurado en la base de datos.</p>
        <Link href="/" className="text-primary hover:underline">
          Volver a la página principal
        </Link>
      </div>
    );
  }

  // Obtener datos de la categoría
  let category;
  try {
    category = await prisma.projectCategory.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    notFound();
  }

  // Si no existe la categoría, mostrar 404
  if (!category) {
    notFound();
  }

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
    <div className="w-full px-4 py-8" style={{ maxWidth: "100%" }}>
      <div className="mb-6">
        <Link href="/portfolio" className="text-primary hover:underline">
          ← {translations.public.allProjects}
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4">
        {translations.public.projectsInCategory} {category.name}
      </h1>

      {category.description && (
        <div className="mb-8 text-gray-600">{category.description}</div>
      )}

      <div className={`flex flex-col lg:flex-row gap-8 ${sidebarConfig.position === 'right' ? '' : 'lg:flex-row-reverse'}`}>
        {/* Contenido principal */}
        <div className="w-full lg:flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <CategoryProjectsClient categoryId={category.id} />
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
