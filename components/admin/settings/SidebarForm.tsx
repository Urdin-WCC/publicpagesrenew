"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { fetchGlobalConfig, saveGlobalConfig } from "@/actions/config-actions";
import { WIDGET_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type SidebarWidget = {
  type: string;
  config: any;
};

type SidebarConfig = {
  widgets: SidebarWidget[];
  position: "left" | "right";
  width: string;
};

export default function SidebarForm() {
  // Estado para controlar cuando los datos iniciales se han cargado
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  
  // Inicializar formulario
  const { 
    register, 
    handleSubmit, 
    setValue, 
    control, 
    formState: { errors, isSubmitting }
  } = useForm<SidebarConfig>({
    defaultValues: { 
      widgets: [], 
      position: "left", 
      width: "" 
    }
  });
  
  // Array de widgets
  const { fields, append, remove } = useFieldArray({ control, name: "widgets" });

  // Cargar datos iniciales
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración de sidebar...");
        const config = await fetchGlobalConfig();
        
        if (!config) {
          console.log("⚠️ No se pudo cargar la configuración");
          setIsInitialDataLoaded(true);
          return;
        }
        
        console.log("📦 Configuración cargada:", config);
        
        if (config.sidebar) {
          try {
            // Intentar parsear el sidebar para obtener sus propiedades
            const sidebarConfig = typeof config.sidebar === 'string'
              ? JSON.parse(config.sidebar)
              : config.sidebar;
              
            console.log('✅ Configuración de sidebar cargada:', sidebarConfig);
            
            // Establecer los valores en el formulario explícitamente
            if (Array.isArray(sidebarConfig.widgets)) {
              console.log('Estableciendo widgets del sidebar:', sidebarConfig.widgets);
              setValue("widgets", [...sidebarConfig.widgets]); // Copia explícita
            } else {
              console.log('No se encontraron widgets de sidebar o no es un arreglo');
              setValue("widgets", []);
            }
            
            setValue("position", sidebarConfig.position || "left");
            setValue("width", sidebarConfig.width || "");
            console.log("✅ Configuración de sidebar establecida correctamente. Widgets:", 
              Array.isArray(sidebarConfig.widgets) ? sidebarConfig.widgets.length : 'no es array');
          } catch (error) {
            console.error('Error parsing sidebar config:', error);
            toast.error('Error al cargar la configuración de la barra lateral');
          }
        }
        
        // Marcar como cargado
        setIsInitialDataLoaded(true);
        console.log("✅ Carga inicial de datos de sidebar completada");
      } catch (error) {
        console.error('Error loading config:', error);
        toast.error('Error al cargar la configuración');
        setIsInitialDataLoaded(true);
      }
    };
    
    loadConfig();
  }, [setValue]);

  // Enviar formulario
  const onSubmit = async (data: SidebarConfig) => {
    try {
      console.log("📝 Preparando datos de sidebar para guardar:", data);
      
      // Convertimos a JSON string para guardar
      const saveData = {
        sidebar: JSON.stringify(data)
      };
      
      console.log("🔍 Enviando datos de sidebar al servidor:", saveData);
      
      // Guardar configuración de la barra lateral
      const result = await saveGlobalConfig(saveData);
      
      if (result.success) {
        console.log("✅ Configuración de sidebar guardada correctamente");
        toast.success(result.message || "Configuración guardada correctamente");
        
        // Recargar configuración para asegurar de que todo está sincronizado
        const updatedConfig = await fetchGlobalConfig();
        console.log("🔄 Configuración actualizada recibida:", updatedConfig);
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
                  <SelectTrigger className="w-full">
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
            <Label htmlFor="width">Ancho de la barra lateral (px, %, rem, etc.)</Label>
            <Input
              id="width"
              {...register("width")}
              placeholder="Ejemplo: 300px"
            />
          </div>

          <div className="space-y-2">
            <Label>Widgets</Label>
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2 border p-3 rounded">
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
                onClick={() => append({ type: WIDGET_TYPES[0]?.value || 'latest_posts', config: {} })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir widget
              </Button>
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
