# Refactorización del Sistema de Temas

## Resumen

Este documento describe la refactorización del sistema de temas de Neurowitch para soportar la nueva arquitectura multi-tema. El nuevo sistema permite:

- Asignar diferentes temas a distintas rutas de la aplicación
- Configuración separada para modos claro (light) y oscuro (dark)
- Control detallado sobre elementos de interfaz como LoadingSpinner y ThemeSwitcher
- Configuración de posicionamiento sticky para elementos como header, footer y sidebar

## Cambios en el Schema de Base de Datos

### Nuevo Modelo ThemePreset

```prisma
model ThemePreset {
  id     Int     @id @default(autoincrement())
  name   String  @unique
  config Json    // Almacena objeto de configuración detallado del tema
}
```

El modelo `ThemePreset` ha sido rediseñado para almacenar configuraciones completas de tema como objetos JSON, identificadas por un ID autoincremental y un nombre único.

### Cambios en el Modelo GlobalConfig

```prisma
model GlobalConfig {
  // Campos existentes...
  
  // Campos del nuevo sistema de temas
  defaultLightThemePresetId  Int?
  defaultDarkThemePresetId   Int?
  themeAssignments           Json    @default("{}") // Mapea rutas/elementos a { light: presetId, dark: presetId }
  loadingSpinnerConfig       Json    @default("{\"enabled\": false, \"overlayColor\": \"rgba(255,255,255,0.8)\"}")
  themeSwitcherConfig        Json    @default("{\"enabled\": true, \"position\": \"bottom-right\"}")
  stickyElementsConfig       Json    @default("{\"header\": false, \"sidebar\": false, \"footer\": false, \"themeSwitcher\": false}")
}
```

Se ha eliminado el campo anterior `activeThemeId` y se han añadido los nuevos campos para gestionar:
- IDs de temas predeterminados para modos claro y oscuro
- Asignaciones específicas de tema por ruta
- Configuraciones para componentes visuales (LoadingSpinner, ThemeSwitcher)
- Configuración de elementos fijos (sticky)

## Nuevas Utilidades de Tema

Se ha creado un nuevo archivo `lib/themeUtils.ts` con funciones auxiliares para trabajar con el nuevo sistema:

### getAllThemePresets()
Obtiene listado sencillo de todos los presets de tema (id y nombre) para usar en interfaces administrativas.

### getThemePresetConfigById()
Recupera y parsea la configuración completa de un tema según su ID.

```typescript
async function getThemePresetConfigById(id: number | null | undefined) {
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
```

### getThemeConfigsForRoute()
Determina qué temas (claro/oscuro) aplicar basándose en la ruta actual y la configuración global.

```typescript
async function getThemeConfigsForRoute(pathname: string, globalConfig: any) {
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
```

### generateCssFromThemeConfigs()
Genera CSS dinámico a partir de las configuraciones de tema para modos claro y oscuro.

```typescript
function generateCssFromThemeConfigs(lightConfig: any, darkConfig: any) {
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
```

## Cambios en Layout Público

El archivo `app/(public)/layout.tsx` ha sido actualizado para:

1. Obtener las configuraciones de tema según contexto/ruta con la nueva función `getThemeConfigsForRoute`
2. Generar CSS para variables de tema usando `generateCssFromThemeConfigs`
3. Interpretar configuraciones para LoadingSpinner, ThemeSwitcher y elementos sticky
4. Aplicar clases CSS condicionales según la configuración

Ejemplo del código actualizado:
```typescript
// Determinar theme configs basado en la ruta/contexto
const { lightConfig, darkConfig } = await getThemeConfigsForRoute(pathname, globalConfig);

// Generar CSS desde las configs del tema
const themeCss = generateCssFromThemeConfigs(lightConfig, darkConfig);

// Interpretar campos de configuración JSON
const loadingSpinnerConfig = typeof globalConfig?.loadingSpinnerConfig === 'string'
  ? JSON.parse(globalConfig?.loadingSpinnerConfig || '{}')
  : globalConfig?.loadingSpinnerConfig || { enabled: false };
```

## Uso del Nuevo Sistema de Temas

### Formato de la Configuración de Temas

Un preset de tema debería tener una estructura similar a esta:

```json
{
  "--background": "#ffffff",
  "--foreground": "#1a1a1a",
  "--primary": "#6d28d9",
  "--primary-foreground": "#ffffff",
  "--secondary": "#f3f4f6",
  "--secondary-foreground": "#1f2937",
  "--accent": "#8b5cf6",
  "--accent-foreground": "#ffffff",
  "--muted": "#f3f4f6",
  "--muted-foreground": "#6b7280",
  "--card": "#ffffff",
  "--card-foreground": "#1a1a1a",
  "--border": "#e5e7eb",
  "--input": "#e5e7eb",
  "--ring": "#6d28d9"
}
```

Cada par clave-valor define una variable CSS que se puede usar en toda la aplicación.

### Configuración de Asignaciones de Tema

El campo `themeAssignments` en GlobalConfig permite mapear rutas a temas específicos:

```json
{
  "/blog": {
    "light": 1,
    "dark": 2
  },
  "/portfolio": {
    "light": 3,
    "dark": 4
  }
}
```

Donde cada número es el ID del preset de tema correspondiente.

### Configuraciones de Componentes de UI

#### LoadingSpinner

```json
{
  "enabled": true,
  "overlayColor": "rgba(255,255,255,0.8)"
}
```

#### ThemeSwitcher

```json
{
  "enabled": true,
  "position": "bottom-right"
}
```

#### Elementos Sticky

```json
{
  "header": true,
  "sidebar": false,
  "footer": false,
  "themeSwitcher": true
}
```

## Próximos Pasos

En el Módulo 7 se construirá la interfaz administrativa para gestionar este nuevo sistema de temas, permitiendo:

1. Crear, editar y eliminar presets de tema
2. Asignar temas a rutas específicas
3. Configurar elementos de interfaz como LoadingSpinner y ThemeSwitcher
4. Gestionar elementos fijos (sticky)
