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
 * It first tries to find a theme marked as isActive: true.
 * If none is found, it fetches the theme specified by activeThemeId in GlobalConfig.
 * If that also fails, it attempts to fetch the theme with id 'default'.
 * @returns Promise<ThemePreset | null>
 */
export async function getActiveTheme(): Promise<ThemePreset | null> {
  try {
    // 1. Try to find explicitly active theme
    let theme = await prisma.themePreset.findFirst({
      where: { isActive: true },
    });

    // 2. If no active theme, try fetching based on GlobalConfig
    if (!theme) {
      const config = await getGlobalConfig();
      if (config?.activeThemeId) {
        theme = await prisma.themePreset.findUnique({
          where: { id: config.activeThemeId },
        });
      }
    }

    // 3. If still no theme, try fetching the 'default' theme
    if (!theme) {
      theme = await prisma.themePreset.findUnique({
        where: { id: 'default' },
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