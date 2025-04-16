import React from 'react';
import { prisma } from '@/lib/prisma';
import { getBlogConfig } from '@/lib/config-server';
import { PostStatus } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { translations } from '@/app/translations';
import PaginationControls from '@/components/public/PaginationControls';

// Reutilizar el tipo del índice del blog
type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  author: { name: string | null } | null;
};

interface BlogCategoryPageProps {
  params: { slug: string }; // Slug de la categoría
  searchParams?: {
    page?: string;
  };
}

// Función para obtener datos de la categoría
async function getCategoryData(slug: string) {
    return prisma.category.findUnique({
        where: { slug },
        select: { id: true, name: true } // Solo necesitamos id y nombre
    });
}

// Opcional: Generar metadatos dinámicos
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
  const postsPerPage = blogConfig.postsPerPage || 10;
  const skip = (currentPage - 1) * postsPerPage;

  // Obtener datos de la categoría
  const category = await getCategoryData(slug);

  if (!category) {
    notFound(); // Mostrar 404 si la categoría no existe
  }

  // Obtener posts de esta categoría
  const whereClause = {
    status: PostStatus.PUBLISHED,
    deleted: false,
    categories: {
      some: { slug: slug }, // Filtrar por slug de categoría
    },
  };

  const posts = await prisma.post.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    skip: skip,
    take: postsPerPage,
  });

  // Obtener el total de posts para la paginación
  const totalPosts = await prisma.post.count({ where: whereClause });
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {translations.public.category}: <span className="text-primary">{category.name}</span>
      </h1>

      {posts.length === 0 ? (
        <p>{translations.public.noResults}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              {post.coverImage && (
                <Link href={`/blog/${post.slug}`} passHref>
                  <div className="relative w-full h-48">
                    <Image
                      src={post.coverImage}
                      alt={`Imagen de portada para ${post.title}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </h2>
                {blogConfig.showPublishDate && post.publishedAt && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {translations.public.postedOn.replace('{0}', new Date(post.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }))}
                    {blogConfig.showAuthorName && post.author?.name && (
                      ` ${translations.public.by} ${post.author.name}`
                    )}
                  </p>
                )}
                {post.excerpt && (
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                )}
                <Link href={`/blog/${post.slug}`} passHref>
                  <span className="text-primary hover:underline">{translations.public.readMore}</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          {/* La ruta base debe incluir la categoría */}
          <PaginationControls currentPage={currentPage} totalPages={totalPages} basePath={`/blog/category/${slug}`} />
        </div>
      )}
    </div>
  );
}

// Opcional: Generar rutas estáticas si se usa SSG
// export async function generateStaticParams() {
//   const categories = await prisma.category.findMany({ select: { slug: true } });
//   return categories.map((cat) => ({ slug: cat.slug }));
// }