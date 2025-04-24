"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { fetchSharingConfig, saveSharingConfig, SharingConfig, SharingButton } from "@/actions/sharing-actions";
import { SOCIAL_ICONS } from "@/lib/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function SharingFormComplete() {
  // Estados
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  
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

  // Cargar datos iniciales
  useEffect(() => {
    // Solo cargar los datos una vez
    if (configLoaded) return;
    
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración de botones para compartir...");
        const sharingConfig = await fetchSharingConfig();
        
        if (!sharingConfig || !sharingConfig.buttons) {
          console.log("⚠️ No se pudo cargar la configuración");
          setIsInitialDataLoaded(true);
          setConfigLoaded(true);
          return;
        }
        
        console.log("📦 Configuración de sharing cargada:", sharingConfig);
        
        if (Array.isArray(sharingConfig.buttons)) {
          // Eliminar los botones existentes en el formulario
          for (let i = fields.length - 1; i >= 0; i--) {
            remove(i);
          }
          
          // Pequeña pausa para evitar problemas de concurrencia con React Hook Form
          setTimeout(() => {
            // Agregar los botones desde la configuración
            sharingConfig.buttons.forEach((button: SharingButton) => {
              append({
                name: button.name || "",
                shareUrlBase: button.shareUrlBase || "",
                icon: button.icon || "",
                newTab: button.newTab === true
              });
            });
            
            console.log("✅ Botones cargados:", sharingConfig.buttons.length);
            setIsInitialDataLoaded(true);
            setConfigLoaded(true);
          }, 50);
        } else {
          console.log("⚠️ No hay botones para añadir o formato incorrecto");
          setIsInitialDataLoaded(true);
          setConfigLoaded(true);
        }
      } catch (error) {
        console.error('Error loading sharing config:', error);
        toast.error('Error al cargar la configuración de compartir');
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      }
    };
    
    loadConfig();
  }, [fields.length, remove, append, configLoaded]);

  // Enviar formulario  
  const onSubmit = async (data: SharingConfig) => {
    try {
      console.log("📝 Guardando configuración de botones para compartir:", data);
      
      const result = await saveSharingConfig(data);
      
      if (result.success) {
        console.log("✅ Configuración guardada correctamente");
        toast.success(result.message || "Configuración guardada correctamente");
      } else {
        console.error("❌ Error al guardar la configuración:", result.message);
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
      icon: "none",
      newTab: true
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
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">Botones de compartir</Label>
              <span className="text-sm text-muted-foreground">
                {fields.length} {fields.length === 1 ? 'botón configurado' : 'botones configurados'}
              </span>
            </div>
            
            {fields.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-gray-300 rounded bg-gray-50">
                <p className="text-muted-foreground mb-4">No hay botones configurados</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSharingButton}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir primer botón
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, idx) => (
                  <div key={field.id} className="border rounded p-4 space-y-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Botón #{idx + 1}</h3>
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
                              defaultValue={field.value || "none"}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar icono" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sin icono</SelectItem>
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
