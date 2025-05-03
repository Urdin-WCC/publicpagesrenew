"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchSocialConfig, saveSocialConfig } from "@/actions/social-actions";
import { toast } from "sonner";


interface SocialIcon {
  name: string;
  url: string;
  svgLight: string;
  svgDark: string;
  openInNewTab?: boolean;
}

interface SocialFormData {
  textBefore: string;
  iconSize: string;
  icons: SocialIcon[];
}

function SvgSelector({
  label,
  value,
  onSelect,
  iconList,
}: {
  label: string;
  value: string;
  onSelect: (url: string) => void;
  iconList: string[];
}) {
  const [customUrl, setCustomUrl] = useState("");

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCustomUrl("");
    onSelect(e.target.value);
  };

  const handleCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(e.target.value);
    onSelect(e.target.value);
  };

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <select
          className="border rounded px-2 py-1"
          value={iconList.includes(value) ? value : ""}
          onChange={handleSelect}
        >
          <option value="">(Elige de la lista)</option>
          {iconList.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
        {value && iconList.includes(value) && (
          <img
            src={`/icons/${value}`}
            alt={value}
            className="w-6 h-6"
            style={{ display: "inline" }}
          />
        )}
        <Input
          className="ml-2"
          placeholder="o URL SVG externo"
          value={!iconList.includes(value) ? value : customUrl}
          onChange={handleCustom}
        />
        {(!iconList.includes(value) && value) && (
          <img
            src={value}
            alt="SVG externo"
            className="w-6 h-6"
            style={{ display: "inline" }}
          />
        )}
      </div>
    </div>
  );
}

export default function SocialForm() {
  const [loading, setLoading] = useState(true);
  const [iconList, setIconList] = useState<string[]>([]);
  const { register, handleSubmit, control, reset, setValue } = useForm<SocialFormData>({
    defaultValues: {
      textBefore: "",
      iconSize: "20px",
      icons: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "icons",
  });

  React.useEffect(() => {
    fetch("/api/list-icons")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data.icons)) setIconList(data.icons);
      })
      .catch(() => setIconList([]));

    fetchSocialConfig()
      .then((data) => {
        if (data && typeof data === "object") {
          reset({
            textBefore: data.textBefore || "",
            iconSize: data.iconSize || "20px",
            icons: Array.isArray(data.icons)
              ? data.icons.map(icon => ({
                  ...icon,
                  openInNewTab: icon.openInNewTab ?? true,
                }))
              : [],
          });
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: SocialFormData) => {
    setLoading(true);
    const result = await saveSocialConfig(data);
    setLoading(false);
    if (result.success) {
      toast.success(result.message || "Configuración guardada correctamente");
    } else {
      toast.error(result.message || "Error al guardar la configuración");
    }
  };

  if (loading) return <div>Cargando configuración...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Opciones Generales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Texto antes del listado de iconos (opcional)</Label>
            <Input
              {...register("textBefore")}
              placeholder='Ej: "Sígueme en las redes:"'
            />
          </div>
          <div>
            <Label>Tamaño de iconos</Label>
            <Input
              {...register("iconSize")}
              placeholder="Ej: 20px, 2em, auto..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Iconos Sociales</CardTitle>
        </CardHeader>
        <CardContent>
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="border-b py-4 space-y-3 relative group transition"
            >
              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg pr-3">#{idx + 1}</span>
                  <Button
                    onClick={() => idx > 0 && move(idx, idx - 1)}
                    variant="outline"
                    size="icon"
                    disabled={idx === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    onClick={() => idx < fields.length - 1 && move(idx, idx + 1)}
                    variant="outline"
                    size="icon"
                    disabled={idx === fields.length - 1}
                  >
                    ↓
                  </Button>
                </div>
                <Button
                  onClick={() => remove(idx)}
                  variant="destructive"
                  size="icon"
                >
                  🗑️
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    {...register(`icons.${idx}.name` as const)}
                    placeholder="Nombre (ej: Facebook)"
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    {...register(`icons.${idx}.url` as const)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>
                    <input
                      type="checkbox"
                      className="mr-2"
                      {...register(`icons.${idx}.openInNewTab`)}
                      defaultChecked={field.openInNewTab === undefined ? true : field.openInNewTab}
                    />
                    Abrir enlace en nueva pestaña
                  </Label>
                </div>
                <div>
                  <SvgSelector
                    label="SVG modo claro"
                    value={fields[idx].svgLight || ""}
                    onSelect={(val) => {
                      setValue(`icons.${idx}.svgLight`, val, {
                        shouldValidate: true,
                      });
                    }}
                    iconList={iconList}
                  />
                </div>
                <div>
                  <SvgSelector
                    label="SVG modo oscuro"
                    value={fields[idx].svgDark || ""}
                    onSelect={(val) => {
                      setValue(`icons.${idx}.svgDark`, val, {
                        shouldValidate: true,
                      });
                    }}
                    iconList={iconList}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="text-right pt-4">
            <Button
              type="button"
              onClick={() =>
                append({ name: "", url: "", svgLight: "", svgDark: "", openInNewTab: true })
              }
            >
              Añadir icono
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end mt-8">
        <Button type="submit">Guardar configuración de redes sociales</Button>
      </div>
    </form>
  );
}
