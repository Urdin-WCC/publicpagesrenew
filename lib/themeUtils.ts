import { prisma } from './prisma';

// Function to get all theme presets for admin UI
export async function getAllThemePresets() {
  try {
    const result = await prisma.$queryRaw`
      SELECT id, name 
      FROM ThemePreset
    `;
    
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching all theme presets:', error);
    return [];
  }
}

// Function to get a theme preset configuration by ID
export async function getThemePresetConfigById(id: number | string | null | undefined) {
  if (id == null) return null;
  
  // Detect if running in the browser (client) or Node (server)
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

// Helper function to get theme assignment IDs for a specific route or component
export async function getThemeAssignmentIDs(
  pathname: string, 
  globalConfig: any, 
  componentName?: string
) {
  console.log(`Getting theme assignment IDs for ${componentName || 'page'} at ${pathname}`);
  console.log(`Global config:`, {
    defaultLightThemeId: globalConfig.defaultLightThemePresetId,
    defaultDarkThemeId: globalConfig.defaultDarkThemePresetId,
    hasThemeAssignments: !!globalConfig.themeAssignments,
    themeAssignmentsType: typeof globalConfig.themeAssignments
  });
  
  // Default to the global default theme IDs
  let lightThemeId = globalConfig.defaultLightThemePresetId || globalConfig.activeThemeId;
  let darkThemeId = globalConfig.defaultDarkThemePresetId;

  try {
    // Asegurar que themeAssignments sea un objeto con la estructura esperada
    let themeAssignments: {
      components?: Record<string, any>;
      routes?: Record<string, any>;
      [key: string]: any; // Permitir indexación dinámica para el nuevo formato
    } = {};
    
    if (typeof globalConfig.themeAssignments === 'string') {
      try {
        themeAssignments = JSON.parse(globalConfig.themeAssignments) as {
          components?: Record<string, any>;
          routes?: Record<string, any>;
        };
        console.log(`Successfully parsed themeAssignments JSON`);
      } catch (error) {
        const parseError = error as Error;
        console.error(`Error parsing themeAssignments JSON: ${parseError.message}`);
        console.log(`Raw themeAssignments:`, globalConfig.themeAssignments);
      }
    } else if (globalConfig.themeAssignments && typeof globalConfig.themeAssignments === 'object') {
      themeAssignments = globalConfig.themeAssignments as {
        components?: Record<string, any>;
        routes?: Record<string, any>;
      };
      console.log(`Using themeAssignments object directly`);
    }
    
    console.log(`Theme assignments structure:`, JSON.stringify(themeAssignments, null, 2));
    
    // Determine if we're looking for route-specific or component-specific assignments
    if (componentName) {
      console.log(`Looking for component-specific assignment for ${componentName}`);
      
      // Two formats are supported:
      // 1. Legacy format: { "components": { "header": { "light": 1, "dark": 2 } } }
      // 2. New format: { "header": { "light": 1, "dark": 2 } }
      
      // Check if the component exists directly in themeAssignments (new format)
      if (themeAssignments[componentName]) {
        const componentAssignment = themeAssignments[componentName];
        console.log(`Found component ${componentName} in assignments (new format):`, componentAssignment);
        
        if (componentAssignment.light) lightThemeId = componentAssignment.light;
        if (componentAssignment.dark) darkThemeId = componentAssignment.dark;
        console.log(`Using new format assignment for component ${componentName}`);
      }
      // Check if there's a component-specific assignment in the legacy format
      else if (themeAssignments.components && themeAssignments.components[componentName]) {
        const componentAssignment = themeAssignments.components[componentName];
        console.log(`Found component ${componentName} in assignments (legacy format):`, componentAssignment);
        
        // Check if there's a route-specific assignment for this component
        if (componentAssignment.routes && componentAssignment.routes[pathname]) {
          const routeSpecificAssignment = componentAssignment.routes[pathname];
          if (routeSpecificAssignment.light) lightThemeId = routeSpecificAssignment.light;
          if (routeSpecificAssignment.dark) darkThemeId = routeSpecificAssignment.dark;
          console.log(`Found route-specific assignment for component ${componentName} at ${pathname}`);
        } 
        // Otherwise, use the component's default assignment
        else if (componentAssignment.light || componentAssignment.dark) {
          if (componentAssignment.light) lightThemeId = componentAssignment.light;
          if (componentAssignment.dark) darkThemeId = componentAssignment.dark;
          console.log(`Using default assignment for component ${componentName}`);
        }
      } else {
        console.log(`No specific assignment found for component ${componentName}`);
      }
    } else {
      console.log(`Looking for route-specific assignment for path ${pathname}`);
      
      // Check for route-specific assignment (page level)
      if (themeAssignments.routes) {
        for (const routePattern in themeAssignments.routes) {
          if (pathname === routePattern || pathname.startsWith(routePattern) || 
              new RegExp(routePattern).test(pathname)) {
            const assignment = themeAssignments.routes[routePattern];
            if (assignment.light) lightThemeId = assignment.light;
            if (assignment.dark) darkThemeId = assignment.dark;
            console.log(`Found route-specific assignment for ${pathname} (pattern: ${routePattern})`);
            break; // Use the first matching route pattern
          }
        }
      } else {
        console.log(`No routes defined in theme assignments`);
      }
    }
  } catch (error) {
    console.error('Error in getThemeAssignmentIDs:', error);
  }
  
  console.log(`Final theme IDs for ${componentName || 'page'} at ${pathname}:`, 
    { lightThemeId, darkThemeId });

  return { lightThemeId, darkThemeId };
}

// Helper function to get theme configs based on route/context
export async function getThemeConfigsForRoute(pathname: string, globalConfig: any) {
  const { lightThemeId, darkThemeId } = await getThemeAssignmentIDs(pathname, globalConfig);

  // Get both theme configs
  const [lightConfig, darkConfig] = await Promise.all([
    getThemePresetConfigById(lightThemeId),
    getThemePresetConfigById(darkThemeId)
  ]);

  // Ensure the theme IDs are passed along with the configs
  return { 
    lightConfig: lightConfig ? { ...lightConfig, id: lightThemeId } : null, 
    darkConfig: darkConfig ? { ...darkConfig, id: darkThemeId } : null,
    lightThemeId,
    darkThemeId
  };
}

// Helper function to get theme configs for a specific component
export async function getThemeConfigsForComponent(
  componentName: string,
  pathname: string,
  globalConfig: any
) {
  const { lightThemeId, darkThemeId } = await getThemeAssignmentIDs(pathname, globalConfig, componentName);

  // Get both theme configs
  const [lightConfig, darkConfig] = await Promise.all([
    getThemePresetConfigById(lightThemeId),
    getThemePresetConfigById(darkThemeId)
  ]);

  // Ensure the theme IDs are passed along with the configs
  return { 
    lightConfig: lightConfig ? { ...lightConfig, id: lightThemeId } : null, 
    darkConfig: darkConfig ? { ...darkConfig, id: darkThemeId } : null,
    lightThemeId,
    darkThemeId
  };
}

  // Default theme configurations
const defaultLightTheme = {
  "--background": "#ffffff",
  "--foreground": "#333333",
  "--primary": "#0070f3",
  "--primary-foreground": "#ffffff",
  "--secondary": "#f5f5f5",
  "--secondary-foreground": "#333333",
  "--accent": "#f000b8",
  "--accent-foreground": "#ffffff",
  "--muted": "#f1f5f9",
  "--muted-foreground": "#64748b",
  "--card": "#ffffff",
  "--card-foreground": "#333333",
  "--border": "#e2e8f0",
  "--input": "#f1f5f9",
  "--ring": "#0070f3",
  "--spacing-padding": "2rem 1rem", // Definición de espaciado predeterminado
  "--spacing-margin": "1rem"
};

const defaultDarkTheme = {
  "--background": "#1a1a1a",
  "--foreground": "#ffffff",
  "--primary": "#0070f3",
  "--primary-foreground": "#ffffff",
  "--secondary": "#2d2d2d",
  "--secondary-foreground": "#ffffff",
  "--accent": "#f000b8",
  "--accent-foreground": "#ffffff",
  "--muted": "#374151",
  "--muted-foreground": "#9ca3af",
  "--card": "#2d2d2d",
  "--card-foreground": "#ffffff",
  "--border": "#4b5563",
  "--input": "#374151",
  "--ring": "#0070f3",
  "--spacing-padding": "2rem 1rem", // Definición de espaciado predeterminado
  "--spacing-margin": "1rem"
};

// Function to flatten nested theme objects
function flattenThemeConfig(config: any, prefix: string = '--'): Record<string, string> {
  if (!config) return {};
  
  const result: Record<string, string> = {};
  
  Object.entries(config).forEach(([key, value]) => {
    // If the value is an object, recursively flatten it
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedValues = flattenThemeConfig(value, `${prefix}${key}-`);
      Object.assign(result, nestedValues);
    } else {
      // Otherwise add the key-value pair directly
      result[`${prefix}${key}`] = String(value);
    }
  });
  
  return result;
}

