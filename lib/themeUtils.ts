import prisma from './prisma';

// Function to get all theme presets for admin UI
export async function getAllThemePresets() {
  return prisma.themePreset.findMany({ 
    select: { id: true, name: true } 
  });
}

// Function to get a theme preset configuration by ID
export async function getThemePresetConfigById(id: number | null | undefined) {
  if (id == null) return null;
  
  const preset = await prisma.themePreset.findUnique({
    where: { id },
  });
  
  if (!preset) return null;
  
  // Parse the config string to JSON
  try {
    return JSON.parse(preset.config);
  } catch (e) {
    console.error('Error parsing theme config:', e);
    return null;
  }
}

// Helper function to get theme configs based on route/context
export async function getThemeConfigsForRoute(pathname: string, globalConfig: any) {
  // Default to the global default theme IDs
  let lightThemeId = globalConfig.defaultLightThemePresetId;
  let darkThemeId = globalConfig.defaultDarkThemePresetId;

  // Parse themeAssignments JSON
  const themeAssignments = typeof globalConfig.themeAssignments === 'string' 
    ? JSON.parse(globalConfig.themeAssignments) 
    : (globalConfig.themeAssignments || {});
  
  // Check if there's a specific theme assignment for this route
  for (const routePattern in themeAssignments) {
    if (pathname.startsWith(routePattern) || new RegExp(routePattern).test(pathname)) {
      const assignment = themeAssignments[routePattern];
      if (assignment.light) lightThemeId = assignment.light;
      if (assignment.dark) darkThemeId = assignment.dark;
      break; // Use the first matching route pattern
    }
  }

  // Get both theme configs
  const [lightConfig, darkConfig] = await Promise.all([
    getThemePresetConfigById(lightThemeId),
    getThemePresetConfigById(darkThemeId)
  ]);

  return { lightConfig, darkConfig };
}

// Helper to generate CSS from theme configs
export function generateCssFromThemeConfigs(lightConfig: any, darkConfig: any) {
  // If no configs are provided, return empty string
  if (!lightConfig && !darkConfig) return '';

  // Default empty objects if configs are null
  lightConfig = lightConfig || {};
  darkConfig = darkConfig || {};

  // Generate CSS for light theme
  let css = ':root {\n';
  Object.entries(lightConfig).forEach(([key, value]) => {
    css += `  ${key}: ${value};\n`;
  });
  css += '}\n\n';

  // Generate CSS for dark theme
  css += 'html.dark:root {\n';
  Object.entries(darkConfig).forEach(([key, value]) => {
    css += `  ${key}: ${value};\n`;
  });
  css += '}\n';

  return css;
}
