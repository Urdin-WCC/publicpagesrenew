"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { fetchGlobalConfig, saveGlobalConfig } from "@/actions/config-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSWR from "swr";
import { toast } from "sonner";

// Importar componentes de pestañas
import GeneralSettingsTab from "./tabs/GeneralSettingsTab";
import ThemeAssignmentsTab from "./tabs/ThemeAssignmentsTab";
import LoadingSpinnerTab from "./tabs/LoadingSpinnerTab";
import ThemeSwitcherTab from "./tabs/ThemeSwitcherTab";
import StickyElementsTab from "./tabs/StickyElementsTab";

// Interfaces básicas necesarias
interface ThemePreset {
  id: number;
  name: string;
}

interface ThemeAssignment {
  path: string;
  lightThemeId: number | null;
  darkThemeId: number | null;
}

interface StaticPage {
  id: number;
  title: string;
  slug: string;
}

interface LoadingSpinnerConfig {
  enabled: boolean;
  overlayColor: string;
  spinnerImageUrl?: string;
}

interface ThemeSwitcherConfig {
  visible: boolean;
  style: "icon" | "icon_text";
  position: "bottom_right" | "bottom_left" | "top_right" | "top_left";
}

interface StickyElementsConfig {
  header: boolean;
  sidebar: boolean;
  footer: boolean;
  themeSwitcher: boolean;
}

interface AppearanceFormValues {
  defaultLightThemePresetId: number | null;
  defaultDarkThemePresetId: number | null;
  themeAssignments: ThemeAssignment[];
  loadingSpinnerConfig: LoadingSpinnerConfig;
  themeSwitcherConfig: ThemeSwitcherConfig;
  stickyElementsConfig: StickyElementsConfig;
}

// Fetcher para useSWR
const fetcher = (url: string) => 
  fetch(url).then(res => res.ok ? res.json() : Promise.reject(new Error("Error cargando datos")));

