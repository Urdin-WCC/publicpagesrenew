'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import CategoryManagement from '@/components/admin/blog/CategoryManagement'; // Componente específico
import TagManagement from '@/components/admin/blog/TagManagement';       // Componente específico

// Tipos para las taxonomías (pueden moverse a un archivo types/)
export interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null; // Solo para categorías
}

// Fetcher genérico para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar datos');
    }
    return res.json();
});

const BlogTaxonomiesPage: React.FC = () => {
  const { data: session, status: sessionStatus } = useSession();

  // Cargar categorías y etiquetas
  const { data: categories, error: categoriesError, isLoading: categoriesLoading, mutate: mutateCategories } = useSWR<TaxonomyItem[]>('/api/blog/categories', fetcher);
  const { data: tags, error: tagsError, isLoading: tagsLoading, mutate: mutateTags } = useSWR<TaxonomyItem[]>('/api/blog/tags', fetcher);

  // Permiso para gestionar taxonomías (ej. EDITOR+)
  const canManage = hasPermission(session?.user?.role, 'manage_blog_taxonomies'); // Usar permiso específico

  if (sessionStatus === 'loading' || categoriesLoading || tagsLoading) {
    return <p>{translations.common.loading}...</p>;
  }

  if (!canManage) {
    return <p className="text-red-500 p-4">{translations.auth.unauthorized}</p>;
  }

  if (categoriesError || tagsError) {
      return <p className="text-red-500 p-4">{translations.admin.taxonomies.fetchError}</p>
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">{translations.admin.taxonomies.pageTitle}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de Categorías */}
        <Card>
          <CardHeader>
            <CardTitle>{translations.admin.taxonomies.categoriesTitle}</CardTitle>
            {/* Botón Añadir (se manejará dentro del componente) */}
          </CardHeader>
          <CardContent>
            <CategoryManagement
              categories={categories || []}
              mutate={mutateCategories}
              canManage={canManage}
            />
          </CardContent>
        </Card>

        {/* Sección de Etiquetas */}
        <Card>
          <CardHeader>
            <CardTitle>{translations.admin.taxonomies.tagsTitle}</CardTitle>
             {/* Botón Añadir (se manejará dentro del componente) */}
          </CardHeader>
          <CardContent>
             <TagManagement
                tags={tags || []}
                mutate={mutateTags}
                canManage={canManage}
             />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogTaxonomiesPage;