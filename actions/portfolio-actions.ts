"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';

/**
 * Interfaz básica para la configuración del portfolio (sincronizada con lib/config-server.ts)
 */
export interface PortfolioConfig {
  projectsPerPage: number;
  defaultDisplayType: 'SINGLE' | 'GALLERY' | 'SLIDER' | 'GRID';
  layoutMode: 'grid' | 'list';
  showSidebarInList: boolean;
  showSidebarInProject: boolean;
  sidebarPositionInList: 'left' | 'right';
  sidebarPositionInProject: 'left' | 'right';
  showSharingInProject: boolean;
}

// Configuración predeterminada del portfolio (completa y sincro)
const DEFAULT_PORTFOLIO_CONFIG: PortfolioConfig = {
  projectsPerPage: 12,
  defaultDisplayType: 'GRID',
  layoutMode: 'grid',
  showSidebarInList: true,
  showSidebarInProject: true,
  sidebarPositionInList: 'right',
  sidebarPositionInProject: 'right',
  showSharingInProject: true
};

/**
 * Obtiene la configuración predeterminada del portfolio
 */
export async function getDefaultPortfolioConfig() {
  return DEFAULT_PORTFOLIO_CONFIG;
}

/**
 * Obtiene directamente la configuración del portfolio de la base de datos
 */
export async function fetchPortfolioConfig() {
  try {
    console.log("🔍 Obteniendo configuración de portfolio directamente...");
    
    // Consulta SQL directa para obtener solo el campo portfolioConfig
    const result = await prisma.$queryRaw`
      SELECT portfolioConfig 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log("⚠️ No se encontró configuración de portfolio");
      return DEFAULT_PORTFOLIO_CONFIG;
    }
    
    const portfolioRaw = result[0].portfolioConfig;
    console.log("📦 Portfolio obtenido:", typeof portfolioRaw, portfolioRaw ? 'contenido disponible' : 'null');
    
    // Si no hay portfolio configurado
    if (!portfolioRaw) {
      console.log("⚠️ El campo portfolioConfig está vacío, usando valores predeterminados");
      return DEFAULT_PORTFOLIO_CONFIG;
    }
    
    // Intentar parsear el JSON
    try {
      // Parsear si es string, usar directo si ya es objeto
      const portfolioConfig = typeof portfolioRaw === 'string'
        ? JSON.parse(portfolioRaw)
        : portfolioRaw;
      
      console.log("✅ Portfolio parseado correctamente");
      
      // Mezclar con valores por defecto para asegurar que todos los campos estén presentes
      return {
        ...DEFAULT_PORTFOLIO_CONFIG,
        ...portfolioConfig
      };
    } catch (parseError) {
      console.error("❌ Error al parsear portfolio:", parseError);
      console.log("📦 Contenido de portfolio que falló el parseo:", portfolioRaw);
      return DEFAULT_PORTFOLIO_CONFIG;
    }
  } catch (error) {
    console.error("❌ Error al obtener configuración de portfolio:", error);
    return DEFAULT_PORTFOLIO_CONFIG;
  }
}

/**
 * Guarda la configuración del portfolio en la base de datos
 */
export async function savePortfolioConfig(portfolioConfig: PortfolioConfig) {
  try {
    console.log("🔍 Guardando configuración de portfolio:", portfolioConfig);
    
    // Convertir a JSON string
    const portfolioJSON = JSON.stringify(portfolioConfig);
    
    // Actualizar directamente en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET portfolioConfig = ?
      WHERE id = 'global'
    `, portfolioJSON);
    
    // Revalidar rutas necesarias
    revalidatePath("/");
    revalidatePath("/portfolio");
    revalidatePath("/admin/settings/portfolio");
    
    console.log("✅ Configuración de portfolio guardada correctamente");
    return { success: true, message: "Configuración de portfolio actualizada." };
  } catch (error) {
    console.error("❌ Error al guardar configuración de portfolio:", error);
    return { 
      success: false, 
      message: "Error al guardar la configuración: " + 
        (error instanceof Error ? error.message : String(error)) 
    };
  }
}
