'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { translations } from '@/app/translations';
import { generateSlug } from '@/lib/utils';
import HtmlEditor from '@/components/core/HtmlEditor';
import ImageUploader from '@/components/core/ImageUploader';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { PostStatus, Role, Category } from '@prisma/client';
import { toast } from 'sonner';

// Tipos para el formulario
interface PostAuthor {
  id: string;
  name: string | null;
}

interface PostCategory {
  id: string;
  name: string;
  slug: string;
}

interface ExistingPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  author: PostAuthor | null;
  categories: PostCategory[];
  coverImage?: string | null;
  excerpt?: string;
  featured: boolean;
  authorDisplayName?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tipo para el formulario - usando el mismo esquema que el formulario de portfolio
interface BlogPostFormData {
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  categories: string[]; // Lista de IDs de categorías
  coverImage?: string | null;
  excerpt?: string;
  featured: boolean;
  authorDisplayName?: string | null;
}

const AdminEditBlogPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [contentValue, setContentValue] = useState('');
  const [originalPostData, setOriginalPostData] = useState<ExistingPostData | null>(null);

  // Configurar formulario
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BlogPostFormData>({
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      status: PostStatus.DRAFT,
      categories: [],
      coverImage: null,
      excerpt: '',
      featured: false,
      authorDisplayName: '',
    },
  });

  // Fetcher genérico para SWR
  const fetcher = (url: string) => fetch(url).then(res => {
      if (!res.ok) throw new Error('Error al cargar datos');
      return res.json();
  });

  // Cargar post y categorías con SWR
  const { data: post, error: postError } = useSWR<ExistingPostData>(
    `/api/blog/${postId}`,
    fetcher
  );
  
  const { data: categories, error: categoriesError, isLoading: isLoadingCategories } = useSWR<Category[]>(
    '/api/blog/categories',
    fetcher
  );

  // Inicializar formulario cuando los datos estén disponibles
  useEffect(() => {
    if (post) {
      setOriginalPostData(post);
      setContentValue(post.content);

      reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        status: post.status,
        categories: post.categories.map(cat => cat.id),
        coverImage: post.coverImage || '',
        excerpt: post.excerpt || '',
        featured: post.featured,
        authorDisplayName: post.authorDisplayName || '',
      });
    }
  }, [post, reset]);

  // Generar slug si el título cambia y el slug no ha sido modificado manualmente
  const watchedTitle = watch('title');
  const currentSlug = watch('slug');
  
  useEffect(() => {
    if (watchedTitle && originalPostData && currentSlug === generateSlug(originalPostData.title)) {
      setValue('slug', generateSlug(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, setValue, originalPostData, currentSlug]);

  // Verificar permisos
  const canEditPost = hasPermission(session?.user?.role, 'edit_post');
  const canPublish = hasPermission(session?.user?.role, 'publish_post');

  // Lógica específica: ¿puede editar ESTE post?
  const isAuthor = originalPostData?.author?.id === session?.user?.id;
  const canEditAny = hasPermission(session?.user?.role, 'edit_any_post');
  const canEditThisPost = isAuthor || canEditAny;

  // Manejar envío del formulario - similar al portfolio
  const onSubmit: SubmitHandler<BlogPostFormData> = async (data) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md mx-auto">
        <h3 className="font-medium text-lg mb-2">Confirmar cambios</h3>
        <p className="mb-4">¿Estás seguro de que deseas guardar los cambios en este post?</p>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toast.dismiss(t)} 
            className="px-3"
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={async () => {
              toast.dismiss(t);
              
              if (!canEditThisPost) {
                toast.error(translations.errorPages.accessDeniedDescription);
                return;
              }
              
              setIsLoading(true);
              
              try {
                // Actualizar contenido desde el editor
                const payload = {
                  ...data,
                  content: contentValue,
                };

                // Si el usuario no puede publicar, mantener el estado original
                if (payload.status === 'PUBLISHED' && !canPublish && originalPostData?.status !== 'PUBLISHED') {
                  payload.status = originalPostData?.status || 'DRAFT';
                }

                console.log("Enviando datos a la API:", payload);
                
                const response = await fetch(`/api/blog/${postId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });

                if (response.ok) {
                  toast.success(translations.notifications.updateSuccess || 'Post actualizado correctamente');
                  router.push('/admin/blog');
                } else {
                  const errorData = await response.json();
                  toast.error(errorData.message || 'Error al actualizar el post');
                }
              } catch (error) {
                console.error('Error updating post:', error);
                toast.error('Error al actualizar el post');
              } finally {
                setIsLoading(false);
              }
            }}
            className="px-3"
          >
            Guardar
          </Button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  // Mostrar error si no se puede cargar el post
  if (postError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error al cargar el post. Por favor, inténtalo de nuevo.
        </div>
        <Button className="mt-4" onClick={() => router.push('/admin/blog')}>
          {translations.common.back}
        </Button>
      </div>
    );
  }

  // Mostrar carga mientras se obtienen los datos
  if (!post) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">{translations.common.loading}</p>
      </div>
    );
  }

  // Redireccionar si no tiene permisos
  if (!canEditPost || !canEditThisPost) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {translations.errorPages.accessDeniedDescription}
        </div>
        <Button className="mt-4" onClick={() => router.push('/admin/blog')}>
          {translations.common.back}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Post: {post.title}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Título */}
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                {...register('title', { required: 'El título es obligatorio' })}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                {...register('slug', { 
                  required: 'El slug es obligatorio',
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
              <p className="text-xs text-muted-foreground mt-1">Ajusta con cuidado si el post ya está publicado.</p>
            </div>

            {/* Imagen de Portada */}
            <div>
              <Label>Imagen de Portada</Label>
              <Controller
                name="coverImage"
                control={control}
                render={({ field }) => (
                  <ImageUploader
                    onChange={(url: string) => field.onChange(url)}
                    value={field.value || undefined}
                  />
                )}
              />
            </div>

            {/* Contenido */}
            <div>
              <Label htmlFor="content">Contenido</Label>
               <HtmlEditor
                  value={contentValue}
                  onChange={setContentValue}
                />
            </div>

             {/* Extracto */}
             <div>
              <Label htmlFor="excerpt">Extracto (Opcional)</Label>
              <Textarea
                id="excerpt"
                {...register('excerpt')}
                rows={3}
                placeholder="Un resumen corto del post..."
              />
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="status">Estado</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // Usar value en lugar de defaultValue para controlar
                    disabled={!canPublish && field.value === PostStatus.PUBLISHED}
                  >
                    <SelectTrigger id="status">
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
               {!canPublish && <p className="text-xs text-muted-foreground mt-1">No tienes permiso para publicar directamente.</p>}
            </div>

            {/* Categoría - ACTUALIZADO PARA CATEGORÍA ÚNICA */}
            <div>
              <Label>Categoría</Label>
              {/* Lógica mejorada para mostrar estado de carga/error/vacío */}
              {isLoadingCategories ? (
                <p className="text-sm text-muted-foreground mt-1">{translations.common.loading}...</p>
              ) : categoriesError ? (
                <p className="text-sm text-red-500 mt-1">Error al cargar categorías.</p>
              ) : categories && categories.length > 0 ? (
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
              ) : (
                 <p className="text-xs text-muted-foreground mt-1">No hay categorías disponibles. Créalas <Link href="/admin/blog/taxonomies" className="underline">aquí</Link>.</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Ahora puedes seleccionar una sola categoría para cada post.</p>
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
              <Label htmlFor="featured">Marcar como destacado</Label>
            </div>

             {/* Pseudónimo Autor (Opcional) */}
             <div>
              <Label htmlFor="authorDisplayName">Mostrar nombre de autor como (Opcional)</Label>
              <Input
                id="authorDisplayName"
                {...register('authorDisplayName')}
                placeholder={originalPostData?.author?.name || 'Nombre de usuario'}
              />
              <p className="text-xs text-muted-foreground mt-1">Si se deja vacío, se usará el nombre de usuario real ({originalPostData?.author?.name || 'desconocido'}).</p>
            </div>

            {/* Mensaje de Error si existe */}
            {errors.root?.message && <p className="text-red-500 text-sm mt-4">{errors.root?.message}</p>}

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
             <Link href="/admin/blog" passHref>
                <Button type="button" variant="outline" disabled={isLoading}>
                 {translations.common.cancel}
                </Button>
             </Link>
            <Button type="submit" disabled={isLoading || !canEditThisPost}>
              {isLoading ? translations.common.loading : translations.common.save}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminEditBlogPage;
