import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getPortfolioConfig } from '@/lib/config-server';
import { getGlobalConfig } from '@/lib/config';
import { translations } from '@/app/translations';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import PortfolioSidebar from '@/components/public/PortfolioSidebar';
import ProjectGallery from '@/components/public/ProjectGallery';

// Parámetros de la página
interface PageProps {
  params: {
    slug: string;
  };
}

// Generar metadatos para la página
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;

  let project;
  try {
    const result = await prisma.$queryRaw`
      SELECT title, excerpt 
      FROM Project 
      WHERE slug = ${slug} 
        AND status = 'PUBLISHED' 
        AND deleted = false
    `;
    project = Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching project metadata:', error);
    return {
      title: 'Error',
      description: 'Error al cargar el proyecto',
    };
  }

  if (!project) {
    return {
      title: 'Proyecto no encontrado',
      description: 'El proyecto que buscas no existe o ha sido eliminado.',
    };
  }

  return {
    title: project.title,
    description: project.excerpt || `Detalles del proyecto ${project.title}`,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;

  // Skip the old model check since we're using raw SQL queries
  if (false) { // Always skip this condition
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

  // Obtener datos del proyecto
  let project;
  try {
    const projectResult = await prisma.$queryRaw`
      SELECT p.*, u.name as authorName, u.image as authorImage, u.id as authorId
      FROM Project p
      LEFT JOIN User u ON p.authorId = u.id
      WHERE p.slug = ${slug}
        AND p.status = 'PUBLISHED'
        AND p.deleted = false
    `;
    
    project = Array.isArray(projectResult) && projectResult.length > 0 ? projectResult[0] : null;
    
    if (project) {
      // Obtener categorías desde el campo JSON categoryIds
      try {
        // Inicializar categories como array vacío por defecto
        project.categories = [];
        
        // Parsear categoryIds si existe
        let categoryIds = [];
        if (project.categoryIds) {
          try {
            categoryIds = JSON.parse(project.categoryIds);
          } catch (parseError) {
            console.error(`Error parsing categoryIds for project ${project.id}:`, parseError);
          }
        }
        
        // Si hay IDs de categorías, obtener sus detalles completos
        if (categoryIds && categoryIds.length > 0) {
          // Construir placeholders para la consulta IN
          const placeholders = categoryIds.map(() => '?').join(',');
          
          // Obtener detalles de las categorías
          const categoriesResult = await prisma.$queryRawUnsafe(`
            SELECT id, name, slug
            FROM Category
            WHERE id IN (${placeholders})
          `, ...categoryIds);
          
          project.categories = Array.isArray(categoriesResult) ? categoriesResult : [];
        }
      } catch (error) {
        console.error('Error fetching categories from JSON:', error);
        project.categories = [];
      }
      
      // Add author in the expected format
      project.author = project.authorId ? {
        id: project.authorId,
        name: project.authorName,
        image: project.authorImage
      } : null;
    }
  } catch (error) {
    console.error('Error fetching project:', error);
    notFound();
  }

  // Si no existe el proyecto, mostrar 404
  if (!project) {
    notFound();
  }

  // Obtener proyectos relacionados (de las mismas categorías)
  let relatedProjects = [];
  try {
    // Intentar encontrar proyectos que compartan categorías si es posible
    if (project.categories.length > 0) {
      // Extraer IDs de categorías del proyecto actual
      const categoryIds = project.categories.map((cat: any) => cat.id);
      
      // Buscar proyectos que tengan alguna de estas categorías usando el campo categoryIds JSON
      let relatedProjectsFound = false;
      
      for (const categoryId of categoryIds) {
        // Para cada categoría, buscar proyectos que la contengan en su campo categoryIds JSON
        const relatedResult = await prisma.$queryRaw`
          SELECT DISTINCT id, title, slug, coverImage, excerpt
          FROM Project
          WHERE id != ${project.id}
            AND status = 'PUBLISHED'
            AND deleted = false
            AND categoryIds LIKE ${'%' + categoryId + '%'}
          LIMIT 3
        `;
        
        if (Array.isArray(relatedResult) && relatedResult.length > 0) {
          relatedProjects = relatedResult;
          relatedProjectsFound = true;
          break; // Si encontramos proyectos relacionados, salimos del bucle
        }
      }
      
      // Si no encontramos proyectos relacionados, usar el enfoque genérico
      if (!relatedProjectsFound) {
        const fallbackResult = await prisma.$queryRaw`
          SELECT DISTINCT id, title, slug, coverImage, excerpt
          FROM Project
          WHERE id != ${project.id}
            AND status = 'PUBLISHED'
            AND deleted = false
          LIMIT 3
        `;
        
        relatedProjects = Array.isArray(fallbackResult) ? fallbackResult : [];
      }
    } else {
      // Si el proyecto no tiene categorías, obtener otros proyectos aleatorios
      const randomResult = await prisma.$queryRaw`
        SELECT DISTINCT id, title, slug, coverImage, excerpt
        FROM Project
        WHERE id != ${project.id}
          AND status = 'PUBLISHED'
          AND deleted = false
        LIMIT 3
      `;
      
      relatedProjects = Array.isArray(randomResult) ? randomResult : [];
    }
  } catch (error) {
    console.error('Error fetching related projects:', error);
    relatedProjects = [];
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

      <div className={`flex flex-col lg:flex-row gap-8 ${(sidebarConfig as any).position === 'right' ? '' : 'lg:flex-row-reverse'}`}>
        {/* Contenido principal */}
        <div className="w-full lg:flex-1">
          <article>
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

              {/* Metadatos del proyecto */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {project.publishedAt && (
                  <div>
                    {translations.public.projectPostedOn.replace(
                      '{0}',
                      new Date(project.publishedAt).toLocaleDateString()
                    )}
                  </div>
                )}

                {(project.author?.name || project.authorDisplayName) && (
                  <div className="flex items-center gap-2">
                    {project.author?.image && (
                      <img
                        src={project.author.image}
                        alt={project.author.name || ''}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span>{project.authorDisplayName || project.author?.name}</span>
                  </div>
                )}
              </div>

              {/* Categoría - ACTUALIZADO PARA CATEGORÍA ÚNICA */}
              {project.categories && project.categories.length > 0 && (
                <div className="mb-6">
                  <Link
                    href={`/portfolio/category/${project.categories[0].slug}`}
                    className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm"
                  >
                    {project.categories[0].name}
                  </Link>
                </div>
              )}

              {/* Imagen de portada */}
              {project.coverImage && (
                <div className="mb-8">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </header>

            {/* Contenido del proyecto */}
            <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: project.content }} />

            {/* Galería de imágenes adicionales */}
            {project.additionalImageUrls && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">{translations.public.projectDetails}</h2>
                <ProjectGallery
                  images={JSON.parse(project.additionalImageUrls as string) as string[]}
                  displayType={project.displayType}
                />
              </div>
            )}

            {/* Proyectos relacionados */}
            {relatedProjects.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">{translations.public.relatedProjects}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedProjects.map((relatedProject: any) => (
                    <Card key={relatedProject.id}>
                      {relatedProject.coverImage && (
                        <Link href={`/portfolio/${relatedProject.slug}`}>
                          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                            <img
                              src={relatedProject.coverImage}
                              alt={relatedProject.title}
                              className="object-cover w-full h-full transition-transform hover:scale-105"
                            />
                          </div>
                        </Link>
                      )}
                      <CardContent className="p-4">
                        <Link href={`/portfolio/${relatedProject.slug}`}>
                          <h3 className="font-bold text-lg mb-2 hover:text-primary transition-colors">
                            {relatedProject.title}
                          </h3>
                        </Link>
                        {relatedProject.excerpt && (
                          <p className="text-gray-600 line-clamp-2">{relatedProject.excerpt}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Barra lateral (condicional) */}
        {portfolioConfig.showSidebarInProject && (
          <div
            className="w-full"
            style={{ width: '100%', maxWidth: (sidebarConfig as any).width || '320px' }}
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
