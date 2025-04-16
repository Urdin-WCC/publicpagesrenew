'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Tag } from '@prisma/client'; // Usar tipo Tag
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
import { Label } from '@/components/ui/label';
import { translations } from '@/app/translations';

// Solo necesitamos el nombre para las etiquetas
interface TagFormData {
  name: string;
}

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TagFormData, tagId?: string) => Promise<void>; // Ajustar tipo de data
  tag?: Tag | null; // Usar tipo Tag
  isLoading: boolean;
}

const TagFormModal: React.FC<TagFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tag, // Usar 'tag'
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TagFormData>();

  useEffect(() => {
    if (isOpen) {
      if (tag) {
        reset({ name: tag.name }); // Resetear solo con nombre
      } else {
        reset({ name: '' });
      }
    }
  }, [tag, isOpen, reset]);

  const handleFormSubmit: SubmitHandler<TagFormData> = async (data) => {
    await onSubmit(data, tag?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {/* Usar traducciones de etiquetas */}
            {tag ? translations.admin.taxonomies.editTag : translations.admin.taxonomies.addTag}
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
          {/* No hay campo de descripción para etiquetas */}
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

export default TagFormModal;