"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';
import { BlogConfig, defaultBlogConfig } from '@/lib/config-server';

// Re-exportamos la interfaz para su uso en componentes
export type { BlogConfig };

/**
 * Obtiene la configuración predeterminada del blog
 */
export async function getDefaultBlogConfig() {
  return defaultBlogConfig;
}

/**
 * Obtiene directamente la configuración del blog de la base de datos
 */
export async function fetchBlogConfig() {
  try {
    console.log("🔍 Obteniendo configuración del blog directamente...");
    
    // Consulta SQL directa para obtener solo el campo blogConfig
    const result = await prisma.$queryRaw`
      SELECT blogConfig 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log("⚠️ No se encontró configuración del blog");
      return defaultBlogConfig;
    }
    
    const blogRaw = result[0].blogConfig;
    console.log("📦 Blog obtenido:", typeof blogRaw, blogRaw ? 'contenido disponible' : 'null');
    
    // Si no hay blog configurado
    if (!blogRaw) {
      console.log("⚠️ El campo blogConfig está vacío, usando valores predeterminados");
      return defaultBlogConfig;
    }
    
    // Intentar parsear el JSON
    try {
      // Parsear si es string, usar directo si ya es objeto
      const blogConfig = typeof blogRaw === 'string'
        ? JSON.parse(blogRaw)
        : blogRaw;
      
      console.log("✅ Blog parseado correctamente");
      
      // Mezclar con valores por defecto para asegurar que todos los campos estén presentes
      return {
        ...defaultBlogConfig,
        ...blogConfig
      };
    } catch (parseError) {
      console.error("❌ Error al parsear blog:", parseError);
      console.log("📦 Contenido de blog que falló el parseo:", blogRaw);
      return defaultBlogConfig;
    }
  } catch (error) {
    console.error("❌ Error al obtener configuración del blog:", error);
    return defaultBlogConfig;
  }
}

/**
 * Guarda la configuración del blog en la base de datos
 */
export async function saveBlogConfig(blogConfig: BlogConfig) {
  try {
    console.log("🔍 Guardando configuración del blog:", blogConfig);
    
    // Convertir a JSON string
    const blogJSON = JSON.stringify(blogConfig);
    
    // Actualizar directamente en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET blogConfig = ?
      WHERE id = 'global'
    `, blogJSON);
    
    // Revalidar rutas necesarias
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/settings/blog");
    
    console.log("✅ Configuración del blog guardada correctamente");
    return { success: true, message: "Configuración del blog actualizada." };
  } catch (error) {
    console.error("❌ Error al guardar configuración del blog:", error);
    return { 
      success: false, 
      message: "Error al guardar la configuración: " + 
        (error instanceof Error ? error.message : String(error)) 
    };
  }
}
