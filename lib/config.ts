import { prisma } from './prisma';
import { GlobalConfig, ThemePreset, SiteSection, MenuItem, Widget, SectionType } from '@prisma/client';

/**
 * Fetches the global configuration settings from the database.
 * Assumes a single configuration record with id 'global'.
 * @returns Promise<GlobalConfig | null>
 */
export async function getGlobalConfig(): Promise<GlobalConfig | null> {
  try {
    const config = await prisma.globalConfig.findUnique({
      where: { id: 'global' },
    });
    return config;
  } catch (error) {
    console.error("Error fetching global config:", error);
    return null; // Or throw error depending on desired handling
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
    
    // 2. If config exists and has defaultLightThemePresetId
    // Usar type assertion para evitar el error de TypeScript
    if (config && (config as any).defaultLightThemePresetId) {
      theme = await prisma.themePreset.findUnique({
        where: { id: (config as any).defaultLightThemePresetId },
      });
    }

    // 3. If still no theme, try fetching any theme
    if (!theme) {
      theme = await prisma.themePreset.findFirst({
        orderBy: { id: 'asc' },
      });
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
