# Documentación del Módulo de Temas Visuales (Theme_Module)

## Introducción

El módulo de temas visuales (Theme_Module) permite a los administradores del sitio crear, gestionar y aplicar diferentes configuraciones de estilo a través de presets reutilizables. Cada preset almacena una colección de configuraciones de estilo (colores, fuentes, espaciado, etc.) que pueden ser aplicados posteriormente al sitio.

## Características

- Gestión completa de presets (CRUD): crear, leer, actualizar, duplicar y eliminar
- Interfaz de usuario amigable y organizada por categorías de estilo
- Selectores de color con soporte para transparencia (alpha)
- Configuración de tipografía, fondos, tarjetas, botones, formularios y efectos
- API RESTful para integración con otros módulos

## Estructura del Módulo

### Modelo de Datos

El módulo utiliza el modelo `ThemePreset` definido en el esquema de Prisma:

```prisma
model ThemePreset {
  id     Int    @id @default(autoincrement())
  name   String @unique
  config String @db.LongText
}
```

La configuración del tema se almacena en el campo `config` como un JSON stringificado con la siguiente estructura TypeScript:

```typescript
interface ThemeConfig {
  background?: {
    type: 'color' | 'gradient' | 'image';
    value: string;
    imageUrl?: string;
  };
  typography?: {
    heading?: { fontFamily?: string; color?: string; };
    paragraph?: { fontFamily?: string; color?: string; };
    link?: { fontFamily?: string; color?: string; hoverColor?: string; };
    button?: { fontFamily?: string; color?: string; };
  };
  spacing?: { 
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
      base?: string; // Valor general
    };
    padding?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
      base?: string; // Valor general
    };
  };
  cards?: {
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    background?: { type: 'color' | 'gradient' | 'image'; value: string; imageUrl?: string; };
    shadow?: {
      x?: string;
      y?: string;
      blur?: string;
      spread?: string;
      color?: string;
    };
  };
  buttons?: {
    primary?: {
      backgroundColor?: string;
      textColor?: string;
      borderRadius?: string;
      hoverBackgroundColor?: string;
      hoverTextColor?: string;
    };
    secondary?: { /* similar structure */ };
  };
  forms?: {
    input?: { /* styles for inputs */ };
    label?: { /* styles for labels */ };
  };
  effects?: {
    transitions?: boolean;
    animation?: 'none' | 'zoomin' | 'zoomout' | 'scale' | 'glow' | 'bounce' | 'pulse' | 'shake' | 'slide' | 'custom';
    customAnimation?: string;
  };
}
```

### Rutas API

El módulo expone las siguientes rutas API para interactuar con los presets de temas:

| Método  | Ruta                                | Descripción                  | Acceso    |
|---------|-------------------------------------|------------------------------|-----------|
| GET     | `/api/theme/presets`                | Obtener todos los presets    | [admin]   |
| POST    | `/api/theme/presets`                | Crear un nuevo preset        | [admin]   |
| GET     | `/api/theme/presets/{id}`           | Obtener preset por ID        | [admin]   |
| PUT     | `/api/theme/presets/{id}`           | Actualizar preset existente  | [admin]   |
| DELETE  | `/api/theme/presets/{id}`           | Eliminar preset              | [admin]   |
| POST    | `/api/theme/presets/{id}/duplicate` | Duplicar preset existente    | [admin]   |

Todas las rutas están protegidas y requieren autenticación con rol de administrador.

### Componentes UI

El módulo incluye los siguientes componentes React:

1. **PresetList**: Lista de temas con acciones para editar, duplicar y eliminar
2. **PresetForm**: Formulario para crear/editar temas con:
   - Selector de color mejorado (usando react-color) con botones de confirmación y cancelación
   - Selector de fuentes con opciones predefinidas y vista previa del texto
   - Configuración detallada de sombras con control sobre desplazamiento X/Y, desenfoque, expansión y color
   - Selector de animaciones predefinidas (zoom, rebote, brillo, etc.)
   - Configuración independiente para los 4 lados en márgenes y padding
   - Interfaz responsiva y organizada por secciones

### Páginas Admin

El módulo proporciona las siguientes páginas en el panel de administración:

1. `/admin/theme` - Página principal con lista de temas existentes
2. `/admin/theme/new` - Página para crear un nuevo tema
3. `/admin/theme/edit/[id]` - Página para editar un tema existente

