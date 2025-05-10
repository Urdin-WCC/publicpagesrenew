import { prisma } from './prisma';
import { ThemePreset, SiteSection, MenuItem, Widget, SectionType } from '@prisma/client';
import type { GlobalConfig } from './config-server';

/**
 * Fetches the global configuration settings from the database.
 * Assumes a single configuration record with id 'global'.
 * Includes fallback mechanism for handling invalid datetime values.
 * @returns Promise<GlobalConfig | null>
 */
export async function getGlobalConfig(): Promise<GlobalConfig | null> {
  try {
    // Intentar obtener toda la configuración con una consulta SQL directa
    // Incluir los campos específicos de tema
    try {
      const config = await prisma.$queryRaw`
        SELECT 
          id, siteName, description, maintenanceMode, 
          defaultLightThemePresetId, defaultDarkThemePresetId,
          themeAssignments, loadingSpinnerConfig, 
          themeSwitcherConfig, stickyElementsConfig, sharing,
          navigationMenu
        FROM GlobalConfig 
        WHERE id = 'global'
      `;
      
      if (Array.isArray(config) && config.length > 0) {
        // Devolver la primera fila de resultados con fechas por defecto
        return {
          ...config[0],
          createdAt: new Date(),
          updatedAt: new Date()
        } as any;
      }
    } catch (mainQueryError) {
      console.error("Error en consulta principal:", mainQueryError);
      
      // Si falla la consulta principal, intentar con una consulta más simple
      try {
        // Get manually with a simpler query - but include navigationMenu
        const basicConfig = await prisma.$queryRaw`
          SELECT id, siteName, description, maintenanceMode, navigationMenu
          FROM GlobalConfig 
          WHERE id = 'global'
        `;
        
        if (Array.isArray(basicConfig) && basicConfig.length > 0) {
          // Build a config object with default dates
          return {
            ...basicConfig[0],
            createdAt: new Date(),
            updatedAt: new Date()
          } as any;
        }
      } catch (simpleQueryError) {
        console.error("Error en consulta simple:", simpleQueryError);
      }
    }
    
    // Final fallback: create a default config
    console.log("Creating default GlobalConfig object");
    return {
      id: 'global',
      siteName: 'Neurowitch',
      description: 'Sitio web',
      navigationMenu: '[]',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  } catch (error) {
    console.error("Error fetching global config:", error);
    
    // Return minimal default config as last resort
    return {
      id: 'global',
      siteName: 'Neurowitch',
      description: 'Sitio web',
      navigationMenu: '[]',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }
}

/**
 * Fetches the currently active theme preset from the database.
 * It tries to fetch the theme specified by defaultLightThemePresetId in GlobalConfig.
 * If that fails, it attempts to fetch the first theme available.
 * @returns Promise<ThemePreset | null>
 */
export async function getActiveTheme(): Promise<ThemePreset | null> {
  try {
    // 1. Try fetching based on GlobalConfig
    const config = await getGlobalConfig();
    let theme = null;
    
    // 2. Check if config exists and has defaultLightThemePresetId
    if (config) {
      // Usar consulta directa para evitar problemas con el schema
      // Acceder al campo de forma segura con la notación as any
      const themeId = (config as any).defaultLightThemePresetId;
      
      if (themeId) {
        try {
          // Usar queryRaw para evitar problemas de tipo
          const result = await prisma.$queryRaw`
            SELECT id, name, config 
            FROM ThemePreset 
            WHERE id = ${themeId}
          `;
          
          // Convertir resultado a objeto ThemePreset
          if (Array.isArray(result) && result.length > 0) {
            theme = result[0] as ThemePreset;
          }
        } catch (fetchError) {
          console.error("Error fetching theme by ID:", fetchError);
        }
      }
    }

    // 3. If still no theme, try fetching any theme
    if (!theme) {
      try {
        const result = await prisma.$queryRaw`
          SELECT id, name, config 
          FROM ThemePreset 
          ORDER BY id ASC 
          LIMIT 1
        `;
        
        if (Array.isArray(result) && result.length > 0) {
          theme = result[0] as ThemePreset;
        }
      } catch (fallbackError) {
        console.error("Error fetching fallback theme:", fallbackError);
      }
    }

    return theme;
  } catch (error) {
    console.error("Error fetching active theme:", error);
    return null; // Or throw error
  }
}

/**
 * Type definition for SiteSection including its related items.
 */
export type SiteSectionWithItems = SiteSection & {
  menuItems: MenuItem[];
  widgets: Widget[];
};

/**
 * Fetches a specific site section (HEADER, FOOTER, SIDEBAR) along with its
 * active menu items and active widgets, ordered correctly.
 * @param sectionType - The type of section to fetch (HEADER, FOOTER, SIDEBAR)
 * @returns Promise<SiteSectionWithItems | null>
 */
export async function getSectionWithItems(sectionType: SectionType): Promise<SiteSectionWithItems | null> {
  try {
    const section = await prisma.siteSection.findFirst({
      where: {
        type: sectionType,
        isActive: true, // Ensure the section itself is active
      },
      include: {
        menuItems: {
          where: { isActive: true }, // Only include active menu items
          orderBy: { order: 'asc' }, // Order menu items
        },
        widgets: {
          where: { isActive: true }, // Only include active widgets
          orderBy: { order: 'asc' }, // Order widgets
        },
      },
    });
    return section;
  } catch (error) {
    console.error(`Error fetching section ${sectionType}:`, error);
    return null; // Or throw error
  }
}
