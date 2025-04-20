"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { fetchGlobalConfig, saveGlobalConfig } from "@/actions/config-actions";
import ImageUploader from "@/components/core/ImageUploader";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CirclePicker } from "react-color";
import useSWR from "swr";

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar los datos');
  }
  return res.json();
});

// Interfaz para el tema
interface ThemePreset {
  id: number;
  name: string;
}

// Interfaz para el asignador de temas
interface ThemeAssignment {
  path: string; // Ruta o elemento (e.g., /blog, /contacto, header, footer)
  lightThemeId: number | null; // ID del tema claro
  darkThemeId: number | null; // ID del tema oscuro
}

// Interfaz para la configuración del spinner
interface LoadingSpinnerConfig {
  enabled: boolean;
  overlayColor: string;
  spinnerImageUrl?: string;
}

// Interfaz para la configuración del cambiador de temas
interface ThemeSwitcherConfig {
  visible: boolean;
  style: "icon" | "icon_text";
  position: "bottom_right" | "bottom_left" | "top_right" | "top_left";
}

// Interfaz para la configuración de elementos fijos
interface StickyElementsConfig {
  header: boolean;
  sidebar: boolean;
  footer: boolean;
  themeSwitcher: boolean;
}

// Interfaz para los valores del formulario
interface AppearanceFormValues {
  defaultLightThemePresetId: number | null;
  defaultDarkThemePresetId: number | null;
  themeAssignments: ThemeAssignment[];
  loadingSpinnerConfig: LoadingSpinnerConfig;
  themeSwitcherConfig: ThemeSwitcherConfig;
  stickyElementsConfig: StickyElementsConfig;
}
export default function AppearanceForm() {
  // Estado para el color seleccionado del overlay del spinner
  const [selectedOverlayColor, setSelectedOverlayColor] = useState("#00000080");

  // Obtener lista de temas disponibles
  const { data: themes, error: themesError } = useSWR<ThemePreset[]>('/api/theme/presets', fetcher, {
    revalidateOnFocus: false,
  });

  // Configuración del formulario con react-hook-form
  const { 
    control, 
    register, 
    handleSubmit, 
    setValue, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<AppearanceFormValues>({
    defaultValues: {
      defaultLightThemePresetId: null,
      defaultDarkThemePresetId: null,
      themeAssignments: [],
      loadingSpinnerConfig: {
        enabled: false,
        overlayColor: "#00000080"
      },
      themeSwitcherConfig: {
        visible: true,
        style: "icon",
        position: "bottom_right"
      },
      stickyElementsConfig: {
        header: false,
        sidebar: false,
        footer: false,
        themeSwitcher: true
      }
    }
  });

  // Configuración para el array de asignaciones de temas
  const { fields, append, remove } = useFieldArray({
    control,
    name: "themeAssignments"
  });

  // Vigilar cambios en la configuración del spinner para actualizar el estado del color
  const loadingSpinnerConfig = watch("loadingSpinnerConfig");
  
  useEffect(() => {
    if (loadingSpinnerConfig?.overlayColor) {
      setSelectedOverlayColor(loadingSpinnerConfig.overlayColor);
    }
  }, [loadingSpinnerConfig?.overlayColor]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Obtener configuración global
        const globalConfig = await fetchGlobalConfig();
        
        if (globalConfig) {
          // Establecer temas por defecto
          if (globalConfig.defaultLightThemePresetId) {
            setValue("defaultLightThemePresetId", globalConfig.defaultLightThemePresetId);
          }
          
          if (globalConfig.defaultDarkThemePresetId) {
            setValue("defaultDarkThemePresetId", globalConfig.defaultDarkThemePresetId);
          }
          
          // Establecer asignaciones de temas
          if (globalConfig.themeAssignments) {
            try {
              const assignments = typeof globalConfig.themeAssignments === 'string'
                ? JSON.parse(globalConfig.themeAssignments)
                : globalConfig.themeAssignments;
              
              // Convertir a formato de array si es un objeto
              if (assignments && typeof assignments === 'object') {
                const assignmentsArray: ThemeAssignment[] = [];
                
                // Si assignments es un objeto con claves de ruta, conviértelo en array
                if (!Array.isArray(assignments)) {
                  Object.entries(assignments).forEach(([path, config]: [string, any]) => {
                    if (path !== 'header' && path !== 'footer' && path !== 'sidebar') { // Excluimos estos porque ya tienen su propia configuración
                      assignmentsArray.push({
                        path,
                        lightThemeId: config.light || null,
                        darkThemeId: config.dark || null
                      });
                    }
                  });
                } else {
                  // Si ya es un array, usarlo directamente
                  assignmentsArray.push(...assignments);
                }
                
                setValue("themeAssignments", assignmentsArray);
              }
            } catch (e) {
              console.error('Error parsing theme assignments:', e);
            }
          }
          
          // Establecer configuración del spinner
          if (globalConfig.loadingSpinnerConfig) {
            try {
              const spinnerConfig = typeof globalConfig.loadingSpinnerConfig === 'string'
                ? JSON.parse(globalConfig.loadingSpinnerConfig)
                : globalConfig.loadingSpinnerConfig;
              
              if (spinnerConfig) {
                setValue("loadingSpinnerConfig", {
                  enabled: !!spinnerConfig.enabled,
                  overlayColor: spinnerConfig.overlayColor || "#00000080",
                  spinnerImageUrl: spinnerConfig.spinnerImageUrl || undefined
                });
                
                setSelectedOverlayColor(spinnerConfig.overlayColor || "#00000080");
              }
            } catch (e) {
              console.error('Error parsing spinner config:', e);
            }
          }
          
          // Establecer configuración del cambiador de temas
          if (globalConfig.themeSwitcherConfig) {
            try {
              const switcherConfig = typeof globalConfig.themeSwitcherConfig === 'string'
                ? JSON.parse(globalConfig.themeSwitcherConfig)
                : globalConfig.themeSwitcherConfig;
              
              if (switcherConfig) {
                setValue("themeSwitcherConfig", {
                  visible: switcherConfig.visible !== false, // Por defecto visible
                  style: switcherConfig.style || "icon",
                  position: switcherConfig.position || "bottom_right"
                });
              }
            } catch (e) {
              console.error('Error parsing theme switcher config:', e);
            }
          }
          
          // Establecer configuración de elementos fijos
          if (globalConfig.stickyElementsConfig) {
            try {
              const stickyConfig = typeof globalConfig.stickyElementsConfig === 'string'
                ? JSON.parse(globalConfig.stickyElementsConfig)
                : globalConfig.stickyElementsConfig;
              
              if (stickyConfig) {
                setValue("stickyElementsConfig", {
                  header: !!stickyConfig.header,
                  sidebar: !!stickyConfig.sidebar,
                  footer: !!stickyConfig.footer,
                  themeSwitcher: stickyConfig.themeSwitcher !== false // Por defecto true
                });
              }
            } catch (e) {
              console.error('Error parsing sticky elements config:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [setValue]);
// Manejar envío del formulario
  const onSubmit = async (data: AppearanceFormValues) => {
    try {
      // Convertir las asignaciones de tema al formato adecuado
      // Si hay alguna asignación específica para header, footer o sidebar
      // se maneja junto con las demás asignaciones
      const themeAssignmentsObj: {[key: string]: {light: number | null, dark: number | null}} = {};
      
      data.themeAssignments.forEach(assignment => {
        themeAssignmentsObj[assignment.path] = {
          light: assignment.lightThemeId,
          dark: assignment.darkThemeId
        };
      });
      
      // Preparar datos para guardar
      const saveData = {
        defaultLightThemePresetId: data.defaultLightThemePresetId,
        defaultDarkThemePresetId: data.defaultDarkThemePresetId,
        themeAssignments: themeAssignmentsObj,
        loadingSpinnerConfig: data.loadingSpinnerConfig,
        themeSwitcherConfig: data.themeSwitcherConfig,
        stickyElementsConfig: data.stickyElementsConfig
      };
      
      // Guardar configuración
      const result = await saveGlobalConfig({
        defaultLightThemePresetId: data.defaultLightThemePresetId,
        defaultDarkThemePresetId: data.defaultDarkThemePresetId,
        themeAssignments: JSON.stringify(themeAssignmentsObj),
        loadingSpinnerConfig: JSON.stringify(data.loadingSpinnerConfig),
        themeSwitcherConfig: JSON.stringify(data.themeSwitcherConfig),
        stickyElementsConfig: JSON.stringify(data.stickyElementsConfig)
      });
      
      if (result.success) {
        alert(result.message || "Configuración guardada con éxito");
      } else {
        alert(result.message || "Error al guardar la configuración");
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      alert("Error al guardar la configuración de apariencia");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="assignments">Asignaciones Específicas</TabsTrigger>
          <TabsTrigger value="spinner">Spinner de Carga</TabsTrigger>
          <TabsTrigger value="switcher">Interruptor de Tema</TabsTrigger>
          <TabsTrigger value="sticky">Elementos Fijos</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de configuración general */}
        <TabsContent value="general">
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
        </TabsContent>
{/* Pestaña de asignaciones específicas */}
        <TabsContent value="assignments">
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
                      <Input
                        {...register(`themeAssignments.${index}.path` as const, {
                          required: "Este campo es obligatorio"
                        })}
                        placeholder="Ej: /blog, /contacto, header, footer"
                      />
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
        </TabsContent>
{/* Pestaña de configuración del spinner de carga */}
        <TabsContent value="spinner">
          <Card>
            <CardHeader>
              <CardTitle>Spinner de Carga</CardTitle>
              <CardDescription>
                Configura el comportamiento y apariencia del spinner de carga durante la navegación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="loadingSpinnerConfig.enabled"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="spinner-enabled"
                      />
                    )}
                  />
                  <Label htmlFor="spinner-enabled">Activar Spinner de Carga</Label>
                </div>
                
                {watch("loadingSpinnerConfig.enabled") && (
                  <>
                    <div className="space-y-2">
                      <Label>Color de Overlay</Label>
                      <div className="mt-2">
                        <CirclePicker
                          color={selectedOverlayColor}
                          onChange={(color) => {
                            setSelectedOverlayColor(color.hex);
                            setValue("loadingSpinnerConfig.overlayColor", color.hex);
                          }}
                          colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39']}
                        />
                        <Input 
                          className="mt-2"
                          value={selectedOverlayColor} 
                          onChange={(e) => {
                            setSelectedOverlayColor(e.target.value);
                            setValue("loadingSpinnerConfig.overlayColor", e.target.value);
                          }} 
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Utiliza valores RGBA o HEXA para controlar la opacidad (ej: #00000080)
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Imagen de Spinner Personalizada</Label>
                      <ImageUploader
                        value={watch("loadingSpinnerConfig.spinnerImageUrl")}
                        onChange={(url) => setValue("loadingSpinnerConfig.spinnerImageUrl", url)}
                        label="Subir imagen para spinner (opcional)"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
{/* Pestaña de configuración del interruptor de tema */}
        <TabsContent value="switcher">
          <Card>
            <CardHeader>
              <CardTitle>Interruptor de Tema</CardTitle>
              <CardDescription>
                Configura la apariencia y posición del interruptor de temas claro/oscuro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="themeSwitcherConfig.visible"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="switcher-visible"
                      />
                    )}
                  />
                  <Label htmlFor="switcher-visible">Mostrar Interruptor de Tema</Label>
                </div>
                
                {watch("themeSwitcherConfig.visible") && (
                  <>
                    <div>
                      <Label htmlFor="switcher-style">Estilo</Label>
                      <Controller
                        name="themeSwitcherConfig.style"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un estilo..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="icon">Solo Icono</SelectItem>
                              <SelectItem value="icon_text">Icono + Texto</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="switcher-position">Posición</Label>
                      <Controller
                        name="themeSwitcherConfig.position"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona una posición..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bottom_right">Abajo Derecha</SelectItem>
                              <SelectItem value="bottom_left">Abajo Izquierda</SelectItem>
                              <SelectItem value="top_right">Arriba Derecha</SelectItem>
                              <SelectItem value="top_left">Arriba Izquierda</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
{/* Pestaña de configuración de elementos fijos */}
        <TabsContent value="sticky">
          <Card>
            <CardHeader>
              <CardTitle>Elementos Fijos</CardTitle>
              <CardDescription>
                Define qué elementos permanecerán fijos durante el desplazamiento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="stickyElementsConfig.header"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="sticky-header"
                        />
                      )}
                    />
                    <Label htmlFor="sticky-header">Cabecera Fija</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="stickyElementsConfig.sidebar"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="sticky-sidebar"
                        />
                      )}
                    />
                    <Label htmlFor="sticky-sidebar">Barra Lateral Fija</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="stickyElementsConfig.footer"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="sticky-footer"
                        />
                      )}
                    />
                    <Label htmlFor="sticky-footer">Pie de Página Fijo</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="stickyElementsConfig.themeSwitcher"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="sticky-switcher"
                        />
                      )}
                    />
                    <Label htmlFor="sticky-switcher">Interruptor de Tema Fijo</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-center">
        <Button type="submit" disabled={isSubmitting} className="px-8">
          Guardar Configuración de Apariencia
        </Button>
      </div>
    </form>
  );
}
