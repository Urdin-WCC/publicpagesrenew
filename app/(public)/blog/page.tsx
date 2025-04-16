import React, { Suspense } from 'react';
import { translations } from '@/app/translations';
import BlogListClient from './BlogListClient'; // Importar el nuevo componente cliente
import LoadingSpinner from '@/components/core/LoadingSpinner'; // Para el Suspense
import BlogSidebar from '@/components/public/BlogSidebar'; // Importar la barra lateral
import { getBlogConfig } from '@/lib/config-server'; // Importar función para obtener la configuración
import { getGlobalConfig } from '@/lib/config'; // Importar función para obtener la configuración global

// La página ahora es un Server Component que obtiene la configuración y renderiza el layout adecuado
export default async function BlogIndexPage() {
  // Obtener la configuración del blog y la configuración global
  const [blogConfig, globalConfig] = await Promise.all([
    getBlogConfig(),
    getGlobalConfig()
  ]);

  // Obtener la configuración de la barra lateral
  const sidebarConfig = globalConfig?.sidebar as { position?: 'left' | 'right', width?: string } || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{translations.public.blogPublic}</h1>

      <div className={`flex flex-col lg:flex-row gap-8 ${sidebarConfig.position === 'right' ? '' : 'lg:flex-row-reverse'}`}>
        {/* Contenido principal */}
        <div className="w-full lg:flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <BlogListClient />
          </Suspense>
        </div>

        {/* Barra lateral (condicional) */}
        {blogConfig.showSidebarInList && (
          <div
            className="w-full"
            style={{ width: '100%', maxWidth: sidebarConfig.width || '320px' }}
          >
            <Suspense fallback={<div className="w-full animate-pulse bg-gray-100 h-64"></div>}>
              <BlogSidebar />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}