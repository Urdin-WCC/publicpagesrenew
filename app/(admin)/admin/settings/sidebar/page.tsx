"use client";
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useCurrentUserRole, checkUserRole } from "@/lib/auth";
import { fetchGlobalConfig, saveGlobalConfig } from "@/actions/config-actions";
import type { GlobalConfigWithCustomFields } from "@/lib/config-server";
import { WIDGET_TYPES } from "@/lib/constants";

type SidebarWidget = {
  type: string;
  config: any;
};

type SidebarConfig = {
  widgets: SidebarWidget[];
  position: "left" | "right";
  width: string;
};

export default function SidebarSettingsPage() {
  const role = useCurrentUserRole();
  const { register, handleSubmit, setValue, watch, control, formState: { isSubmitting } } = useForm<SidebarConfig>({
    defaultValues: { widgets: [], position: "left", width: "" }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "widgets" });

  // Cargar datos actuales al montar usando Server Action
  useEffect(() => {
    fetchGlobalConfig().then((config) => {
      if (config?.sidebar) {
        const sidebar = config.sidebar as SidebarConfig;
        setValue("widgets", sidebar.widgets || []);
        setValue("position", sidebar.position || "left");
        setValue("width", sidebar.width || "");
      }
    });
  }, [setValue]);

  if (!checkUserRole(role, "ADMIN")) {
    return <div className="p-8 text-red-600 font-bold">Acceso denegado. Se requiere rol ADMIN.</div>;
  }

  const onSubmit = async (data: SidebarConfig) => {
    const result = await saveGlobalConfig({ sidebar: data });
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message || "Error desconocido al guardar.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Configuración de la Barra Lateral</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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