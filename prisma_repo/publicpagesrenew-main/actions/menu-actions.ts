"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';

/**
 * Obtiene directamente el menú de navegación de la base de datos
 */
export async function fetchNavigationMenu() {
  try {
    console.log("Obteniendo menú de navegación directamente...");
    
    // Consulta SQL directa para obtener solo el campo navigationMenu
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].navigationMenu) {
      console.log("No se encontró menú de navegación");
      return { items: [] };
    }
    
    const navigationMenuRaw = result[0].navigationMenu;
    console.log("Menú obtenido:", navigationMenuRaw);
    
    // Intentar parsear el JSON
    try {
      const menuDataRaw = typeof navigationMenuRaw === 'string'
        ? JSON.parse(navigationMenuRaw)
        : navigationMenuRaw;
      
      // Asegurarnos de que los valores booleanos se manejen correctamente
      const menuData = Array.isArray(menuDataRaw) ? menuDataRaw.map(item => ({
        ...item,
        // Convertir explícitamente a booleano si es string
        openInNewTab: item.openInNewTab === 'true' || item.openInNewTab === true
      })) : [];
      
      console.log("Menú parseado con booleanos corregidos:", menuData);
      return { items: menuData };
    } catch (parseError) {
      console.error("Error al parsear menú:", parseError);
      return { items: [] };
    }
  } catch (error) {
    console.error("Error al obtener menú de navegación:", error);
    return { items: [] };
  }
}

/**
 * Actualiza el menú de navegación en la base de datos
 */
export async function saveNavigationMenu(items: any[]) {
  try {
    console.log("Guardando menú de navegación:", items);
    
    // Asegurarnos de que los valores booleanos se manejen correctamente
    const processedItems = items.map(item => ({
      ...item,
      // Convertir explícitamente a booleano si es string
      openInNewTab: item.openInNewTab === 'true' || item.openInNewTab === true
    }));
    
    console.log("Menú procesado con booleanos corregidos:", processedItems);
    
    // Convertir a JSON string
    const menuJSON = JSON.stringify(processedItems);
    
    // Actualizar directamente en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET navigationMenu = ?
      WHERE id = 'global'
    `, menuJSON);
    
    // Revalidar rutas necesarias
    revalidatePath("/");
    revalidatePath("/admin/settings/menu");
    
    return { success: true, message: "Menú de navegación actualizado." };
  } catch (error) {
    console.error("Error al guardar menú de navegación:", error);
    return { 
      success: false, 
      message: "Error al guardar el menú: " + 
        (error instanceof Error ? error.message : String(error)) 
    };
  }
}
