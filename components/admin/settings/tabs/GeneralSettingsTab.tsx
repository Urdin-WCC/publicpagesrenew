"use client";

import React from "react";
import { Controller, Control } from "react-hook-form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Interfaz para el tema
interface ThemePreset {
  id: number;
  name: string;
}

// Interfaz para los valores del formulario
interface GeneralSettingsFormValues {
  defaultLightThemePresetId: number | null;
  defaultDarkThemePresetId: number | null;
  [key: string]: any;
}

interface GeneralSettingsTabProps {
  control: Control<GeneralSettingsFormValues>;
  themes?: ThemePreset[];
}

export default function GeneralSettingsTab({ control, themes }: GeneralSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Temas Predeterminados</CardTitle>
        <CardDescription>
          Selecciona los temas predeterminados para los modos claro y oscuro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tema claro predeterminado */}
          <div>
            <Label htmlFor="defaultLightThemePresetId">Tema por Defecto (Claro)</Label>
            <Controller
              name="defaultLightThemePresetId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un tema claro..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Ninguno</SelectItem>
                    {themes?.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id.toString()}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Tema oscuro predeterminado */}
          <div>
            <Label htmlFor="defaultDarkThemePresetId">Tema por Defecto (Oscuro)</Label>
            <Controller
              name="defaultDarkThemePresetId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un tema oscuro..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Ninguno</SelectItem>
                    {themes?.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id.toString()}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
