import React from 'react';
import Link from 'next/link';
import { translations } from '@/app/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Tipo para el widget
interface WidgetLatestPostsProps {
  title?: string;
  config?: {
    limit?: number;
    showFeatured?: boolean;
  };
}

// Tipo para posts
type Post = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  publishedAt: string | null;
  author?: {
    name: string | null;
  } | null;
};

export default async function WidgetLatestPosts({
  title,
  config
}: WidgetLatestPostsProps) {
  // Opciones predeterminadas
  const limit = config?.limit || 3;
  const showFeatured = config?.showFeatured || false;

  // Construir URL con parámetros
  const queryParams = new URLSearchParams();
  queryParams.set('limit', limit.toString());
  queryParams.set('status', 'PUBLISHED'); // Always filter by PUBLISHED status in public views
  if (showFeatured) {
    queryParams.set('featured', 'true');
  }

  // Obtener posts recientes
  let posts: Post[] = [];
  try {
    // Usar URL absoluta para evitar errores de parseo
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog/latest?${queryParams.toString()}`, {
      next: { revalidate: 3600 }, // Revalidar cada hora
    });

    if (response.ok) {
      posts = await response.json();
    }
  } catch (error) {
    console.error('Error fetching latest posts:', error);
  }

  // Si no hay posts, no mostrar el widget
  if (posts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title || translations.public.recentPosts}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="flex gap-3">
              {post.coverImage && (
                <Link href={`/blog/${post.slug}`} className="shrink-0">
                  <div className="w-16 h-16 rounded overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              )}
              <div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-medium hover:text-primary line-clamp-2"
                >
                  {post.title}
                </Link>
                <p className="text-xs text-gray-500 mt-1">
                  {post.publishedAt && new Date(post.publishedAt).toLocaleDateString()}
                  {post.author?.name && ` - ${post.author.name}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
