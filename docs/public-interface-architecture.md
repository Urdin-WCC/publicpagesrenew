# Arquitectura de la Interfaz Pública

Este documento describe la arquitectura y flujo de datos de la interfaz pública del sitio, explicando cómo se cargan y aplican las diferentes configuraciones.

## Visión General

El sistema de interfaz pública está diseñado para:

1. Cargar configuraciones almacenadas en la base de datos
2. Aplicar temas y estilos personalizados
3. Renderizar componentes (header, footer, sidebar) según la configuración
4. Proporcionar funcionalidades como cambio de tema y modo de mantenimiento

La arquitectura sigue un modelo de componentes React Server Components con hidratación selectiva de componentes cliente donde es necesario.

## Flujo de Carga de Datos

### 1. Layout Público (`app/(public)/layout.tsx`)

El layout público actúa como el punto de entrada principal y coordina la carga de datos:

```plaintext
1. getGlobalConfig() → Carga configuración global del sitio
2. getCookieBannerSettings() → Carga configuración del banner de cookies
3. getThemeConfigsForRoute() → Obtiene temas (claro/oscuro) para la ruta actual
4. getSectionWithItems() → Carga secciones (HEADER, FOOTER) con sus elementos
5. generateCssFromThemeConfigs() → Genera CSS variables para los temas
```

Los datos se pasan a los componentes hijos a través de props, y el CSS se inyecta directamente en el documento.

### 2. Página Principal (`app/(public)/page.tsx`)

La página principal:

1. Llama a `getHomePage()` para obtener el contenido de la página inicial
2. Genera metadatos SEO con `generateMetadata()`
3. Expone configuración (`showHeader`, `showFooter`, etc) al cliente mediante un script

## Componentes Clave

### Header (`components/public/Header.tsx`)

```typescript
interface HeaderProps {
  menuItems?: MenuItem[];       // Elementos de menú de la base de datos
  siteName?: string;            // Nombre del sitio
  logoUrl?: string | null;      // URL del logo
  config?: any;                 // Configuración personalizada
  stickyClass?: string;         // Clase CSS para posicionamiento
}
```

El Header combina elementos de menú de dos fuentes:
1. `navigationMenu` de la configuración global (gestionado en admin)
2. `menuItems` de la tabla `SiteSection` + `MenuItem` 

### Footer (`components/public/Footer.tsx`)

```typescript
interface FooterProps {
  text?: string;                // Texto de copyright
  widgets?: Widget[];           // Widgets del footer
  config?: any;                 // Configuración personalizada
  stickyClass?: string;         // Clase CSS para posicionamiento
}
```

El Footer muestra:
1. Widgets dinámicos recuperados de la base de datos
2. Contenido HTML personalizado desde la configuración (`footerHtmlContent`)
3. Texto de copyright y atribución

### ThemeSwitcher (`components/public/ThemeSwitcher.tsx`)

Componente cliente que permite al usuario cambiar entre tema claro y oscuro:

```typescript
interface ThemeSwitcherProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style?: 'icon-only' | 'icon-text';
}
```

Características:
- Almacena preferencias en localStorage
- Detecta preferencias del sistema operativo
- Actualiza en tiempo real añadiendo/quitando la clase `dark` del HTML

### LoadingSpinner (`components/core/LoadingSpinner.tsx`)

Componente de carga global que se muestra cuando está configurado.

## Sistema de Temas

El sistema de temas utiliza variables CSS para aplicar estilos consistentes:

### 1. Obtención de Temas

`getThemeConfigsForRoute()` en `lib/themeUtils.ts`:
- Determina qué tema aplicar basado en la ruta actual
- Verifica asignaciones específicas de temas por ruta
- Carga configuraciones para temas claro y oscuro

### 2. Generación de CSS

`generateCssFromThemeConfigs()` convierte configuraciones de tema en variables CSS:

```css
:root {
  --color-primary: #3b82f6;
  --color-background: #ffffff;
  /* Más variables CSS */
}

html.dark:root {
  --color-primary: #60a5fa;
  --color-background: #1f2937;
  /* Más variables CSS para modo oscuro */
}
```

### 3. Aplicación de Temas

Los temas se aplican mediante:
- Inyección de CSS en el layout principal
- Manipulación de clases en el componente ThemeSwitcher
- Variables CSS aplicadas a través de clases tailwind como `text-primary`

## Configuraciones en GlobalConfig

La tabla `GlobalConfig` almacena:
- Ajustes generales (nombre del sitio, logo, etc.)
- Campos JSON para configuraciones específicas:
  - `themeAssignments`: { [ruta]: { light: id, dark: id }}
  - `loadingSpinnerConfig`: { enabled: boolean, ... }
  - `themeSwitcherConfig`: { enabled: boolean, position: string, ... }
  - `stickyElementsConfig`: { header: boolean, footer: boolean, ... }
  - `header`, `footer`, `sidebar`: Configuraciones para cada sección
  - `navigationMenu`: Menú de navegación global

## Flujo de Renderizado y Visibilidad

1. Layout público recupera todas las configuraciones
2. Se genera script cliente para controlar visibilidad (CSS display)
3. Cada página puede establecer `window.__PAGE_CONFIG__` para controlar visibilidad
4. El script cliente aplica las reglas de visibilidad basado en configuración

## Server Actions

Las acciones del servidor (`menu-actions.ts`, etc.) proporcionan operaciones CRUD para las configuraciones:
- `fetchNavigationMenu()`: Obtiene menú de navegación actual
- `getThemePresetConfigById()`: Obtiene configuración de tema por ID
- `getSectionWithItems()`: Obtiene sección (header/footer) con sus elementos

## Optimización de Rendimiento

- Consultas SQL directas para evitar problemas con Prisma
- Fallbacks para valores por defecto cuando hay errores
- Lazy loading de componentes cliente
- Manejo cuidadoso de JSON para evitar errores de parseo