## Guía de Uso

### Crear un Nuevo Tema

1. Navegar a `/admin/theme` en el panel de administración
2. Hacer clic en "Crear Nuevo Tema"
3. Rellenar el formulario con el nombre del tema y configuraciones deseadas
4. Personalizar los distintos elementos (tipografía, colores, espaciados, etc.)
5. Hacer clic en "Crear Tema" para guardar

### Editar un Tema

1. Navegar a `/admin/theme` en el panel de administración
2. Hacer clic en el botón "Editar" junto al tema deseado
3. Modificar las configuraciones según sea necesario
4. Hacer clic en "Guardar Cambios" para actualizar

### Duplicar un Tema

1. Navegar a `/admin/theme` en el panel de administración
2. Hacer clic en el botón "Duplicar" junto al tema deseado
3. Se creará automáticamente un nuevo tema con el prefijo "Copia de" 

### Eliminar un Tema

1. Navegar a `/admin/theme` en el panel de administración
2. Hacer clic en el botón "Eliminar" junto al tema deseado
3. Confirmar la acción en el diálogo de confirmación

## Integración con Otros Módulos

Para aplicar los temas a elementos visuales del sitio, otros módulos pueden:

1. Obtener la lista de temas disponibles mediante la API GET `/api/theme/presets`
2. Asignar temas a distintas secciones del sitio a través del sistema de asignación de temas
3. Aplicar los estilos definidos en la configuración del tema a los componentes visuales

### Sistema de Asignación de Temas por Sección

El nuevo sistema de asignación de temas permite vincular presets específicos a cada sección principal del sitio:

- Blog - Configuración para el módulo de blog
- Páginas - Temas para páginas individuales
- Portfolio - Configuración para el módulo de portfolio
- Header - Tema específico para el encabezado
- Footer - Tema para el pie de página
- Sidebar - Personalización de la barra lateral

Cada sección puede tener asignados temas diferentes tanto para modo claro como para modo oscuro. La configuración se almacena en el campo `themeAssignments` en la tabla `GlobalConfig` como un JSON estructurado. Para más detalles sobre esta implementación, consulte [docs/theme-assignments.md](./theme-assignments.md).

## Consideraciones Técnicas

- Los colores admiten valores RGBA para soportar transparencia
- La configuración es extremadamente flexible, permitiendo definir solo los valores necesarios
- Los valores predeterminados se aplican cuando falta alguna configuración específica

## Características Implementadas en la Última Actualización (2025)

### Centralización de la Configuración de Temas (2025-Q2)

- **Sistema de asignación central**: Nueva interfaz unificada que permite gestionar todas las asignaciones de temas desde un solo lugar en Apariencia Global.
- **Selector mejorado de destinos**: Interfaz intuitiva que muestra:
  * Elementos del sistema (header, footer, sidebar, blog, portfolio)
  * Todas las páginas estáticas disponibles (cargadas dinámicamente)
  * Opción para rutas personalizadas
- **Eliminación de selectores redundantes**: Retirados todos los selectores de temas dispersos en múltiples configuraciones (encabezado, pie de página, páginas individuales).
- **Retrocompatibilidad**: Mantiene compatibilidad con asignaciones existentes mientras ofrece un nuevo flujo de trabajo más eficiente.
- **Mensajes informativos**: Cada sección individual ahora incluye redirecciones claras al sistema centralizado.

### Mejoras en el Módulo de Páginas Estáticas (2025-Q2)

- **Nuevas opciones de visualización**: Control granular sobre elementos que se muestran en cada página:
  * Mostrar/ocultar cabecera (activado por defecto)
  * Mostrar/ocultar pie de página (activado por defecto)
  * Mostrar/ocultar barra lateral con selección de posición (izquierda/derecha)
- **Campos SEO por página**: Posibilidad de especificar para cada página:
  * Título Meta personalizado
  * Descripción Meta personalizada
  * Palabras clave específicas
- **Gestión de menú separada**: La inclusión en el menú de navegación se gestiona ahora a través del nuevo Sistema de Menú de Navegación.

### Nuevo Sistema de Menú de Navegación (2025-Q2)

Se ha implementado un sistema completamente nuevo para la gestión del menú de navegación. Para una documentación detallada, consulte [docs/navigation-menu-system.md](./navigation-menu-system.md).

