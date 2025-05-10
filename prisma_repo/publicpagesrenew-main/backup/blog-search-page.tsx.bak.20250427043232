import React from 'react';
import { prisma } from '@/lib/prisma';
import { getBlogConfig } from '@/lib/config-server';
import { PostStatus } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { translations } from '@/app/translations';
import PaginationControls from '@/components/public/PaginationControls';
import SearchForm from '@/components/public/SearchForm'; // Asumiendo componente de formulario

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

interface BlogSearchPageProps {
  searchParams?: {
    q?: string; // Término de búsqueda
    page?: string;
  };
}

export default async function BlogSearchPage({ searchParams }: BlogSearchPageProps) {
  const query = searchParams?.q || '';
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const blogConfig = await getBlogConfig();
  const postsPerPage = blogConfig.postsPerPage || 10;
  const skip = (currentPage - 1) * postsPerPage;

  let posts: PostSummary[] = [];
  let totalPosts = 0;

  // Solo buscar si hay un término de búsqueda
  if (query) {
    const whereClause = {
      status: PostStatus.PUBLISHED,
      deleted: false,
      OR: [ // Buscar en título, extracto o contenido
        { title: { contains: query, mode: 'insensitive' as const } },
        { excerpt: { contains: query, mode: 'insensitive' as const } },
        { content: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    posts = await prisma.post.findMany({
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

    totalPosts = await prisma.post.count({ where: whereClause });
  }

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div className="w-full px-4 py-8" style={{ maxWidth: "100%" }}>
      <h1 className="text-3xl font-bold mb-4">{translations.public.searchTitle}</h1>

      {/* Formulario de Búsqueda */}
      <div className="mb-8">
         {/* Podríamos crear un componente SearchForm reutilizable */}
         <form method="GET" action="/blog/search">
             <div className="flex">
                 <input
                     type="search"
                     name="q"
                     defaultValue={query}
                     placeholder={translations.public.searchPlaceholder}
                     className="border rounded-l px-4 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-primary"
                     required
                 />
                 <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-r hover:bg-primary/90">
                     {translations.public.searchButton}
                 </button>
             </div>
         </form>
      </div>

      {query && ( // Mostrar resultados solo si se buscó algo
        <>
          <h2 className="text-xl mb-6">
            {totalPosts > 0
              ? `${translations.public.searchResultsFor.replace('{0}', query)} (${totalPosts})`
              : translations.public.noResultsFor.replace('{0}', query)}
          </h2>

          {posts.length > 0 && (
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
                    <h3 className="text-xl font-semibold mb-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </h3>
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

          {/* Paginación para resultados de búsqueda */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              {/* Pasamos la ruta base correcta para que los enlaces de paginación funcionen */}
              <PaginationControls currentPage={currentPage} totalPages={totalPages} basePath="/blog/search" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
