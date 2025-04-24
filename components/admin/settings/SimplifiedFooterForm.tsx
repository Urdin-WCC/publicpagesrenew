"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchFooterConfig, saveFooterConfig } from "@/actions/footer-actions";

interface SimpleFooterConfig {
  height: string;
  secondaryHtml: string;
}

export default function SimplifiedFooterForm() {
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    formState: { isSubmitting }
  } = useForm<SimpleFooterConfig>({
    defaultValues: { 
      height: "",
      secondaryHtml: ""
    }
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await fetchFooterConfig();
        if (config) {
          setValue("height", config.height || "");
          setValue("secondaryHtml", config.secondaryHtml || "");
        }
      } catch (error) {
        console.error("Error loading footer config:", error);
        toast.error("Error al cargar la configuración");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, [setValue]);

  const onSubmit = async (data: SimpleFooterConfig) => {
    try {
      // Guardar con widgets vacíos para mantener la estructura
      const fullConfig = {
        ...data,
        widgets: []
      };
      
      const result = await saveFooterConfig(fullConfig);
      
      if (result.success) {
        toast.success("Configuración guardada correctamente");
      } else {
        toast.error(result.message || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving footer config:", error);
      toast.error("Error al guardar la configuración");
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="height">Altura del pie de página (px, rem, etc.)</Label>
            <Input
              id="height"
              {...register("height")}
              placeholder="Ejemplo: 200px"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secondaryHtml">HTML del pie de página (opcional)</Label>
            <Input
              id="secondaryHtml"
              {...register("secondaryHtml")}
              placeholder="<p>Contenido HTML</p>"
            />
          </div>