Características destacadas:
- Gestión centralizada de todos los elementos del menú
- Soporte para páginas del sistema, páginas estáticas y URLs personalizadas
- Interfaz intuitiva con reordenación mediante botones
- Apertura en nueva pestaña configurable por elemento
- Validación de datos y prevención de errores

### Mejoras Previas del Módulo de Temas

- **Configuración detallada de sombras**: Control granular sobre todos los aspectos de las sombras (posición X/Y, desenfoque, expansión y color).
- **Selección de fuentes mejorada**: Selector con fuentes comunes predefinidas y vista previa en tiempo real.
- **Selector de color mejorado**: Interfaz con botones de confirmación y cancelación que evita cambios accidentales.
- **Animaciones predefinidas**: Selector con opciones como zoom, rebote, brillo, deslizamiento y más.
- **Control de espaciado independiente**: Configuración individual para cada lado (superior, derecho, inferior, izquierdo) tanto en márgenes como en padding.
- **Interfaz más amigable**: Mejor organización, más espacio y diseño responsive.

## Consideraciones Técnicas Importantes

### Acceso a Configuración Global

El módulo de temas interactúa con la tabla `GlobalConfig` que almacena configuraciones globales del sitio. Es importante considerar:

1. **Campos de Tema en GlobalConfig**: 
   La tabla tiene campos `defaultLightThemePresetId` y `defaultDarkThemePresetId` para almacenar los IDs de los temas predeterminados.

2. **Evitar Acceder a Campos No Existentes**:
   En versiones anteriores del código, se intentaba acceder a un campo `activeThemeId` que no existe en la estructura actual de la base de datos. La solución implementada usa los campos correctos existentes:

   ```typescript
   // En lugar de:
   if (config?.activeThemeId) {
     theme = await prisma.themePreset.findUnique({
       where: { id: config.activeThemeId },
     });
   }
   
   // Ahora usamos:
   if (config && (config as any).defaultLightThemePresetId) {
     theme = await prisma.themePreset.findUnique({
       where: { id: (config as any).defaultLightThemePresetId },
     });
   }
   ```

3. **Consultas SQL Directas**:
   Para casos donde hay posibles problemas con el esquema o tipos, es recomendable usar consultas SQL directas que especifiquen exactamente qué campos se necesitan:

   ```typescript
   const result = await prisma.$queryRaw`
     SELECT id, name, config
     FROM ThemePreset
     ORDER BY name ASC
   `;
   ```

### Manejo de Autenticación

Es importante implementar manejo de errores robusto para la autenticación:

```typescript
try {
  session = await auth();
} catch (authError) {
  console.error("Error en auth:", authError);
  return NextResponse.json({ error: "Error de autenticación" }, { status: 401 });
}
```

## Refactorización del Sistema (2025)

El sistema de temas ha sido completamente refactorizado para mejorar su modularidad, mantenibilidad y experiencia de usuario. Los principales cambios incluyen:

- División del componente principal (`PresetForm.tsx`) en múltiples componentes especializados
- Creación de componentes base reutilizables (ColorPicker, FontSelector)
- Organización por pestañas para una navegación más intuitiva
- Vistas previas en tiempo real para cada sección
- Mejoras significativas en la experiencia de usuario

Para más detalles sobre la nueva arquitectura, patrones implementados, y cómo extender el sistema, consulte la [documentación completa de la refactorización](./theme-system-refactoring.md).

## Mejoras Futuras Posibles

- ✓ ~~Previsualización en tiempo real de los cambios de tema~~ (Implementado en la refactorización)
- Selección de temas predefinidos como punto de partida
- Exportación/importación de temas para compartir entre sitios
- Aplicación de temas basada en hora del día o ubicación del usuario
- Soporte para temas estacionales o temáticos
- Modo oscuro/claro automático basado en preferencias del usuario
- Regenerar el cliente Prisma para asegurar acceso a todos los modelos
- ✓ ~~Implementar documentación detallada para desarrolladores sobre cómo extender el sistema de temas~~ (Implementado en la documentación de refactorización)
- Sistema avanzado de herencia de temas (temas base y variaciones)
- Gestión de versiones para cada tema con posibilidad de revertir cambios
- Biblioteca de componentes que apliquen automáticamente los estilos del tema
- Validación de contraste para asegurar accesibilidad
