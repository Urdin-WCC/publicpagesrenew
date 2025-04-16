'use client';

import React, { useState } from 'react';
// Eliminar useSWR ya que los datos vendrán por props
import { Category } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { translations } from '@/app/translations';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import CategoryFormModal from './CategoryFormModal';
import type { KeyedMutator } from 'swr'; // Importar tipo para mutate
import type { TaxonomyItem } from '@/app/(admin)/admin/blog/taxonomies/page'; // Importar tipo compartido
import { toast } from 'sonner'; // Importar toast

// Eliminar fetcher, ya no se usa aquí

// Definir props que el componente recibirá
interface CategoryManagementProps {
  categories: TaxonomyItem[];
  mutate: KeyedMutator<TaxonomyItem[]>; // Función para refrescar datos en el padre
  canManage: boolean; // Permiso para editar/eliminar
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, mutate, canManage }) => {
  // Eliminar la llamada useSWR interna

  // Estado unificado para el modal y la categoría en edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el botón de guardar

  // Abrir modal para añadir
  const handleAdd = () => {
    setEditingCategory(null); // Asegurarse de que no hay categoría seleccionada
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null); // Limpiar categoría en edición al cerrar
  };

  // Guardar (Crear o Actualizar) categoría
  const handleSaveCategory = async (data: { name: string; description?: string }, categoryId?: string) => {
    setIsSubmitting(true);
    const url = categoryId ? `/api/blog/categories/${categoryId}` : '/api/blog/categories';
    const method = categoryId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || translations.admin.taxonomies.saveError);
      }

      toast.success(translations.admin.taxonomies.saveSuccess);
      handleCloseModal(); // Cerrar modal en éxito
      mutate(); // Refrescar la lista de categorías
    } catch (err: any) {
      console.error('Error saving category:', err);
      toast.error(err.message || translations.admin.taxonomies.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar categoría
  const handleDelete = (category: Category) => {
    const promise = fetch(`/api/blog/categories/${category.id}`, {
      method: 'DELETE',
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || translations.admin.taxonomies.deleteError);
      }
      mutate(); // Refrescar lista en éxito
      return { name: category.name }; // Devolver datos para el mensaje de éxito del toast
    });

    toast.promise(promise, {
      loading: `Eliminando categoría "${category.name}"...`,
      success: (data) => `Categoría "${data.name}" eliminada correctamente.`,
      error: (err) => err.message || translations.admin.taxonomies.deleteError,
    });
  };

  // Eliminar isLoading y error, ya que los datos vienen de props

  return (
    <div>
      <div className="flex justify-end mb-4">
        {/* Solo mostrar botón si tiene permiso */}
        {canManage && (
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> {translations.admin.taxonomies.addCategory}
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{translations.admin.taxonomies.nameLabel}</TableHead>
            <TableHead>{translations.admin.taxonomies.slugLabel}</TableHead>
            {/* Podríamos añadir descripción si fuera relevante */}
            {/* Solo mostrar columna de acciones si tiene permiso */}
            {canManage && <TableHead className="text-right">{translations.common.actions}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                {/* Solo mostrar botones de acción si tiene permiso */}
                {canManage && (
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(category)} title={translations.admin.taxonomies.editCategory}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(category)} title={translations.admin.taxonomies.deleteCategory}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              {/* Ajustar colSpan según si se muestra la columna de acciones */}
              <TableCell colSpan={canManage ? 3 : 2} className="text-center">
                {translations.admin.blogList.noPostsFound.replace('posts', 'categorías')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Renderizar el modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveCategory}
        category={editingCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default CategoryManagement;