'use client';

import React, { useEffect, useState } from 'react';
import { translations } from '@/app/translations';
import useSWR from 'swr';
import Link from 'next/link';

// Fetcher genérico para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || translations.common.error);
  }
  return res.json();
});

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface LatestPost {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
}

interface SidebarWidget {
  type: string;
  config?: any;
}

interface SidebarConfig {
  widgets?: SidebarWidget[];
  position?: 'left' | 'right';
  width?: string;
}

const BlogSidebar: React.FC = () => {
  // Estado para almacenar la configuración de la barra lateral
  const [sidebarConfig, setSidebarConfig] = useState<SidebarConfig>({ widgets: [] });

  // Cargar la configuración de la barra lateral
  useEffect(() => {
    fetch('/api/settings/sidebar')
      .then(res => res.json())
      .then(data => {
        if (data && data.widgets) {
          setSidebarConfig(data);
        }
      })
      .catch(err => console.error('Error loading sidebar config:', err));
  }, []);
  // Cargar categorías
  const { data: categories, error: categoriesError } = useSWR<Category[]>('/api/blog/categories', fetcher);

  // Cargar etiquetas
  const { data: tags, error: tagsError } = useSWR<Tag[]>('/api/blog/tags', fetcher);

  // Cargar posts recientes
  const { data: latestPosts, error: postsError } = useSWR<LatestPost[]>('/api/blog/latest', fetcher);

  // Función para renderizar un widget según su tipo
  const renderWidget = (widget: SidebarWidget, index: number) => {
    switch (widget.type) {
      case 'search':
        return (
          <div key={`widget-${index}`} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">{translations.public.search}</h3>
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
                {translations.public.search}
              </button>
            </form>
          </div>
        );
      case 'categories':
        return (
          <div key={`widget-${index}`} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">{translations.public.categories}</h3>
            {categoriesError ? (
              <p className="text-red-500 text-sm">{translations.common.error}</p>
            ) : !categories ? (
              <p className="text-sm text-gray-500">{translations.common.loading}...</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-500">{translations.public.noCategories}</p>
            ) : (
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/blog/category/${category.slug}`}
                      className="text-primary hover:underline block"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'tags':
        return (
          <div key={`widget-${index}`} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">{translations.public.tags}</h3>
            {tagsError ? (
              <p className="text-red-500 text-sm">{translations.common.error}</p>
            ) : !tags ? (
              <p className="text-sm text-gray-500">{translations.common.loading}...</p>
            ) : tags.length === 0 ? (
              <p className="text-sm text-gray-500">{translations.public.noTags}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      case 'recent_posts':
        return (
          <div key={`widget-${index}`} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">{translations.public.recentPosts}</h3>
            {postsError ? (
              <p className="text-red-500 text-sm">{translations.common.error}</p>
            ) : !latestPosts ? (
              <p className="text-sm text-gray-500">{translations.common.loading}...</p>
            ) : latestPosts.length === 0 ? (
              <p className="text-sm text-gray-500">{translations.public.noPosts}</p>
            ) : (
              <ul className="space-y-3">
                {latestPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-primary hover:underline block"
                    >
                      {post.title}
                    </Link>
                    {post.publishedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Si no hay widgets configurados, mostrar los widgets por defecto
  const defaultWidgets = [
    { type: 'search' },
    { type: 'categories' },
    { type: 'tags' },
    { type: 'recent_posts' }
  ];

  const widgetsToRender = (sidebarConfig.widgets && sidebarConfig.widgets.length > 0)
    ? sidebarConfig.widgets
    : defaultWidgets;

  return (
    <aside className="w-full space-y-8">
      {widgetsToRender.map((widget, index) => renderWidget(widget, index))}
    </aside>
  );
};

export default BlogSidebar;
