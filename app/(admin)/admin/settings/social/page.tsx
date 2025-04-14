"use client";
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useCurrentUserRole, checkUserRole } from "@/lib/auth";
import { fetchGlobalConfig, saveGlobalConfig } from "@/actions/config-actions";
import type { GlobalConfigWithCustomFields } from "@/lib/config-server";

type SocialLink = {
  name: string;
  url: string;
  icon?: string;
  newTab?: boolean;
};

type SocialConfig = {
  links: SocialLink[];
};

export default function SocialSettingsPage() {
  const role = useCurrentUserRole();
  const { register, handleSubmit, setValue, control, watch, formState: { isSubmitting } } = useForm<SocialConfig>({
    defaultValues: { links: [] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  // Cargar datos actuales al montar usando Server Action
  useEffect(() => {
    fetchGlobalConfig().then((config) => {
      if (config?.social) {
        const social = config.social as SocialConfig;
        setValue("links", social.links || []);
      }
    });
  }, [setValue]);

  if (!checkUserRole(role, "ADMIN")) {
    return <div className="p-8 text-red-600 font-bold">Acceso denegado. Se requiere rol ADMIN.</div>;
  }

  const onSubmit = async (data: SocialConfig) => {
    const result = await saveGlobalConfig({ social: data });
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message || "Error desconocido al guardar.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Configuración de Enlaces Sociales</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Enlaces sociales</label>
          {fields.map((field, idx) => (
            <div key={field.id} className="flex flex-wrap items-end gap-2 mb-2 border-b pb-2">
              <div>
                <label className="block text-sm">Nombre</label>
                <input
                  {...register(`links.${idx}.name` as const)}
                  className="border rounded px-2 py-1"
                  placeholder="Ej: Twitter"
                />
              </div>
              <div>
                <label className="block text-sm">URL</label>
                <input
                  {...register(`links.${idx}.url` as const)}
                  className="border rounded px-2 py-1"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm">Icono (opcional)</label>
                <input
                  {...register(`links.${idx}.icon` as const)}
                  className="border rounded px-2 py-1"
                  placeholder="fa-twitter, svg, etc."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register(`links.${idx}.newTab` as const)}
                  className="mr-1"
                />
                <span className="text-sm">Abrir en nueva pestaña</span>
              </div>
              <button
                type="button"
                className="text-red-600 font-bold px-2"
                onClick={() => remove(idx)}
                aria-label="Eliminar enlace"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-gray-200 px-4 py-1 rounded font-semibold"
            onClick={() => append({ name: "", url: "", icon: "", newTab: false })}
          >
            Añadir enlace
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