import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getGlobalConfig } from '@/lib/config-server';
import { translations } from '@/app/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WidgetRenderer from '@/components/public/WidgetRenderer';

// Define interfaces for our data types
interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    posts: number;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  publishedAt: Date | null;  // Changed from string to Date to match Prisma
  author: {
    name: string | null;
  } | null;
}

interface SidebarWidget {
  id: string;  // Make id required to match WidgetRenderer expectations
  type: string;
  title: string; // Make title required to match WidgetRenderer expectations
  config?: any;
  content?: string | null;
  order?: number;
  isActive?: boolean;
  sectionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SidebarConfig {
  widgets?: SidebarWidget[];
  position?: 'left' | 'right';
  width?: string;
  customHtml?: string;
}

export default async function BlogSidebar() {
  // Obtener categorías y posts recientes
  let categories: Category[] = [];
  let recentPosts: Post[] = [];

  try {
    // Verificar si el modelo Category existe
    if (prisma.category) {
      categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  status: 'PUBLISHED',
                  deleted: false,
                },
              },
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    }

    // Verificar si el modelo Post existe
    if (prisma.post) {
      // Obtener posts recientes
      recentPosts = await prisma.post.findMany({
        where: {
          status: 'PUBLISHED', 
          deleted: false,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          publishedAt: true,
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 5,
      });
    }
  } catch (error) {
    console.error('Error fetching blog data:', error);
    // En caso de error, usar arrays vacíos
    categories = [];
    recentPosts = [];
  }

  // Obtener configuración global
  const globalConfig = await getGlobalConfig();
  const sidebarConfig = globalConfig?.sidebar as SidebarConfig || { widgets: [] };

  return (
    <div className="space-y-6">
      {/* Formulario de búsqueda */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{translations.common.search}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/blog/search" method="get" className="flex">
            <input
              type="text"
              name="q"
              placeholder={translations.public.searchPlaceholder}
              className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark transition-colors"
            >
              {translations.common.search}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Categorías */}
      {categories.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{translations.public.categories}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/blog/category/${category.slug}`}
                    className="text-gray-700 hover:text-primary flex justify-between items-center py-1"
                  >
                    <span>{category.name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {category._count.posts}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Posts recientes */}
      {recentPosts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{translations.public.recentPosts}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentPosts.map((post) => (
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
      )}

      {/* Widgets personalizados */}
      {sidebarConfig.widgets && sidebarConfig.widgets.map((widget, index) => (
        <WidgetRenderer key={index} widget={widget} />
      ))}
    </div>
  );
}
