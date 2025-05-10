"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';

/**
 * Interfaz básica para la configuración de la barra lateral
 */
export interface SidebarConfig {
  position: string;
  width: string;
  visible: boolean;
  widgets: SidebarWidget[];
}

export interface SidebarWidget {
  type: string;
  title: string;
  config: any;
}

/**
 * Obtiene directamente la configuración de la barra lateral de la base de datos
 */
export async function fetchSidebarConfig() {
  try {
    console.log("🔍 Obteniendo configuración de barra lateral directamente...");
    
    // Consulta SQL directa para obtener solo el campo sidebar
    const result = await prisma.$queryRaw`
      SELECT sidebar 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log("⚠️ No se encontró configuración de barra lateral");
      return null;
    }
    
    const sidebarRaw = result[0].sidebar;
    console.log("📦 Sidebar obtenido:", typeof sidebarRaw, sidebarRaw ? 'contenido disponible' : 'null');
    
    // Si no hay sidebar configurado
    if (!sidebarRaw) {
      console.log("⚠️ El campo sidebar está vacío");
      return {
        position: "left",
        width: "300px", 
        visible: true,
        widgets: []
      };
    }
    
    // Intentar parsear el JSON
    try {
      // Parsear si es string, usar directo si ya es objeto
      const sidebarConfig = typeof sidebarRaw === 'string'
        ? JSON.parse(sidebarRaw)
        : sidebarRaw;
      
      console.log("✅ Sidebar parseado correctamente:", 
        sidebarConfig && sidebarConfig.widgets ? `${sidebarConfig.widgets.length} widgets` : 'sin widgets');
      
      return {
        position: sidebarConfig.position || "left",
        width: sidebarConfig.width || "300px",
        visible: sidebarConfig.visible !== false,
        widgets: Array.isArray(sidebarConfig.widgets) ? sidebarConfig.widgets : []
      };
    } catch (parseError) {
      console.error("❌ Error al parsear sidebar:", parseError);
      console.log("📦 Contenido de sidebar que falló el parseo:", sidebarRaw);
      return {
        position: "left",
        width: "300px",
        visible: true,
        widgets: []
      };
    }
  } catch (error) {
    console.error("❌ Error al obtener configuración de sidebar:", error);
    return null;
  }
}

/**
 * Guarda la configuración de la barra lateral en la base de datos
 */
export async function saveSidebarConfig(sidebarConfig: SidebarConfig) {
  try {
    console.log("🔍 Guardando configuración de barra lateral:", sidebarConfig);
    
    // Convertir a JSON string
    const sidebarJSON = JSON.stringify(sidebarConfig);
    
    // Actualizar directamente en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET sidebar = ?
      WHERE id = 'global'
    `, sidebarJSON);
    
    // Revalidar rutas necesarias
    revalidatePath("/");
    revalidatePath("/admin/settings/sidebar");
    
    console.log("✅ Configuración de sidebar guardada correctamente");
    return { success: true, message: "Configuración de barra lateral actualizada." };
  } catch (error) {
    console.error("❌ Error al guardar configuración de sidebar:", error);
    return { 
      success: false, 
      message: "Error al guardar la configuración: " + 
        (error instanceof Error ? error.message : String(error)) 
    };
  }
}
