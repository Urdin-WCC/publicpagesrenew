"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { fetchFooterConfig, saveFooterConfig, FooterConfig } from "@/actions/footer-actions";
import { WIDGET_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import HtmlEditor from "@/components/core/HtmlEditor";
import { useCurrentUserRole, checkUserRole } from "@/lib/auth";

interface WidgetsSectionProps {
  fields: any[];
  append: (value: any) => void;
  remove: (index: number) => void;
  control: any;
}

const WidgetsSection: React.FC<WidgetsSectionProps> = ({ 
  fields, 
  append, 
  remove, 
  control 
}) => {
  return (
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                remove(idx);
              }}
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
          onClick={(e) => {
            e.preventDefault(); // Prevenir cualquier comportamiento por defecto
            append({ type: WIDGET_TYPES[0]?.value || 'latest_posts', config: {} });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir widget
        </Button>
      </div>
    </div>
  );
};

export default function FooterFormComplete() {
  const role = useCurrentUserRole();
  const isMaster = checkUserRole(role, "MASTER");
  
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch,
    control, 
    formState: { isSubmitting }
  } = useForm<FooterConfig>({
    defaultValues: { 
      widgets: [], 
      height: "", 
      secondaryHtml: "" 
    }
  });
  
  const { fields, append, remove } = useFieldArray({ control, name: "widgets" });

  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    // Solo cargar los datos una vez
    if (configLoaded) return;
    
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración de footer...");
        const footerConfig = await fetchFooterConfig();
        
        if (!footerConfig) {
          console.log("⚠️ No se pudo cargar la configuración");
          setIsInitialDataLoaded(true);
          setConfigLoaded(true);
          return;
        }
        
        console.log("📦 Footer cargado:", footerConfig);
        
        if (Array.isArray(footerConfig.widgets)) {
          // Limpiar array existente primero si es necesario
          if (fields.length > 0) {
            for (let i = fields.length - 1; i >= 0; i--) {
              remove(i);
            }
          }
          
          // Añadir widgets individualmente
          footerConfig.widgets.forEach(widget => {
            append({
              type: widget.type || WIDGET_TYPES[0]?.value || 'latest_posts',
              config: widget.config || {}
            });
          });
        }
        
        setValue("height", footerConfig.height || "");
        setValue("secondaryHtml", footerConfig.secondaryHtml || "");
        
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      } catch (error) {
        console.error('❌ Error loading footer config:', error);
        toast.error('Error al cargar la configuración');
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      }
    };
    
    loadConfig();
  }, [setValue, remove, append, fields.length, configLoaded]);

  const onSubmit = async (data: FooterConfig) => {
    try {      
      console.log("📝 Guardando configuración:", data);
      
      const result = await saveFooterConfig(data);
      
      if (result.success) {
        toast.success("Configuración guardada correctamente");
      } else {
        toast.error(result.message || "Error al guardar");
      }
    } catch (error) {
      console.error('❌ Error saving footer config:', error);
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
          <div className="space-y-2">
            <Label htmlFor="height">Altura del pie de página (px, rem, etc.)</Label>
            <Input
              id="height"
              {...register("height")}
              placeholder="Ejemplo: 120px"
            />
          </div>

          <WidgetsSection 
            fields={fields} 
            append={append} 
            remove={remove} 
            control={control} 
          />
          
          {isMaster && (
            <div className="space-y-2">
              <Label htmlFor="secondaryHtml">HTML secundario (solo master)</Label>
              <HtmlEditor
                value={watch("secondaryHtml")}
                onChange={(val) => setValue("secondaryHtml", val)}
                label=""
              />
            </div>
          )}
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
