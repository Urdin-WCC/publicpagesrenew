"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { fetchPortfolioConfig, savePortfolioConfig, getDefaultPortfolioConfig, PortfolioConfig } from "@/actions/portfolio-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { translations } from "@/app/translations";

export default function PortfolioFormComplete() {
  // Estados
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // Inicializar formulario con valores predeterminados temporalmente
  const { 
    register, 
    handleSubmit, 
    setValue, 
    control,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm<PortfolioConfig>({
    defaultValues: {
      projectsPerPage: 12,
      defaultDisplayType: 'GRID',
      layoutMode: 'grid',
      showSidebarInList: true,
      showSidebarInProject: true,
      sidebarPositionInList: 'right',
      sidebarPositionInProject: 'right',
      showSharingInProject: true,
    }
  });
  
  // Cargar datos iniciales
  useEffect(() => {
    if (configLoaded) return;
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración de portfolio...");
        const portfolioConfig = await fetchPortfolioConfig();
        if (!portfolioConfig) {
          setIsInitialDataLoaded(true);
          setConfigLoaded(true);
          return;
        }

        setValue('projectsPerPage', portfolioConfig.projectsPerPage);
        setValue('defaultDisplayType', portfolioConfig.defaultDisplayType);
        setValue('layoutMode', portfolioConfig.layoutMode);
        setValue('showSidebarInList', portfolioConfig.showSidebarInList);
        setValue('showSidebarInProject', portfolioConfig.showSidebarInProject);
        setValue('sidebarPositionInList', portfolioConfig.sidebarPositionInList || 'right');
        setValue('sidebarPositionInProject', portfolioConfig.sidebarPositionInProject || 'right');
        setValue('showSharingInProject', typeof portfolioConfig.showSharingInProject === "boolean" ? portfolioConfig.showSharingInProject : true);

        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      } catch (error) {
        toast.error('Error al cargar la configuración del portfolio');
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      }
    };
    loadConfig();
  }, [setValue, configLoaded]);

  // Enviar formulario  
  const onSubmit = async (data: PortfolioConfig) => {
    try {
      const result = await savePortfolioConfig(data);
      if (result.success) {
        toast.success(result.message || "Configuración guardada correctamente");
      } else {
        toast.error(result.message || "Error al guardar la configuración");
      }
    } catch (error) {
      toast.error("Error al guardar la configuración del portfolio");
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
          <CardTitle>Configuración del Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-medium mb-2">Configuración General</h3>
          
          {/* Proyectos por página */}
          <div className="space-y-2">
            <Label htmlFor="projectsPerPage">Proyectos por página (Sitio público)</Label>
            <Input
              id="projectsPerPage"
              type="number"
              min="1"
              max="100"
              {...register('projectsPerPage', {
                required: 'Campo obligatorio',
                valueAsNumber: true,
                min: { value: 1, message: 'Debe ser al menos 1' },
                max: { value: 100, message: 'Máximo 100 proyectos por página' }
              })}
              className={`w-24 ${errors.projectsPerPage ? 'border-red-500' : ''}`}
            />
            {errors.projectsPerPage && <p className="text-red-500 text-xs mt-1">{errors.projectsPerPage.message}</p>}
          </div>
          
          {/* Tipo de visualización predeterminado */}
          <div className="space-y-2">
            <Label htmlFor="defaultDisplayType">Tipo de visualización predeterminado</Label>
            <Controller
              name="defaultDisplayType"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Seleccionar tipo de visualización" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Individual</SelectItem>
                    <SelectItem value="GALLERY">Galería</SelectItem>
                    <SelectItem value="SLIDER">Slider</SelectItem>
                    <SelectItem value="GRID">Cuadrícula</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Modo de visualización del listado */}
          <div className="space-y-2">
            <Label htmlFor="layoutMode">Modo de visualización del listado</Label>
            <Controller
              name="layoutMode"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Seleccionar modo de visualización" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Cuadrícula</SelectItem>
                    <SelectItem value="list">Lista</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
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
              Mostrar barra lateral en el listado de proyectos
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

          {/* Mostrar barra lateral en proyecto individual */}
          <div className="flex items-center space-x-2">
            <Controller
              name="showSidebarInProject"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="showSidebarInProject"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="showSidebarInProject">
              Mostrar barra lateral en el proyecto individual
            </Label>
            <Label className="ml-4">Posición:</Label>
            <select
              {...register("sidebarPositionInProject")}
              className="border rounded px-2 py-1 ml-2"
              defaultValue="right"
            >
              <option value="right">Derecha</option>
              <option value="left">Izquierda</option>
            </select>
          </div>

          {/* Mostrar botones de compartir en proyecto individual */}
          <div className="flex items-center space-x-2">
            <Controller
              name="showSharingInProject"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="showSharingInProject"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="showSharingInProject">
              Mostrar botones de compartir en proyectos individuales
            </Label>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
