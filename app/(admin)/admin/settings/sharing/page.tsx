"use client";
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useCurrentUserRole, checkUserRole } from "@/lib/auth";
import { fetchGlobalConfig, saveGlobalConfig } from "@/actions/config-actions";
import type { GlobalConfigWithCustomFields } from "@/lib/config-server";
import { SOCIAL_ICONS } from "@/lib/social-icons";

type SharingButton = {
  name: string;
  shareUrlBase: string;
  icon?: string;
  newTab?: boolean;
};

type SharingConfig = {
  buttons: SharingButton[];
};

export default function SharingSettingsPage() {
  const role = useCurrentUserRole();
  const { register, handleSubmit, setValue, control, watch, formState: { isSubmitting } } = useForm<SharingConfig>({
    defaultValues: { buttons: [] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "buttons" });

  // Cargar datos actuales al montar usando Server Action
  useEffect(() => {
    fetchGlobalConfig().then((config) => {
      if (config?.sharing) {
        const sharing = config.sharing as SharingConfig;
        setValue("buttons", sharing.buttons || []);
      }
    });
  }, [setValue]);

  if (!checkUserRole(role, "ADMIN")) {
    return <div className="p-8 text-red-600 font-bold">Acceso denegado. Se requiere rol ADMIN.</div>;
  }

  const onSubmit = async (data: SharingConfig) => {
    const result = await saveGlobalConfig({ sharing: data });
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message || "Error desconocido al guardar.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Configuración de Botones para Compartir</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Botones de compartir</label>
          {fields.map((field, idx) => (
            <div key={field.id} className="flex flex-wrap items-end gap-2 mb-2 border-b pb-2">
              <div>
                <label className="block text-sm">Nombre</label>
                <input
                  {...register(`buttons.${idx}.name` as const)}
                  className="border rounded px-2 py-1"
                  placeholder="Ej: WhatsApp"
                />
              </div>
              <div>
                <label className="block text-sm">URL base para compartir</label>
                <input
                  {...register(`buttons.${idx}.shareUrlBase` as const)}
                  className="border rounded px-2 py-1"
                  placeholder="Ej: https://wa.me/?text="
                />
              </div>
              <div>
                <label className="block text-sm">Icono</label>
                <select
                  {...register(`buttons.${idx}.icon` as const)}
                  className="border rounded px-2 py-1"
                  defaultValue=""
                >
                  <option value="">Seleccionar icono</option>
                  {SOCIAL_ICONS.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register(`buttons.${idx}.newTab` as const)}
                  className="mr-1"
                />
                <span className="text-sm">Abrir en nueva pestaña</span>
              </div>
              <button
                type="button"
                className="text-red-600 font-bold px-2"
                onClick={() => remove(idx)}
                aria-label="Eliminar botón"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-gray-200 px-4 py-1 rounded font-semibold"
            onClick={() => append({ name: "", shareUrlBase: "", icon: "", newTab: false })}
          >
            Añadir botón
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