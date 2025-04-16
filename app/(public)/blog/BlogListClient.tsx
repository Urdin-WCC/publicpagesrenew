'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { translations } from '@/app/translations';
import PaginationControls from '@/components/public/PaginationControls';
import LoadingSpinner from '@/components/core/LoadingSpinner'; // Para indicar carga
import { PostStatus } from '@prisma/client'; // Importar PostStatus

// Tipo para los datos del post que esperamos de la API
type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null; // La API devolverá string probablemente
  author: { name: string | null } | null;
};

// Importar la interfaz BlogConfig
import { BlogConfig } from '@/lib/config-server';

// Tipo para la respuesta de la API pública
interface PublicApiResponse {
  posts: PostSummary[];
  totalPages: number;
  currentPage: number;
  totalPosts: number;
  // Incluir config del blog si la API la devuelve
  blogConfig?: Partial<BlogConfig>;
}

// Fetcher genérico para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Usar una traducción genérica o específica si la API la proporciona
        throw new Error(errorData.message || translations.common.error);
    }
    return res.json();
});

const BlogListClient: React.FC = () => {
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10; // O obtener de config si es necesario

  // Construir URL para SWR, asegurando que solo pedimos posts publicados
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('limit', limit.toString());
    params.set('status', PostStatus.PUBLISHED); // Filtrar por publicados
    // Podríamos añadir otros filtros públicos si fueran necesarios (ej. categoría, tag)
    // if (searchParams.get('category')) params.set('category', searchParams.get('category')!);
    return `/api/blog?${params.toString()}`;
  }, [currentPage, limit]); // Dependencias: currentPage y limit

  const { data: apiResponse, error, isLoading } = useSWR<PublicApiResponse>(apiUrl, fetcher, {
    keepPreviousData: true, // Mantiene datos anteriores mientras carga nuevos
  });

  // Extraer config del blog de la respuesta si existe, o usar valores por defecto
  const blogConfig = apiResponse?.blogConfig ?? {
    showPublishDate: true,
    showAuthorName: true,
    listDisplayMode: 'grid',
    showSidebarInList: true,
    showSidebarInPost: true
  };

  if (error) return <p className="text-red-500">{translations.admin.blogList.fetchError}: {error.message}</p>;
  if (isLoading && !apiResponse) return <LoadingSpinner />; // Mostrar spinner solo en carga inicial

  const posts = apiResponse?.posts ?? [];
  const totalPages = apiResponse?.totalPages ?? 0;

  return (
    <>
      {isLoading && <div className="opacity-50"><LoadingSpinner /></div>} {/* Indicador visual de recarga */}
      {posts.length === 0 && !isLoading ? (
        <p>{translations.public.noResults}</p>
      ) : (
        <div className={blogConfig.listDisplayMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8"
          : "flex flex-col space-y-6 mb-8"
        }>
          {posts.map((post) => (
            <article key={post.id} className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${blogConfig.listDisplayMode === 'list' ? 'flex flex-row' : ''}`}>
              {post.coverImage && (
                <Link href={`/blog/${post.slug}`} passHref>
                  <div className={`relative ${blogConfig.listDisplayMode === 'grid' ? 'w-full h-48' : 'min-w-[200px] h-full'}`}>
                    <Image
                      src={post.coverImage}
                      alt={`Imagen de portada para ${post.title}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes={blogConfig.listDisplayMode === 'grid'
                        ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        : "200px"}
                    />
                  </div>
                </Link>
              )}
              <div className="p-4 flex-1">
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
          {/* Pasamos currentPage y totalPages obtenidos de la API */}
          <PaginationControls currentPage={apiResponse?.currentPage ?? 1} totalPages={totalPages} />
        </div>
      )}
    </>
  );
};

export default BlogListClient;