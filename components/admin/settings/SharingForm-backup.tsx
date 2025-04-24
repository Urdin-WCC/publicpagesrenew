"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { fetchGlobalConfig, saveGlobalConfig } from "@/actions/config-actions";
import { SOCIAL_ICONS } from "@/lib/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type SharingButton = {
  name: string;
  shareUrlBase: string;
  icon?: string;
  newTab?: boolean;
};

type SharingConfig = {
  buttons: SharingButton[];
};

export default function SharingForm() {
  // Estado para controlar cuando los datos iniciales se han cargado
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  
  // Inicializar formulario
  const { 
    register, 
    handleSubmit, 
    setValue, 
    control,
    formState: { errors, isSubmitting }
  } = useForm<SharingConfig>({
    defaultValues: { 
      buttons: []
    }
  });
  
  // Array de botones
  const { fields, append, remove } = useFieldArray({ control, name: "buttons" });

  const addButtonsDirectly = (buttons: SharingButton[]) => {
    if (!Array.isArray(buttons)) {
      console.log("Los botones recibidos no son un array válido:", buttons);
      setIsInitialDataLoaded(true);
      return;
    }
    
    console.log("Añadiendo botones directamente, total:", buttons.length);
    
    // Eliminar los botones existentes
    for (let i = fields.length - 1; i >= 0; i--) {
      remove(i);
    }
    
    // Espera un instante y luego añade los nuevos
    // Esto es un workaround para errores de reconciliación de React
    setTimeout(() => {
      // Crea una copia nueva del array para evitar problemas de referencia
      const buttonsCopy = [...buttons].map(button => ({
        name: button.name || "",
        shareUrlBase: button.shareUrlBase || "",
        icon: button.icon || "",
        newTab: button.newTab === true // Conversión explícita a booleano
      }));
      
      buttonsCopy.forEach(button => {
        append(button);
      });
      console.log("Botones añadidos directamente:", buttonsCopy.length);
      setIsInitialDataLoaded(true);
    }, 50);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración de sharing...");
        const config = await fetchGlobalConfig();
        
        if (!config) {
          console.log("⚠️ No se pudo cargar la configuración");
          setIsInitialDataLoaded(true);
          return;
        }
        
        console.log("📦 Configuración cargada:", config);
        
        if (config.sharing) {
          try {
            // Intentar parsear el JSON si es una cadena
            let sharingConfig: SharingConfig;
            if (typeof config.sharing === "string") {
              sharingConfig = JSON.parse(config.sharing);
            } else {
              // Si ya es un objeto, usarlo directamente
              sharingConfig = config.sharing as SharingConfig;
            }
            console.log("✅ Configuración de sharing cargada:", sharingConfig);
            
            // Establecer los valores en el formulario
            if (sharingConfig.buttons && Array.isArray(sharingConfig.buttons)) {
              console.log("🔄 Añadiendo botones:", sharingConfig.buttons);
              
              // Aproximación directa para agregar botones
              addButtonsDirectly(sharingConfig.buttons);
              
              // No marcamos como cargado aquí, dejamos que pase tiempo para
              // que React actualice el estado desde addButtonsDirectly
            } else {
              console.log("⚠️ No hay botones para añadir");
              setIsInitialDataLoaded(true);
            }
          } catch (error) {
            console.error('Error parsing sharing config:', error);
            toast.error('Error al cargar la configuración de compartir');
            setIsInitialDataLoaded(true);
          }
        } else {
          console.log('⚠️ No hay configuración de sharing encontrada');
          setIsInitialDataLoaded(true);
        }
      } catch (error) {
        console.error('Error loading config:', error);
        toast.error('Error al cargar la configuración');
        setIsInitialDataLoaded(true);
      }
    };
    
    loadConfig();
  }, []);

  // Enviar formulario  
  const onSubmit = async (data: SharingConfig) => {
    try {
      console.log("📝 Preparando datos de sharing para guardar:", data);
      
      // Convertimos a JSON string para guardar
      const saveData = {
        sharing: JSON.stringify(data)
      };
      
      console.log("🔍 Enviando datos de sharing al servidor:", saveData);
      
      // Guardar configuración
      const result = await saveGlobalConfig(saveData);
      
      if (result.success) {
        console.log("✅ Configuración de sharing guardada correctamente");
        toast.success(result.message || "Configuración guardada correctamente");
        
        // Recargar configuración para asegurar de que todo está sincronizado
        const updatedConfig = await fetchGlobalConfig();
        console.log("🔄 Configuración actualizada recibida:", updatedConfig);
      } else {
        console.error("❌ Error al guardar la configuración de sharing:", result.message);
        toast.error(result.message || "Error al guardar la configuración");
      }
    } catch (error) {
      console.error('Error saving sharing config:', error);
      toast.error("Error al guardar la configuración de botones de compartir");
    }
  };

  // Añadir un botón al formulario
  const addSharingButton = () => {
    append({
      name: "",
      shareUrlBase: "",
      icon: "",
      newTab: false
    });
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
            <Label>Botones de compartir ({fields.length})</Label>
            {fields.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-gray-300 rounded">
                No hay botones configurados. Añade uno usando el botón de abajo.
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, idx) => (
                  <div key={field.id} className="border rounded p-4 space-y-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-medium">Botón #{idx + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`buttons.${idx}.name`}>Nombre</Label>
                        <Input
                          id={`buttons.${idx}.name`}
                          {...register(`buttons.${idx}.name`)}
                          placeholder="Ej: WhatsApp"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`buttons.${idx}.shareUrlBase`}>URL base para compartir</Label>
                        <Input
                          id={`buttons.${idx}.shareUrlBase`}
                          {...register(`buttons.${idx}.shareUrlBase`)}
                          placeholder="Ej: https://wa.me/?text="
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`buttons.${idx}.icon`}>Icono</Label>
                        <Controller
                          name={`buttons.${idx}.icon`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar icono" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Sin icono</SelectItem>
                                {SOCIAL_ICONS.map(icon => (
                                  <SelectItem key={icon.value} value={icon.value}>{icon.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Controller
                          name={`buttons.${idx}.newTab`}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`buttons.${idx}.newTab`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <Label htmlFor={`buttons.${idx}.newTab`}>
                                Abrir en nueva pestaña
                              </Label>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={addSharingButton}
            >
              <Plus className="mr-2 h-4 w-4" />
              Añadir botón
            </Button>
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
