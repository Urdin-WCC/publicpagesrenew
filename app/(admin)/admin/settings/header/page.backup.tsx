"use client";
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useCurrentUserRole, checkUserRole } from "@/lib/auth";
import ImageUploader from "@/components/core/ImageUploader";
import { fetchGlobalConfig, saveGlobalConfig } from "@/actions/config-actions";
import type { GlobalConfigWithCustomFields } from "@/lib/config-server";
import { SOCIAL_ICONS } from "@/lib/social-icons";
import HtmlEditor from "@/components/core/HtmlEditor";

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

  // Cargar datos actuales al montar
  useEffect(() => {
    fetchGlobalConfig().then((config) => {
      if (config?.header && Array.isArray(config.header.elements)) {
        setValue("elements", config.header.elements);
      }
    });
  }, [setValue]);

  if (!checkUserRole(role, "ADMIN")) {
    return <div className="p-8 text-red-600 font-bold">Acceso denegado. Se requiere rol ADMIN.</div>;
  }

  const onSubmit = async (data: HeaderConfig) => {
    const result = await saveGlobalConfig({ header: data });
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message || "Error desconocido al guardar.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Configuración del Encabezado</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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