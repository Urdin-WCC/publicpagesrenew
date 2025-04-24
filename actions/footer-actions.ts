"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';

/**
 * Interfaz básica para la configuración del footer
 */
export interface FooterConfig {
  widgets: FooterWidget[];
  height: string;
  secondaryHtml: string;
}

interface FooterWidget {
  type: string;
  config: any;
}

/**
 * Obtiene directamente la configuración del footer de la base de datos
 */
export async function fetchFooterConfig() {
  try {
    console.log("🔍 Obteniendo configuración de footer directamente...");
    
    // Consulta SQL directa para obtener solo el campo footer
    const result = await prisma.$queryRaw`
      SELECT footer 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log("⚠️ No se encontró configuración de footer");
      return null;
    }
    
    const footerRaw = result[0].footer;
    console.log("📦 Footer obtenido:", typeof footerRaw, footerRaw ? 'contenido disponible' : 'null');
    
    // Si no hay footer configurado
    if (!footerRaw) {
      console.log("⚠️ El campo footer está vacío");
      return {
        widgets: [],
        height: "",
        secondaryHtml: ""
      };
    }
    
    // Intentar parsear el JSON
    try {
      // Parsear si es string, usar directo si ya es objeto
      const footerConfig = typeof footerRaw === 'string'
        ? JSON.parse(footerRaw)
        : footerRaw;
      
      console.log("✅ Footer parseado correctamente:", 
        footerConfig && footerConfig.widgets ? `${footerConfig.widgets.length} widgets` : 'sin widgets');
      
      return {
        widgets: Array.isArray(footerConfig.widgets) ? footerConfig.widgets : [],
        height: footerConfig.height || "",
        secondaryHtml: footerConfig.secondaryHtml || ""
      };
    } catch (parseError) {
      console.error("❌ Error al parsear footer:", parseError);
      console.log("📦 Contenido de footer que falló el parseo:", footerRaw);
      return {
        widgets: [],
        height: "",
        secondaryHtml: ""
      };
    }
  } catch (error) {
    console.error("❌ Error al obtener configuración de footer:", error);
    return null;
  }
}

/**
 * Guarda la configuración del footer en la base de datos
 */
export async function saveFooterConfig(footerConfig: FooterConfig) {
  try {
    console.log("🔍 Guardando configuración de footer:", footerConfig);
    
    // Convertir a JSON string
    const footerJSON = JSON.stringify(footerConfig);
    
    // Actualizar directamente en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET footer = ?
      WHERE id = 'global'
    `, footerJSON);
    
    // Revalidar rutas necesarias
    revalidatePath("/");
    revalidatePath("/admin/settings/footer");
    
    console.log("✅ Configuración de footer guardada correctamente");
    return { success: true, message: "Configuración de pie de página actualizada." };
  } catch (error) {
    console.error("❌ Error al guardar configuración de footer:", error);
    return { 
      success: false, 
      message: "Error al guardar la configuración: " + 
        (error instanceof Error ? error.message : String(error)) 
    };
  }
}
