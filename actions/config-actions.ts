"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { getGlobalConfig, updateGlobalConfig, GlobalConfig } from "@/lib/config-server"; // Importar desde el archivo de servidor

/**
 * Server Action para obtener la configuración global.
 */
export async function fetchGlobalConfig(): Promise<GlobalConfig | null> {
  return await getGlobalConfig();
}

/**
 * Server Action para actualizar una parte de la configuración global.
 * @param data - Datos parciales a actualizar.
 */
export async function saveGlobalConfig(data: Partial<GlobalConfig>) {
  try {
    await updateGlobalConfig(data);
    // Revalidar rutas relevantes si es necesario (ej: layout principal)
    revalidatePath("/");
    revalidatePath("/admin/settings/header"); 
    revalidatePath("/admin/settings/appearance"); // Revalidar la página de configuración de apariencia
    return { success: true, message: "Configuración guardada." };
  } catch (error) {
    console.error("Error saving global config:", error);
    return { success: false, message: "Error al guardar la configuración: " + (error instanceof Error ? error.message : String(error)) };
  }
}
