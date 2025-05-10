# Sistema de Menú de Navegación

## Introducción

El Sistema de Menú de Navegación es un módulo comprensivo que permite configurar y gestionar los elementos del menú principal del sitio web. Este sistema ofrece una interfaz intuitiva para la gestión centralizada de la navegación, proporcionando flexibilidad para crear enlaces a páginas del sistema, páginas estáticas personalizadas o URLs externas.

## Implementación Técnica (2025-Q2)

La implementación completa del sistema ha requerido varios cambios en la base de datos, esquema y componentes:

### Cambios en la Base de Datos

- Adición del campo `navigationMenu` de tipo `LONGTEXT` a la tabla `GlobalConfig` mediante el siguiente script SQL:
```sql
ALTER TABLE GlobalConfig ADD COLUMN navigationMenu LONGTEXT;
```

### Actualización del Esquema de Prisma

- Inclusión del campo `navigationMenu` en el modelo `GlobalConfig`:
```prisma
model GlobalConfig {
  // Otros campos...
  navigationMenu String? @db.LongText
  // Otros campos...
}
```
- Regeneración del cliente Prisma para reconocer el nuevo campo.

### Componentes Desarrollados

- Creación de `NavigationMenuForm.tsx` con:
  * Carga dinámica de páginas estáticas del sistema para generar opciones
  * Interface intuitiva para agregar, editar, eliminar y reordenar elementos
  * Validación de datos para prevenir errores
  * Agrupación visual de opciones por categorías (páginas del sistema, páginas estáticas, opciones personalizadas)
  * Gestión eficiente de los elementos a través de react-hook-form y useFieldArray

### Integración en el Panel de Administración

- Adición del enlace "Menú de Navegación" en:
  * El menú lateral principal (`components/admin/AdminSidebar.tsx`)
  * El layout duplicado con navegación lateral (`app/(admin)/layout.tsx`)
  * La página principal de configuración (`app/(admin)/admin/settings/page.tsx`)

## Características

- Gestión centralizada de elementos del menú de navegación
- Interfaz de arrastrar y soltar para ordenar elementos
- Soporte para diferentes tipos de destinos (páginas del sistema, páginas estáticas, URLs personalizadas)
- Configuración de apertura en nueva pestaña por elemento
- Integración con otros módulos (cabecera, pie de página, barra lateral)
- Previsualización en tiempo real
- Guardar y cargar configuraciones

## Estructura del Módulo

### Modelo de Datos

La configuración del menú de navegación se almacena en el campo `navigationMenu` en la tabla `GlobalConfig` como un array JSON stringificado:

```typescript
interface MenuItem {
  id: string;        // Identificador único del elemento
  label: string;     // Texto visible del enlace
  target: string;    // Destino del enlace (ruta o 'custom' para URLs personalizadas)
  customUrl?: string; // URL personalizada (usado cuando target es 'custom')
  openInNewTab: boolean; // Indica si el enlace debe abrirse en nueva pestaña
}
```

Ejemplo de datos almacenados:

```json
[
  {
    "id": "menu-item-1",
    "label": "Inicio",
    "target": "home",
    "openInNewTab": false
  },
  {
    "id": "menu-item-2",
    "label": "Blog",
    "target": "blog",
    "openInNewTab": false
  },
  {
    "id": "menu-item-3",
    "label": "Portfolio",
    "target": "portfolio",
    "openInNewTab": false
  },
  {
    "id": "menu-item-4",
    "label": "Acerca de",
    "target": "/page/about",
    "openInNewTab": false
  },
  {
    "id": "menu-item-5",
    "label": "GitHub",
    "target": "custom",
    "customUrl": "https://github.com",
    "openInNewTab": true
  }
]
```

### Componentes UI

El módulo incluye los siguientes componentes React:

1. **NavigationMenuForm**: Principal componente para la configuración del menú, ubicado en `components/admin/settings/NavigationMenuForm.tsx`
   - Gestión completa de elementos del menú (agregar, editar, eliminar, reordenar)
   - Formulario interactivo con validación
   - Controles intuitivos mediante botones y selectores

2. **NavigationMenu**: Componente para renderizar el menú en el frontend, que implementa lo siguiente:
   - Renderizado adaptativo según el contexto (cabecera, pie de página, barra lateral)
   - Soporte para modo claro y oscuro
   - Gestión automática de estado activo para la página actual

### Páginas Admin

El módulo proporciona la siguiente página en el panel de administración:

- `/admin/settings/menu` - Configuración del menú de navegación

## Integración con el Sistema de Temas

El sistema de menú de navegación está integrado con el sistema de temas para asegurar que:

1. La apariencia visual del menú sigue la configuración de tema asignada a su contexto (cabecera, pie de página, barra lateral)
2. Los estilos definidos en los presets de tema se aplican correctamente a todos los elementos del menú
3. Tanto el modo claro como oscuro están soportados sin configuración adicional

## Implementación Detallada

### Carga de Datos

El sistema carga la configuración del menú al montar el componente:

