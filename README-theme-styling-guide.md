# Guía de Aplicación de Estilos de Tema

Este documento describe cómo se aplican los estilos de tema en la interfaz pública y cómo garantizar que los componentes respeten correctamente las configuraciones de tema definidas en la base de datos.

## Arquitectura del Sistema de Temas

El sistema de temas se basa en un enfoque de variables CSS que permite definir estilos para diferentes componentes y rutas:

1. **Configuración en base de datos**: Los temas se configuran en el panel de administración y se almacenan en la base de datos.
2. **Obtención de configuración**: El componente `ThemeStyleManager` obtiene la configuración de tema para una ruta o componente específico.
3. **Generación de CSS**: El componente transforma la configuración en variables CSS y las inyecta en la página.
4. **Aplicación en componentes**: Los componentes utilizan estas variables CSS para aplicar estilos.

## Componente ThemeStyleManager

Este componente centraliza toda la lógica relacionada con temas:

```tsx
<ThemeStyleManager
  pathname="/ruta-actual" // Ruta para la que cargar el tema
  globalConfig={globalConfig} // Config global que incluye temas
  selector=".selector-css" // Selector al que aplicar los estilos
  componentId="nombre-componente" // Opcional: ID para temas específicos
/>
```

### Ubicación

El componente se debe colocar cerca de la parte superior del árbol de componentes, antes de los elementos que utilizarán las variables CSS generadas.

### Propiedades

- **pathname**: Ruta actual para cargar el tema específico asociado a ella.
- **globalConfig**: Configuración global que incluye los temas.
- **selector**: Selector CSS que recibirá las variables y estilos.
- **componentId**: (Opcional) ID del componente específico si se está aplicando a un componente en lugar de a una ruta.

## Uso de Variables CSS

Las variables CSS generadas siguen este patrón:

- `--[propiedad]`: Variable general (ej: `--background-value`)
- `--[componente]-[propiedad]`: Variable específica de componente (ej: `--header-background`)

### Ejemplos de variables disponibles

```css
/* Variables generales */
--background-value      /* Color de fondo principal */
--foreground           /* Color de texto principal */
--spacing-padding      /* Espaciado interno general */
--spacing-margin       /* Espaciado externo general */
--typography-h1-fontSize  /* Tamaño de fuente para h1 */
--typography-paragraph-fontFamily /* Familia de fuente para párrafos */

/* Variables específicas de componentes */
--footer-padding-base  /* Padding del footer */
--footer-cards-background /* Fondo de las tarjetas en el footer */
--footer-cards-boxShadow /* Sombra de las tarjetas en el footer */
--footer-cards-borderRadius /* Radio de borde de tarjetas en footer */
--header-height        /* Altura del header */
--sidebar-width        /* Ancho de la barra lateral */
```

## Aplicación Correcta de Estilos en Componentes

Para garantizar que los componentes respeten correctamente las variables CSS de tema:

### 1. Uso de variables con fallbacks

Siempre proporciona un valor fallback en caso de que la variable no esté definida:

```css
background: var(--footer-cards-background, #f5f5f5);
box-shadow: var(--footer-cards-boxShadow, 0 4px 6px rgba(0,0,0,0.1));
```

### 2. Priorización de estilos importantes

Si hay conflictos de especificidad, usa `!important` para garantizar la aplicación de las variables:

```css
background: var(--footer-cards-background, #f5f5f5) !important;
padding: var(--footer-cards-padding, 1.25rem) !important;
```

### 3. Evitar sobreescrituras inline

No apliques estilos directamente que podrían sobreescribir las variables CSS:

```tsx
// ❌ Mal: Sobreescribe el estilo de tema
<div style={{ background: 'blue' }}></div>

// ✅ Bien: Usa la variable CSS
<div style={{ background: 'var(--background-value, white)' }}></div>
```

### 4. Debuggear variables CSS

Para depurar variables, puede ser útil crear variables espejo:

```css
.component {
  --debug-background: var(--footer-cards-background);
  --debug-padding: var(--footer-cards-padding);
}
```

## Solución de Problemas

### Estilos no se aplican correctamente

1. **Verificar selector**: Asegúrate de que el selector CSS en `ThemeStyleManager` coincide con el elemento target.
2. **Verificar orden CSS**: Las reglas CSS se aplican en orden de aparición, asegúrate que tus reglas no sean sobreescritas.
3. **Especificidad CSS**: Si tienes problemas de especificidad, usa `!important` o aumenta la especificidad del selector.
4. **Inspeccionar variables**: Usa las herramientas de desarrollo para ver si las variables CSS se están generando correctamente.

### Estilo inconsistente en diferentes tamaños de pantalla

1. **Media queries**: Asegúrate de que las media queries no están sobreescribiendo tus variables CSS.
2. **Responsividad**: Verifica que el diseño responsive mantiene acceso a las variables CSS.

## Mejores Prácticas

1. **Un ThemeStyleManager por ruta/componente**: Evita duplicar componentes ThemeStyleManager para el mismo selector.
2. **Selecciona el nivel correcto**: Aplica el selector al contenedor más específico donde se necesiten los estilos.
3. **Evita hardcodear valores**: Siempre usa variables CSS para valores que podrían cambiar según el tema.
4. **Documenta variables personalizadas**: Si creas nuevas variables, documéntalas para otros desarrolladores.
5. **Usa DevTools**: Las herramientas de desarrollo del navegador son útiles para inspeccionar variables CSS aplicadas.
