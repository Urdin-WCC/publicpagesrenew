import { prisma } from './prisma';

// Funciones específicas para tematización del panel ADMIN

export async function getAdminThemePresetConfigById(id: number | string | null | undefined) {
  if (id == null) return null;
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/theme-preset/${id}`);
      if (!res.ok) return null;
      const { config } = await res.json();
      return config || null;
    } catch (err) {
      console.error("Error fetching theme config from API:", err);
      return null;
    }
  } else {
    try {
      const result = await prisma.$queryRaw`
        SELECT config 
        FROM ThemePreset 
        WHERE id = ${id.toString()}
      `;
      if (!Array.isArray(result) || result.length === 0 || !result[0].config) {
        return null;
      }
      const themeConfig = result[0].config;
      if (typeof themeConfig === 'string') {
        try {
          return JSON.parse(themeConfig);
        } catch {
          return null;
        }
      }
      return themeConfig;
    } catch (error) {
      console.error(`Error fetching theme preset with ID ${id}:`, error);
      return null;
    }
  }
}

// Version admin-only de flattenThemeConfig igualando convención pública
function flattenAdminThemeConfig(config: any, prefix: string = '--'): Record<string, string> {
  if (!config) return {};
  const result: Record<string, string> = {};

  Object.entries(config).forEach(([key, value]) => {
    if (key === "background" && value && typeof value === "object") {
      if ("value" in value) result["--background"] = String((value as any).value);
      if ("type" in value) result["--background-type"] = String((value as any).type);
    } else if (key === "foreground" && value && typeof value === "object" && "value" in value) {
      result["--foreground"] = String((value as any).value);
    } else if (key === "card" && value && typeof value === "object" && "value" in value) {
      result["--card"] = String((value as any).value);
    } else if (key === "typography" && value && typeof value === "object") {
      // Flatten nested: heading, paragraph, link, button, etc.
      const typographyKeys = ["heading", "paragraph", "link", "button"];
      typographyKeys.forEach(tk => {
        if (tk in value && value[tk] && typeof value[tk] === "object") {
          const props = value[tk] as Record<string, any>;
          Object.entries(props).forEach(([propN, propV]) => {
            if (typeof propV !== "undefined") {
              result[`--typography-${tk}-${propN}`] = String(propV);
            }
          });
        }
      });
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const nestedValues = flattenAdminThemeConfig(value, `${prefix}${key}-`);
      Object.assign(result, nestedValues);
    } else {
      result[`${prefix}${key}`] = String(value);
    }
  });

  return result;
}

// Helper para generar CSS (igual interfaz que en themeUtils)
export function generateAdminCssFromThemeConfigs(lightConfig: any, darkConfig: any, selector?: string) {
  // Use default fallback si hace falta
  if (!lightConfig && !darkConfig) return "";
  lightConfig = lightConfig || {};
  darkConfig = darkConfig || {};
  const flatLightConfig = flattenAdminThemeConfig(lightConfig);
  const flatDarkConfig = flattenAdminThemeConfig(darkConfig);
  const lightSelector = selector || ':root';
  const darkSelector = selector ? `html.dark ${selector}` : 'html.dark:root';

  // Generate the CSS blocks
  let css = `${lightSelector} {\n`;
  Object.entries(flatLightConfig).forEach(([key, value]) => {
    css += `  ${key}: ${value};\n`;
  });
  css += '}\n\n';
  css += `${darkSelector} {\n`;
  Object.entries(flatDarkConfig).forEach(([key, value]) => {
    css += `  ${key}: ${value};\n`;
  });
  css += '}\n';
  return css;
}
