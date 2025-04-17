import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { translations } from '@/app/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { generateSlug } from '@/lib/utils';

// Tipo para categoría
type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

// Tipo para el formulario
interface FormValues {
  name: string;
  description?: string;
}

interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: () => void;
}

export default function CategoryFormModal({ category, onClose, onSave }: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!category;

  // Configurar formulario
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
    },
  });

  // Manejar envío del formulario
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/portfolio/categories/${category.id}`
        : '/api/portfolio/categories';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(translations.admin.portfolioTaxonomies.saveSuccess);
        onSave();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || translations.admin.portfolioTaxonomies.saveError);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(translations.admin.portfolioTaxonomies.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isEditing
            ? translations.admin.portfolioTaxonomies.editCategory
            : translations.admin.portfolioTaxonomies.addCategory}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div>
            <Label htmlFor="name">{translations.admin.portfolioTaxonomies.nameLabel}</Label>
            <Input
              id="name"
              {...register('name', { required: translations.admin.portfolioForm.validationRequired })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">{translations.admin.portfolioTaxonomies.descriptionLabel}</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {translations.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {translations.common.loading}
                </>
              ) : (
                translations.common.save
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
