# Guía de Depuración de la Interfaz Pública

Este documento proporciona una guía paso a paso para depurar problemas en la interfaz pública, especialmente relacionados con la carga de configuraciones y la visualización de elementos.

## Categorías de Problemas Comunes

Los problemas en la interfaz pública generalmente se dividen en:

1. **Problemas de Carga de Datos**: Configuraciones que no se cargan correctamente
2. **Problemas de Visualización**: Elementos que no se muestran o se muestran incorrectamente
3. **Problemas de Tema**: Estilos o temas que no se aplican correctamente
4. **Problemas de Rendimiento**: Carga lenta o bloqueos

## Proceso de Depuración General

### 1. Inspeccionar la Consola del Navegador

Revisa los mensajes de error en la consola del navegador presionando F12:
- `Error fetching global config`
- `Error parsing theme config`
- `Error fetching section`

### 2. Verificar Network Requests

Revisa las solicitudes de red para identificar:
- Peticiones fallidas a la API
- Códigos de estado HTTP inesperados
- Tiempos de respuesta largos

### 3. Verificar el HTML Generado

Inspecciona el HTML para asegurarte que:
- Variables CSS de tema presentes en `<style>`
- Elemento `<script>` con `window.__PAGE_CONFIG__`
- Elementos estructurales como `<header>`, `<footer>` presentes

## Depuración por Componente

### Problemas con Header

Si el header no aparece o aparece incorrectamente:

```bash
# 1. Verificar datos del menú
prisma.$queryRaw`SELECT navigationMenu FROM GlobalConfig WHERE id = 'global'`

# 2. Verificar sección de header
prisma.$queryRaw`SELECT * FROM SiteSection WHERE type = 'HEADER' AND isActive = true`

# 3. Revisar elementos del menú
prisma.$queryRaw`SELECT * FROM MenuItem WHERE sectionId = '[ID-SECCION]' AND isActive = true`
```

Componentes involucrados:
- `app/(public)/layout.tsx` (carga datos)
- `components/public/Header.tsx` (renderiza)
- `actions/menu-actions.ts` (obtiene datos)

### Problemas con Footer

Si el footer no aparece o los widgets no son correctos:

```bash
# 1. Verificar configuración del footer
prisma.$queryRaw`SELECT footer FROM GlobalConfig WHERE id = 'global'`

# 2. Verificar sección de footer
prisma.$queryRaw`SELECT * FROM SiteSection WHERE type = 'FOOTER' AND isActive = true`

# 3. Revisar widgets de footer
prisma.$queryRaw`SELECT * FROM Widget WHERE sectionId = '[ID-SECCION]' AND isActive = true`
```

### Problemas con Temas

Si los colores o estilos no se aplican correctamente:

```bash
# 1. Verificar tema predeterminado
prisma.$queryRaw`SELECT defaultLightThemePresetId, defaultDarkThemePresetId FROM GlobalConfig WHERE id = 'global'`

# 2. Verificar configuración de tema
prisma.$queryRaw`SELECT config FROM ThemePreset WHERE id = [ID-TEMA]`

# 3. Verificar asignaciones de tema
prisma.$queryRaw`SELECT themeAssignments FROM GlobalConfig WHERE id = 'global'`
```

Componentes involucrados:
- `lib/themeUtils.ts` (lógica de temas)
- `components/public/ThemeSwitcher.tsx` (cambio de tema)
- Inyección CSS en `app/(public)/layout.tsx`

## Resolución de Problemas Específicos

### Problema: "La visibilidad de Header/Footer no funciona correctamente"

**Diagnóstico:**
1. Verifica si `window.__PAGE_CONFIG__` se establece correctamente
2. Inspecciona el script cliente en el HTML
3. Comprueba los valores de `showHeader` y `showFooter` en la página

**Solución:**
1. Asegúrate de que el script se inyecta correctamente en la página
2. Verifica que la página de inicio tiene los valores correctos en la base de datos
3. Actualiza el código de la página para incluir estos valores:
   ```tsx
   const pageConfig = {
     showHeader: homepage.showHeader === undefined ? true : Boolean(homepage.showHeader),
     showFooter: homepage.showFooter === undefined ? true : Boolean(homepage.showFooter),
   };
   ```

### Problema: "Los colores del tema no se aplican correctamente"

**Diagnóstico:**
1. Inspecciona el elemento `<style>` en el HTML para verificar las variables CSS
2. Verifica si `html.dark` se aplica correctamente al cambiar de tema
3. Revisa la configuración del tema en la base de datos

**Solución:**
1. Asegúrate de que `generateCssFromThemeConfigs()` tiene los valores correctos:
   ```tsx
   const themeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig);
   ```
2. Verifica que ThemeSwitcher está funcionando correctamente:
   ```tsx
   // Debe alternar la clase 'dark' en el elemento html
   document.documentElement.classList.add('dark'); // o remove
   ```
3. Revisa las asignaciones de tema para la ruta actual

### Problema: "Los elementos del menú de navegación no aparecen"

**Diagnóstico:**
1. Verifica el resultado de `fetchNavigationMenu()`
2. Inspecciona la estructura del objeto devuelto
3. Comprueba si hay errores de parseo de JSON

**Solución:**
1. Corrige el formato del menú de navegación en la base de datos:
   ```bash
   # Ejemplo de formato correcto
   UPDATE GlobalConfig SET navigationMenu = '[{"label": "Inicio", "url": "/", "openInNewTab": false}]' WHERE id = 'global'
   ```
2. Asegúrate de que el Header procesa correctamente los elementos del menú
3. Verifica que no hay errores al mezclar las dos fuentes de elementos de menú

### Problema: "El Loading Spinner/ThemeSwitcher no aparecen"

**Diagnóstico:**
1. Verifica las configuraciones en GlobalConfig
2. Comprueba que las propiedades `enabled` están correctamente establecidas
3. Revisa que los campos JSON se están parseando correctamente

**Solución:**
1. Corrige las configuraciones en la base de datos:
   ```bash
   UPDATE GlobalConfig SET loadingSpinnerConfig = '{"enabled": true}' WHERE id = 'global'
   UPDATE GlobalConfig SET themeSwitcherConfig = '{"enabled": true, "position": "bottom-right"}' WHERE id = 'global'
   ```
2. Verifica que la página procesa correctamente estas configuraciones

## Errores Comunes en Campos JSON

Muchos problemas se originan en campos JSON malformados:

| Campo | Formato Correcto | Formato Incorrecto |
|-------|------------------|-------------------|
| `navigationMenu` | `[{"label": "Inicio", "url": "/"}]` | `[{label: Inicio, url: /}]` |
| `themeAssignments` | `{"/blog": {"light": 1, "dark": 2}}` | `{/blog: {light: 1, dark: 2}}` |
| `themeSwitcherConfig` | `{"enabled": true, "position": "top-right"}` | `{enabled: true, position: top-right}` |

Al corregir campos JSON, siempre:
1. Usa comillas dobles para claves y valores de texto
2. Asegúrate de que los valores booleanos sean `true`/`false` (sin comillas)
3. Verifica que los números no tienen comillas

## Herramientas de Depuración

Para una depuración más profunda, puedes utilizar estas herramientas:

1. **Consola del Navegador**: Inspecciona variables, estructura DOM y rendimiento
2. **React Dev Tools**: Inspecciona componentes React, props y estado
3. **Prisma Studio**: Visualiza y edita datos de la base de datos directamente
4. **SQL Client**: Ejecuta queries directamente para verificar datos
