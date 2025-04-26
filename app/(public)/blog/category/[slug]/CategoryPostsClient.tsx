'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import PaginationControls from '@/components/public/PaginationControls';
import LoadingSpinner from '@/components/core/LoadingSpinner';

interface CategoryPostsClientProps {
  categorySlug: string;
  initialPage?: number;
  translations: any;
  layoutMode?: 'grid' | 'list';
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  author: { name: string | null } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoryPostsClient({ 
  categorySlug, 
  initialPage = 1, 
  translations,
  layoutMode = 'grid'
}: CategoryPostsClientProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [config, setConfig] = useState<any>({});
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const page = searchParams.get('page');
    if (page) {
      setCurrentPage(parseInt(page, 10));
    }
  }, [searchParams]);
  
  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Primero obtenemos la categoría por su slug
        const categoryResponse = await fetch(`/api/blog/categories?slug=${categorySlug}`);
        
        if (!categoryResponse.ok) {
          throw new Error('Error al cargar la categoría');
        }
        
        const categoryData = await categoryResponse.json();
        
        if (!categoryData || categoryData.length === 0) {
          setError('Categoría no encontrada');
          setIsLoading(false);
          return;
        }
        
        const foundCategory = categoryData[0];
        setCategory(foundCategory);
        
        // Ahora obtenemos los posts filtrando por categoryIds que contenga el ID de esta categoría
        const postsResponse = await fetch(`/api/blog?page=${currentPage}&status=PUBLISHED&category=${foundCategory.slug}`);
        
        if (!postsResponse.ok) {
          throw new Error('Error al cargar los posts');
        }
        
        const postsData = await postsResponse.json();
        
        setPosts(postsData.posts);
        setTotalPages(postsData.totalPages);
        setConfig(postsData.blogConfig || {});
        
      } catch (err: any) {
        setError(err.message || 'Error al cargar el contenido');
        console.error('Error en CategoryPostsClient:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategory();
  }, [categorySlug, currentPage]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !category) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl text-red-500 mb-4">{error || 'Categoría no encontrada'}</h2>
        <Link href="/blog" className="text-blue-500 hover:underline">
          {translations.public.backToBlog}
        </Link>
      </div>
    );
  }
  
  const gridClass = layoutMode === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
    : 'space-y-8';
  
  return (
    <div className="w-full px-4 py-8" style={{ maxWidth: "100%" }}>
      <h1 className="text-3xl font-bold mb-8">
        {translations.public.category}: <span className="text-primary">{category.name}</span>
      </h1>

      {posts.length === 0 ? (
        <p>{translations.public.noResults}</p>
      ) : (
        <div className={gridClass}>
          {posts.map((post) => (
            <article key={post.id} className={layoutMode === 'grid' 
              ? "border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200" 
              : "border-b pb-6"
            }>
              {post.coverImage && (
                <Link href={`/blog/${post.slug}`} passHref>
                  <div className={layoutMode === 'grid' 
                    ? "relative w-full h-48" 
                    : "relative w-full h-64 sm:h-96 mb-4"
                  }>
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
                <h2 className={layoutMode === 'grid' ? "text-xl font-semibold mb-2" : "text-2xl font-semibold mb-3"}>
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </h2>
                {config.showPublishDate && post.publishedAt && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {translations.public.postedOn.replace('{0}', new Date(post.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }))}
                    {config.showAuthorName && post.author?.name && (
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
          <PaginationControls currentPage={currentPage} totalPages={totalPages} basePath={`/blog/category/${categorySlug}`} />
        </div>
      )}
    </div>
  );
}
