"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { fetchBlogConfig, saveBlogConfig, BlogConfig } from "@/actions/blog-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function BlogFormComplete() {
  // Estados
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // Inicializar formulario con valores predeterminados temporalmente
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isSubmitting, isDirty },
    reset
  } = useForm<BlogConfig>({
    defaultValues: {
      postsPerPage: 10,
      allowComments: false,
      showAuthorName: true,
      showPublishDate: true,
      relatedPostsEnabled: true,
      relatedPostsCount: 3,
      listDisplayMode: 'grid',
      showSidebarInList: true,
      showSidebarInPost: true,
      sidebarPositionInList: 'right',
      sidebarPositionInPost: 'right',
      showSharingInPost: true,
    }
  });
  
  // Cargar datos iniciales
  useEffect(() => {
    // Evitar cargar múltiples veces
    if (configLoaded) return;
    
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración del blog...");
        const blogConfig = await fetchBlogConfig();
        
        if (!blogConfig) {
          console.log("⚠️ No se pudo cargar la configuración");
          setIsInitialDataLoaded(true);
          setConfigLoaded(true);
          return;
        }
        
        console.log("📦 Configuración del blog cargada:", blogConfig);
        
        // Establecer los valores en el formulario
        reset(blogConfig);
        
        console.log("✅ Configuración cargada correctamente");
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      } catch (error) {
        console.error('Error loading blog config:', error);
        toast.error('Error al cargar la configuración del blog');
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      }
    };
    
    loadConfig();
  }, [reset, configLoaded]);

  // Enviar formulario  
  const onSubmit = async (data: BlogConfig) => {
    try {
      console.log("📝 Guardando configuración del blog:", data);
      
      const result = await saveBlogConfig(data);
      
      if (result.success) {
        console.log("✅ Configuración guardada correctamente");
        toast.success(result.message || "Configuración guardada correctamente");
      } else {
        console.error("❌ Error al guardar la configuración:", result.message);
        toast.error(result.message || "Error al guardar la configuración");
      }
    } catch (error) {
      console.error('Error saving blog config:', error);
      toast.error("Error al guardar la configuración del blog");
    }
  };

  if (!isInitialDataLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Blog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-medium mb-2">Configuración General</h3>
          
          {/* Posts por página */}
          <div className="space-y-2">
            <Label htmlFor="postsPerPage">Posts por página (Sitio público)</Label>
            <Input
              id="postsPerPage"
              type="number"
              min="1"
              max="50"
              {...register('postsPerPage', {
                required: 'Campo obligatorio',
                valueAsNumber: true,
                min: { value: 1, message: 'Debe ser al menos 1' },
                max: { value: 50, message: 'Máximo 50 posts por página' }
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
                <Checkbox
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
                <Checkbox
                  id="showAuthorName"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="showAuthorName">
              Mostrar nombre del autor en posts
              <span className="ml-2 text-xs text-gray-500">(si existe un pseudónimo se muestra el pseudónimo, si no, el nombre real)</span>
            </Label>
          </div>

          {/* Mostrar Fecha Publicación */}
          <div className="flex items-center space-x-2">
            <Controller
              name="showPublishDate"
              control={control}
              render={({ field }) => (
                <Checkbox
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
                <Checkbox
                  id="relatedPostsEnabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="relatedPostsEnabled">Mostrar sección de posts relacionados</Label>
          </div>

          {/* Número de Posts Relacionados */}
          <div className="space-y-2">
            <Label htmlFor="relatedPostsCount">Número de posts relacionados a mostrar</Label>
            <Input
              id="relatedPostsCount"
              type="number"
              min="0"
              max="10"
              {...register('relatedPostsCount', {
                required: 'Campo obligatorio',
                valueAsNumber: true,
                min: { value: 0, message: 'Debe ser 0 o más' },
                max: { value: 10, message: 'Máximo 10 posts relacionados' }
              })}
              className={`w-24 ${errors.relatedPostsCount ? 'border-red-500' : ''}`}
            />
            {errors.relatedPostsCount && <p className="text-red-500 text-xs mt-1">{errors.relatedPostsCount.message}</p>}
          </div>

          {/* Opciones de visualización */}
          <div className="border-t my-4"></div>
          <h3 className="text-lg font-medium mb-2">Opciones de visualización</h3>
          
          {/* Modo de visualización del listado */}
          <div className="space-y-2">
            <Label>Modo de visualización del listado de posts</Label>
            <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                    <input
                        type="radio"
                        id="displayMode-grid"
                        {...register('listDisplayMode')}
                        value="grid"
                    />
                    <Label htmlFor="displayMode-grid">Cuadrícula</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="radio"
                        id="displayMode-list"
                        {...register('listDisplayMode')}
                        value="list"
                    />
                    <Label htmlFor="displayMode-list">Lista</Label>
                </div>
            </div>
          </div>

          {/* Mostrar barra lateral en listado */}
          <div className="flex items-center space-x-2">
            <Controller
              name="showSidebarInList"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="showSidebarInList"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="showSidebarInList">
              Mostrar barra lateral en el listado de posts
            </Label>
            <Label className="ml-4">Posición:</Label>
            <select
              {...register("sidebarPositionInList")}
              className="border rounded px-2 py-1 ml-2"
              defaultValue="right"
            >
              <option value="right">Derecha</option>
              <option value="left">Izquierda</option>
            </select>
          </div>

          {/* Mostrar barra lateral en post individual */}
          <div className="flex items-center space-x-2">
            <Controller
              name="showSidebarInPost"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="showSidebarInPost"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="showSidebarInPost">
              Mostrar barra lateral en el post individual
            </Label>
            <Label className="ml-4">Posición:</Label>
            <select
              {...register("sidebarPositionInPost")}
              className="border rounded px-2 py-1 ml-2"
              defaultValue="right"
            >
              <option value="right">Derecha</option>
              <option value="left">Izquierda</option>
            </select>
          </div>

          {/* Mostrar botones de compartir en post individual */}
          <div className="flex items-center space-x-2">
            <Controller
              name="showSharingInPost"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="showSharingInPost"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="showSharingInPost">
              Mostrar botones de compartir en posts individuales
            </Label>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
