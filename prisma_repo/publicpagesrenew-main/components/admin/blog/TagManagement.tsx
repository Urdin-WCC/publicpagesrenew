'use client';

import React, { useState } from 'react';
// Eliminar useSWR
import { Tag } from '@prisma/client'; // Usar tipo Tag
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { translations } from '@/app/translations';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import TagFormModal from './TagFormModal';
import { toast } from 'sonner';
import type { KeyedMutator } from 'swr'; // Importar tipo para mutate
import type { TaxonomyItem } from '@/app/(admin)/admin/blog/taxonomies/page'; // Importar tipo compartido

// Eliminar fetcher

// Definir props
interface TagManagementProps {
  tags: TaxonomyItem[];
  mutate: KeyedMutator<TaxonomyItem[]>;
  canManage: boolean;
}

const TagManagement: React.FC<TagManagementProps> = ({ tags, mutate, canManage }) => {
  // Eliminar useSWR

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null); // Usar tipo Tag
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    setEditingTag(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tag: Tag) => { // Usar tipo Tag
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  // Guardar (Crear o Actualizar) etiqueta
  const handleSaveTag = async (data: { name: string }, tagId?: string) => { // Solo necesita 'name'
    setIsSubmitting(true);
    const url = tagId ? `/api/blog/tags/${tagId}` : '/api/blog/tags'; // Cambiar endpoint
    const method = tagId ? 'PUT' : 'POST';

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
      handleCloseModal();
      mutate(); // Refrescar la lista de etiquetas
    } catch (err: any) {
      console.error('Error saving tag:', err);
      toast.error(err.message || translations.admin.taxonomies.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar etiqueta
  const handleDelete = (tag: Tag) => { // Usar tipo Tag
    const promise = fetch(`/api/blog/tags/${tag.id}`, { // Cambiar endpoint
      method: 'DELETE',
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || translations.admin.taxonomies.deleteError);
      }
      mutate(); // Refrescar lista
      return { name: tag.name };
    });

    toast.promise(promise, {
      loading: `Eliminando etiqueta "${tag.name}"...`,
      success: (data) => `Etiqueta "${data.name}" eliminada correctamente.`,
      error: (err) => err.message || translations.admin.taxonomies.deleteError,
    });
  };

  // Eliminar isLoading y error

  return (
    <div>
      <div className="flex justify-end mb-4">
        {/* Solo mostrar botón si tiene permiso */}
        {canManage && (
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> {translations.admin.taxonomies.addTag}
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{translations.admin.taxonomies.nameLabel}</TableHead>
            <TableHead>{translations.admin.taxonomies.slugLabel}</TableHead>
            {/* Solo mostrar columna de acciones si tiene permiso */}
            {canManage && <TableHead className="text-right">{translations.common.actions}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags && tags.length > 0 ? ( // Usar 'tags'
            tags.map((tag) => ( // Usar 'tag'
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell>{tag.slug}</TableCell>
                {/* Solo mostrar botones de acción si tiene permiso */}
                {canManage && (
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(tag)} title={translations.admin.taxonomies.editTag}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(tag)} title={translations.admin.taxonomies.deleteTag}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              {/* Ajustar colSpan */}
              <TableCell colSpan={canManage ? 3 : 2} className="text-center">
                {translations.admin.blogList.noPostsFound.replace('posts', 'etiquetas')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Renderizar el modal de etiquetas (se creará después) */}
      <TagFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveTag}
        tag={editingTag} // Pasar 'tag'
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TagManagement;