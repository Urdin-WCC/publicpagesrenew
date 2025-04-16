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
import HtmlEditor from '@/components/core/HtmlEditor'; // Asumiendo componente
import ImageUploader from '@/components/core/ImageUploader'; // Asumiendo componente
import { PostStatus } from '@prisma/client';
import type { TaxonomyItem } from '@/app/(admin)/admin/blog/taxonomies/page'; // Reutilizar tipo

// Interfaz para los datos del formulario
interface PostFormData {
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  categoryIds: string[];
  tagIds: string[];
  coverImage?: string | null;
  excerpt?: string | null;
  featured?: boolean;
  authorDisplayName?: string | null; // Opcional: Pseudónimo
}

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Error al cargar datos');
    return res.json();
});

const NewPostPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar categorías y etiquetas para los selectores
  const { data: categories, error: categoriesError } = useSWR<TaxonomyItem[]>('/api/blog/categories', fetcher);
  const { data: tags, error: tagsError } = useSWR<TaxonomyItem[]>('/api/blog/tags', fetcher);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    defaultValues: {
      status: PostStatus.DRAFT, // Por defecto es borrador
      categoryIds: [],
      tagIds: [],
      featured: false,
      content: '', // Inicializar editor vacío
    },
  });

  // Observar título para generar slug automáticamente
  const titleValue = watch('title');
  const slugValue = watch('slug');

  const generateAndSetSlug = useCallback(() => {
    if (titleValue && !slugValue) { // Solo generar si hay título y el slug está vacío
      setValue('slug', generateSlug(titleValue), { shouldValidate: true });
    }
  }, [titleValue, slugValue, setValue]);

  // Permisos
  const canCreate = hasPermission(session?.user?.role, 'create_post');
  const canPublish = hasPermission(session?.user?.role, 'publish_post');

  const onSubmit: SubmitHandler<PostFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || translations.admin.blogList.createError);
      }

      const newPost = await response.json();
      toast.success(`Post "${newPost.title}" creado correctamente.`);
      router.push('/admin/blog'); // Redirigir a la lista de posts

    } catch (err: any) {
      console.error('Error creating post:', err);
      toast.error(err.message || translations.admin.blogList.createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionStatus === 'loading') return <p>{translations.common.loading}...</p>;
  if (!canCreate) return <p className="text-red-500 p-4">{translations.auth.unauthorized}</p>;
  if (categoriesError || tagsError) return <p className="text-red-500 p-4">Error al cargar categorías o etiquetas.</p>;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nuevo Post</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Título */}
            <div>
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register('title', { required: 'El título es obligatorio' })} onBlur={generateAndSetSlug} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" {...register('slug', { required: 'El slug es obligatorio' })} />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">Se genera automáticamente a partir del título si se deja vacío. Debe ser único.</p>
            </div>

            {/* Contenido */}
            <div>
              <Label htmlFor="content">Contenido</Label>
              <Controller
                name="content"
                control={control}
                rules={{ required: 'El contenido no puede estar vacío' }}
                render={({ field }) => <HtmlEditor value={field.value} onChange={field.onChange} />}
              />
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
            </div>

            {/* Extracto */}
            <div>
              <Label htmlFor="excerpt">Extracto (Opcional)</Label>
              <Textarea id="excerpt" {...register('excerpt')} rows={3} />
              <p className="text-xs text-muted-foreground mt-1">Resumen corto que puede mostrarse en listados.</p>
            </div>

             {/* Imagen de Portada */}
             <div>
                <Label htmlFor="coverImage">Imagen de Portada (Opcional)</Label>
                <Controller
                    name="coverImage"
                    control={control}
                    render={({ field }) => (
                        <ImageUploader
                            onChange={(url: string) => field.onChange(url)} // Asume que devuelve la URL
                            value={field.value}
                            buttonText="Seleccionar o subir imagen"
                        />
                    )}
                />
                {/* No hay error de 'required' aquí */}
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="status">Estado</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PostStatus.DRAFT}>Borrador</SelectItem>
                      {canPublish && <SelectItem value={PostStatus.PUBLISHED}>Publicado</SelectItem>}
                      <SelectItem value={PostStatus.ARCHIVED}>Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
               <p className="text-xs text-muted-foreground mt-1">
                {canPublish ? 'Selecciona el estado del post.' : 'Solo puedes guardar como Borrador o Archivado.'}
               </p>
            </div>

            {/* Categorías */}
            <div>
                <Label>Categorías</Label>
                <Controller
                    name="categoryIds"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-2 rounded-md max-h-40 overflow-y-auto">
                            {categories?.map(cat => (
                                <div key={cat.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`cat-${cat.id}`}
                                        checked={field.value?.includes(cat.id)}
                                        onCheckedChange={(checked) => {
                                            const newValue = checked
                                                ? [...(field.value || []), cat.id]
                                                : (field.value || []).filter(id => id !== cat.id);
                                            field.onChange(newValue);
                                        }}
                                    />
                                    <Label htmlFor={`cat-${cat.id}`} className="font-normal">{cat.name}</Label>
                                </div>
                            ))}
                        </div>
                    )}
                />
                 {categories?.length === 0 && <p className="text-xs text-muted-foreground mt-1">No hay categorías disponibles. Créalas <Link href="/admin/blog/taxonomies" className="underline">aquí</Link>.</p>}
            </div>

             {/* Etiquetas */}
             <div>
                <Label>Etiquetas</Label>
                 <Controller
                    name="tagIds"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-2 rounded-md max-h-40 overflow-y-auto">
                            {tags?.map(tag => (
                                <div key={tag.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`tag-${tag.id}`}
                                        checked={field.value?.includes(tag.id)}
                                        onCheckedChange={(checked) => {
                                            const newValue = checked
                                                ? [...(field.value || []), tag.id]
                                                : (field.value || []).filter(id => id !== tag.id);
                                            field.onChange(newValue);
                                        }}
                                    />
                                    <Label htmlFor={`tag-${tag.id}`} className="font-normal">{tag.name}</Label>
                                </div>
                            ))}
                        </div>
                    )}
                />
                 {tags?.length === 0 && <p className="text-xs text-muted-foreground mt-1">No hay etiquetas disponibles. Créalas <Link href="/admin/blog/taxonomies" className="underline">aquí</Link>.</p>}
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
              <Label htmlFor="featured" className="font-normal">Marcar como destacado</Label>
            </div>

             {/* Pseudónimo Autor (Opcional) */}
             <div>
              <Label htmlFor="authorDisplayName">Mostrar nombre de autor como (Opcional)</Label>
              <Input id="authorDisplayName" {...register('authorDisplayName')} placeholder={session?.user?.name || 'Nombre de usuario actual'} />
              <p className="text-xs text-muted-foreground mt-1">Si se deja vacío, se usará el nombre de usuario.</p>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? translations.common.loading : 'Crear Post'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewPostPage;