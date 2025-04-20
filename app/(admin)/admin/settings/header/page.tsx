"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useCurrentUserRole, checkUserRole } from "@/lib/auth";
import ImageUploader from "@/components/core/ImageUploader";
import { fetchGlobalConfig, saveGlobalConfig } from "@/actions/config-actions";
import type { GlobalConfig } from "@prisma/client";
import { SOCIAL_ICONS } from "@/lib/social-icons";
import HtmlEditor from "@/components/core/HtmlEditor";
import useSWR from "swr";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Interfaz para el tema
interface ThemePreset {
  id: number;
  name: string;
}

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar los datos');
    }
    return res.json();
});

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
};

type HeaderConfig = {
  elements: HeaderElementConfig[];
  lightThemeId?: number | null;
  darkThemeId?: number | null;
};

export default function HeaderSettingsPage() {
  const role = useCurrentUserRole();
  const { control, register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<HeaderConfig>({
    defaultValues: {
      elements: HEADER_ELEMENTS.map(e => ({
        type: e.type,
        visible: true,
        position: "top-left"
      }))
    }
  });
  const { fields } = useFieldArray({ control, name: "elements" });
  
  // Cargar lista de temas disponibles
  const { data: themes } = useSWR<ThemePreset[]>('/api/theme/presets', fetcher, {
      revalidateOnFocus: false,
  });

  // Manejar cambios en selección de tema claro
  const handleLightThemeChange = (value: string) => {
    // Si es "default" o cadena vacía, establecer como null
    setValue('lightThemeId', value && value !== 'default' ? parseInt(value) : null);
  };

  // Manejar cambios en selección de tema oscuro
  const handleDarkThemeChange = (value: string) => {
    // Si es "default" o cadena vacía, establecer como null
    setValue('darkThemeId', value && value !== 'default' ? parseInt(value) : null);
  };

  // Cargar datos actuales al montar
  useEffect(() => {
    fetchGlobalConfig().then((config) => {
      if (config?.header && Array.isArray(config.header.elements)) {
        setValue("elements", config.header.elements);
      }
      
      // Obtener asignaciones de tema para el header
      if (config?.themeAssignments) {
        try {
          const assignments = JSON.parse(config.themeAssignments);
          if (assignments.header) {
            if (assignments.header.light) {
              setValue('lightThemeId', assignments.header.light);
            }
            if (assignments.header.dark) {
              setValue('darkThemeId', assignments.header.dark);
            }
          }
        } catch (e) {
          console.error('Error parsing theme assignments:', e);
        }
      }
    });
  }, [setValue]);

  if (!checkUserRole(role, "ADMIN")) {
    return <div className="p-8 text-red-600 font-bold">Acceso denegado. Se requiere rol ADMIN.</div>;
  }

  const onSubmit = async (data: HeaderConfig) => {
    // Extraer IDs de temas para manejarlos separadamente
    const { lightThemeId, darkThemeId, ...headerData } = data;

    // Guardar configuración del encabezado
    const result = await saveGlobalConfig({ header: headerData });
    
    if (result.success) {
      // Actualizar asignaciones de tema
      try {
        // Obtener la configuración actual
        const currentConfig = await fetchGlobalConfig();
        let themeAssignments = {};
        
        // Intentar parsear asignaciones existentes
        if (currentConfig?.themeAssignments) {
          try {
            themeAssignments = JSON.parse(currentConfig.themeAssignments);
          } catch (e) {
            console.error('Error parsing existing theme assignments', e);
            themeAssignments = {};
          }
        }
        
        // Actualizar asignación para el header
        themeAssignments = {
          ...themeAssignments,
          header: {
            light: lightThemeId,
            dark: darkThemeId
          }
        };
        
        // Guardar asignaciones de tema actualizadas
        const themeSaveResult = await saveGlobalConfig({
          themeAssignments: JSON.stringify(themeAssignments)
        });
        
        if (themeSaveResult.success) {
          alert(result.message);
        } else {
          alert("Configuración guardada, pero hubo un problema al guardar las asignaciones de tema");
        }
      } catch (themeError) {
        console.error('Error saving theme assignments:', themeError);
        alert("Configuración guardada, pero hubo un error al guardar las asignaciones de tema");
      }
    } else {
      alert(result.message || "Error desconocido al guardar.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Configuración del Encabezado</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selección de Temas */}
        <div className="border rounded p-3 mb-3 bg-slate-50">
          <h2 className="font-bold mb-3 text-lg">Temas Visuales del Encabezado</h2>
          <p className="text-sm mb-4">Elige temas personalizados para el encabezado en modo claro y oscuro</p>
          
          {/* Tema Modo Claro */}
          <div className="mb-4">
            <Label htmlFor="lightThemeId" className="block mb-1 font-medium">Tema para Modo Claro</Label>
            <Controller
              name="lightThemeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={handleLightThemeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un tema..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Tema por defecto del sitio</SelectItem>
                    {themes?.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id.toString()}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-slate-500 text-xs mt-1">
              Selecciona el tema para el modo claro del encabezado (opcional)
            </p>
          </div>
          
          {/* Tema Modo Oscuro */}
          <div>
            <Label htmlFor="darkThemeId" className="block mb-1 font-medium">Tema para Modo Oscuro</Label>
            <Controller
              name="darkThemeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={handleDarkThemeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un tema..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Tema por defecto del sitio</SelectItem>
                    {themes?.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id.toString()}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-slate-500 text-xs mt-1">
              Selecciona el tema para el modo oscuro del encabezado (opcional)
            </p>
          </div>
        </div>
        
        <h2 className="font-bold mb-3 text-lg">Elementos del Encabezado</h2>
        {fields.map((field, idx) => (
          <div key={field.id} className="border rounded p-3 mb-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                {...register(`elements.${idx}.visible` as const)}
                className="mr-2"
                defaultChecked={field.visible}
              />
              <span className="font-semibold">{HEADER_ELEMENTS.find(e => e.type === field.type)?.label}</span>
              <select
                {...register(`elements.${idx}.position` as const)}
                className="ml-auto border rounded px-2 py-1"
                defaultValue={field.position}
              >
                {POSITIONS.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>
            {/* Configuración específica por tipo */}
            {field.type === "logo" && field.visible && (
              <ImageUploader
                value={watch(`elements.${idx}.logoUrl`)}
                onChange={url => setValue(`elements.${idx}.logoUrl`, url)}
                label="Logo del sitio"
              />
            )}
            {field.type === "text" && field.visible && (
              <div>
                <label className="block mb-1 font-medium">Texto</label>
                <input
                  {...register(`elements.${idx}.text` as const)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Texto del encabezado"
                />
              </div>
            )}
            {field.type === "html" && field.visible && (
              <HtmlEditor
                value={watch(`elements.${idx}.html`) || ""}
                onChange={val => setValue(`elements.${idx}.html`, val)}
                label="Bloque HTML"
              />
            )}
            {/* Otros tipos pueden expandirse según necesidades */}
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold"
          disabled={isSubmitting}
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