// Helper to generate CSS from theme configs
export function generateCssFromThemeConfigs(lightConfig: any, darkConfig: any, selector?: string) {
  console.log("Generating CSS with configs:", 
    typeof lightConfig, 
    lightConfig && Object.keys(lightConfig).length, 
    typeof darkConfig, 
    darkConfig && Object.keys(darkConfig).length
  );
  
  // Use default themes if no configs are provided
  if (!lightConfig && !darkConfig) {
    console.log("No theme configs found, using defaults");
    lightConfig = defaultLightTheme;
    darkConfig = defaultDarkTheme;
  }

  // Default to default themes if configs are null
  lightConfig = lightConfig || defaultLightTheme;
  darkConfig = darkConfig || defaultDarkTheme;

  // Extract theme IDs if available
  const lightThemeId = lightConfig.id || 'default';
  const darkThemeId = darkConfig.id || 'default';
  
  console.log("Theme IDs for CSS generation:", { lightThemeId, darkThemeId });
  console.log("Light config:", lightConfig);
  console.log("Dark config:", darkConfig);

  // Flatten nested theme objects
  let flatLightConfig = flattenThemeConfig(lightConfig);
  let flatDarkConfig = flattenThemeConfig(darkConfig);

  // Si el selector es un componente, remapea las variables CSS de spacing y margin/padding con prefijo
  if (selector && selector.startsWith('.header-component')) {
    flatLightConfig = Object.fromEntries(
      Object.entries(flatLightConfig).map(([key, value]) =>
        key.startsWith('--spacing-padding-')
          ? [`--header-padding${key.replace('--spacing-padding', '')}`, value]
          : key.startsWith('--spacing-margin-')
            ? [`--header-margin${key.replace('--spacing-margin', '')}`, value]
            : [key, value]
      )
    );
    flatDarkConfig = Object.fromEntries(
      Object.entries(flatDarkConfig).map(([key, value]) =>
        key.startsWith('--spacing-padding-')
          ? [`--header-padding${key.replace('--spacing-padding', '')}`, value]
          : key.startsWith('--spacing-margin-')
            ? [`--header-margin${key.replace('--spacing-margin', '')}`, value]
            : [key, value]
      )
    );
  }
  
  console.log("Flattened light theme:", flatLightConfig);
  console.log("Flattened dark theme:", flatDarkConfig);
  
  // Determine the CSS selector to use
  const lightSelector = selector ? selector : ':root';
  const darkSelector = selector ? `html.dark ${selector}` : 'html.dark:root';
  
  // Generate CSS for light theme
  let css = `${lightSelector} {\n`;
  Object.entries(flatLightConfig).forEach(([key, value]) => {
    css += `  ${key}: ${value};\n`;
  });
  css += '}\n\n';

  // Generate CSS for dark theme
  css += `${darkSelector} {\n`;
  Object.entries(flatDarkConfig).forEach(([key, value]) => {
    css += `  ${key}: ${value};\n`;
  });
  css += '}\n';

  // Add special background rules for components
  if (selector === '.header-component') {
    // Extract background type from theme configurations
    const lightBgType = flatLightConfig['--background-type'] || 'color';
    const darkBgType = flatDarkConfig['--background-type'] || 'color';
    
    css += `\n/* Background rules for header */\n`;
    
    // Light theme background rules
    css += `${lightSelector} {\n`;
    
    // Default background-color (always set as fallback)
    css += `  background-color: var(--background-value, white);\n`;
    
    // Apply specific background type
    if (lightBgType === 'image' && lightThemeId !== 'default') {
      // Image background (usando extensión .img universal)
      css += `  background-image: url(/images/backgrounds/main-${lightThemeId}.img);\n`;
      css += `  background-size: cover;\n`;
      css += `  background-position: center;\n`;
    } else if (lightBgType === 'gradient') {
      // Gradient background - get it from CSS variables
      css += `  background-image: var(--background-gradient, linear-gradient(to right, var(--background-value), var(--primary)));\n`;
    }
    css += `}\n\n`;
    
    // Dark theme background rules
    css += `${darkSelector} {\n`;
    
    // Default background-color (always set as fallback)
    css += `  background-color: var(--background-value, #1a1a1a);\n`;
    
    // Apply specific background type
    if (darkBgType === 'image' && darkThemeId !== 'default') {
      // Image background (incluyendo extension .jpg como fallback)
      css += `  background-image: url(/images/backgrounds/main-${darkThemeId}.img);\n`;
      css += `  background-size: cover;\n`;
      css += `  background-position: center;\n`;
    } else if (darkBgType === 'gradient') {
      // Gradient background - get it from CSS variables
      css += `  background-image: var(--background-gradient, linear-gradient(to right, var(--background-value), var(--primary)));\n`;
    }
    css += `}\n`;
  } else if (selector === '.footer-component') {
    // Extract background and cards type from theme configurations
    const lightBgType = flatLightConfig['--background-type'] || 'color';
    const darkBgType = flatDarkConfig['--background-type'] || 'color';
    const lightCardsBgType = flatLightConfig['--cards-background-type'] || 'color';
    const darkCardsBgType = flatDarkConfig['--cards-background-type'] || 'color';
    const lightThemeIdStr = String(lightThemeId);
    const darkThemeIdStr = String(darkThemeId);
    
    css += `\n/* Background rules for footer */\n`;
    
    // Light theme background rules
    css += `${lightSelector} {\n`;
    css += `  background-color: var(--background-value, white);\n`;
    
    // Apply specific background type (main background)
    if (lightBgType === 'image' && lightThemeId !== 'default') {
      css += `  background-image: url(/images/backgrounds/main-${lightThemeIdStr}.img);\n`;
      css += `  background-size: cover;\n`;
      css += `  background-position: center;\n`;
    } else if (lightBgType === 'gradient') {
      css += `  background-image: var(--background-gradient, linear-gradient(to right, var(--background-value), var(--primary)));\n`;
    }
    // Cards background
    // image
    if (lightCardsBgType === 'image' && lightThemeId !== 'default') {
      css += `  --footer-cards-background: url(/images/backgrounds/card-${lightThemeIdStr}.img);\n`;
    } else if (lightCardsBgType === 'gradient') {
      css += `  --footer-cards-background: var(--cards-background-gradient, linear-gradient(to right,#fff,#eee));\n`;
    } else {
      css += `  --footer-cards-background: var(--cards-background, #fff);\n`;
    }
    css += `}\n\n`;

    // Dark theme background rules
    css += `${darkSelector} {\n`;
    css += `  background-color: var(--background-value, #1a1a1a);\n`;
    // main background
    if (darkBgType === 'image' && darkThemeId !== 'default') {
      css += `  background-image: url(/images/backgrounds/main-${darkThemeIdStr}.img);\n`;
      css += `  background-size: cover;\n`;
      css += `  background-position: center;\n`;
    } else if (darkBgType === 'gradient') {
      css += `  background-image: var(--background-gradient, linear-gradient(to right, var(--background-value), var(--primary)));\n`;
    }
    // cards bg
    if (darkCardsBgType === 'image' && darkThemeId !== 'default') {
      css += `  --footer-cards-background: url(/images/backgrounds/card-${darkThemeIdStr}.img);\n`;
    } else if (darkCardsBgType === 'gradient') {
      css += `  --footer-cards-background: var(--cards-background-gradient, linear-gradient(to right,#222,#444));\n`;
    } else {
      css += `  --footer-cards-background: var(--cards-background, #222);\n`;
    }
    css += `}\n`;
  } else if (selector && selector.startsWith('.page-')) {
    // Extract background type from theme configurations
    const lightBgType = flatLightConfig['--background-type'] || 'color';
    const darkBgType = flatDarkConfig['--background-type'] || 'color';
    
    css += `\n/* Background rules for page */\n`;
    
    // Light theme background rules
    css += `${lightSelector} {\n`;
    
    // Apply specific background type for page content
    if (lightBgType === 'image' && lightThemeId !== 'default') {
      css += `  --background-image: url(/images/backgrounds/main-${lightThemeId}.img);\n`;
    } else if (lightBgType === 'gradient') {
      css += `  --background-image: var(--background-gradient, linear-gradient(to right, var(--background-value), var(--primary)));\n`;
    } else {
      css += `  --background-image: none;\n`;
    }
    css += `}\n\n`;
    
    // Dark theme background rules
    css += `${darkSelector} {\n`;
    
    // Apply specific background type for page content
    if (darkBgType === 'image' && darkThemeId !== 'default') {
      css += `  --background-image: url(/images/backgrounds/main-${darkThemeId}.img);\n`;
    } else if (darkBgType === 'gradient') {
      css += `  --background-image: var(--background-gradient, linear-gradient(to right, var(--background-value), var(--primary)));\n`;
    } else {
      css += `  --background-image: none;\n`;
    }
    css += `}\n`;
  } else if (selector === '.sidebar-component') {
    // Extract background type from theme configurations
    const lightBgType = flatLightConfig['--background-type'] || 'color';
    const darkBgType = flatDarkConfig['--background-type'] || 'color';
    
    css += `\n/* Background rules for sidebar */\n`;
    
    // Light theme background rules
    css += `${lightSelector} {\n`;
    css += `  background-color: var(--background-value, white);\n`;
    
    // Apply specific background type
    if (lightBgType === 'image' && lightThemeId !== 'default') {
      // Image background for cards is different
      css += `  background-image: url(/images/backgrounds/card-${lightThemeId}.img);\n`;
      css += `  background-size: cover;\n`;
      css += `  background-position: center;\n`;
    } else if (lightBgType === 'gradient') {
      // Gradient background
      css += `  background-image: var(--background-gradient, linear-gradient(to right, var(--background-value), var(--primary)));\n`;
    }
    css += `}\n\n`;
    
    // Dark theme background rules
    css += `${darkSelector} {\n`;
    css += `  background-color: var(--background-value, #1a1a1a);\n`;
    
    // Apply specific background type
    if (darkBgType === 'image' && darkThemeId !== 'default') {
      // Image background for cards is different
      css += `  background-image: url(/images/backgrounds/card-${darkThemeId}.img);\n`;
      css += `  background-size: cover;\n`;
      css += `  background-position: center;\n`;
    } else if (darkBgType === 'gradient') {
      // Gradient background
      css += `  background-image: var(--background-gradient, linear-gradient(to right, var(--background-value), var(--primary)));\n`;
    }
    css += `}\n`;
  }

  return css;
}