export default function AppearanceForm() {
  // Estado para el color del spinner
  const [selectedOverlayColor, setSelectedOverlayColor] = useState("#00000080");
  // Estado para controlar cuando los datos iniciales se han cargado
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  
  // Cargar datos de SWR
  const { data: themes } = useSWR<ThemePreset[]>('/api/theme/presets', fetcher, {
    revalidateOnFocus: false
  });
  
  const { data: staticPages } = useSWR<StaticPage[]>('/api/pages', fetcher, {
    revalidateOnFocus: false
  });
  
  // Elementos del sistema
  const systemElements = [
    { id: 'header', name: 'Encabezado', slug: 'header' },
    { id: 'footer', name: 'Pie de Página', slug: 'footer' },
    { id: 'sidebar', name: 'Barra Lateral', slug: 'sidebar' },
    { id: 'blog', name: 'Blog', slug: 'blog' },
    { id: 'portfolio', name: 'Portfolio', slug: 'portfolio' }
  ];
  
  // Inicializar formulario
  const { 
    control, 
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
  
  // Array de asignaciones de temas
  const fieldArrayProps = useFieldArray({
    control,
    name: "themeAssignments"
  });
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración inicial...");
        const config = await fetchGlobalConfig();
        
        if (!config) {
          console.log("⚠️ No se pudo cargar la configuración");
          return;
        }
        
        console.log("📦 Configuración cargada:", config);
        
        // Cargar temas predeterminados
        if (config.defaultLightThemePresetId) {
          setValue("defaultLightThemePresetId", Number(config.defaultLightThemePresetId));
          console.log("✅ Tema claro predeterminado establecido:", config.defaultLightThemePresetId);
        }
        
        if (config.defaultDarkThemePresetId) {
          setValue("defaultDarkThemePresetId", Number(config.defaultDarkThemePresetId));
          console.log("✅ Tema oscuro predeterminado establecido:", config.defaultDarkThemePresetId);
        }
        
        // Cargar asignaciones de temas
        if (config.themeAssignments) {
          try {
            // Si es string, parsearlo como JSON
            const assignments = typeof config.themeAssignments === 'string'
              ? JSON.parse(config.themeAssignments)
              : config.themeAssignments;
              
            if (assignments && typeof assignments === 'object') {
              const assignmentsArray: ThemeAssignment[] = [];
              
              // Convertir de objeto a array si es necesario
              if (!Array.isArray(assignments)) {
                Object.entries(assignments).forEach(([path, config]: [string, any]) => {
                  assignmentsArray.push({
                    path,
                    lightThemeId: config.light || null,
                    darkThemeId: config.dark || null
                  });
                });
              } else {
                assignmentsArray.push(...assignments);
              }
              
              setValue("themeAssignments", assignmentsArray);
              console.log("✅ Asignaciones de temas establecidas:", assignmentsArray);
            }
          } catch (e) {
            console.error('Error parsing theme assignments', e);
          }
        }
        
        // Cargar configuración del spinner
        if (config.loadingSpinnerConfig) {
          try {
            const spinnerConfig = typeof config.loadingSpinnerConfig === 'string'
              ? JSON.parse(config.loadingSpinnerConfig)
              : config.loadingSpinnerConfig;
              
            setValue("loadingSpinnerConfig", {
              enabled: !!spinnerConfig.enabled,
              overlayColor: spinnerConfig.overlayColor || "#00000080",
              spinnerImageUrl: spinnerConfig.spinnerImageUrl || undefined
            });
            
            setSelectedOverlayColor(spinnerConfig.overlayColor || "#00000080");
            console.log("✅ Configuración de spinner establecida:", spinnerConfig);
          } catch (e) {
            console.error('Error parsing spinner config', e);
          }
        }
        
        // Cargar configuración del cambiador de temas
        if (config.themeSwitcherConfig) {
          try {
            const switcherConfig = typeof config.themeSwitcherConfig === 'string'
              ? JSON.parse(config.themeSwitcherConfig)
              : config.themeSwitcherConfig;
              
            setValue("themeSwitcherConfig", {
              visible: switcherConfig.visible !== false,
              style: switcherConfig.style || "icon",
              position: switcherConfig.position || "bottom_right"
            });
            console.log("✅ Configuración de theme switcher establecida:", switcherConfig);
          } catch (e) {
            console.error('Error parsing theme switcher config', e);
          }
        }
        
        // Cargar configuración de elementos fijos
        if (config.stickyElementsConfig) {
          try {
            const stickyConfig = typeof config.stickyElementsConfig === 'string'
              ? JSON.parse(config.stickyElementsConfig)
              : config.stickyElementsConfig;
              
            setValue("stickyElementsConfig", {
              header: !!stickyConfig.header,
              sidebar: !!stickyConfig.sidebar,
              footer: !!stickyConfig.footer,
              themeSwitcher: stickyConfig.themeSwitcher !== false
            });
            console.log("✅ Configuración de elementos fijos establecida:", stickyConfig);
          } catch (e) {
            console.error('Error parsing sticky elements config', e);
          }
        }
        
        // Marcar como cargado
        setIsInitialDataLoaded(true);
        console.log("✅ Carga inicial de datos completada");
      } catch (error) {
        console.error('Error loading config', error);
        toast.error("Error al cargar la configuración");
      }
    };
    
    loadConfig();
  }, [setValue]);
  
  // Enviar formulario
  const onSubmit = async (data: AppearanceFormValues) => {
    try {
      console.log("📝 Preparando datos para guardar:", data);
      
      // Convertir asignaciones a formato para guardar
      const themeAssignmentsObj: {[key: string]: {light: number | null, dark: number | null}} = {};
      
      data.themeAssignments.forEach(assignment => {
        themeAssignmentsObj[assignment.path] = {
          light: assignment.lightThemeId,
          dark: assignment.darkThemeId
        };
      });
      
      // Preparar datos - convertimos a strings para evitar problemas de tipado
      const saveData = {
        defaultLightThemePresetId: data.defaultLightThemePresetId,
        defaultDarkThemePresetId: data.defaultDarkThemePresetId,
        // Convertimos a JSON string todos los objetos
        themeAssignments: JSON.stringify(themeAssignmentsObj),
        loadingSpinnerConfig: JSON.stringify(data.loadingSpinnerConfig),
        themeSwitcherConfig: JSON.stringify(data.themeSwitcherConfig),
        stickyElementsConfig: JSON.stringify(data.stickyElementsConfig)
      };
      
      console.log("🔍 Enviando datos al servidor:", saveData);
      
      // Guardar
      const result = await saveGlobalConfig(saveData);
      
      if (result.success) {
        console.log("✅ Configuración guardada correctamente");
        toast.success(result.message || "Configuración guardada correctamente");
        
        // Recargar configuración para asegurar de que todo está sincronizado
        const updatedConfig = await fetchGlobalConfig();
        console.log("🔄 Configuración actualizada recibida:", updatedConfig);
      } else {
        console.error("❌ Error al guardar la configuración:", result.message);
        toast.error(result.message || "Error al guardar la configuración");
      }
    } catch (error) {
      console.error('Error saving config', error);
      toast.error("Error al guardar la configuración");
    }
  };
  
  // Si los temas o páginas no están disponibles
  if (!themes || !staticPages) {
    return <div className="p-8 text-center">Cargando datos...</div>;
  }
  
  // Renderizar formulario con pestañas
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
          <TabsTrigger value="spinner">Spinner de Carga</TabsTrigger>
          <TabsTrigger value="switcher">Interruptor de Tema</TabsTrigger>
          <TabsTrigger value="sticky">Elementos Fijos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettingsTab 
            control={control as any}
            themes={themes}
          />
        </TabsContent>
        
        <TabsContent value="assignments">
          <ThemeAssignmentsTab 
            control={control as any}
            fieldArrayProps={fieldArrayProps as any}
            watch={watch}
            setValue={setValue}
            errors={errors}
            themes={themes}
            staticPages={staticPages}
            systemElements={systemElements}
          />
        </TabsContent>
        
        <TabsContent value="spinner">
          <LoadingSpinnerTab 
            control={control as any}
            watch={watch}
            setValue={setValue}
            selectedOverlayColor={selectedOverlayColor}
            setSelectedOverlayColor={setSelectedOverlayColor}
          />
        </TabsContent>
        
        <TabsContent value="switcher">
          <ThemeSwitcherTab 
            control={control as any}
            watch={watch}
          />
        </TabsContent>
        
        <TabsContent value="sticky">
          <StickyElementsTab control={control as any} />
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-center">
        <Button type="submit" disabled={isSubmitting} className="px-8">
          {isSubmitting ? "Guardando..." : "Guardar Configuración de Apariencia"}
        </Button>
      </div>
      
      {/* Muestra el estado de carga de datos iniciales */}
      {!isInitialDataLoaded && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Cargando configuración inicial...
        </div>
      )}
    </form>
  );
}
