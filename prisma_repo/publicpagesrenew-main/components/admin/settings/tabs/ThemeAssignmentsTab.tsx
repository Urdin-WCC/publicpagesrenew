"use client";

import React from "react";
import { Controller, Control, UseFieldArrayReturn } from "react-hook-form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Interfaces
interface ThemePreset {
  id: number;
  name: string;
}

interface StaticPage {
  id: number;
  title: string;
  slug: string;
}

interface ThemeAssignment {
  path: string;
  lightThemeId: number | null;
  darkThemeId: number | null;
}

interface AssignmentsFormValues {
  themeAssignments: ThemeAssignment[];
  [key: string]: any;
}

interface SystemElement {
  id: string;
  name: string;
  slug: string;
}

interface ThemeAssignmentTabProps {
  control: Control<AssignmentsFormValues>;
  fieldArrayProps: UseFieldArrayReturn<AssignmentsFormValues, "themeAssignments", "id">;
  watch: any; // Function to watch form values
  setValue: any; // Function to set form values
  errors: any; // Form errors
  themes?: ThemePreset[];
  staticPages?: StaticPage[];
  systemElements: SystemElement[];
}

export default function ThemeAssignmentsTab({
  control,
  fieldArrayProps,
  watch,
  setValue,
  errors,
  themes,
  staticPages,
  systemElements
}: ThemeAssignmentTabProps) {
  const { fields, append, remove } = fieldArrayProps;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignaciones Específicas de Tema</CardTitle>
        <CardDescription>
          Asigna temas específicos a rutas o elementos del sitio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col md:flex-row gap-4 items-end border p-4 rounded-md">
              <div className="flex-1">
                <Label htmlFor={`themeAssignments.${index}.path`}>Ruta o Elemento</Label>
                <Controller
                  name={`themeAssignments.${index}.path` as const}
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un elemento..." />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Grupo de elementos del sistema */}
                        <SelectItem value="system_header" disabled>Elementos del Sistema</SelectItem>
                        {systemElements.map((element) => (
                          <SelectItem key={element.id} value={element.slug}>
                            {element.name}
                          </SelectItem>
                        ))}
                        
                        {/* Grupo de páginas estáticas */}
                        {staticPages && staticPages.length > 0 && (
                          <>
                            <SelectItem value="pages_header" disabled className="mt-2">Páginas Estáticas</SelectItem>
                            {staticPages.map((page) => (
                              <SelectItem key={page.id} value={`/${page.slug}`}>
                                {page.title}
                              </SelectItem>
                            ))}
                          </>
                        )}
                        
                        {/* Opción para entrada personalizada */}
                        <SelectItem value="custom" className="border-t mt-2 pt-2">
                          Personalizado (introducir manualmente)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                
                {watch(`themeAssignments.${index}.path`) === 'custom' && (
                  <Input
                    className="mt-2"
                    placeholder="Introduce la ruta personalizada (ej: /contacto)"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setValue(`themeAssignments.${index}.path`, e.target.value);
                      }
                    }}
                  />
                )}
                
                {errors.themeAssignments?.[index]?.path && (
                  <span className="text-red-500 text-sm">
                    {errors.themeAssignments[index]?.path?.message}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <Label htmlFor={`themeAssignments.${index}.lightThemeId`}>Tema Claro</Label>
                <Controller
                  name={`themeAssignments.${index}.lightThemeId` as const}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tema..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Predeterminado</SelectItem>
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
              
              <div className="flex-1">
                <Label htmlFor={`themeAssignments.${index}.darkThemeId`}>Tema Oscuro</Label>
                <Controller
                  name={`themeAssignments.${index}.darkThemeId` as const}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tema..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Predeterminado</SelectItem>
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
              
              <Button 
                variant="destructive" 
                onClick={() => remove(index)}
                type="button"
                className="mb-2"
              >
                Eliminar
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ path: "", lightThemeId: null, darkThemeId: null })}
          >
            Añadir Asignación
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
