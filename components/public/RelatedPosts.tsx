import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { PostStatus } from '@prisma/client';
import { translations } from '@/app/translations';

interface RelatedPostsProps {
  currentPostId: string;
  count?: number; // Número de posts a mostrar
}

// Tipo simplificado para los posts relacionados
type RelatedPostItem = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
};

// Función para obtener posts recientes (excepto el actual)
async function getRelatedPosts(currentPostId: string, count: number): Promise<RelatedPostItem[]> {
  try {
    // Simple: obtener posts recientes excluyendo el actual
    const recentPosts = await prisma.post.findMany({
      where: {
        id: { not: currentPostId },
        status: PostStatus.PUBLISHED,
        deleted: false
      },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true
      },
      orderBy: { 
        publishedAt: 'desc' 
      },
      take: count
    });

    return recentPosts;

  } catch (error) {
    console.error("Error fetching related posts:", error);
    return []; // Devolver array vacío en caso de error
  }
}

const RelatedPosts: React.FC<RelatedPostsProps> = async ({ currentPostId, count = 3 }) => {
  const posts = await getRelatedPosts(currentPostId, count);

  if (posts.length === 0) {
    return null; // No renderizar nada si no hay posts relacionados
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h3 className="text-2xl font-semibold mb-6">{translations.public.relatedPosts}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.id} className="group">
            <Link href={`/blog/${post.slug}`} passHref>
              {post.coverImage && (
                <div className="relative w-full h-40 mb-3 rounded overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={`Imagen para ${post.title}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <h4 className="text-lg font-medium group-hover:text-primary transition-colors">
                {post.title}
              </h4>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
