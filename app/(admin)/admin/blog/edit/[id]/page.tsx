'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr'; // Importar useSWR
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
import { PostStatus, Role, Category, Tag } from '@prisma/client'; // Importar tipos reales
interface PostAuthor {
  id: string;
  name: string | null;
}
interface PostCategory {
  id: string;
  name: string;
}
interface PostTag {
  id: string;
  name: string;
}
interface ExistingPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  author: PostAuthor | null;
  categories: PostCategory[];
  tags: PostTag[];
  coverImage?: string | null;
  excerpt?: string;
  featured: boolean;
  authorDisplayName?: string | null; // Añadir campo faltante al tipo
  createdAt: string;
  updatedAt: string;
}
interface BlogPostFormData {
  title: string;
  slug: string;
  content: string; // Este campo no se usa directamente, se usa contentValue
  status: PostStatus;
  categoryIds: string[];
  tagIds: string[];
  coverImage?: string | null;
  excerpt?: string;
  featured: boolean;
  authorDisplayName?: string | null; // Añadir campo faltante al tipo del formulario
}

const AdminEditBlogPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string; // Obtener ID del post de la URL
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPost, setIsFetchingPost] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Quitar useState para categories y tags
  const [contentValue, setContentValue] = useState(''); // Estado para HtmlEditor
  const [originalPostData, setOriginalPostData] = useState<ExistingPostData | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset, // Para resetear el form con datos cargados
    formState: { errors },
  } = useForm<BlogPostFormData>({
    defaultValues: {
      title: '',
      slug: '',
      content: '', // No se usa directamente
      status: PostStatus.DRAFT,
      categoryIds: [],
      tagIds: [],
      coverImage: null,
      excerpt: '',
      featured: false,
      authorDisplayName: null, // Añadir valor por defecto
    },
  });

  // Fetcher genérico para SWR
  const fetcher = (url: string) => fetch(url).then(res => {
      if (!res.ok) throw new Error('Error al cargar datos');
      return res.json();
  });

  // Cargar categorías y etiquetas reales con SWR (fuera de fetchData)
  const { data: categories, error: categoriesError, isLoading: isLoadingCategories } = useSWR<Category[]>('/api/blog/categories', fetcher);
  const { data: tags, error: tagsError, isLoading: isLoadingTags } = useSWR<Tag[]>('/api/blog/tags', fetcher);


  // Cargar datos del post
  const fetchData = useCallback(async () => {
    if (!postId) return;
    setIsFetchingPost(true);
    setError(null);
    try {
      // Cargar post
      const postRes = await fetch(`/api/blog/${postId}`);
      if (!postRes.ok) {
        if (postRes.status === 404) throw new Error('Post no encontrado');
        if (postRes.status === 403) throw new Error(translations.auth.unauthorized);
        throw new Error('Error al cargar el post');
      }
      const postData: ExistingPostData = await postRes.json();
      setOriginalPostData(postData);

      // Poblar formulario
      reset({
        title: postData.title,
        slug: postData.slug,
        status: postData.status,
        categoryIds: postData.categories.map(cat => cat.id),
        tagIds: postData.tags.map(tag => tag.id),
        coverImage: postData.coverImage,
        excerpt: postData.excerpt || '',
        featured: postData.featured,
        authorDisplayName: postData.authorDisplayName, // Poblar pseudónimo
        content: '', // No poblar content directamente
      });
      setContentValue(postData.content); // Poblar estado del editor

      // Ya no se cargan taxonomías aquí

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetchingPost(false);
    }
  }, [postId, reset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const watchedTitle = watch('title');
  const currentSlug = watch('slug');

  // Generar slug si el título cambia y el slug no ha sido modificado manualmente
   useEffect(() => {
    if (watchedTitle && originalPostData && currentSlug === generateSlug(originalPostData.title)) {
      setValue('slug', generateSlug(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, setValue, originalPostData, currentSlug]);


  // Verificar permisos
  const canEditPost = hasPermission(session?.user?.role, 'edit_post'); // Permiso general
  // Lógica más específica: ¿puede editar ESTE post? (autor o rol superior)
  const roleHierarchyLevels: Record<Role, number> = { // Definir niveles localmente
      [Role.COLLABORATOR]: 1,
      [Role.EDITOR]: 2,
      [Role.ADMIN]: 3,
      [Role.MASTER]: 4,
  };
  const userLevel = session?.user?.role ? roleHierarchyLevels[session.user.role] : 0;
  const editorLevel = roleHierarchyLevels[Role.EDITOR];

  const canEditThisPost = canEditPost && (
    session?.user?.id === originalPostData?.author?.id ||
    hasPermission(session?.user?.role, 'edit_any_post') // Asumiendo un permiso más granular
    || userLevel >= editorLevel // Comprobar si el nivel es EDITOR o superior
  );
  const canPublish = hasPermission(session?.user?.role, 'publish_post');

  const onSubmit: SubmitHandler<BlogPostFormData> = async (data) => {
     if (!canEditThisPost) {
      setError(translations.auth.unauthorized);
      return;
    }
     // Asegurarse de que un colaborador no pueda publicar directamente
    if (!canPublish && data.status === PostStatus.PUBLISHED) {
        data.status = originalPostData?.status ?? PostStatus.DRAFT; // Revertir al estado original si no puede publicar
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, content: contentValue }), // Enviar contenido del editor
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || translations.notifications.updateError || 'Error al actualizar el post');
      }

      alert(translations.notifications.updateSuccess);
      router.push('/admin/blog'); // Redirigir a la lista
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingPost) return <p>{translations.common.loading}...</p>;
  if (error && (error === 'Post no encontrado' || error === translations.auth.unauthorized)) {
      return <p className="text-red-500">{error}</p>;
  }
  if (!originalPostData) return <p>Error al cargar datos del post.</p>; // Estado inesperado

   // Renderizar solo si tiene permiso para editar este post específico
   if (!canEditThisPost && !isFetchingPost) {
     return <p className="text-red-500">{translations.auth.unauthorized}</p>;
   }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Post: {originalPostData.title}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Título */}
            <div>
              <Label htmlFor="title">{translations.admin.blogList.tableTitle}</Label>
              <Input
                id="title"
                {...register('title', { required: 'El título es obligatorio' })}
                className={errors.title ? 'border-red-500' : ''}
              />
              {/* Mensaje si SWR aún no ha cargado las categorías */}
              {!categories && !categoriesError && <p className="text-xs text-muted-foreground mt-1">{translations.common.loading}...</p>}
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
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
                    message: 'Slug inválido (solo letras minúsculas, números y guiones)',
                  },
                })}
                 className={errors.slug ? 'border-red-500' : ''}
              />
               {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
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
                    value={field.value || undefined} // Usar 'value' en lugar de 'initialUrl'
                    buttonText="Cambiar o subir imagen" // Añadir texto botón
                  />
                )}
              />
              {/* Eliminar comentario erróneo de etiquetas aquí */}
            </div>

            {/* Contenido */}
            <div>
              <Label htmlFor="content">Contenido</Label>
               <HtmlEditor
                  value={contentValue}
                  onChange={setContentValue}
                />
               {/* TODO: Añadir validación para el contenido si es necesario */}
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
              <Label htmlFor="status">{translations.admin.blogList.tableStatus}</Label>
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
                      <SelectItem value={PostStatus.DRAFT}>{translations.admin.blogList.statusDraft}</SelectItem>
                      {canPublish && <SelectItem value={PostStatus.PUBLISHED}>{translations.admin.blogList.statusPublished}</SelectItem>}
                      <SelectItem value={PostStatus.ARCHIVED}>{translations.admin.blogList.statusArchived}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
               {!canPublish && <p className="text-xs text-muted-foreground mt-1">No tienes permiso para publicar directamente.</p>}
            </div>

            {/* Categorías */}
            <div>
              <Label>{translations.admin.blogList.tableCategories}</Label>
              {/* Lógica mejorada para mostrar estado de carga/error/vacío */}
              {isLoadingCategories ? (
                <p className="text-sm text-muted-foreground mt-1">{translations.common.loading}...</p>
              ) : categoriesError ? (
                <p className="text-sm text-red-500 mt-1">Error al cargar categorías.</p>
              ) : categories && categories.length > 0 ? (
                <Controller
                  name="categoryIds"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-2 rounded-md max-h-40 overflow-y-auto mt-1">
                      {categories.map((cat) => (
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
              ) : (
                 <p className="text-xs text-muted-foreground mt-1">No hay categorías disponibles. Créalas <Link href="/admin/blog/taxonomies" className="underline">aquí</Link>.</p>
              )}
            </div>



             {/* Etiquetas */}
            <div>
              <Label>{translations.admin.blogList.tableTags}</Label>
              {/* Lógica mejorada para mostrar estado de carga/error/vacío */}
              {isLoadingTags ? (
                 <p className="text-sm text-muted-foreground mt-1">{translations.common.loading}...</p>
              ) : tagsError ? (
                 <p className="text-sm text-red-500 mt-1">Error al cargar etiquetas.</p>
              ) : tags && tags.length > 0 ? (
                 <Controller
                    name="tagIds"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-2 rounded-md max-h-40 overflow-y-auto mt-1">
                            {tags.map(tag => (
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
               ) : (
                 <p className="text-xs text-muted-foreground mt-1">No hay etiquetas disponibles. Créalas <Link href="/admin/blog/taxonomies" className="underline">aquí</Link>.</p>
              )}
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

            {/* Mensaje de Error General del Fetch inicial */}
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

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