# Documentación de Cambios - Configuración del Blog

## Nuevas Funcionalidades Implementadas

Se han añadido tres nuevas opciones a la configuración del blog en la página admin/settings/blog:

1. **Modo de visualización del listado de posts**: Permite elegir entre dos modos de visualización para el listado de posts:
   - **Cuadrícula (Grid)**: Muestra los posts en una cuadrícula de tarjetas (modo por defecto)
   - **Lista**: Muestra los posts en formato de lista vertical

2. **Visibilidad de la barra lateral en el listado**: Permite controlar si la barra lateral se muestra o no en la página principal del blog (listado de posts).

3. **Visibilidad de la barra lateral en el post individual**: Permite controlar si la barra lateral se muestra o no en la página de detalle de un post.

## Cambios Realizados

### 1. Actualización de la Interfaz BlogConfig

Se ha modificado la interfaz `BlogConfig` en `lib/config-server.ts` para incluir las nuevas opciones:

```typescript
export interface BlogConfig {
  // Opciones existentes
  postsPerPage: number;
  allowComments: boolean;
  showAuthorName: boolean;
  showPublishDate: boolean;
  relatedPostsEnabled: boolean;
  relatedPostsCount: number;
  
  // Nuevas opciones
  listDisplayMode: 'grid' | 'list';  // Modo de visualización del listado de posts
  showSidebarInList: boolean;        // Mostrar barra lateral en el listado de posts
  showSidebarInPost: boolean;        // Mostrar barra lateral en el post individual
}
```

### 2. Actualización del Formulario de Configuración

Se ha modificado la página `app/(admin)/admin/settings/blog/page.tsx` para incluir los nuevos controles:

- Un selector de radio para elegir entre modo cuadrícula o lista
- Un switch para controlar la visibilidad de la barra lateral en el listado
- Un switch para controlar la visibilidad de la barra lateral en el post individual

### 3. Integración con la Configuración Existente de la Barra Lateral

Las nuevas opciones de visibilidad de la barra lateral se han integrado con la configuración existente de la barra lateral (admin/settings/sidebar):

- La visibilidad (mostrar/ocultar) se controla desde la configuración del blog
- La posición (izquierda/derecha), ancho y widgets se controlan desde la configuración de la barra lateral

### 4. Modificación de las Páginas Públicas

Se han modificado las páginas públicas para utilizar las nuevas opciones:

- **Página de listado de posts** (`app/(public)/blog/page.tsx`):
  - Implementa el modo de visualización (cuadrícula/lista)
  - Muestra u oculta la barra lateral según la configuración
  - Respeta la posición y ancho configurados para la barra lateral

- **Página de detalle de post** (`app/(public)/blog/[slug]/page.tsx`):
  - Muestra u oculta la barra lateral según la configuración
  - Respeta la posición y ancho configurados para la barra lateral

### 5. Componente BlogSidebar Mejorado

Se ha mejorado el componente `BlogSidebar` para que utilice los widgets configurados en admin/settings/sidebar:

- Obtiene la configuración de widgets desde la API
- Renderiza dinámicamente los widgets según su tipo
- Proporciona widgets por defecto si no hay configuración

### 6. Nueva API para la Configuración de la Barra Lateral

Se ha creado una nueva API para obtener la configuración de la barra lateral:

- `app/api/settings/sidebar/route.ts`: Devuelve la configuración de la barra lateral (posición, ancho, widgets)

## Uso

1. Accede a la página de configuración del blog en `/admin/settings/blog`
2. Configura el modo de visualización del listado de posts (cuadrícula o lista)
3. Activa o desactiva la barra lateral para el listado de posts y para los posts individuales
4. Guarda los cambios

Para configurar la posición, ancho y widgets de la barra lateral:

1. Accede a la página de configuración de la barra lateral en `/admin/settings/sidebar`
2. Configura la posición (izquierda o derecha) y el ancho
3. Añade, elimina o reordena los widgets
4. Guarda los cambios

## Notas Técnicas

- Las nuevas opciones se almacenan en la configuración global del sitio, en el campo `blogConfig`
- La configuración de la barra lateral se almacena en la configuración global del sitio, en el campo `sidebar`
- Se ha mantenido la compatibilidad con el código existente
- Se han respetado los patrones de diseño y arquitectura del proyecto
