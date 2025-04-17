# Documentación del Módulo de Portfolio

## Descripción General

El Módulo de Portfolio es una extensión de la aplicación Neurowitch que permite gestionar y mostrar proyectos de portfolio. Este módulo proporciona funcionalidades para crear, editar, eliminar y visualizar proyectos, así como para gestionar categorías y configurar la visualización del portfolio.

## Características Principales

- **Gestión de Proyectos**: CRUD completo para Proyectos y Categorías en `/admin/portfolio/...`
- **Formularios con Validación**: Uso de React Hook Form para validación de formularios
- **Gestión de Imágenes**: Soporte para imagen de portada y múltiples imágenes adicionales
- **Tipos de Visualización**: Diferentes modos de visualización para proyectos (SINGLE, GALLERY, SLIDER, GRID)
- **Configuración Personalizable**: Página de configuración específica del portfolio en `/admin/settings/portfolio`
- **Visualización Pública**: Listado de proyectos publicados en `/portfolio` con paginación y filtros
- **Categorías**: Soporte para categorización de proyectos y navegación por categorías
- **Búsqueda**: Funcionalidad de búsqueda integrada

## Estructura del Módulo

### Páginas de Administración
- `app/(admin)/admin/portfolio/page.tsx`: Listado de proyectos
- `app/(admin)/admin/portfolio/new/page.tsx`: Creación de nuevos proyectos
- `app/(admin)/admin/portfolio/edit/[id]/page.tsx`: Edición de proyectos existentes
- `app/(admin)/admin/portfolio/categories/page.tsx`: Gestión de categorías
- `app/(admin)/admin/settings/portfolio/page.tsx`: Configuración del portfolio

### Páginas Públicas
- `app/(public)/portfolio/page.tsx`: Listado público de proyectos
- `app/(public)/portfolio/[slug]/page.tsx`: Página de detalle de proyecto
- `app/(public)/portfolio/category/[slug]/page.tsx`: Listado de proyectos por categoría
- `app/(public)/portfolio/search/page.tsx`: Búsqueda de proyectos

### Rutas API
- `app/api/portfolio/route.ts`: Operaciones CRUD para proyectos
- `app/api/portfolio/[id]/route.ts`: Operaciones por ID de proyecto
- `app/api/portfolio/categories/route.ts`: Operaciones CRUD para categorías
- `app/api/portfolio/categories/[id]/route.ts`: Operaciones por ID de categoría
- `app/api/settings/portfolio/route.ts`: Gestión de configuración del portfolio

## Modelos de Datos

### Project
```typescript
model Project {
  id                  String             @id @default(cuid())
  title               String
  slug                String             @unique
  content             String             @db.Text
  excerpt             String?            @db.Text
  coverImage          String?
  additionalImageUrls String?            @db.LongText // Almacenado como JSON string
  displayType         ProjectDisplayType @default(SINGLE)
  status              ProjectStatus      @default(DRAFT)
  publishedAt         DateTime?
  featured            Boolean            @default(false)
  authorDisplayName   String?
  deleted             Boolean            @default(false)
  authorId            String?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
  categoryIds         String?            @db.Text // Almacenado como JSON string de IDs de categorías
  author              User?              @relation(fields: [authorId], references: [id])
}
```

### Categorías Compartidas
El módulo de Portfolio comparte las categorías con el módulo de Blog, utilizando el modelo `Category` para ambos:

```typescript
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  posts       Post[]   @relation("PostCategories")
  // Ya no tiene relación directa con proyectos
}
```

Desde abril 2025, la relación entre proyectos y categorías se maneja mediante un campo JSON `categoryIds` en la tabla Project, en lugar de usar una tabla de relación. Esto mejora el rendimiento y elimina problemas de permisos que ocurrían con la relación muchos a muchos.

### ProjectDisplayType
```typescript
enum ProjectDisplayType {
  SINGLE
  GALLERY
  SLIDER
  GRID
}
```

