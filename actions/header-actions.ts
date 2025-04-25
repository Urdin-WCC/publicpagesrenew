"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';

/**
 * Interfaz básica para la configuración del header
 */
export interface HeaderConfig {
  elements: HeaderElementConfig[];
}

export interface HeaderElementConfig {
  type: string;
  visible: boolean;
  position: string;
  logoUrl?: string;
  html?: string;
  height?: string; // Altura del encabezado
}

// Elementos predeterminados para el header
const DEFAULT_HEADER_ELEMENTS = [
  { type: "logo", visible: true, position: "top-left" },
  { type: "text", visible: true, position: "top-center" },
  { type: "menu", visible: true, position: "top-right" },
  { type: "social", visible: true, position: "bottom-left" },
  { type: "theme", visible: true, position: "bottom-right" },
  { type: "html", visible: true, position: "center-center" }
];

/**
 * Obtiene directamente la configuración del header de la base de datos
 */
export async function fetchHeaderConfig() {
  try {
    console.log("🔍 Obteniendo configuración de header directamente...");
    
    // Consulta SQL directa para obtener solo el campo header
    const result = await prisma.$queryRaw`
      SELECT header 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log("⚠️ No se encontró configuración de header");
      return { elements: DEFAULT_HEADER_ELEMENTS };
    }
    
    const headerRaw = result[0].header;
    console.log("📦 Header obtenido:", typeof headerRaw, headerRaw ? 'contenido disponible' : 'null');
    
    // Si no hay header configurado
    if (!headerRaw) {
      console.log("⚠️ El campo header está vacío, usando valores predeterminados");
      return { elements: DEFAULT_HEADER_ELEMENTS };
    }
    
    // Intentar parsear el JSON
    try {
      // Parsear si es string, usar directo si ya es objeto
      const headerConfig = typeof headerRaw === 'string'
        ? JSON.parse(headerRaw)
        : headerRaw;
      
      console.log("✅ Header parseado correctamente:", 
        headerConfig && headerConfig.elements ? `${headerConfig.elements.length} elementos` : 'sin elementos');
      
      if (!headerConfig.elements || !Array.isArray(headerConfig.elements) || headerConfig.elements.length === 0) {
        // Devolver valores predeterminados cuando no hay elementos
        console.log("✅ No hay elementos, utilizando valores predeterminados");
        return { elements: DEFAULT_HEADER_ELEMENTS };
      }
      
      // Asegurarse de que todos los tipos de elementos estén presentes
      const existingTypes = headerConfig.elements.map((elem: HeaderElementConfig) => elem.type);
      const missingElements = DEFAULT_HEADER_ELEMENTS.filter(
        (elem: HeaderElementConfig) => !existingTypes.includes(elem.type)
      );
      
      if (missingElements.length > 0) {
        console.log("✅ Añadiendo elementos faltantes:", missingElements.length);
        return {
          elements: [...headerConfig.elements, ...missingElements]
        };
      }
      
      return {
        elements: headerConfig.elements
      };
    } catch (parseError) {
      console.error("❌ Error al parsear header:", parseError);
      console.log("📦 Contenido de header que falló el parseo:", headerRaw);
      return {
        elements: DEFAULT_HEADER_ELEMENTS
      };
    }
  } catch (error) {
    console.error("❌ Error al obtener configuración de header:", error);
    return { elements: DEFAULT_HEADER_ELEMENTS };
  }
}

/**
 * Guarda la configuración del header en la base de datos
 */
export async function saveHeaderConfig(headerConfig: HeaderConfig) {
  try {
    console.log("🔍 Guardando configuración de header:", headerConfig);
    
    // Convertir a JSON string
    const headerJSON = JSON.stringify(headerConfig);
    
    // Actualizar directamente en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET header = ?
      WHERE id = 'global'
    `, headerJSON);
    
    // Revalidar rutas necesarias
    revalidatePath("/");
    revalidatePath("/admin/settings/header");
    
    console.log("✅ Configuración de header guardada correctamente");
    return { success: true, message: "Configuración de encabezado actualizada." };
  } catch (error) {
    console.error("❌ Error al guardar configuración de header:", error);
    return { 
      success: false, 
      message: "Error al guardar la configuración: " + 
        (error instanceof Error ? error.message : String(error)) 
    };
  }
}
