"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';

/**
 * Interfaz básica para la configuración de botones para compartir
 */
export interface SharingConfig {
  buttons: SharingButton[];
}

export interface SharingButton {
  name: string;
  shareUrlBase: string;
  icon?: string;
  newTab?: boolean;
}

// Botones de compartir predeterminados
const DEFAULT_SHARING_BUTTONS = [
  { 
    name: "Facebook", 
    shareUrlBase: "https://www.facebook.com/sharer/sharer.php?u=", 
    icon: "facebook", 
    newTab: true 
  },
  { 
    name: "Twitter", 
    shareUrlBase: "https://twitter.com/intent/tweet?url=", 
    icon: "twitter", 
    newTab: true 
  },
  { 
    name: "WhatsApp", 
    shareUrlBase: "https://wa.me/?text=", 
    icon: "whatsapp", 
    newTab: true 
  }
];

/**
 * Obtiene directamente la configuración de botones para compartir de la base de datos
 */
export async function fetchSharingConfig() {
  try {
    console.log("🔍 Obteniendo configuración de botones para compartir directamente...");
    
    // Consulta SQL directa para obtener solo el campo sharing
    const result = await prisma.$queryRaw`
      SELECT sharing 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log("⚠️ No se encontró configuración de botones para compartir");
      return { buttons: DEFAULT_SHARING_BUTTONS };
    }
    
    const sharingRaw = result[0].sharing;
    console.log("📦 Sharing obtenido:", typeof sharingRaw, sharingRaw ? 'contenido disponible' : 'null');
    
    // Si no hay sharing configurado
    if (!sharingRaw) {
      console.log("⚠️ El campo sharing está vacío, usando valores predeterminados");
      return { buttons: DEFAULT_SHARING_BUTTONS };
    }
    
    // Intentar parsear el JSON
    try {
      // Parsear si es string, usar directo si ya es objeto
      const sharingConfig = typeof sharingRaw === 'string'
        ? JSON.parse(sharingRaw)
        : sharingRaw;
      
      console.log("✅ Sharing parseado correctamente:", 
        sharingConfig && sharingConfig.buttons ? `${sharingConfig.buttons.length} botones` : 'sin botones');
      
      if (!sharingConfig.buttons || !Array.isArray(sharingConfig.buttons) || sharingConfig.buttons.length === 0) {
        console.log("✅ No hay botones configurados, utilizando valores predeterminados");
        return { buttons: DEFAULT_SHARING_BUTTONS };
      }
      
      return { buttons: sharingConfig.buttons };
    } catch (parseError) {
      console.error("❌ Error al parsear sharing:", parseError);
      console.log("📦 Contenido de sharing que falló el parseo:", sharingRaw);
      return { buttons: DEFAULT_SHARING_BUTTONS };
    }
  } catch (error) {
    console.error("❌ Error al obtener configuración de sharing:", error);
    return { buttons: DEFAULT_SHARING_BUTTONS };
  }
}

/**
 * Guarda la configuración de botones para compartir en la base de datos
 */
export async function saveSharingConfig(sharingConfig: SharingConfig) {
  try {
    console.log("🔍 Guardando configuración de botones para compartir:", sharingConfig);
    
    // Convertir a JSON string
    const sharingJSON = JSON.stringify(sharingConfig);
    
    // Actualizar directamente en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET sharing = ?
      WHERE id = 'global'
    `, sharingJSON);
    
    // Revalidar rutas necesarias
    revalidatePath("/");
    revalidatePath("/admin/settings/sharing");
    
    console.log("✅ Configuración de botones para compartir guardada correctamente");
    return { success: true, message: "Configuración de botones para compartir actualizada." };
  } catch (error) {
    console.error("❌ Error al guardar configuración de sharing:", error);
    return { 
      success: false, 
      message: "Error al guardar la configuración: " + 
        (error instanceof Error ? error.message : String(error)) 
    };
  }
}
