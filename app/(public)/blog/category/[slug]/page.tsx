import React from 'react';
import { prisma } from '@/lib/prisma';
import { getBlogConfig } from '@/lib/config-server';
import { getGlobalConfig } from '@/lib/config';
import { getThemeConfigsForRoute, generateCssFromThemeConfigs } from '@/lib/themeUtils'; 
import { notFound } from 'next/navigation';
import { translations } from '@/app/translations';
import CategoryPostsClient from './CategoryPostsClient';

interface BlogCategoryPageProps {
  params: { slug: string }; // Slug de la categoría
  searchParams?: {
    page?: string;
  };
}

// Función para obtener datos de la categoría para los metadatos
async function getCategoryData(slug: string) {
    return prisma.category.findUnique({
        where: { slug },
        select: { id: true, name: true }
    });
}

// Generar metadatos dinámicos
export async function generateMetadata({ params }: BlogCategoryPageProps) {
  const category = await getCategoryData(params.slug);

  if (!category) {
    return { title: 'Categoría no encontrada' };
  }

  return {
    title: `${translations.public.postsInCategory} ${category.name}`,
    // description: `...`,
  };
}

export default async function BlogCategoryPage({ params, searchParams }: BlogCategoryPageProps) {
  const { slug } = params;
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const blogConfig = await getBlogConfig();

  // Verificar si la categoría existe
  const category = await getCategoryData(slug);
  if (!category) {
    notFound(); // Mostrar 404 si la categoría no existe
  }
  
  // Obtener configuración global para temas
  const globalConfig = await getGlobalConfig();
  
  // Obtener temas específicos para la ruta de blog/categoría
  const { lightConfig, darkConfig } = await getThemeConfigsForRoute(`/blog/category/${slug}`, globalConfig);
  
  // Generar CSS para los temas específicos de esta página de categoría
  const categoryPageThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, `.blog-category-page-${slug}`);

  return (
    <>
      {/* Inyectar CSS para los temas específicos de esta página de categoría */}
      {categoryPageThemeCSS && (
        <style id={`blog-category-${slug}-theme-css`} dangerouslySetInnerHTML={{ __html: categoryPageThemeCSS }} />
      )}
      
      <div 
        className={`blog-category-page-${slug} w-full`}
        style={{
          backgroundColor: 'var(--background-value, white)',
          color: 'var(--typography-paragraph-color, inherit)'
        }}
      >
        <CategoryPostsClient 
          categorySlug={slug} 
          initialPage={currentPage}
          translations={translations}
          layoutMode={blogConfig.listDisplayMode || 'grid'}
        />
      </div>
    </>
  );
}
