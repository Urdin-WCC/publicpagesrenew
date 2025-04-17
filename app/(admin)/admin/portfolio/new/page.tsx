'use client';

import React, { useState, useCallback } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { generateSlug } from '@/lib/utils';
import { translations } from '@/app/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import HtmlEditor from '@/components/core/HtmlEditor';
import ImageUploader from '@/components/core/ImageUploader';
import { ProjectStatus, ProjectDisplayType } from '@prisma/client';

// Tipo para categorías
type Category = {
  id: string;
  name: string;
  slug: string;
};

// Tipo para el formulario
interface FormValues {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  additionalImageUrls: string[];
  displayType: ProjectDisplayType;
  status: ProjectStatus;
  featured: boolean;
  authorDisplayName?: string;
  categories: string[];
}

// Función para obtener datos de la API
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // Obtener categorías del blog
  const { data: categories, error: categoriesError } = useSWR<Category[]>(
    '/api/blog/categories',
    fetcher
  );

  // Configurar formulario
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      coverImage: '',
      additionalImageUrls: [],
      displayType: 'GALLERY',
      status: 'DRAFT',
      featured: false,
      authorDisplayName: '',
      categories: [],
    },
  });

  // Observar título para generar slug automáticamente
  const titleValue = watch('title');
  const slugValue = watch('slug');

  // Función para generar y establecer el slug
  const generateAndSetSlug = useCallback(() => {
    if (titleValue && !slugValue) { // Solo generar si hay título y el slug está vacío
      setValue('slug', generateSlug(titleValue), { shouldValidate: true });
    }
  }, [titleValue, slugValue, setValue]);

  // Verificar permisos
  const canCreate = hasPermission(session?.user?.role, 'create_post'); // Reutilizamos el permiso de posts
  const canPublish = hasPermission(session?.user?.role, 'publish_post');

  // Manejar envío del formulario
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!canCreate) {
      toast.error(translations.errorPages.accessDeniedDescription);
      return;
    }

    setIsSubmitting(true);

    try {
      // Asignar imágenes adicionales
      data.additionalImageUrls = additionalImages;

      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || translations.admin.portfolioForm.saveError);
      }

      const newProject = await response.json();
      toast.success(`Proyecto "${newProject.title}" creado correctamente.`);
      router.push('/admin/portfolio');
    } catch (err: any) {
      console.error('Error creating project:', err);
      toast.error(err.message || translations.admin.portfolioForm.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar adición de imágenes adicionales
  const handleAddAdditionalImage = (url: string) => {
    setAdditionalImages((prev) => [...prev, url]);
  };

  // Manejar eliminación de imágenes adicionales
  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Redireccionar si no tiene permisos
  if (!canCreate) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {translations.errorPages.accessDeniedDescription}
        </div>
        <Button className="mt-4" onClick={() => router.push('/admin/portfolio')}>
          {translations.common.back}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{translations.admin.portfolioForm.createTitle}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Título */}
            <div>
              <Label htmlFor="title">{translations.admin.portfolioForm.titleLabel}</Label>
              <Input
                id="title"
                placeholder={translations.admin.portfolioForm.titlePlaceholder}
                {...register('title', { required: translations.admin.portfolioForm.validationRequired })}
                className={errors.title ? 'border-red-500' : ''}
                onBlur={generateAndSetSlug}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">{translations.admin.portfolioForm.slugLabel}</Label>
              <Input
                id="slug"
                placeholder={translations.admin.portfolioForm.slugPlaceholder}
                {...register('slug', {
                  required: translations.admin.portfolioForm.validationRequired,
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message: 'Slug inválido (solo letras minúsculas, números y guiones)'
                  }
                })}
                className={errors.slug ? 'border-red-500' : ''}
              />
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {translations.admin.portfolioForm.slugHelp}
              </p>
            </div>

            {/* Contenido */}
            <div>
              <Label htmlFor="content">{translations.admin.portfolioForm.contentLabel}</Label>
              <Controller
                name="content"
                control={control}
                rules={{ required: translations.admin.portfolioForm.validationRequired }}
                render={({ field }) => (
                  <HtmlEditor value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
              )}
            </div>

            {/* Extracto */}
            <div>
              <Label htmlFor="excerpt">{translations.admin.portfolioForm.excerptLabel}</Label>
              <Textarea
                id="excerpt"
                placeholder={translations.admin.portfolioForm.excerptPlaceholder}
                {...register('excerpt')}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {translations.admin.portfolioForm.excerptHelp}
              </p>
            </div>

            {/* Imagen de Portada */}
            <div>
              <Label htmlFor="coverImage">{translations.admin.portfolioForm.coverImageLabel}</Label>
              <Controller
                name="coverImage"
                control={control}
                render={({ field }) => (
                  <ImageUploader
                    value={field.value}
                    onChange={(url: string) => field.onChange(url)}
                  />
                )}
              />
            </div>

            {/* Imágenes Adicionales */}
            <div>
              <Label>{translations.admin.portfolioForm.additionalImagesLabel}</Label>
              <div className="mt-2">
                <ImageUploader
                  onChange={handleAddAdditionalImage}
                  label={translations.admin.portfolioForm.additionalImagesLabel}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {translations.admin.portfolioForm.additionalImagesHelp}
                </p>
              </div>
              {additionalImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {additionalImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Additional image ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        title={translations.common.delete}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tipo de Visualización */}
            <div>
              <Label htmlFor="displayType">{translations.admin.portfolioForm.displayTypeLabel}</Label>
              <Controller
                name="displayType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={translations.admin.portfolioForm.displayTypeLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">{translations.admin.portfolioForm.displayTypeSingle}</SelectItem>
                      <SelectItem value="GALLERY">{translations.admin.portfolioForm.displayTypeGallery}</SelectItem>
                      <SelectItem value="SLIDER">{translations.admin.portfolioForm.displayTypeSlider}</SelectItem>
                      <SelectItem value="GRID">{translations.admin.portfolioForm.displayTypeGrid}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Categorías */}
            <div>
              <Label>{translations.admin.portfolioForm.categoriesLabel}</Label>
              <div className="flex justify-between items-center mb-2">
                <span>{translations.admin.portfolioForm.categoriesLabel}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/admin/blog/categories', '_blank')}
                >
                  {'Gestionar categorías'}
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 border p-2 rounded-md max-h-40 overflow-y-auto">
                {categoriesError ? (
                  <p className="text-red-500 text-sm">Error al cargar categorías</p>
                ) : !categories ? (
                  <p className="text-sm text-muted-foreground">{translations.common.loading}</p>
                ) : (categories || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay categorías disponibles. <Link href="/admin/blog/categories" className="underline">Crea algunas categorías</Link> primero.
                  </p>
                ) : Array.isArray(categories) ? (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Controller
                        name="categories"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={field.value.includes(category.id)}
                            onCheckedChange={(checked) => {
                              const updatedCategories = checked
                                ? [...field.value, category.id]
                                : field.value.filter((id) => id !== category.id);
                              field.onChange(updatedCategories);
                            }}
                          />
                        )}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Error: Las categorías no son un array válido. Por favor, recarga la página.
                  </p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="status">{translations.admin.portfolioForm.statusLabel}</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={field.value === 'PUBLISHED' && !canPublish}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={translations.admin.portfolioForm.statusLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">{translations.admin.portfolioForm.statusDraft}</SelectItem>
                      {canPublish && (
                        <SelectItem value="PUBLISHED">{translations.admin.portfolioForm.statusPublished}</SelectItem>
                      )}
                      <SelectItem value="ARCHIVED">{translations.admin.portfolioForm.statusArchived}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Destacado */}
            <div className="flex items-center space-x-2">
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="featured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="featured" className="font-normal cursor-pointer">
                {translations.admin.portfolioForm.featuredLabel}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground -mt-4">
              {translations.admin.portfolioForm.featuredHelp}
            </p>

            {/* Nombre del Autor a Mostrar */}
            <div>
              <Label htmlFor="authorDisplayName">{translations.admin.portfolioForm.authorDisplayNameLabel}</Label>
              <Input
                id="authorDisplayName"
                placeholder={translations.admin.portfolioForm.authorDisplayNamePlaceholder}
                {...register('authorDisplayName')}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/portfolio')}
            >
              {translations.admin.portfolioForm.cancelButton}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {translations.common.loading}
                </>
              ) : (
                translations.admin.portfolioForm.saveButton
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
