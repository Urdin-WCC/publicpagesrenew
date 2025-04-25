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
import HtmlEditor from "@/components/core/HtmlEditor";
import ImageUploaderLogo from "@/components/core/ImageUploaderLogo";
import { toast } from "sonner";

const HEADER_ELEMENTS = [
  { type: "logo", label: "Logo" },
  { type: "text", label: "Texto" },
  { type: "menu", label: "Menú de navegación" },
  { type: "social", label: "Iconos redes sociales" },
  { type: "theme", label: "Interruptor tema claro/oscuro" },
  { type: "html", label: "Bloque HTML (banner/publicidad)" }
];

const POSITIONS = [
  { value: "top-left", label: "Arriba izquierda" },
  { value: "top-center", label: "Arriba centro" },
  { value: "top-right", label: "Arriba derecha" },
  { value: "center-left", label: "Centro izquierda" },
  { value: "center-center", label: "Centro centro" },
  { value: "center-right", label: "Centro derecha" },
  { value: "bottom-left", label: "Abajo izquierda" },
  { value: "bottom-center", label: "Abajo centro" },
  { value: "bottom-right", label: "Abajo derecha" }
];

type HeaderElementConfig = {
  type: string;
  visible: boolean;
  position: string;
  // Configuración específica por tipo
  logoUrl?: string;
  text?: string;
  menuItems?: string[]; // Simplificado
  socialLinks?: { icon: string; url: string }[];
  html?: string;
  // Propiedades adicionales
  height?: string; // Altura del encabezado
};

type HeaderConfig = {
  elements: HeaderElementConfig[];
};

export default function HeaderForm() {
  // Estado para controlar cuando los datos iniciales se han cargado
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  
  // Inicializar formulario
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch,
    control, 
    formState: { errors, isSubmitting }
  } = useForm<HeaderConfig>({
    defaultValues: {
      elements: HEADER_ELEMENTS.map(e => ({
        type: e.type,
        visible: true,
        position: "top-left"
      }))
    }
  });
  
  // Array de elementos
  const { fields } = useFieldArray({ control, name: "elements" });

  // Cargar datos iniciales
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración de cabecera...");
        const config = await fetchGlobalConfig();
        
        if (!config) {
          console.log("⚠️ No se pudo cargar la configuración");
          setIsInitialDataLoaded(true);
          return;
        }
        
        console.log("📦 Configuración cargada:", config);
        
        if (config.header) {
          try {
            // Intentar parsear el header para obtener los elementos
            let headerConfig: HeaderConfig;
            if (typeof config.header === 'string') {
              headerConfig = JSON.parse(config.header);
            } else {
              // Si ya es un objeto, usarlo directamente
              headerConfig = config.header as HeaderConfig;
            }
            console.log("✅ Configuración de header cargada:", headerConfig);
              
            if (headerConfig && Array.isArray(headerConfig.elements)) {
              console.log('Estableciendo elementos del encabezado:', headerConfig.elements);
              setValue("elements", [...headerConfig.elements]); // Copia explícita
              console.log("✅ Elementos de cabecera establecidos:", headerConfig.elements.length);
            } else {
              console.log('No se encontraron elementos de encabezado o no es un arreglo');
              setValue("elements", HEADER_ELEMENTS.map(e => ({
                type: e.type,
                visible: true,
                position: "top-left"
              })));
            }
          } catch (error) {
            console.error('Error parsing header config:', error);
            toast.error('Error al cargar la configuración de cabecera');
          }
        }
        
        // Marcar como cargado
        setIsInitialDataLoaded(true);
        console.log("✅ Carga inicial de datos de cabecera completada");
      } catch (error) {
        console.error('Error loading config', error);
        toast.error("Error al cargar la configuración de cabecera");
        setIsInitialDataLoaded(true);
      }
    };
    
    loadConfig();
  }, [setValue]);

  // Enviar formulario
  const onSubmit = async (data: HeaderConfig) => {
    try {
      console.log("📝 Preparando datos de cabecera para guardar:", data);
      
      // Convertimos a JSON string para guardar
      const saveData = {
        header: JSON.stringify(data)
      };
      
      console.log("🔍 Enviando datos de cabecera al servidor:", saveData);
      
      // Guardar configuración del encabezado
      const result = await saveGlobalConfig(saveData);
      
      if (result.success) {
        console.log("✅ Configuración de cabecera guardada correctamente");
        toast.success(result.message || "Configuración guardada correctamente");
        
        // Recargar configuración para asegurar de que todo está sincronizado
        const updatedConfig = await fetchGlobalConfig();
        console.log("🔄 Configuración actualizada recibida:", updatedConfig);
      } else {
        console.error("❌ Error al guardar la configuración de cabecera:", result.message);
        toast.error(result.message || "Error al guardar la configuración");
      }
    } catch (error) {
      console.error('Error saving header config', error);
      toast.error("Error al guardar la configuración de cabecera");
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
          <h2 className="text-lg font-semibold">Elementos del Encabezado</h2>
          
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="border rounded p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Controller
                      name={`elements.${idx}.visible`}
                      control={control}
                      render={({ field: visibleField }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`visible-${idx}`}
                            checked={visibleField.value}
                            onCheckedChange={visibleField.onChange}
                          />
                          <Label htmlFor={`visible-${idx}`} className="font-medium">
                            {HEADER_ELEMENTS.find(e => e.type === field.type)?.label || field.type}
                          </Label>
                        </div>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`position-${idx}`} className="text-sm">Posición:</Label>
                    <Controller
                      name={`elements.${idx}.position`}
                      control={control}
                      render={({ field: posField }) => (
                        <Select 
                          onValueChange={posField.onChange} 
                          defaultValue={posField.value}
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue placeholder="Selecciona posición" />
                          </SelectTrigger>
                          <SelectContent>
                            {POSITIONS.map(pos => (
                              <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                
                {/* Configuración específica por tipo */}
                {watch(`elements.${idx}.visible`) && (
                  <div className="bg-white p-3 border rounded">
                    {field.type === "logo" && (
                      <div className="space-y-2">
                        <Label>Logo del sitio:</Label>
                        <ImageUploaderLogo
                          value={watch(`elements.${idx}.logoUrl`)}
                          onChange={(url: string) => setValue(`elements.${idx}.logoUrl`, url)}
                          label="Seleccionar imagen para el logo"
                        />
                        
                        <div className="mt-4">
                          <Label>Altura del encabezado:</Label>
                          <Input
                            {...register(`elements.${idx}.height` as const)}
                            placeholder="ej: 80px, 5rem, auto"
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Define la altura del encabezado. Use valores como 80px, 5rem o auto.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {field.type === "text" && (
                      <div className="space-y-2">
                        <Label>Texto:</Label>
                        <Input
                          {...register(`elements.${idx}.text` as const)}
                          placeholder="Texto del encabezado"
                        />
                      </div>
                    )}
                    
                    {field.type === "html" && (
                      <div className="space-y-2">
                        <Label>HTML personalizado:</Label>
                        <HtmlEditor
                          value={watch(`elements.${idx}.html`) || ""}
                          onChange={val => setValue(`elements.${idx}.html`, val)}
                          label=""
                        />
                      </div>
                    )}
                    
                    {/* Otros tipos pueden expandirse según necesidades */}
                  </div>
                )}
              </div>
            ))}
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
