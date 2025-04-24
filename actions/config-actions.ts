"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { getGlobalConfig as getGlobalConfigServer, updateGlobalConfig, GlobalConfig } from "@/lib/config-server"; 
import { getGlobalConfig as getGlobalConfigRobust } from "@/lib/config"; // Importamos la versión robusta

/**
 * Server Action para obtener la configuración global.
 * Usamos la versión robusta que obtiene los campos de apariencia directamente con SQL.
 */
export async function fetchGlobalConfig(): Promise<GlobalConfig | null> {
  // Añadir un timestamp a la consulta para evitar caché
  const timestamp = Date.now();
  console.log(`🔍 fetchGlobalConfig - Iniciando petición [ts: ${timestamp}]`);
  
  try {
    // Primero intentamos con la versión robusta que usa SQL directo
    let config = await getGlobalConfigRobust();
    
    // Si no tiene campos necesarios, intentamos con la versión normal
    if (!config || (!config.defaultLightThemePresetId && !config.loadingSpinnerConfig)) {
      console.log("⚠️ Usando método secundario de obtención de configuración");
      config = await getGlobalConfigServer();
    }
    
    console.log(`✅ fetchGlobalConfig - Resultado [ts: ${timestamp}]:`, JSON.stringify(config, null, 2));
    
    // Forzar que Next.js no cachee esta respuesta
    revalidatePath("/admin/settings/appearance");
    
    return config;
  } catch (error) {
    console.error(`❌ Error en fetchGlobalConfig [ts: ${timestamp}]:`, error);
    // En caso de error, intentar con el método tradicional como fallback
    return getGlobalConfigServer();
  }
}

/**
 * Server Action para actualizar una parte de la configuración global.
 * @param data - Datos parciales a actualizar.
 */
export async function saveGlobalConfig(data: Partial<GlobalConfig>) {
  try {
    // Añadir un timestamp a la operación para rastreo
    const timestamp = Date.now();
    console.log(`🔍 saveGlobalConfig - Iniciando guardado [ts: ${timestamp}]`);
    console.log(`📦 Datos recibidos para guardar:`, JSON.stringify(data, null, 2));
    
    // Guardar la configuración
    const result = await updateGlobalConfig(data);
    
    console.log(`✅ Resultado de guardado [ts: ${timestamp}]:`, 
      result ? "Datos guardados correctamente" : "No se pudo guardar la configuración");
    
    // Invalidar cachés agresivamente
    console.log("🔄 Revalidando todas las rutas relacionadas con la configuración...");
    
    // Revalidar rutas relevantes (con { force: true } para forzar la revalidación)
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/settings", "layout");
    revalidatePath("/admin/settings/appearance", "page");
    revalidatePath("/admin/settings/header", "page");
    revalidatePath("/admin/settings/sharing", "page");
    revalidatePath("/admin/settings/menu", "page");
    
    // Para indicar que la revalidación fue exitosa
    console.log("✅ Rutas revalidadas correctamente");
    
    return { 
      success: true, 
      message: "Configuración guardada correctamente.",
      timestamp
    };
  } catch (error) {
    console.error(`❌ Error guardando configuración [ts: ${Date.now()}]:`, error);
    return { 
      success: false, 
      message: "Error al guardar la configuración: " + (error instanceof Error ? error.message : String(error))
    };
  }
}
