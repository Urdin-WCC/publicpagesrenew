import React, { Suspense } from 'react';
import { translations } from '@/app/translations';
import BlogListClient from './BlogListClient';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import BlogSidebar from '@/components/public/BlogSidebar';
import { getBlogConfig } from '@/lib/config-server';
import { getGlobalConfig } from '@/lib/config';
import { getThemeConfigsForRoute, generateCssFromThemeConfigs } from '@/lib/themeUtils';

// La página ahora es un Server Component que obtiene la configuración y renderiza el layout adecuado
export default async function BlogIndexPage() {
  // Obtener la configuración del blog y la configuración global
  const [blogConfig, globalConfig] = await Promise.all([
    getBlogConfig(),
    getGlobalConfig()
  ]);

  // Obtener la configuración de la barra lateral
  const sidebarConfig = globalConfig?.sidebar as { position?: 'left' | 'right', width?: string } || {};
  
  // Obtener temas específicos para la ruta de blog
  const { lightConfig, darkConfig } = await getThemeConfigsForRoute('/blog', globalConfig);
  
  // Generar CSS para los temas específicos del blog
  const blogThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.blog-page');

  return (
    <>
      {/* Inyectar CSS para los temas específicos del blog */}
      {blogThemeCSS && (
        <style id="blog-theme-css" dangerouslySetInnerHTML={{ __html: blogThemeCSS }} />
      )}
      
      <div 
        className="blog-page w-full px-4 py-8"
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
        >{translations.public.blogPublic}</h1>

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
              <BlogListClient />
            </Suspense>
          </div>

          {/* Barra lateral (condicional) */}
          {blogConfig.showSidebarInList && (
            <div
              className="w-full"
              style={{ 
                width: '100%', 
                maxWidth: sidebarConfig.width || '320px',
                fontFamily: 'var(--typography-paragraph-fontFamily, inherit)'
              }}
            >
              <Suspense fallback={<div className="w-full animate-pulse bg-gray-100 h-64"></div>}>
                <BlogSidebar />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
