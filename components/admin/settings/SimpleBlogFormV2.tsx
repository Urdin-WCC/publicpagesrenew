"use client";

import React, { useEffect, useState } from "react";
import { fetchBlogConfig, saveBlogConfig, BlogConfig } from "@/actions/blog-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Componente extremadamente simplificado para evitar cualquier problema de rendimiento
export default function SimpleBlogFormV2() {
  // Un solo estado para la configuración actual
  const [config, setConfig] = useState<BlogConfig>({
    postsPerPage: 10,
    allowComments: false,
    showAuthorName: true,
    showPublishDate: true,
    relatedPostsEnabled: true,
    relatedPostsCount: 3,
    listDisplayMode: 'grid',
    showSidebarInList: true,
    showSidebarInPost: true
  });
  
  // Estado para seguimiento de carga y guardado
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const data = await fetchBlogConfig();
        if (isMounted && data) {
          setConfig(data);
        }
      } catch (err) {
        console.error("Error cargando configuración:", err);
        if (isMounted) {
          toast.error("Error al cargar la configuración");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    
    // Limpieza para prevenir updates en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, []);

  // Manejar cambios en campos numéricos
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue)) {
      setConfig(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  // Manejar cambios en checkboxes
  const handleCheckboxChange = (name: keyof BlogConfig, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Manejar cambios en radio buttons
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    try {
      const result = await saveBlogConfig(config);
      
      if (result.success) {
        toast.success(result.message || "Configuración guardada correctamente");
      } else {
        toast.error(result.message || "Error al guardar");
      }
    } catch (err) {
      console.error("Error guardando configuración:", err);
      toast.error("Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Blog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-medium mb-2">Configuración General</h3>
          
          {/* Posts por página */}
          <div className="space-y-2">
            <Label htmlFor="postsPerPage">Posts por página</Label>
            <Input
              id="postsPerPage"
              name="postsPerPage"
              type="number"
              value={config.postsPerPage}
              onChange={handleNumberChange}
              min={1}
              max={50}
              className="w-24"
            />
          </div>
          
          {/* Permitir Comentarios */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowComments"
              checked={config.allowComments}
              onCheckedChange={(checked) => 
                handleCheckboxChange('allowComments', checked === true)
              }
            />
            <Label htmlFor="allowComments">Permitir Comentarios</Label>
          </div>

          {/* Mostrar Nombre Autor */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showAuthorName"
              checked={config.showAuthorName}
              onCheckedChange={(checked) => 
                handleCheckboxChange('showAuthorName', checked === true)
              }
            />
            <Label htmlFor="showAuthorName">Mostrar nombre del autor</Label>
          </div>

          {/* Mostrar Fecha Publicación */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showPublishDate"
              checked={config.showPublishDate}
              onCheckedChange={(checked) => 
                handleCheckboxChange('showPublishDate', checked === true)
              }
            />
            <Label htmlFor="showPublishDate">Mostrar fecha de publicación</Label>
          </div>

          {/* Habilitar Posts Relacionados */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="relatedPostsEnabled"
              checked={config.relatedPostsEnabled}
              onCheckedChange={(checked) => 
                handleCheckboxChange('relatedPostsEnabled', checked === true)
              }
            />
            <Label htmlFor="relatedPostsEnabled">Mostrar posts relacionados</Label>
          </div>

          {/* Número de Posts Relacionados */}
          <div className="space-y-2">
            <Label htmlFor="relatedPostsCount">Número de posts relacionados</Label>
            <Input
              id="relatedPostsCount"
              name="relatedPostsCount"
              type="number"
              value={config.relatedPostsCount}
              onChange={handleNumberChange}
              min={0}
              max={10}
              className="w-24"
            />
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
                  id="grid"
                  name="listDisplayMode"
                  value="grid"
                  checked={config.listDisplayMode === 'grid'}
                  onChange={handleRadioChange}
                />
                <Label htmlFor="grid">Cuadrícula</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="list"
                  name="listDisplayMode"
                  value="list"
                  checked={config.listDisplayMode === 'list'}
                  onChange={handleRadioChange}
                />
                <Label htmlFor="list">Lista</Label>
              </div>
            </div>
          </div>

          {/* Mostrar barra lateral en listado */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSidebarInList"
              checked={config.showSidebarInList}
              onCheckedChange={(checked) => 
                handleCheckboxChange('showSidebarInList', checked === true)
              }
            />
            <Label htmlFor="showSidebarInList">
              Mostrar barra lateral en el listado
            </Label>
          </div>

          {/* Mostrar barra lateral en post individual */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSidebarInPost"
              checked={config.showSidebarInPost}
              onCheckedChange={(checked) => 
                handleCheckboxChange('showSidebarInPost', checked === true)
              }
            />
            <Label htmlFor="showSidebarInPost">
              Mostrar barra lateral en el post individual
            </Label>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSaving}
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
