# Módulo de Páginas Estáticas (Static_Pages_Module)

Este documento proporciona una descripción detallada del módulo de páginas estáticas implementado en el proyecto Neurowitch, actualizado con los cambios y mejoras recientes.

## 1. Introducción

El módulo de páginas estáticas permite a los administradores crear y gestionar contenido estático como "Acerca de", "Contacto", "Política de Privacidad", etc. Permite personalizar la apariencia de cada página y optimizar su contenido para SEO.

## 2. Estructura del Módulo

### 2.1. Modelo de Datos

#### Modelo `StaticPage` (Páginas Estáticas)

```prisma
model StaticPage {
  id              Int      @id @default(autoincrement())
  title           String
  slug            String   @unique
  contentHtml     String   @db.LongText
  isHomePage      Boolean  @default(false)  // Nota: Configurado a través del sistema centralizado
  showHeader      Boolean  @default(true)   // Opciones de visualización
  showFooter      Boolean  @default(true)   // Opciones de visualización
  showSidebar     Boolean  @default(false)  // Opciones de visualización
  sidebarPosition String   @default("left") // Opciones de visualización
  metaTitle       String?                   // SEO
  metaDescription String?  @db.Text         // SEO
  metaKeywords    String?                   // SEO
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

> **Nota sobre campos obsoletos**: Los campos `menuOrder`, `includeInMenu` e `isVisible` han sido eliminados en favor de un sistema centralizado de menús en la configuración global. La visibilidad y organización del menú ahora se manejan a través del sistema de navegación central.

#### Campos Añadidos al Modelo `GlobalConfig`

```prisma
model GlobalConfig {
  // ... otros campos existentes
  cookieBannerText          String?  @db.Text
  cookieBannerLinkPageId    Int?
  navigationMenu            String?  @db.Text // JSON con estructura de menú
}
```

### 2.2. Componentes Principales

#### Componentes de Administración

- **PageList (`components/admin/pages/PageList.tsx`)**: Lista de páginas estáticas con funciones de administración (crear, editar, eliminar)
- **PageForm (`components/admin/pages/PageForm.tsx`)**: Formulario para crear/editar páginas estáticas con opciones de visualización y SEO
- **PrivacySettingsForm (`components/admin/settings/PrivacySettingsForm.tsx`)**: Formulario para configurar el banner de cookies

#### Server Actions

- **Page Actions (`actions/page-actions.ts`)**: Acciones del servidor para manejar la creación y actualización de páginas usando consultas SQL directas

#### Componentes Públicos

- **CookieBanner (`components/public/CookieBanner.tsx`)**: Componente que muestra el banner de cookies en el sitio público

### 2.3. Páginas del Panel de Administración

- **Lista de Páginas**: `app/(admin)/admin/pages/page.tsx`
- **Crear Nueva Página**: `app/(admin)/admin/pages/new/page.tsx`
- **Editar Página**: `app/(admin)/admin/pages/edit/[id]/page.tsx`
- **Configuración de Privacidad**: `app/(admin)/admin/settings/privacy/page.tsx`

### 2.4. Páginas Públicas

- **Página de Inicio Dinámica**: `app/(public)/page.tsx`
- **Páginas Dinámicas**: `app/(public)/[slug]/page.tsx`
- **Layout Público con Banner de Cookies**: `app/(public)/layout.tsx`

### 2.5. API Routes

- **Operaciones CRUD para páginas**: 
  - `app/api/pages/route.ts` (GET, POST)
  - `app/api/pages/[id]/route.ts` (GET, PUT, DELETE)

- **Configuración de privacidad**:
  - `app/api/settings/privacy/route.ts` (PUT)

> **Nota**: Las API routes para toggle de visibilidad, toggle de menú, establecer como página de inicio y reordenar páginas han sido reemplazadas por el nuevo sistema centralizado de navegación.

## 3. Flujos de Trabajo Principales

### 3.1. Gestión de Páginas Estáticas

1. **Listar Páginas**: Los administradores pueden ver todas las páginas estáticas en `/admin/pages`.
2. **Crear Página**: Mediante el formulario en `/admin/pages/new`.
3. **Editar Página**: A través del formulario en `/admin/pages/edit/[id]`.
4. **Eliminar Página**: Botón de eliminación con confirmación vía diálogo modal.
5. **Configurar Opciones de Visualización**: En el formulario de edición:
   - Mostrar/Ocultar Cabecera
   - Mostrar/Ocultar Pie de Página
   - Mostrar/Ocultar Barra Lateral
   - Seleccionar Posición de Barra Lateral (izquierda/derecha)
6. **Optimizar SEO**: En el formulario de edición:
   - Establecer Título Meta
   - Establecer Descripción Meta
   - Establecer Palabras Clave

### 3.2. Configuración de Privacidad

1. **Configurar Banner de Cookies**: Los administradores pueden establecer el texto del banner.
2. **Seleccionar Página de Política de Privacidad**: Para enlazar desde el banner de cookies.

### 3.3. Visualización Pública

1. **Página de Inicio**: Muestra la página marcada como inicio en el sistema centralizado.
2. **Páginas Dinámicas**: Acceso a páginas mediante su `slug` en la URL.
3. **Banner de Cookies**: Se muestra en todas las páginas hasta que el usuario lo acepta.

## 4. Integración con Otros Módulos

### 4.1. Sistema de Navegación

- Las páginas se integran en el sistema centralizado de navegación y menús.
- La visibilidad en el menú se controla desde la configuración central de navegación.

### 4.2. Módulo de Temas

- Las opciones de visualización (cabecera, pie de página, barra lateral) se coordinan con el sistema de temas.
- Las propiedades `showHeader`, `showFooter` y `showSidebar` controlan la apariencia sin afectar la estructura del tema.

### 4.3. Core Module

- Utiliza el sistema de autenticación para proteger rutas administrativas.
- Utiliza el componente `HtmlEditor` para editar el contenido de las páginas.
- Utiliza el cliente Prisma y consultas SQL directas para interactuar con la base de datos.
- Utiliza la función `logAdminAction` para registrar acciones administrativas.
- Utiliza las Server Actions para operaciones de alto nivel.

### 4.4. UI Framework Module

- Integración con el layout administrativo.
- Integración con el layout público y el sistema de navegación.

## 5. Seguridad

- **Protección por Rol**: Solo los usuarios con rol "ADMIN" o "MASTER" pueden acceder a la gestión de páginas.
- **Validación de Entrada**: Se validan los datos recibidos en los endpoints de API y en las Server Actions.
- **Prevención XSS**: Se utiliza `dangerouslySetInnerHTML` con precaución solo para contenido generado por el editor WYSIWYG.

## 6. Consideraciones de Rendimiento

- **Server Actions**: Se utilizan Server Actions para mejorar el rendimiento y la seguridad.
- **SSG/SSR**: Las páginas públicas utilizan generación estática mediante `generateStaticParams`.
- **Peticiones Eficientes**: Se optimizan las consultas a la base de datos para incluir solo los campos necesarios.

## 7. Pruebas y Mantenimiento

Para probar este módulo, se recomienda:

1. **Prueba de Creación**: Crear varias páginas estáticas con diferentes opciones de visualización.
2. **Prueba de Navegación**: Verificar que se muestren correctamente en el sitio público.
3. **Prueba del Banner**: Configurar el banner de cookies y verificar su funcionamiento.
4. **Prueba de Opciones**: Verificar que las opciones de visualización y SEO se apliquen correctamente.

## 8. Consideraciones Técnicas Importantes

### 8.1. Acceso a Modelos en Prisma

El modelo `StaticPage` está definido en el esquema de Prisma, pero puede ocurrir que el cliente generado no tenga acceso directo a este modelo. Para solucionar este problema:

- **Usar Consultas SQL Directas** (enfoque recomendado):
  ```typescript
  const pages = await prisma.$queryRaw`
    SELECT id, title, slug, contentHtml, showHeader, showFooter, showSidebar, sidebarPosition 
    FROM StaticPage 
    ORDER BY id DESC
  `;
  ```

- **Server Actions**: Para operaciones CRUD complejas, se recomienda usar las Server Actions definidas en `actions/page-actions.ts`:
  ```typescript
  import { createPage, updatePage } from "@/actions/page-actions";
  
  // Para crear una página
  const result = await createPage(data);
  
  // Para actualizar una página
  const result = await updatePage(pageId, data);
  ```

### 8.2. Manejo de Errores en Archivos Grandes

Durante el desarrollo del módulo se identificaron problemas con la edición de archivos grandes o complejos. Para evitar estos problemas, se siguen estas estrategias:

1. **División en Componentes Más Pequeños**: Los componentes grandes se dividen en subcomponentes más pequeños y manejables.

2. **Actualizaciones Incrementales**: 
   - En lugar de actualizaciones extensas en una sola operación, se realizan cambios pequeños e incrementales.
   - Cada cambio incremental se prueba antes de continuar con el siguiente.

3. **Uso de Server Actions**: 
   - Se utilizan Server Actions para manejar la lógica de operaciones en el servidor.
   - Se mantiene la interfaz de usuario desacoplada de la lógica de datos.

4. **Uso de Componentización Adecuada**:
   - Por ejemplo, los componentes de formulario se dividen en secciones lógicas.
   - Se utilizan Checkboxes para opciones booleanas en lugar de Switches para mayor estabilidad.

### 8.3. Manejo de Parámetros de Ruta en Next.js

Next.js requiere que los parámetros de ruta se manejen de manera específica. Las implementaciones actuales siguen estas prácticas:

1. **En Rutas API**:
   ```typescript
   export async function PUT(
     request: NextRequest,
     context: { params: { id: string } }
   ) {
     const { params } = context;
     // Ahora params.id se puede usar de forma segura
   }
   ```

2. **En Páginas de la App**:
   ```typescript
   export default async function EditPagePage(props: {
     params: { id: string };
   }) {
     // Esperar a que los params se resuelvan
     const { id } = await Promise.resolve(props.params);
   }
   ```

## 9. Cambios y Mejoras Recientes

### 9.1. Eliminación de Columnas Obsoletas
- Se han eliminado los campos `menuOrder`, `includeInMenu` e `isVisible` del modelo `StaticPage`
- El listado de páginas ya no muestra la columna "En Inicio" ni sus iconos
- La visibilidad de páginas ahora se gestiona a través del sistema centralizado de navegación

### 9.2. Nuevas Opciones de Visualización
- Se han añadido opciones para controlar la visualización de elementos de página:
  * `showHeader`: Controla si se muestra la cabecera en la página
  * `showFooter`: Controla si se muestra el pie de página
  * `showSidebar`: Controla si se muestra una barra lateral
  * `sidebarPosition`: Determina la posición de la barra lateral ("left" o "right")

### 9.3. Soporte para SEO
- Se han añadido campos para mejorar el SEO de cada página:
  * `metaTitle`: Título personalizado para SEO
  * `metaDescription`: Descripción personalizada para motores de búsqueda
  * `metaKeywords`: Palabras clave para mejorar el posicionamiento

### 9.4. Uso de Server Actions
- Se ha implementado un nuevo archivo `actions/page-actions.ts` con Server Actions
- Las operaciones CRUD ahora utilizan directamente consultas SQL (`$queryRaw`) para mayor robustez
- Las acciones del servidor validan los datos y manejan errores de forma centralizada

### 9.5. Mejora de la Interfaz de Usuario
- Se han actualizado los componentes para usar Checkboxes en lugar de Switches para las opciones booleanas
- El formulario de edición de páginas ahora tiene secciones más claras para opciones de visualización y SEO
- La interfaz es más consistente con el resto del sistema

## 10. Contribuciones Futuras

Posibles mejoras para versiones futuras:

- Implementar un sistema de plantillas predefinidas para tipos comunes de páginas estáticas.
- Añadir soporte para previsualización de páginas antes de publicarlas.
- Implementar historial de versiones/revisiones para páginas importantes.
- Mejorar la integración con el sistema de temas para opciones de estilo más avanzadas.
- Implementar un sistema de cache para mejorar el rendimiento de las páginas más visitadas.