```typescript
useEffect(() => {
  const loadMenuData = async () => {
    try {
      const config = await fetchGlobalConfig();
      if (config && config.navigationMenu) {
        const menuData = typeof config.navigationMenu === 'string'
          ? JSON.parse(config.navigationMenu)
          : config.navigationMenu;
        
        if (Array.isArray(menuData)) {
          setValue('items', menuData);
        }
      }
    } catch (error) {
      console.error('Error loading menu data:', error);
      toast.error('Error al cargar los datos del menú');
    }
  };

  loadMenuData();
}, [setValue]);
```

### Guardado de Datos

La configuración se guarda en la base de datos mediante la acción del servidor `saveGlobalConfig`:

```typescript
const onSubmit = async (data: MenuFormData) => {
  try {
    // Validaciones...
    
    const result = await saveGlobalConfig({
      navigationMenu: JSON.stringify(data.items)
    });

    if (result.success) {
      toast.success('Menú de navegación actualizado correctamente');
    } else {
      toast.error(result.message || 'Error al guardar el menú');
    }
  } catch (error) {
    console.error('Error saving menu:', error);
    toast.error('Error al guardar el menú de navegación');
  }
};
```

### Ordenamiento de Elementos

El sistema utiliza controles intuitivos para reordenar elementos:

```typescript
const handleMoveUp = (index: number) => {
  if (index > 0) {
    move(index, index - 1);
  }
};

const handleMoveDown = (index: number) => {
  if (index < fields.length - 1) {
    move(index, index + 1);
  }
};
```

### Integración con Páginas Estáticas

El sistema carga dinámicamente todas las páginas estáticas disponibles:

```typescript
const { data: staticPages } = useSWR<StaticPage[]>('/api/pages', fetcher, {
  revalidateOnFocus: false,
});

// ...

{/* Páginas estáticas */}
<div className="py-1 px-2 text-xs text-muted-foreground font-semibold bg-muted mt-1">
  PÁGINAS ESTÁTICAS
</div>
{staticPages && staticPages.map((page) => (
  <SelectItem key={page.id} value={`/page/${page.slug}`}>
    {page.title}
  </SelectItem>
))}
```

## Ventajas del Sistema Centralizado

El enfoque centralizado para la gestión del menú de navegación ofrece numerosas ventajas:

1. **Consistencia**: Todos los elementos del menú se gestionan en un solo lugar
2. **Facilidad de uso**: Interfaz intuitiva para ordenar y configurar elementos
3. **Flexibilidad**: Soporte para diferentes tipos de enlaces (internos, páginas estáticas, externos)
4. **Mantenibilidad**: Cambios en el menú no requieren modificar múltiples secciones
5. **Coherencia visual**: La integración con el sistema de temas asegura una apariencia consistente

## Guía de Uso

### Añadir un Elemento al Menú

1. Navegar a `/admin/settings/menu` en el panel de administración
2. Hacer clic en "Añadir elemento al menú"
3. Completar el formulario:
   - **Texto del enlace**: El texto que se mostrará en el menú
   - **Destino**: Seleccionar entre páginas del sistema, páginas estáticas o URL personalizada
   - **URL personalizada** (si aplica): Introducir la URL completa con protocolo
   - **Abrir en pestaña nueva**: Activar si el enlace debe abrir en una nueva pestaña
4. Usar los botones de flecha para ordenar el elemento en la posición deseada
5. Hacer clic en "Guardar Menú de Navegación" para aplicar los cambios

### Editar/Eliminar Elementos Existentes

1. Navegar a `/admin/settings/menu` en el panel de administración
2. Localizar el elemento a modificar
3. Cambiar los campos necesarios o hacer clic en el botón de eliminar
4. Hacer clic en "Guardar Menú de Navegación" para aplicar los cambios

## Consideraciones Técnicas

- **Performance**: El sistema precompila la configuración del menú para minimizar cálculos en tiempo de ejecución
- **SEO**: Los enlaces generados son compatibles con SEO y siguen las mejores prácticas
- **Accesibilidad**: El menú generado incluye atributos ARIA para una navegación accesible
- **Internacionalización**: Compatible con el módulo de traducciones multi-idioma

## Resolución de Problemas Comunes

- **Error al guardar**: "Unknown argument `navigationMenu`" - Indica que el campo no está definido en el esquema de Prisma. Solución: Verificar que el esquema de Prisma incluye el campo `navigationMenu` y que se ha regenerado el cliente.
- **SelectItem vacío**: Error relacionado con elementos `<SelectItem value="">` vacíos. Solución: Utilizar divs con estilos para crear los encabezados de grupos en lugar de SelectItems con valor vacío.
- **Páginas no aparecen**: Si las páginas estáticas no aparecen en el selector, verificar que la API `/api/pages` está respondiendo correctamente y que el tipo `StaticPage` está definido correctamente.

## Futuras Mejoras

- Soporte para submenús (menús desplegables)
- Opciones avanzadas de estilo por elemento
- Previsualización instantánea del menú mientras se configura
- Posibilidad de tener múltiples configuraciones de menú para diferentes secciones
- Importación/exportación de configuraciones de menú
- Integración con roles de usuario para elementos condicionados por permisos
