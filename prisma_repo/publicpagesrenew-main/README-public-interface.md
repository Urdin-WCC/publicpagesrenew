# Documentación de la Interfaz Pública

## Visión General
La interfaz pública de Neurowitch es visualmente consistente y completamente personalizable a través de un sistema centralizado de configuración. El sistema soporta múltiples variantes temáticas, gestión de iconos (social/sharing), y opciones avanzadas para visibilidad, sidebar, y control exhaustivo sobre posts y proyectos.

## Configuración avanzada de Blog y Portfolio

### Esquemas de configuración (BlogConfig / PortfolioConfig)

```jsonc
// BlogConfig
{
  "postsPerPage": 10,
  "allowComments": false,
  "showAuthorName": true, // Usa pseudónimo si existe, nombre real si no.
  "showPublishDate": true,
  "relatedPostsEnabled": true,
  "relatedPostsCount": 3,
  "listDisplayMode": "grid", // "list" o "grid"
  "showSidebarInList": true,
  "sidebarPositionInList": "right", // o "left"
  "showSidebarInPost": true,
  "sidebarPositionInPost": "right",
  "showSharingInPost": true
}

// PortfolioConfig (idéntico en estructura)
{
  "projectsPerPage": 12,
  "defaultDisplayType": "GRID",
  "layoutMode": "grid", // "list" o "grid"
  "showSidebarInList": true,
  "sidebarPositionInList": "right",
  "showSidebarInProject": true,
  "sidebarPositionInProject": "right",
  "showSharingInProject": true
}
```

#### ¿Qué permite cada campo?

- `showSharingInPost` / `showSharingInProject`: Si se muestran o no los botones de compartir en cada post/proyecto. Impacta a nivel de UI pública.
- `showSidebarInList`/`showSidebarInPost`/`showSidebarInProject`: Controla la visibilidad de la barra lateral en listados y detalles.
- `sidebarPositionInList`/`sidebarPositionInPost`/`sidebarPositionInProject`: Define en qué lado aparece la sidebar (izquierda o derecha), permitiendo layouts verdaderamente responsivos y personalizados.
- `showAuthorName`: Muestra el nombre de autor, priorizando pseudónimo si está definido; solo muestra nombre real si el pseudónimo está ausente. 
- `listDisplayMode`/`layoutMode`: Permite conmutar entre visualización tipo lista (vertical clásica) y cuadrícula (tarjetas / grid) tanto en el listado principal como en búsquedas.

### Ejemplo de Uso en Componentes Públicos

**Listado del blog (page.tsx) y búsqueda:**
```tsx
// page.tsx
const blogConfig = await getBlogConfig();
<BlogListClient 
  displayMode={blogConfig.listDisplayMode}
  postsPerPage={blogConfig.postsPerPage}
/>

// search/page.tsx
<div className={blogConfig.listDisplayMode === 'grid'
  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
  : 'flex flex-col space-y-6'}>
  ...posts...
</div>
```

**Detalle de post/proyecto:**
```tsx
const blogConfig = await getBlogConfig();
// Mostrar/ocultar y posición sidebar:
if (blogConfig.showSidebarInPost) {
  // Usa blogConfig.sidebarPositionInPost ('left'/'right') para ubicarla
}
// Autor: muestra pseudónimo antes que nombre real

// SHARING
if (blogConfig.showSharingInPost) {
  <Sharing config={sharingConfig} />
}
```

### Compatibilidad y buenas prácticas

- El modelo de configuración es retrocompatible; nuevos campos tienen valores por defecto seguros. Si tu instalación proviene de versiones antiguas, simplemente accede al panel admin y guarda para inicializar todos los valores nuevos.
- No se requieren migraciones de base de datos para añadir estos campos, ya que el esquema JSON de configuración es flexible.
- Mantén actualizados los valores y prueba con distintos layouts para verificar el efecto de los flags en el frontend.

### Limpieza de código y componentes obsoletos

Recuerda eliminar cualquier fragmento o componente anterior que use hardcode, el sistema viejo de links, o no respete los flags documentados aquí para centralizar el flujo de configuración y evitar confusión futura. 

<!-- (Otras secciones no afectadas permanecen como estaban) -->
