"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { fetchHeaderConfig, saveHeaderConfig, HeaderConfig, HeaderElementConfig } from "@/actions/header-actions";
import { SOCIAL_ICONS } from "@/lib/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import HtmlEditor from "@/components/core/HtmlEditor";
import ImageUploaderLogo from "@/components/core/ImageUploaderLogo";

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

// Las interfaces ya están importadas arriba

export default function HeaderFormComplete() {
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch,
    control, 
    formState: { isSubmitting }
  } = useForm<HeaderConfig>({
    defaultValues: {
      elements: HEADER_ELEMENTS.map(e => ({
        type: e.type,
        visible: true,
        position: "top-left"
      }))
    }
  });
  
  const { fields } = useFieldArray({ control, name: "elements" });

  useEffect(() => {
    // Solo cargar los datos una vez
    if (configLoaded) return;
    
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración de encabezado...");
        const headerConfig = await fetchHeaderConfig();
        
        if (!headerConfig) {
          console.log("⚠️ No se pudo cargar la configuración");
          setIsInitialDataLoaded(true);
          setConfigLoaded(true);
          return;
        }
        
        console.log("📦 Header cargado:", headerConfig);
        
        if (headerConfig.elements && Array.isArray(headerConfig.elements)) {
          // Establecer los elementos directamente
          setValue("elements", [...headerConfig.elements]);
          console.log("✅ Elementos de cabecera establecidos:", headerConfig.elements.length);
        } else {
          // Valores por defecto
          setValue("elements", HEADER_ELEMENTS.map(e => ({
            type: e.type,
            visible: true,
            position: "top-left"
          })));
        }
        
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      } catch (error) {
        console.error('❌ Error loading header config:', error);
        toast.error('Error al cargar la configuración');
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      }
    };
    
    loadConfig();
  }, [setValue, configLoaded]);

  const onSubmit = async (data: HeaderConfig) => {
    try {      
      console.log("📝 Guardando configuración:", data);
      
      const result = await saveHeaderConfig(data);
      
      if (result.success) {
        toast.success("Configuración guardada correctamente");
      } else {
        toast.error(result.message || "Error al guardar");
      }
    } catch (error) {
      console.error('❌ Error saving header config:', error);
      toast.error("Error al guardar la configuración");
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
                            onCheckedChange={(checked) => {
                              visibleField.onChange(checked);
                            }}
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
                          value={watch(`elements.${idx}.logoUrl`) || ""}
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
                    
                    {field.type === "html" && (
                      <div className="space-y-2">
                        <Label>HTML personalizado:</Label>
                        <HtmlEditor
                          value={watch(`elements.${idx}.html`) || ""}
                          onChange={(val) => setValue(`elements.${idx}.html`, val)}
                          label=""
                        />
                      </div>
                    )}
                    
                    {field.type !== "logo" && field.type !== "html" && (
                      <div className="text-sm text-muted-foreground">
                        Este elemento se configurará en {
                          field.type === "text" ? "la configuración general" :
                          field.type === "menu" ? "la sección de menú de navegación" :
                          field.type === "social" ? "la configuración de redes sociales" :
                          field.type === "theme" ? "la configuración de apariencia" :
                          "otra sección"
                        }.
                      </div>
                    )}
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