### ProjectStatus
```typescript
enum ProjectStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## Configuración del Portfolio

La configuración del portfolio se almacena en la tabla `GlobalConfig` y se gestiona a través de la página de configuración del portfolio. La configuración incluye:

```typescript
interface PortfolioConfig {
  projectsPerPage: number;
  defaultDisplayType: ProjectDisplayType;
  showSidebarInList: boolean;
  showSidebarInProject: boolean;
  layoutMode: 'grid' | 'list';
}
```

## Manejo de Errores y Mejoras de Robustez

### Correcciones Implementadas en 2025

1. **Filtrado Correcto de Proyectos por Estado en Vistas Públicas (Abril 2025)**
   - Se ha corregido el sistema de filtrado para asegurar que solo los proyectos con estado PUBLISHED se muestren en las vistas públicas.
   - Se ha añadido el filtro explícito de `status=PUBLISHED` a todos los componentes cliente que muestran proyectos en vistas públicas:
     - `PortfolioListClient.tsx`
     - `SearchResultsClient.tsx`
     - `CategoryProjectsClient.tsx`
     - `LatestProjectsWidget.tsx`
   - Se ha actualizado la API para asegurar el filtrado incluso si el parámetro no se envía explícitamente desde el cliente.
   - Se ha implementado un script de prueba `test-portfolio-public-vs-admin.js` para verificar el correcto funcionamiento del filtrado.

2. **Mejora en la Visualización de Imágenes en Modo Cuadrícula (Abril 2025)**
   - Se ha rediseñado el componente `ProjectGallery.tsx` para mejorar la visualización en modo cuadrícula.
   - Implementación de proporciones fijas (4:3) para todas las imágenes en la cuadrícula.
   - Mejora del lightbox (visor de imágenes ampliadas) para garantizar la correcta visualización de imágenes.
   - Añadido soporte para navegación por teclado (flechas izquierda/derecha, ESC).
   - Optimizada la experiencia de usuario con indicadores de posición y contador de imágenes.
   - Resueltos problemas con imágenes que aparecían en negro o no se visualizaban correctamente.

3. **Mejora en la Navegación a Categorías (Abril 2025)**
   - Añadido enlace "Gestionar categorías" en la página principal del portfolio.
   - El enlace dirige a `/admin/blog/taxonomies`, donde se gestionan las categorías compartidas.
   - Implementado con icono visual (TagIcon) para mejor usabilidad.
   - Colocado junto a la barra de búsqueda para fácil acceso.

4. **Nueva implementación de categorías de proyectos (Abril 2025)**
   - Se ha modificado la forma en que los proyectos se relacionan con las categorías:
     - Eliminada la tabla de relación `_ProjectCategories` que causaba problemas de permisos
     - Añadido campo `categoryIds` (JSON) a la tabla Project para almacenar IDs de categorías
     - Actualizado el esquema de Prisma para reflejar estos cambios
   - Ventajas de la nueva implementación:
     - Mayor simplicidad: Sin tablas de relación adicionales
     - Mejor rendimiento: Menos joins y consultas más directas
     - Mayor compatibilidad: Evita problemas con permisos de MySQL
     - Menor complejidad en las APIs: Operaciones más directas y predecibles
   - Implementado en:
     - `GET /api/portfolio/[id]` - Para obtener un proyecto con sus categorías
     - `PUT /api/portfolio/[id]` - Para actualizar categorías de proyectos
     - `POST /api/portfolio` - Para crear proyectos con categorías
     - `GET /api/portfolio` - Para listar proyectos con sus categorías
     - `app/(public)/portfolio/[slug]/page.tsx` - Para mostrar categorías en la vista pública

5. **Otros Arreglos y Mejoras (Abril 2025)**
   - Tipo ProjectDisplayType definido localmente para evitar dependencia de Prisma en componentes de UI.
   - Optimización en el uso de useEffect para gestionar eventos de teclado en el lightbox.
   - Mejora en los estilos de navegación y botones para mejor experiencia de usuario.
   - Implementación de lazy loading para mejorar el rendimiento con múltiples imágenes.
   - Añadidos atributos de accesibilidad (aria-label) a elementos interactivos.
   - Mejorado el sistema de proyectos relacionados para mostrar proyectos que comparten categorías.

4. **Categorías Compartidas entre Blog y Portfolio**
   - Se ha implementado un sistema de categorías compartidas entre el blog y el portfolio.
   - Se ha eliminado el modelo `ProjectCategory` y se ha modificado el modelo `Category` para relacionarse con proyectos.
   - Se han actualizado las rutas API y los componentes de UI para usar las categorías del blog.
   - Se ha añadido un enlace a la página de categorías del blog en el menú de configuración.

2. **Manejo de Categorías en Formularios**
   - Se ha mejorado el manejo de categorías en los formularios de creación y edición de proyectos.
   - Se han añadido verificaciones para asegurar que `categories` sea un array antes de intentar usar `map`.
   - Se ha añadido un mensaje de error para cuando `categories` no sea un array.
   - Se ha añadido un enlace para crear categorías directamente desde la página de creación de proyectos.

   ```typescript
   // Ejemplo de código mejorado
   {categoriesError ? (
     <p className="text-red-500 text-sm">Error al cargar categorías</p>
   ) : !categories ? (
     <p className="text-sm text-muted-foreground">{translations.common.loading}</p>
   ) : (categories || []).length === 0 ? (
     <p className="text-sm text-muted-foreground">
       No hay categorías disponibles. <Link href="/admin/portfolio/categories" className="underline">Crea algunas categorías</Link> primero.
     </p>
   ) : Array.isArray(categories) ? (
     categories.map((category) => (
       // Renderizado de categorías
     ))
   ) : (
     <p className="text-sm text-muted-foreground">
       Error: Las categorías no son un array válido. Por favor, recarga la página.
     </p>
   )}
   ```

2. **Corrección de Errores de Sintaxis**
   - Se han corregido errores de sintaxis en la estructura JSX de los componentes.
   - Se ha añadido un paréntesis de cierre faltante en la estructura condicional que maneja las categorías.

3. **Mejora en la Página de Categorías**
   - Se ha mejorado el manejo de categorías en la página de gestión de categorías.
   - Se han añadido verificaciones para asegurar que `categories` sea un array antes de intentar usar `map`.
   - Se ha añadido una fila de tabla con un mensaje de error para cuando `categories` no sea un array.

   ```typescript
   // Ejemplo de código mejorado
   {Array.isArray(categories) ? categories.map((category) => (
     // Renderizado de categorías
   )) : (
     <TableRow>
       <TableCell colSpan={4} className="text-center py-4 text-gray-500">
         Error: Las categorías no son un array válido. Por favor, recarga la página.
       </TableCell>
     </TableRow>
   )}
   ```

4. **Manejo de Errores en API**
   - Se han mejorado los mensajes de error en las rutas API para proporcionar información más clara sobre los problemas.
   - Se han añadido bloques try/catch para manejar errores de forma más robusta.

5. **Manejo de additionalImageUrls como JSON**
   - Se ha corregido la discrepancia entre el modelo de Prisma y el código.
   - En el esquema de Prisma, `additionalImageUrls` está definido como `String?` (un string opcional), pero en el código se trataba como un array de strings (`string[]`).
   - Se han modificado las rutas API para convertir el string JSON a un array de strings cuando se obtienen proyectos.
   - Se utiliza `JSON.stringify()` para convertir el array a un string cuando se guardan proyectos.
   - Se utiliza `JSON.parse()` para convertir el string a un array cuando se obtienen proyectos.

6. **Mejora en la Visualización de Errores**
   - Se han añadido estados de carga y error en los componentes para mejorar la experiencia de usuario.
   - Se han añadido mensajes de error claros y acciones para recuperarse de los errores.

## Buenas Prácticas Implementadas

1. **Verificación de Tipos**
   - Uso de verificaciones de tipo (como `Array.isArray()`) antes de operar con datos.
   - Uso de operadores de coalescencia nula (`||`) para proporcionar valores por defecto.

2. **Manejo de Estados de Carga**
   - Implementación de estados de carga para mejorar la experiencia de usuario.
   - Uso de componentes de carga (como `LoadingSpinner`) durante las operaciones asíncronas.

3. **Mensajes de Error Claros**
   - Implementación de mensajes de error claros y específicos.
   - Uso de componentes visuales para destacar los errores.

4. **Recuperación de Errores**
   - Implementación de mecanismos para recuperarse de errores (como botones para reintentar o enlaces para crear recursos faltantes).

## Consideraciones de Seguridad

1. **Validación de Entrada**
   - Validación de todos los datos de entrada en formularios y rutas API.
   - Uso de React Hook Form para validación de formularios.

2. **Protección de Rutas**
   - Protección de rutas administrativas basada en roles.
   - Verificación de permisos antes de realizar operaciones CRUD.

3. **Sanitización de Datos**
   - Sanitización de datos antes de almacenarlos en la base de datos.
   - Uso de Prisma para prevenir inyección SQL.

## Conclusión

El Módulo de Portfolio proporciona una solución completa para la gestión y visualización de proyectos de portfolio. Las mejoras implementadas en el manejo de errores y la robustez del código aseguran una experiencia de usuario fluida y sin errores, incluso en situaciones donde los datos pueden no ser los esperados.

Las buenas prácticas implementadas, como la verificación de tipos, el manejo de estados de carga y la implementación de mensajes de error claros, contribuyen a la calidad general del código y la experiencia de usuario.

## Referencias

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de React Hook Form](https://react-hook-form.com/get-started)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
