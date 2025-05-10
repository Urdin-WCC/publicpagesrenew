"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { fetchSidebarConfig, saveSidebarConfig, SidebarConfig } from "@/actions/sidebar-actions";
import { WIDGET_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function SidebarFormComplete() {
  // Estados
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // Inicializar formulario
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch,
    control, 
    formState: { errors, isSubmitting }
  } = useForm<SidebarConfig>({
    defaultValues: { 
      widgets: [], 
      position: "left", 
      width: "300px",
      visible: true
    }
  });
  
  // Array de widgets
  const { fields, append, remove } = useFieldArray({ control, name: "widgets" });

  // Cargar datos iniciales
  useEffect(() => {
    // Solo cargar los datos una vez
    if (configLoaded) return;
    
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración de barra lateral...");
        const sidebarConfig = await fetchSidebarConfig();
        
        if (!sidebarConfig) {
          console.log("⚠️ No se pudo cargar la configuración");
          setIsInitialDataLoaded(true);
          setConfigLoaded(true);
          return;
        }
        
        console.log("📦 Sidebar cargado:", sidebarConfig);
        
        // Establecer los valores en el formulario
        setValue("position", sidebarConfig.position || "left");
        setValue("width", sidebarConfig.width || "300px");
        setValue("visible", sidebarConfig.visible !== false);
        
        if (Array.isArray(sidebarConfig.widgets)) {
          console.log('Estableciendo widgets del sidebar:', sidebarConfig.widgets.length);
          setValue("widgets", [...sidebarConfig.widgets]);
        } else {
          console.log('No se encontraron widgets de sidebar o no es un arreglo');
          setValue("widgets", []);
        }
        
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
        console.log("✅ Carga inicial de datos de sidebar completada");
      } catch (error) {
        console.error('Error loading sidebar config:', error);
        toast.error('Error al cargar la configuración');
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      }
    };
    
    loadConfig();
  }, [setValue, configLoaded]);

  // Enviar formulario
  const onSubmit = async (data: SidebarConfig) => {
    try {
      console.log("📝 Guardando configuración de barra lateral:", data);
      
      const result = await saveSidebarConfig(data);
      
      if (result.success) {
        console.log("✅ Configuración de sidebar guardada correctamente");
        toast.success(result.message || "Configuración guardada correctamente");
      } else {
        console.error("❌ Error al guardar la configuración de sidebar:", result.message);
        toast.error(result.message || "Error al guardar la configuración");
      }
    } catch (error) {
      console.error('Error saving sidebar config:', error);
      toast.error("Error al guardar la configuración de barra lateral");
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
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Configuración de la Barra Lateral</h2>
            <div className="flex items-center space-x-2">
              <Switch 
                id="visible"
                checked={watch("visible")}
                onCheckedChange={(checked) => setValue("visible", checked)}
              />
              <Label htmlFor="visible">Visible</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Posición</Label>
                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una posición" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Izquierda</SelectItem>
                        <SelectItem value="right">Derecha</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Ancho (px, %, rem, etc.)</Label>
                <Input
                  id="width"
                  {...register("width")}
                  placeholder="Ejemplo: 300px"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Widgets</Label>
                <span className="text-xs text-muted-foreground">
                  {fields.length} widgets configurados
                </span>
              </div>
              
              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2 border p-3 rounded bg-gray-50">
                    <div className="flex-1">
                      <Controller
                        name={`widgets.${idx}.type`}
                        control={control}
                        render={({ field: typeField }) => (
                          <Select 
                            onValueChange={typeField.onChange} 
                            defaultValue={typeField.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un tipo de widget" />
                            </SelectTrigger>
                            <SelectContent>
                              {WIDGET_TYPES.map(w => (
                                <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        La configuración específica de este widget se realizará 
                        en el editor de widgets, en la sección correspondiente.
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => remove(idx)}
                      aria-label="Eliminar widget"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => append({ 
                    type: WIDGET_TYPES[0]?.value || 'latest_posts', 
                    title: 'Nuevo widget',
                    config: {} 
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir widget
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
