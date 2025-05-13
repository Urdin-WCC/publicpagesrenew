# Neurowitch: Guía para Desarrollo de Interfaz Pública

## Descripción General del Proyecto

Neurowitch es una plataforma web modular y configurable para la creación de sitios web profesionales. El sistema está construido con Next.js (App Router), TypeScript, Prisma ORM y MySQL, y sigue una arquitectura modular que separa claramente la interfaz de administración de la interfaz pública.

### Estructura Principal

- **Panel Administrativo**: Permite la configuración de todos los aspectos del sitio, desde temas y layouts hasta contenido.
- **Interfaz Pública**: Muestra el sitio web al usuario final, aplicando todas las configuraciones establecidas en el panel administrativo.
- **Sistema de Temas**: Permite la personalización visual completa del sitio mediante temas configurables.

## Arquitectura de la Interfaz Pública

La interfaz pública está diseñada para ser completamente dinámica, obteniendo todos sus valores de configuración desde la base de datos. Esto incluye:

1. **Configuración estructural**: Layout, presencia de componentes (header, footer, sidebar)
2. **Configuración visual**: Temas, colores, tipografías, espaciados
3. **Contenido**: Textos, imágenes, widgets y otros elementos de contenido

### Directorio de la Interfaz Pública

La interfaz pública se encuentra principalmente en:
- `app/(public)/`: Páginas y rutas públicas
- `components/public/`: Componentes utilizados en la interfaz pública

## Sistema de Temas y Estilos

### Evolución del Sistema

Originalmente, el sistema de temas utilizaba un enfoque descentralizado donde cada componente y página tenía que:
1. Obtener la configuración de tema para su ruta o componente usando `getThemeConfigsForRoute` o `getThemeConfigsForComponent`
2. Generar el CSS correspondiente usando `generateCssFromThemeConfigs`
3. Inyectar ese CSS en la página usando `<style>` tags

Este enfoque llevaba a duplicación de código, inconsistencias y problemas de mantenimiento.

### Sistema Actual (ThemeStyleManager)

El sistema actual centraliza toda la lógica de temas en un componente llamado `ThemeStyleManager`, que:

1. Obtiene la configuración de tema para una ruta o componente específico
2. Genera las variables CSS necesarias
3. Inyecta esas variables en la página

Cada componente y página solo necesita:
1. Incluir el componente `ThemeStyleManager` con los parámetros adecuados
2. Utilizar las variables CSS generadas en sus estilos

```tsx
// Ejemplo de uso en una página
<>
  <ThemeStyleManager
    pathname="/blog"
    globalConfig={globalConfig}
    selector=".blog-page"
  />
  <div className="blog-page">
    {/* Contenido que utiliza las variables CSS generadas */}
  </div>
</>
```

## Tareas Pendientes para la Interfaz Pública

### 1. Verificar Aplicación de Estilos

Actualmente, algunos componentes no están aplicando correctamente todos los valores de configuración. En particular:

- Algunos componentes no respetan configuraciones de tamaño, padding y margin
- Las sombras y bordes configurados en temas no siempre se aplican
- Widgets y tarjetas pueden tener problemas con la adaptación al espacio disponible

### 2. Soluciones Específicas Implementadas

Para el footer, hemos implementado las siguientes soluciones que pueden servir como referencia:

- Uso de `!important` para forzar la aplicación de variables CSS cuando hay conflictos de especificidad
- CSS personalizado para grid en lugar de clases Tailwind para mayor control
- Eliminación de estilos inline que sobrescriben las variables CSS
- Variables de debugging para facilitar la inspección de valores

```css
/* Ejemplo de CSS específico para el footer */
.footer-component .widget-card {
  /* Aplicamos estilos forzados con !important para asegurarnos que se apliquen */
  background: var(--footer-cards-background, #f5f5f5) !important;
  box-shadow: var(--footer-cards-boxShadow, 0 4px 6px rgba(0,0,0,0.1)) !important;
  padding: var(--footer-cards-padding, 1.25rem) !important;
  /* Más propiedades... */
}
```

### 3. Directrices para Nuevos Desarrollos

#### Verificar Componentes Existentes

1. Revisar cada componente público para asegurar que utiliza `ThemeStyleManager`
2. Verificar que los componentes utilizan las variables CSS correctamente
3. Comprobar que no hay estilos inline o hardcodeados que sobrescriban las variables

#### Implementar Nuevos Componentes

1. Incluir siempre `ThemeStyleManager` al inicio del componente
2. Utilizar un selector específico y descriptivo (por ejemplo, `.component-name` en lugar de `.container`)
3. Definir todas las propiedades de estilo usando variables CSS con fallbacks
4. Usar `!important` cuando sea necesario para garantizar la aplicación de estilos

```tsx
<ThemeStyleManager
  pathname={pathname}
  globalConfig={globalConfig}
  selector={`.component-name`}
/>
<div className="component-name">
  {/* Contenido */}
</div>
```

#### Debugging de Variables CSS

Para depurar variables CSS, puedes:

1. Crear variables de debug que reflejen los valores reales:
```css
.component {
  --debug-background: var(--component-background);
  --debug-shadow: var(--component-boxShadow);
}
```

2. Usar las herramientas de desarrollo del navegador para inspeccionar las variables CSS aplicadas
3. Verificar la especificidad de los selectores CSS para asegurar que las variables se apliquen correctamente

## Información Adicional

### Componentes Clave

- **ThemeStyleManager**: `components/ThemeStyleManager.tsx` - Gestiona la aplicación de temas
- **Header/Footer/Sidebar**: `components/public/{Header,Footer,Sidebar}.tsx` - Componentes principales del layout
- **WidgetRenderer**: `components/public/WidgetRenderer.tsx` - Renderiza diferentes tipos de widgets

### Utilitarios Relevantes

- **themeUtils**: `lib/themeUtils.ts` - Funciones para trabajar con temas y generar CSS
- **config**: `lib/config.ts` - Funciones para obtener configuración global y específica

### Recursos Adicionales

- `README-theme-manager.md` - Documentación detallada sobre el nuevo sistema de temas
- `README-theme-styling-guide.md` - Guía para la aplicación correcta de estilos de tema
- `README-theme-fix.md` - Historia y contexto del sistema de temas anterior

## Consejos para la Resolución de Problemas

1. **Inspeccionar Variables CSS**: Usa las herramientas de desarrollo para ver si las variables se generan correctamente
2. **Comprobar Especificidad**: Si un estilo no se aplica, puede ser un problema de especificidad CSS
3. **Verificar Valores Predeterminados**: Asegúrate de que los valores fallback son apropiados
4. **Testear Responsividad**: Verifica que los estilos se apliquen correctamente en diferentes tamaños de pantalla
5. **Comprobar Orden de Carga**: Asegúrate de que el CSS generado no esté siendo sobrescrito por otro CSS cargado posteriormente
