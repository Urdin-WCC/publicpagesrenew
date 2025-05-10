'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Category } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { translations } from '@/app/translations';

interface CategoryFormData {
  name: string;
  description?: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData, categoryId?: string) => Promise<void>; // Función que maneja POST/PUT
  category?: Category | null; // Categoría existente para editar
  isLoading: boolean; // Estado de carga del submit
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>();

  // Resetear el formulario cuando cambia la categoría (para editar) o se cierra/abre
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({ name: category.name, description: category.description || '' });
      } else {
        reset({ name: '', description: '' });
      }
    }
  }, [category, isOpen, reset]);

  const handleFormSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    await onSubmit(data, category?.id);
    // No cerramos aquí, esperamos a que el padre lo haga tras el éxito
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? translations.admin.taxonomies.editCategory : translations.admin.taxonomies.addCategory}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {translations.admin.taxonomies.nameLabel}*
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                {...register('name', { required: 'El nombre es obligatorio' })}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {translations.admin.taxonomies.descriptionLabel}
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              className="col-span-3"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                {translations.common.cancel}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? translations.common.loading : translations.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormModal;