'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'; // Usar Switch para booleanos
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { translations } from '@/app/translations';
import { toast } from 'sonner';

// Importar la interfaz BlogConfig desde config-server.ts
import { BlogConfig } from '@/lib/config-server';

// Usar la interfaz importada para el formulario
type BlogConfigFormData = BlogConfig;

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar la configuración');
    }
    return res.json();
});

const AdminBlogSettingsPage: React.FC = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar configuración actual
  const { data: blogConfig, error, isLoading, mutate } = useSWR<BlogConfigFormData>('/api/settings/blog', fetcher, {
      revalidateOnFocus: false, // Evitar recargar al cambiar de pestaña
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty }, // isDirty para saber si hay cambios
  } = useForm<BlogConfigFormData>();

  // Resetear el formulario cuando la configuración se carga
  useEffect(() => {
    if (blogConfig) {
      reset(blogConfig);
    }
  }, [blogConfig, reset]);

  // Verificar permisos (ADMIN+)
  const canManageSettings = hasPermission(session?.user?.role, 'manage_settings');

  const onSubmit: SubmitHandler<BlogConfigFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/settings/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || translations.notifications.saveError);
      }

      const updatedConfig = await response.json();
      mutate(updatedConfig, false); // Actualizar caché SWR sin revalidar
      reset(updatedConfig); // Resetear form para quitar 'isDirty'
      toast.success(translations.notifications.saveSuccess);

    } catch (err: any) {
      console.error('Error saving blog settings:', err);
      toast.error(err.message || translations.notifications.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionStatus === 'loading' || isLoading) {
    return <p>{translations.common.loading}...</p>;
  }

  if (!canManageSettings) {
    return <p className="text-red-500 p-4">{translations.auth.unauthorized}</p>;
  }

  if (error) {
      return <p className="text-red-500 p-4">Error al cargar la configuración: {error.message}</p>
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Blog</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Posts por página */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="postsPerPage">Posts por página (Sitio público)</Label>
              <Input
                id="postsPerPage"
                type="number"
                min="1"
                {...register('postsPerPage', {
                    required: 'Campo obligatorio',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Debe ser al menos 1' }
                })}
                className={`w-24 ${errors.postsPerPage ? 'border-red-500' : ''}`}
              />
              {errors.postsPerPage && <p className="text-red-500 text-xs mt-1">{errors.postsPerPage.message}</p>}
            </div>

            {/* Permitir Comentarios */}
            <div className="flex items-center space-x-2">
               <Controller
                  name="allowComments"
                  control={control}
                  render={({ field }) => (
                     <Switch
                        id="allowComments"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                  )}
                />
              <Label htmlFor="allowComments">Permitir Comentarios (funcionalidad futura)</Label>
            </div>

             {/* Mostrar Nombre Autor */}
            <div className="flex items-center space-x-2">
               <Controller
                  name="showAuthorName"
                  control={control}
                  render={({ field }) => (
                     <Switch
                        id="showAuthorName"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                  )}
                />
              <Label htmlFor="showAuthorName">Mostrar nombre del autor en posts</Label>
            </div>

             {/* Mostrar Fecha Publicación */}
            <div className="flex items-center space-x-2">
               <Controller
                  name="showPublishDate"
                  control={control}
                  render={({ field }) => (
                     <Switch
                        id="showPublishDate"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                  )}
                />
              <Label htmlFor="showPublishDate">Mostrar fecha de publicación en posts</Label>
            </div>

             {/* Habilitar Posts Relacionados */}
            <div className="flex items-center space-x-2">
               <Controller
                  name="relatedPostsEnabled"
                  control={control}
                  render={({ field }) => (
                     <Switch
                        id="relatedPostsEnabled"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                  )}
                />
              <Label htmlFor="relatedPostsEnabled">Mostrar sección de posts relacionados</Label>
            </div>

             {/* Número de Posts Relacionados */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="relatedPostsCount">Número de posts relacionados a mostrar</Label>
              <Input
                id="relatedPostsCount"
                type="number"
                min="0"
                 {...register('relatedPostsCount', {
                    required: 'Campo obligatorio',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Debe ser 0 o más' }
                })}
                className={`w-24 ${errors.relatedPostsCount ? 'border-red-500' : ''}`}
              />
               {errors.relatedPostsCount && <p className="text-red-500 text-xs mt-1">{errors.relatedPostsCount.message}</p>}
            </div>

            {/* Separador */}
            <div className="border-t my-4"></div>
            <h3 className="text-lg font-medium mb-2">Opciones de visualización</h3>

            {/* Modo de visualización del listado */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="listDisplayMode">Modo de visualización del listado de posts</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="listDisplayMode-grid"
                    value="grid"
                    {...register('listDisplayMode')}
                  />
                  <Label htmlFor="listDisplayMode-grid">Cuadrícula</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="listDisplayMode-list"
                    value="list"
                    {...register('listDisplayMode')}
                  />
                  <Label htmlFor="listDisplayMode-list">Lista</Label>
                </div>
              </div>
            </div>

            {/* Mostrar barra lateral en listado */}
            <div className="flex items-center space-x-2">
               <Controller
                  name="showSidebarInList"
                  control={control}
                  render={({ field }) => (
                     <Switch
                        id="showSidebarInList"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                  )}
                />
              <Label htmlFor="showSidebarInList">Mostrar barra lateral en el listado de posts</Label>
            </div>

            {/* Mostrar barra lateral en post individual */}
            <div className="flex items-center space-x-2">
               <Controller
                  name="showSidebarInPost"
                  control={control}
                  render={({ field }) => (
                     <Switch
                        id="showSidebarInPost"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                  )}
                />
              <Label htmlFor="showSidebarInPost">Mostrar barra lateral en el post individual</Label>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? translations.common.loading : translations.common.save}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminBlogSettingsPage;