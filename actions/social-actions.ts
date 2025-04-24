"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';

/**
 * Interfaz básica para la configuración de enlaces de redes sociales
 */
export interface SocialConfig {
  links: SocialLink[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: string;
  newTab?: boolean;
}

// Enlaces de redes sociales predeterminados
const DEFAULT_SOCIAL_LINKS = [
  { 
    name: "Facebook", 
    url: "https://facebook.com/", 
    icon: "facebook", 
    newTab: true 
  },
  { 
    name: "Twitter", 
    url: "https://twitter.com/", 
    icon: "twitter", 
    newTab: true 
  },
  { 
    name: "Instagram", 
    url: "https://instagram.com/", 
    icon: "instagram", 
    newTab: true 
  }
];

/**
 * Obtiene directamente la configuración de enlaces de redes sociales de la base de datos
 */
export async function fetchSocialConfig() {
  try {
    console.log("🔍 Obteniendo configuración de redes sociales directamente...");
    
    // Consulta SQL directa para obtener solo el campo social
    const result = await prisma.$queryRaw`
      SELECT social 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log("⚠️ No se encontró configuración de redes sociales");
      return { links: DEFAULT_SOCIAL_LINKS };
    }
    
    const socialRaw = result[0].social;
    console.log("📦 Social obtenido:", typeof socialRaw, socialRaw ? 'contenido disponible' : 'null');
    
    // Si no hay social configurado
    if (!socialRaw) {
      console.log("⚠️ El campo social está vacío, usando valores predeterminados");
      return { links: DEFAULT_SOCIAL_LINKS };
    }
    
    // Intentar parsear el JSON
    try {
      // Parsear si es string, usar directo si ya es objeto
      const socialConfig = typeof socialRaw === 'string'
        ? JSON.parse(socialRaw)
        : socialRaw;
      
      console.log("✅ Social parseado correctamente:", 
        socialConfig && socialConfig.links ? `${socialConfig.links.length} enlaces` : 'sin enlaces');
      
      if (!socialConfig.links || !Array.isArray(socialConfig.links) || socialConfig.links.length === 0) {
        console.log("✅ No hay enlaces configurados, utilizando valores predeterminados");
        return { links: DEFAULT_SOCIAL_LINKS };
      }
      
      return { links: socialConfig.links };
    } catch (parseError) {
      console.error("❌ Error al parsear social:", parseError);
      console.log("📦 Contenido de social que falló el parseo:", socialRaw);
      return { links: DEFAULT_SOCIAL_LINKS };
    }
  } catch (error) {
    console.error("❌ Error al obtener configuración de redes sociales:", error);
    return { links: DEFAULT_SOCIAL_LINKS };
  }
}

/**
 * Guarda la configuración de enlaces de redes sociales en la base de datos
 */
export async function saveSocialConfig(socialConfig: SocialConfig) {
  try {
    console.log("🔍 Guardando configuración de redes sociales:", socialConfig);
    
    // Convertir a JSON string
    const socialJSON = JSON.stringify(socialConfig);
    
    // Actualizar directamente en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET social = ?
      WHERE id = 'global'
    `, socialJSON);
    
    // Revalidar rutas necesarias
    revalidatePath("/");
    revalidatePath("/admin/settings/social");
    
    console.log("✅ Configuración de redes sociales guardada correctamente");
    return { success: true, message: "Configuración de redes sociales actualizada." };
  } catch (error) {
    console.error("❌ Error al guardar configuración de redes sociales:", error);
    return { 
      success: false, 
      message: "Error al guardar la configuración: " + 
        (error instanceof Error ? error.message : String(error)) 
    };
  }
}
