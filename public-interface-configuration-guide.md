# Guía de Configuración de la Interfaz Pública

Este documento enumera todas las propiedades configurables en el panel de administración para la interfaz pública, su ubicación en la base de datos y su formato. Esta información es crucial para implementar correctamente las páginas públicas y asegurar que las configuraciones se apliquen correctamente.

## Índice
1. [Configuración de Apariencia Global](#1-configuración-de-apariencia-global)
2. [Configuración del Header (Encabezado)](#2-configuración-del-header-encabezado)
3. [Configuración del Footer (Pie de Página)](#3-configuración-del-footer-pie-de-página)
4. [Configuración de la Sidebar (Barra Lateral)](#4-configuración-de-la-sidebar-barra-lateral)
5. [Configuración del Menú de Navegación](#5-configuración-del-menú-de-navegación)
6. [Configuración de Páginas Estáticas](#6-configuración-de-páginas-estáticas)
7. [Sistema de Visibilidad de Componentes](#7-sistema-de-visibilidad-de-componentes)

## 1. Configuración de Apariencia Global

### Ruta en Admin Panel
`/admin/settings/appearance`

### Componente React
`components/admin/settings/AppearanceForm.tsx`

### Propiedades Configurables

#### Temas Predeterminados
| Propiedad | Ubicación en Base de Datos | Formato | Descripción |
|-----------|----------------------------|---------|-------------|
| `defaultLightThemePresetId` | `GlobalConfig.defaultLightThemePresetId` | `Number` | ID del tema claro predeterminado |
| `defaultDarkThemePresetId` | `GlobalConfig.defaultDarkThemePresetId` | `Number` | ID del tema oscuro predeterminado |

#### Asignaciones de Temas
| Propiedad | Ubicación en Base de Datos | Formato | Descripción |
|-----------|----------------------------|---------|-------------|
| `themeAssignments` | `GlobalConfig.themeAssignments` | `JSON String` | Asignaciones de temas para rutas/componentes específicos |

Formato JSON:
```json
{
  "header": { "light": 1, "dark": 2 },
  "footer": { "light": 1, "dark": 2 },
  "sidebar": { "light": 1, "dark": 2 },
  "/blog": { "light": 3, "dark": 4 }
}
```

#### Spinner de Carga
| Propiedad | Ubicación en Base de Datos | Formato | Descripción |
|-----------|----------------------------|---------|-------------|
| `loadingSpinnerConfig` | `GlobalConfig.loadingSpinnerConfig` | `JSON String` | Configuración del spinner de carga |

Formato JSON:
```json
{
  "enabled": true,
  "overlayColor": "rgba(0,0,0,0.3)",
  "spinnerImageUrl": "/path/to/spinner.gif" 
}
```

#### Interruptor de Tema
| Propiedad | Ubicación en Base de Datos | Formato | Descripción |
|-----------|----------------------------|---------|-------------|
| `themeSwitcherConfig` | `GlobalConfig.themeSwitcherConfig` | `JSON String` | Configuración del interruptor de tema |

Formato JSON:
```json
{
  "visible": true,
  "style": "icon",
  "position": "bottom_right"
}
```

#### Elementos Fijos
| Propiedad | Ubicación en Base de Datos | Formato | Descripción |
|-----------|----------------------------|---------|-------------|
| `stickyElementsConfig` | `GlobalConfig.stickyElementsConfig` | `JSON String` | Configuración de elementos fijos |

Formato JSON:
```json
{
  "header": true,
  "sidebar": false,
  "footer": false,
  "themeSwitcher": true
}
```

### Server Actions
```typescript
// Ubicación: actions/config-actions.ts
fetchGlobalConfig() // Obtiene la configuración global
saveGlobalConfig(data) // Guarda la configuración global
```

## 2. Configuración del Header (Encabezado)

### Ruta en Admin Panel
`/admin/settings/header`

### Componente React
`components/admin/settings/HeaderFormComplete.tsx`

### Propiedades Configurables
| Propiedad | Ubicación en Base de Datos | Formato | Descripción |
|-----------|----------------------------|---------|-------------|
| `header` | `GlobalConfig.header` | `JSON String` | Configuración completa del header |

Formato JSON:
```json
{
  "elements": [
    { 
      "type": "logo", 
      "visible": true, 
      "position": "top-left",
      "logoUrl": "/path/to/logo.png"
    },
    { 
      "type": "text", 
      "visible": true, 
      "position": "top-center"
    },
    { 
      "type": "menu", 
      "visible": true, 
      "position": "top-right"
    },
    { 
      "type": "social", 
      "visible": true, 
      "position": "bottom-left"
    },
    { 
      "type": "theme", 
      "visible": true, 
      "position": "bottom-right"
    },
    { 
      "type": "html", 
      "visible": false, 
      "position": "center-center",
      "html": "<div>Custom HTML content</div>"
    }
  ]
}
```

### Server Actions
```typescript
// Ubicación: actions/header-actions.ts
fetchHeaderConfig() // Obtiene la configuración del header
saveHeaderConfig(data) // Guarda la configuración del header
```

## 3. Configuración del Footer (Pie de Página)

### Ruta en Admin Panel
`/admin/settings/footer`

### Componente React
`components/admin/settings/FooterFormComplete.tsx`

### Propiedades Configurables
| Propiedad | Ubicación en Base de Datos | Formato | Descripción |
|-----------|----------------------------|---------|-------------|
| `footer` | `GlobalConfig.footer` | `JSON String` | Configuración completa del footer |

Formato JSON:
```json
{
  "widgets": [
    {
      "type": "latest_posts",
      "config": {}
    },
    {
      "type": "categories",
      "config": {}
    }
  ],
  "height": "200px",
  "secondaryHtml": "<div>Custom HTML content</div>"
}
```

### Server Actions
```typescript
// Ubicación: actions/footer-actions.ts
fetchFooterConfig() // Obtiene la configuración del footer
saveFooterConfig(data) // Guarda la configuración del footer
```

## 4. Configuración de la Sidebar (Barra Lateral)

### Ruta en Admin Panel
`/admin/settings/sidebar`

### Componente React
`components/admin/settings/SidebarFormComplete.tsx`

### Propiedades Configurables
| Propiedad | Ubicación en Base de Datos | Formato | Descripción |
|-----------|----------------------------|---------|-------------|
| `sidebar` | `GlobalConfig.sidebar` | `JSON String` | Configuración completa de la sidebar |

Formato JSON:
```json
{
  "widgets": [
    {
      "type": "latest_posts",
      "title": "Últimos Posts",
      "config": {}
    },
    {
      "type": "categories",
      "title": "Categorías",
      "config": {}
    }
  ],
  "position": "right",
  "width": "300px",
  "visible": true
}
```

### Server Actions
```typescript
// Ubicación: actions/sidebar-actions.ts
fetchSidebarConfig() // Obtiene la configuración de la sidebar
saveSidebarConfig(data) // Guarda la configuración de la sidebar
```

## 5. Configuración del Menú de Navegación

### Ruta en Admin Panel
`/admin/settings/menu`

### Componente React
`components/admin/settings/NavigationMenuForm.tsx`

### Propiedades Configurables
| Propiedad | Ubicación en Base de Datos | Formato | Descripción |
|-----------|----------------------------|---------|-------------|
| `navigationMenu` | `GlobalConfig.navigationMenu` | `JSON String` | Elementos del menú de navegación |

Formato JSON:
```json
[
  {
    "id": "menu-item-1",
    "label": "Inicio",
    "target": "/",
    "openInNewTab": false
  },
  {
    "id": "menu-item-2",
    "label": "Blog",
    "target": "/blog",
    "openInNewTab": false
  },
  {
    "id": "menu-item-3",
    "label": "Acerca de",
    "target": "/page/about",
    "openInNewTab": false
  },
  {
    "id": "menu-item-4",
    "label": "GitHub",
    "target": "custom",
    "customUrl": "https://github.com",
    "openInNewTab": true
  }
]
```

### Server Actions
```typescript
// Ubicación: actions/menu-actions.ts
fetchNavigationMenu() // Obtiene el menú de navegación
saveNavigationMenu(items) // Guarda el menú de navegación
```

## 6. Configuración de Páginas Estáticas

### Ruta en Admin Panel
`/admin/pages` y `/admin/pages/edit/[id]`

### Componente React
`components/admin/pages/PageForm.tsx`

### Propiedades Configurables
| Propiedad | Ubicación en Base de Datos | Formato | Descripción |
|-----------|----------------------------|---------|-------------|
| `title` | `StaticPage.title` | `String` | Título de la página |
| `slug` | `StaticPage.slug` | `String` | Slug URL-friendly de la página |
| `contentHtml` | `StaticPage.contentHtml` | `String (HTML)` | Contenido HTML de la página |
| `showHeader` | `StaticPage.showHeader` | `Boolean` | Mostrar encabezado en la página |
| `showFooter` | `StaticPage.showFooter` | `Boolean` | Mostrar pie de página en la página |
| `showSidebar` | `StaticPage.showSidebar` | `Boolean` | Mostrar barra lateral en la página |
| `sidebarPosition` | `StaticPage.sidebarPosition` | `String ('left'/'right')` | Posición de barra lateral |
| `metaTitle` | `StaticPage.metaTitle` | `String` | Título para SEO (opcional) |
| `metaDescription` | `StaticPage.metaDescription` | `String` | Descripción para SEO (opcional) |
| `metaKeywords` | `StaticPage.metaKeywords` | `String` | Palabras clave para SEO (opcional) |

### Server Actions
```typescript
// Ubicación: actions/page-actions.ts
createPage(data) // Crea una nueva página estática
updatePage(pageId, data) // Actualiza una página estática existente
getStaticPageBySlug(slug) // Obtiene una página por su slug
```

## 7. Sistema de Visibilidad de Componentes

La visibilidad de los componentes en las páginas públicas se controla a través de un objeto `window.__PAGE_CONFIG__` que puede ser configurado para cada página. Este objeto controla las clases CSS que ocultan o muestran los diferentes componentes:

```javascript
window.__PAGE_CONFIG__ = {
  showHeader: true, // Controla si se muestra el encabezado
  showFooter: true, // Controla si se muestra el pie de página
  showSidebar: true, // Controla si se muestra la barra lateral
  sidebarPosition: 'right' // Controla la posición de la barra lateral ('left' o 'right')
};
```

### Componente Responsable
`components/public/PageConfigHandler.tsx` - Este componente cliente aplica las clases CSS basadas en `window.__PAGE_CONFIG__`.

### Clases CSS Relevantes
```css
body.hide-header header {
  display: none !important;
}

body.hide-footer footer {
  display: none !important;
}

body.show-sidebar .sidebar-component {
  display: block !important;
}

body.hide-sidebar .sidebar-component {
  display: none !important;
}

body.sidebar-left .sidebar-component[data-position="right"] {
  display: none !important;
}

body.sidebar-right .sidebar-component[data-position="left"] {
  display: none !important;
}
```

### Implementación en las Páginas Públicas

En las páginas estáticas, la configuración de visibilidad se inyecta utilizando un script inline:

```tsx
// Ejemplo de implementación en app/(public)/page/[slug]/page.tsx
const pageConfig = {
  showHeader: page.showHeader !== undefined ? Boolean(page.showHeader) : true,
  showFooter: page.showFooter !== undefined ? Boolean(page.showFooter) : true,
  showSidebar: page.showSidebar !== undefined ? Boolean(page.showSidebar) : false,
  sidebarPosition: page.sidebarPosition || 'right'
};

// Inyectar configuración mediante script
const pageConfigScript = `
  <script>
    window.__PAGE_CONFIG__ = ${JSON.stringify(pageConfig)};
  </script>
`;

return (
  <>
    {/* Insertar script con configuración de página */}
    <div dangerouslySetInnerHTML={{ __html: pageConfigScript }} />
    
    {/* Contenido principal */}
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <div className="mb-12">
        <FixedHtmlRenderer content={page.contentHtml || ""} />
      </div>
    </div>
  </>
);
```

## Consideraciones Importantes

1. **Formato JSON Correcto**: Todos los campos JSON en `GlobalConfig` deben tener un formato válido. Los errores comunes incluyen:
   - Falta de comillas en nombres de propiedades
   - Falta de comas entre elementos
   - Valores booleanos como strings ("true" en lugar de true)

2. **Tema Predeterminado**: Asegúrate de que siempre existan temas con IDs 1 y 2 para los temas claro y oscuro predeterminados.

3. **Valores Fallback**: Implementa valores predeterminados cuando las configuraciones no existan.

4. **Parseado Seguro de JSON**: Utiliza manejo de errores al parsear configuraciones JSON.

5. **Consultas SQL Directas**: Las consultas SQL directas pueden ser más confiables que los métodos de Prisma para campos personalizados:

  ```typescript
  const result = await prisma.$queryRaw`
    SELECT field FROM GlobalConfig WHERE id = 'global';
  `;
  ```

## Mejores Prácticas

1. **Validación en Formularios**: Implementa validación adecuada para evitar guardar configuraciones incorrectas.

2. **Respaldo de Configuraciones**: Antes de actualizar, respaldar la configuración existente.

3. **Notificaciones de Cambios**: Usa toast o alertas para informar sobre cambios en configuraciones.

4. **Testing de Visibilidad**: Después de cambiar configuraciones, verifica la visibilidad correcta de componentes.

5. **Comentarios en Código**: Documenta claramente la estructura y formato esperado de cada configuración.
