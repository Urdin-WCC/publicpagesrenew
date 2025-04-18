import React, { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getBlogConfig } from '@/lib/config-server';
import { getGlobalConfig } from '@/lib/config'; // Importar función para obtener la configuración global
import { PostStatus } from '@prisma/client';
import { notFound } from 'next/navigation'; // Para mostrar 404
import Image from 'next/image';
import Link from 'next/link';
import { translations } from '@/app/translations';
import RelatedPosts from '@/components/public/RelatedPosts';
import BlogSidebar from '@/components/public/BlogSidebar';
import LoadingSpinner from '@/components/core/LoadingSpinner';
// Definir tipos necesarios
type Category = {
  id: string;
  name: string;
  slug: string;
};

// Tipo para el post con categorías
type PostWithCategories = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  status: string;
  author: { id: string; name: string | null } | null;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  featured: boolean;
  authorDisplayName: string | null;
  categoryIds?: string;
  categories: Category[];
};

// Función para obtener los datos del post
async function getPostData(slug: string): Promise<PostWithCategories | null> {
  // Obtener el post básico primero
  const post = await prisma.post.findUnique({
    where: {
      slug: slug,
      status: PostStatus.PUBLISHED,
      deleted: false,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  }) as any; // Forzar tipo para acceder a categoryIds
  
  if (!post) return null;
  
  // Procesar categorías si el post existe
  let categories: Category[] = [];
  try {
    // Si hay categoryIds, obtener los detalles de las categorías
    if (post.categoryIds) {
      const categoryIds = JSON.parse(post.categoryIds as string);
      if (categoryIds.length > 0) {
        categories = await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, slug: true }
        });
      }
    }
  } catch (error) {
    console.error(`Error parsing categories for post ${post.id}:`, error);
  }
  
  // Añadir las categorías como propiedad al post
  return {
    ...post,
    categories
  };
}

interface BlogPostPageProps {
  params: { slug: string };
}

// Opcional: Generar metadatos dinámicos
export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getPostData(params.slug);

  if (!post) {
    return { title: 'Post no encontrado' };
  }

  return {
    title: post.title,
    description: post.excerpt || 'Entrada del blog', // Usar extracto como descripción
    // Podríamos añadir openGraph, etc.
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;

  // Obtener la configuración del blog, la configuración global y los datos del post
  const [blogConfig, globalConfig, post] = await Promise.all([
    getBlogConfig(),
    getGlobalConfig(),
    getPostData(slug)
  ]);

  // Obtener la configuración de la barra lateral
  const sidebarConfig = globalConfig?.sidebar as { position?: 'left' | 'right', width?: string } || {};

  // Si no se encuentra el post, mostrar 404
  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`flex flex-col lg:flex-row gap-8 ${sidebarConfig.position === 'right' ? '' : 'lg:flex-row-reverse'}`}>
        {/* Contenido principal */}
        <div className={`w-full ${blogConfig.showSidebarInPost ? 'lg:flex-1' : 'max-w-3xl mx-auto'}`}>
          <article>
            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

            {/* Meta Información */}
            <div className="text-sm text-muted-foreground mb-6">
              {blogConfig.showPublishDate && post.publishedAt && (
                <span>
                  {translations.public.postedOn.replace('{0}', new Date(post.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }))}
                </span>
              )}
              {blogConfig.showAuthorName && post.author?.name && (
                <span>
                  {' '}{translations.public.by}{' '}
                  <span className="font-medium">{post.author.name}</span>
                </span>
              )}
          {/* Mostrar Categoría - ACTUALIZADO PARA CATEGORÍA ÚNICA */}
          {post.categories && post.categories.length > 0 && (
             <span className="ml-2">
                {translations.public.in}{' '}
                <Link href={`/blog/category/${post.categories[0].slug}`} className="hover:text-primary hover:underline">
                    {post.categories[0].name}
                </Link>
             </span>
          )}
        </div>

        {/* Imagen de Portada */}
        {post.coverImage && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.coverImage}
              alt={`Imagen de portada para ${post.title}`}
              fill
              style={{ objectFit: 'cover' }}
              priority // Priorizar carga de imagen principal
              sizes="100vw"
            />
          </div>
        )}

        {/* Contenido del Post */}
        {/* ATENCIÓN: Usar dangerouslySetInnerHTML es un riesgo de seguridad si el HTML no está sanitizado */}
        {/* Se recomienda usar un parser/renderer como react-markdown o sanitizar en el backend/API */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert" // Clases de Tailwind Typography
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Nota: Sección de etiquetas eliminada porque hemos migrado a un modelo sin etiquetas */}

        {/* Posts Relacionados (Opcional) */}
        {blogConfig.relatedPostsEnabled && (
          <RelatedPosts currentPostId={post.id} count={blogConfig.relatedPostsCount} />
        )}


      </article>
        </div>

        {/* Barra lateral (condicional) */}
        {blogConfig.showSidebarInPost && (
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

// Opcional: Generar rutas estáticas si se usa SSG
// export async function generateStaticParams() {
//   const posts = await prisma.post.findMany({
//     where: { status: PostStatus.PUBLISHED, deleted: false },
//     select: { slug: true },
//   });
//   return posts.map((post) => ({ slug: post.slug }));
// }
