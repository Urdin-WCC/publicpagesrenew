"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { fetchSocialConfig, saveSocialConfig, SocialConfig, SocialLink } from "@/actions/social-actions";
import { SOCIAL_ICONS } from "@/lib/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function SocialFormComplete() {
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
  } = useForm<SocialConfig>({
    defaultValues: { 
      links: []
    }
  });
  
  // Array de enlaces
  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  // Cargar datos iniciales
  useEffect(() => {
    // Solo cargar los datos una vez
    if (configLoaded) return;
    
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración de redes sociales...");
        const socialConfig = await fetchSocialConfig();
        
        if (!socialConfig || !socialConfig.links) {
          console.log("⚠️ No se pudo cargar la configuración");
          setIsInitialDataLoaded(true);
          setConfigLoaded(true);
          return;
        }
        
        console.log("📦 Configuración de social cargada:", socialConfig);
        
        if (Array.isArray(socialConfig.links)) {
          // Eliminar los enlaces existentes en el formulario
          for (let i = fields.length - 1; i >= 0; i--) {
            remove(i);
          }
          
          // Pequeña pausa para evitar problemas de concurrencia con React Hook Form
          setTimeout(() => {
            // Agregar los enlaces desde la configuración
            socialConfig.links.forEach((link: SocialLink) => {
              append({
                name: link.name || "",
                url: link.url || "",
                icon: link.icon || "none",
                newTab: link.newTab === true
              });
            });
            
            console.log("✅ Enlaces cargados:", socialConfig.links.length);
            setIsInitialDataLoaded(true);
            setConfigLoaded(true);
          }, 50);
        } else {
          console.log("⚠️ No hay enlaces para añadir o formato incorrecto");
          setIsInitialDataLoaded(true);
          setConfigLoaded(true);
        }
      } catch (error) {
        console.error('Error loading social config:', error);
        toast.error('Error al cargar la configuración de redes sociales');
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      }
    };
    
    loadConfig();
  }, [fields.length, remove, append, configLoaded]);

  // Enviar formulario  
  const onSubmit = async (data: SocialConfig) => {
    try {
      console.log("📝 Guardando configuración de redes sociales:", data);
      
      const result = await saveSocialConfig(data);
      
      if (result.success) {
        console.log("✅ Configuración guardada correctamente");
        toast.success(result.message || "Configuración guardada correctamente");
      } else {
        console.error("❌ Error al guardar la configuración:", result.message);
        toast.error(result.message || "Error al guardar la configuración");
      }
    } catch (error) {
      console.error('Error saving social config:', error);
      toast.error("Error al guardar la configuración de redes sociales");
    }
  };

  // Añadir un enlace al formulario
  const addSocialLink = () => {
    append({
      name: "",
      url: "",
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
              <Label className="text-lg font-medium">Redes sociales</Label>
              <span className="text-sm text-muted-foreground">
                {fields.length} {fields.length === 1 ? 'enlace configurado' : 'enlaces configurados'}
              </span>
            </div>
            
            {fields.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-gray-300 rounded bg-gray-50">
                <p className="text-muted-foreground mb-4">No hay enlaces de redes sociales configurados</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSocialLink}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir primer enlace
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, idx) => (
                  <div key={field.id} className="border rounded p-4 space-y-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Enlace #{idx + 1}</h3>
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
                        <Label htmlFor={`links.${idx}.name`}>Nombre</Label>
                        <Input
                          id={`links.${idx}.name`}
                          {...register(`links.${idx}.name`)}
                          placeholder="Ej: Facebook"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`links.${idx}.url`}>URL</Label>
                        <Input
                          id={`links.${idx}.url`}
                          {...register(`links.${idx}.url`)}
                          placeholder="Ej: https://facebook.com/miempresa"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`links.${idx}.icon`}>Icono</Label>
                        <Controller
                          name={`links.${idx}.icon`}
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
                          name={`links.${idx}.newTab`}
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`links.${idx}.newTab`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <Label htmlFor={`links.${idx}.newTab`}>
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
              onClick={addSocialLink}
            >
              <Plus className="mr-2 h-4 w-4" />
              Añadir enlace
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
