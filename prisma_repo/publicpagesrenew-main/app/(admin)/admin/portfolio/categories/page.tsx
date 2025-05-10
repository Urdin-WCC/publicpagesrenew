'use client';

import React, { useState } from 'react';
import useSWR, { KeyedMutator } from 'swr';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CategoryFormModal from './CategoryFormModal';

// Tipo para categorías
type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

// Función para obtener datos de la API
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PortfolioCategoriesPage() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Verificar permisos
  const canManage = hasPermission(session?.user?.role, 'manage_blog_taxonomies'); // Reutilizamos el permiso de blog

  // Obtener categorías
  const { data: categories, error, mutate } = useSWR<Category[]>(
    '/api/portfolio/categories',
    fetcher
  );

  // Abrir modal para crear nueva categoría
  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar categoría existente
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Eliminar categoría
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(translations.admin.portfolioTaxonomies.confirmDeleteCategory.replace('{0}', name))) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(translations.admin.portfolioTaxonomies.deleteSuccess);
        mutate(); // Recargar datos
      } else {
        const data = await response.json();
        toast.error(data.message || translations.admin.portfolioTaxonomies.deleteError);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(translations.admin.portfolioTaxonomies.deleteError);
    }
  };

  // Mostrar error si no se pueden cargar las categorías
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {translations.admin.portfolioTaxonomies.fetchError}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{translations.admin.portfolioTaxonomies.pageTitle}</CardTitle>
          {canManage && (
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {translations.admin.portfolioTaxonomies.addCategory}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!categories ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">{translations.common.loading}</p>
            </div>
          ) : (categories || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay categorías disponibles.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{translations.admin.portfolioTaxonomies.nameLabel}</TableHead>
                  <TableHead>{translations.admin.portfolioTaxonomies.slugLabel}</TableHead>
                  <TableHead>{translations.admin.portfolioTaxonomies.descriptionLabel}</TableHead>
                  <TableHead className="text-right">{translations.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(categories) ? categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canManage && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(category)}
                              title={translations.admin.portfolioTaxonomies.editCategory}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id, category.name)}
                              title={translations.admin.portfolioTaxonomies.deleteCategory}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      Error: Las categorías no son un array válido. Por favor, recarga la página.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear/editar categoría */}
      {isModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={handleCloseModal}
          onSave={() => {
            mutate();
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}
