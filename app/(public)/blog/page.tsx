import React, { Suspense } from 'react';
import { translations } from '@/app/translations';
import BlogListClient from './BlogListClient';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import CategoryDropdown from './CategoryDropdown';
import BlogSearchForm from './BlogSearchForm';
import { getBlogConfig } from '@/lib/config-server';
import { getGlobalConfig } from '@/lib/config';
import ThemeStyleManager from '@/components/ThemeStyleManager';

// La página ahora es un Server Component que obtiene la configuración y renderiza el layout adecuado
export default async function BlogIndexPage() {
  // Obtener la configuración del blog y la configuración global
  const [blogConfig, globalConfig] = await Promise.all([
    getBlogConfig(),
    getGlobalConfig()
  ]);

  // Obtener la configuración de la barra lateral
  const sidebarConfig = globalConfig?.sidebar as { position?: 'left' | 'right', width?: string } || {};
  
  // Los estilos de tema ahora se manejan con el componente ThemeStyleManager

  return (
    <>
      {/* Gestor de tema para la página del blog */}
      <ThemeStyleManager
        pathname="/blog"
        globalConfig={globalConfig}
        selector=".blog-page"
      />
      
      <div 
        className="blog-page w-full h-full"
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
            <BlogSearchForm />
          </div>
          
          <div className="sm:flex items-center gap-4">
            <div className="sm:w-64 mb-4 sm:mb-0">
              <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded" />}>
                <CategoryDropdown />
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
              <BlogListClient 
                displayMode={blogConfig.listDisplayMode as 'grid' | 'list'} 
                postsPerPage={blogConfig.postsPerPage}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
