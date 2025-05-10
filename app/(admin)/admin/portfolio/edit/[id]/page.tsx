'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Role } from "@/lib/auth-client";

// Custom types for ProjectStatus and ProjectDisplayType since they might not be exported from Prisma
type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type ProjectDisplayType = 'SINGLE' | 'GALLERY' | 'SLIDER' | 'GRID';

// Tipo para categorías
type Category = {
  id: string;
  name: string;
  slug: string;
};

// Tipo para el proyecto
type Project = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  additionalImageUrls: string[];
  displayType: ProjectDisplayType;
  status: ProjectStatus;
  featured: boolean;
  authorDisplayName: string | null;
  authorId: string | null;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
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

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [contentValue, setContentValue] = useState('');
  const [originalProjectData, setOriginalProjectData] = useState<Project | null>(null);

  // Obtener datos del proyecto
  const { data: project, error: projectError } = useSWR<Project>(
    `/api/portfolio/${id}`,
    fetcher
  );

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
    reset,
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

  // Cargar datos del proyecto cuando estén disponibles
  useEffect(() => {
    if (project) {
      setOriginalProjectData(project);
      setContentValue(project.content);
      setAdditionalImages(project.additionalImageUrls || []);

      reset({
        title: project.title,
        slug: project.slug,
        content: project.content,
        excerpt: project.excerpt || '',
        coverImage: project.coverImage || '',
        additionalImageUrls: project.additionalImageUrls || [],
        displayType: project.displayType,
        status: project.status,
        featured: project.featured,
        authorDisplayName: project.authorDisplayName || '',
        categories: project.categories.map((cat) => cat.id),
      });
    }
  }, [project, reset]);

  // Observar título y slug para generar slug automáticamente si es necesario
  const watchedTitle = watch('title');
  const currentSlug = watch('slug');

  // Generar slug si el título cambia y el slug no ha sido modificado manualmente
  useEffect(() => {
    if (watchedTitle && originalProjectData && currentSlug === generateSlug(originalProjectData.title)) {
      setValue('slug', generateSlug(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, setValue, originalProjectData, currentSlug]);

  // Verificar permisos
  const canEditProject = hasPermission(session?.user?.role, 'edit_post'); // Reutilizamos el permiso de posts
  const canPublish = hasPermission(session?.user?.role, 'publish_post');

  // Verificar si el usuario puede editar este proyecto específico
  const isAuthor = originalProjectData?.authorId === session?.user?.id;
  const canEditAny = hasPermission(session?.user?.role, 'edit_any_post'); // Reutilizamos el permiso de posts
  const canEditThisProject = isAuthor || canEditAny;

  // Manejar envío del formulario
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!canEditProject || !canEditThisProject) {
      toast.error(translations.errorPages.accessDeniedDescription);
      return;
    }

    setIsSubmitting(true);

    try {
      // Actualizar contenido desde el editor
      data.content = contentValue;

      // Asignar imágenes adicionales
      data.additionalImageUrls = additionalImages;

      // Si el usuario no puede publicar, mantener el estado original si era PUBLISHED
      if (data.status === 'PUBLISHED' && !canPublish && originalProjectData?.status !== 'PUBLISHED') {
        data.status = originalProjectData?.status || 'DRAFT';
      }

      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(translations.admin.portfolioForm.saveSuccess);
        router.push('/admin/portfolio');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || translations.admin.portfolioForm.saveError);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      console.log('Form data being submitted:', data); // Añadir log de datos de formulario
      toast.error(translations.admin.portfolioForm.saveError);
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

  // Mostrar error si no se puede cargar el proyecto
  if (projectError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error al cargar el proyecto. Por favor, inténtalo de nuevo.
        </div>
        <Button className="mt-4" onClick={() => router.push('/admin/portfolio')}>
          {translations.common.back}
        </Button>
      </div>
    );
  }

  // Mostrar carga mientras se obtienen los datos
  if (!project) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">{translations.common.loading}</p>
      </div>
    );
  }

  // Redireccionar si no tiene permisos
  if (!canEditProject || !canEditThisProject) {
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
          <CardTitle>{translations.admin.portfolioForm.editTitle}: {project.title}</CardTitle>
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
                {...register('slug', { required: translations.admin.portfolioForm.validationRequired })}
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
              <HtmlEditor
                value={contentValue}
                onChange={setContentValue}
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

            {/* Categoría - ACTUALIZADO PARA CATEGORÍA ÚNICA */}
            <div>
              <Label>{translations.admin.portfolioForm.categoriesLabel}</Label>
              <div className="flex justify-between items-center mb-2">
                <span>Categoría</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/admin/blog/taxonomies', '_blank')}
                >
                  {'Gestionar categorías'}
                </Button>
              </div>

              {categoriesError ? (
                <p className="text-red-500 text-sm">Error al cargar categorías</p>
              ) : !categories ? (
                <p className="text-sm text-muted-foreground">{translations.common.loading}</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay categorías disponibles. <Link href="/admin/blog/taxonomies" className="underline">Crea algunas categorías</Link> primero.
                </p>
              ) : (
                <Controller
                  name="categories" /* Mantener el nombre "categories" para compatibilidad con API */
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        // Cuando selecciona una categoría, lo convertimos a array con un elemento
                        // Si es "none", lo convertimos a array vacío
                        field.onChange(value !== "none" ? [value] : []);
                      }}
                      value={field.value?.length > 0 ? field.value[0] : "none"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin categoría</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              <p className="text-xs text-muted-foreground mt-1">Ahora puedes seleccionar una sola categoría para cada proyecto.</p>
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
                    disabled={
                      field.value === 'PUBLISHED' &&
                      !canPublish &&
                      originalProjectData?.status !== 'PUBLISHED'
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={translations.admin.portfolioForm.statusLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">{translations.admin.portfolioForm.statusDraft}</SelectItem>
                      {(canPublish || originalProjectData?.status === 'PUBLISHED') && (
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
