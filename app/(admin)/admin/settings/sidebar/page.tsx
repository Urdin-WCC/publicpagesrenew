"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useCurrentUserRole, checkUserRole } from "@/lib/auth";
import { fetchGlobalConfig, saveGlobalConfig } from "@/actions/config-actions";
import type { GlobalConfig } from "@prisma/client";
import { WIDGET_TYPES } from "@/lib/constants";
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

type SidebarWidget = {
  type: string;
  config: any;
};

type SidebarConfig = {
  widgets: SidebarWidget[];
  position: "left" | "right";
  width: string;
  lightThemeId?: number | null;
  darkThemeId?: number | null;
};

export default function SidebarSettingsPage() {
  const role = useCurrentUserRole();
  const { register, handleSubmit, setValue, watch, control, formState: { isSubmitting } } = useForm<SidebarConfig>({
    defaultValues: { widgets: [], position: "left", width: "" }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "widgets" });
  
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

  // Cargar datos actuales al montar usando Server Action
  useEffect(() => {
    fetchGlobalConfig().then((config) => {
      if (config?.sidebar) {
        const sidebar = config.sidebar as SidebarConfig;
        setValue("widgets", sidebar.widgets || []);
        setValue("position", sidebar.position || "left");
        setValue("width", sidebar.width || "");
      }
      
      // Obtener asignaciones de tema para la barra lateral
      if (config?.themeAssignments) {
        try {
          const assignments = JSON.parse(config.themeAssignments);
          if (assignments.sidebar) {
            if (assignments.sidebar.light) {
              setValue('lightThemeId', assignments.sidebar.light);
            }
            if (assignments.sidebar.dark) {
              setValue('darkThemeId', assignments.sidebar.dark);
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

  const onSubmit = async (data: SidebarConfig) => {
    // Extraer IDs de temas para manejarlos separadamente
    const { lightThemeId, darkThemeId, ...sidebarData } = data;

    // Guardar configuración de la barra lateral
    const result = await saveGlobalConfig({ sidebar: sidebarData });
    
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
        
        // Actualizar asignación para la barra lateral
        themeAssignments = {
          ...themeAssignments,
          sidebar: {
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
      <h1 className="text-2xl font-bold mb-4">Configuración de la Barra Lateral</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selección de Temas */}
        <div className="border rounded p-3 mb-3 bg-slate-50">
          <h2 className="font-bold mb-3 text-lg">Temas Visuales de la Barra Lateral</h2>
          <p className="text-sm mb-4">Elige temas personalizados para la barra lateral en modo claro y oscuro</p>
          
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
              Selecciona el tema para el modo claro de la barra lateral (opcional)
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
              Selecciona el tema para el modo oscuro de la barra lateral (opcional)
            </p>
          </div>
        </div>
        
        <div>
          <label className="block mb-1 font-medium">Posición</label>
          <select {...register("position")} className="border rounded px-2 py-1">
            <option value="left">Izquierda</option>
            <option value="right">Derecha</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Ancho de la barra lateral (px, %, rem, etc.)</label>
          <input
            {...register("width")}
            className="w-full border rounded px-3 py-2"
            placeholder="Ejemplo: 300px"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Widgets</label>
          {fields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
              <select
                {...register(`widgets.${idx}.type` as const)}
                className="border rounded px-2 py-1"
              >
                {WIDGET_TYPES.map(w => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
              {/* Configuración específica del widget podría ir aquí */}
              <button
                type="button"
                className="text-red-600 font-bold px-2"
                onClick={() => remove(idx)}
                aria-label="Eliminar widget"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-gray-200 px-4 py-1 rounded font-semibold"
            onClick={() => append({ type: WIDGET_TYPES[0].value, config: {} })}
          >
            Añadir widget
          </button>
        </div>
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
