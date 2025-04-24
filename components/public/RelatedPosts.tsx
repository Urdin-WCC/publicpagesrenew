'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export interface RelatedPostsProps {
  postId: number | string;
  categoryIds: number[];
  limit?: number;
}

interface Post {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: Date;
}

export default function RelatedPosts({ postId, categoryIds, limit = 3 }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchRelatedPosts() {
      if (!postId) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Construct query parameters
        const params = new URLSearchParams();
        params.append('postId', String(postId));
        if (categoryIds && categoryIds.length > 0) {
          params.append('categoryIds', JSON.stringify(categoryIds));
        }
        params.append('limit', String(limit));
        
        // Fetch related posts from API
        const response = await fetch(`/api/blog/related-posts?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch related posts');
        }
        
        const data = await response.json();
        setRelatedPosts(data.posts || []);
      } catch (err) {
        console.error('Error fetching related posts:', err);
        setError('Could not load related posts');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRelatedPosts();
  }, [postId, categoryIds, limit]);
  
  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Artículos relacionados</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({length: 3}).map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-200 w-full"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error || relatedPosts.length === 0) {
    // Don't show the section if there are no related posts
    return null;
  }
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Artículos relacionados</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <div key={post.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {post.coverImage && (
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-48 w-full">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </h3>
              {post.excerpt && (
                <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
              )}
              <div className="mt-4">
                <Link href={`/blog/${post.slug}`} className="text-primary hover:underline">
                  Leer más
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
