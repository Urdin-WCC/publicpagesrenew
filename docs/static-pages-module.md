# Módulo de Páginas Estáticas (Static_Pages_Module)

Este documento proporciona una descripción detallada del módulo de páginas estáticas implementado en el proyecto Neurowitch.

## 1. Introducción

El módulo de páginas estáticas permite a los administradores crear y gestionar contenido estático como "Acerca de", "Contacto", "Política de Privacidad", etc. También proporciona configuración para el banner de consentimiento de cookies y gestión del menú de navegación principal.

## 2. Estructura del Módulo

### 2.1. Modelo de Datos

#### Modelo `StaticPage` (Páginas Estáticas)

```prisma
model StaticPage {
  id            Int      @id @default(autoincrement())
  title         String
  slug          String   @unique
  contentHtml   String   @db.LongText
  menuOrder     Int      @default(0)
  includeInMenu Boolean  @default(false)
  isHomePage    Boolean  @default(false)
  isVisible     Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### Campos Añadidos al Modelo `GlobalConfig`

```prisma
model GlobalConfig {
  // ... otros campos existentes
  cookieBannerText          String?  @db.Text
  cookieBannerLinkPageId    Int?
}
```

### 2.2. Componentes Principales

#### Componentes de Administración

- **PageList (`components/admin/pages/PageList.tsx`)**: Lista de páginas estáticas con funciones de administración
- **PageForm (`components/admin/pages/PageForm.tsx`)**: Formulario para crear/editar páginas estáticas
- **PrivacySettingsForm (`components/admin/settings/PrivacySettingsForm.tsx`)**: Formulario para configurar el banner de cookies

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

- **Operaciones específicas**:
  - Toggle de visibilidad: `app/api/pages/[id]/toggle-visibility/route.ts`
  - Toggle de menú: `app/api/pages/[id]/toggle-menu/route.ts`
  - Establecer como página de inicio: `app/api/pages/[id]/set-home/route.ts`
  - Reordenar páginas: `app/api/pages/reorder/route.ts`
  - Obtener páginas para menú: `app/api/pages/menu/route.ts`

- **Configuración de privacidad**:
  - `app/api/settings/privacy/route.ts` (PUT)

## 3. Flujos de Trabajo Principales

### 3.1. Gestión de Páginas Estáticas

1. **Listar Páginas**: Los administradores pueden ver todas las páginas estáticas en `/admin/pages`.
2. **Crear Página**: Mediante el formulario en `/admin/pages/new`.
3. **Editar Página**: A través del formulario en `/admin/pages/edit/[id]`.
4. **Eliminar Página**: Botón de eliminación con confirmación vía diálogo modal.
5. **Cambiar Visibilidad**: Mediante toggle en la lista de páginas.
6. **Incluir/Excluir del Menú**: Mediante toggle en la lista de páginas.
7. **Establecer como Página de Inicio**: Botón en la lista de páginas.
8. **Reordenar Páginas**: Funcionalidad para establecer el orden en el menú.

### 3.2. Configuración de Privacidad

1. **Configurar Banner de Cookies**: Los administradores pueden establecer el texto del banner.
2. **Seleccionar Página de Política de Privacidad**: Para enlazar desde el banner de cookies.

### 3.3. Visualización Pública

1. **Página de Inicio**: Muestra la página marcada como `isHomePage: true`.
2. **Páginas Dinámicas**: Acceso a páginas mediante su `slug` en la URL.
3. **Banner de Cookies**: Se muestra en todas las páginas hasta que el usuario lo acepta.

## 4. Integración con Otros Módulos

### 4.1. Core Module

- Utiliza el sistema de autenticación para proteger rutas administrativas.
- Utiliza el componente `HtmlEditor` para editar el contenido de las páginas.
- Utiliza el cliente Prisma para interactuar con la base de datos.
- Utiliza la función `logAdminAction` para registrar acciones administrativas.

### 4.2. UI Framework Module

- Integración con el layout administrativo.
- Integración con el layout público y el sistema de navegación.

## 5. Seguridad

- **Protección por Rol**: Solo los usuarios con rol "ADMIN" o "MASTER" pueden acceder a la gestión de páginas.
- **Validación de Entrada**: Se validan los datos recibidos en los endpoints de API.
- **Prevención XSS**: Se utiliza `dangerouslySetInnerHTML` con precaución solo para contenido generado por el editor WYSIWYG.

## 6. Consideraciones de Rendimiento

- **SSG/SSR**: Las páginas públicas utilizan generación estática mediante `generateStaticParams`.
- **Peticiones Eficientes**: Se optimizan las consultas a la base de datos para incluir solo los campos necesarios.

## 7. Pruebas y Mantenimiento

Para probar este módulo, se recomienda:

1. **Prueba de Creación**: Crear varias páginas estáticas.
2. **Prueba de Navegación**: Verificar que se muestren correctamente en el sitio público.
3. **Prueba del Banner**: Configurar el banner de cookies y verificar su funcionamiento.
4. **Prueba de Menú**: Verificar que el menú se actualice correctamente al incluir/excluir páginas.

## 8. Consideraciones Técnicas Importantes

### 8.1. Acceso a Modelos en Prisma

El modelo `StaticPage` está definido en el esquema de Prisma, pero puede ocurrir que el cliente generado no tenga acceso directo a este modelo. Cuando esto ocurre, hay dos enfoques para solucionar el problema:

1. **Regenerar el Cliente Prisma**:
   ```bash
   npx prisma generate
   ```
   
2. **Usar Consultas SQL Directas** (enfoque implementado):
   En lugar de intentar usar `prisma.staticPage.findMany()` que puede no estar disponible, usamos:
   ```typescript
   const pages = await prisma.$queryRaw`
     SELECT id, title, slug, contentHtml, isVisible, includeInMenu 
     FROM StaticPage 
     ORDER BY menuOrder ASC
   `;
   ```

### 8.2. Manejo de Parámetros de Ruta en Next.js

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

### 8.3. Manejo de Errores de Autenticación

Es importante manejar posibles errores durante la autenticación:

```typescript
let session;
try {
  session = await auth();
} catch (authError) {
  console.error("Error en auth:", authError);
  return NextResponse.json({ error: "Error de autenticación" }, { status: 401 });
}
```

## 9. Contribuciones Futuras

Posibles mejoras para versiones futuras:

- Implementar drag-and-drop para reordenamiento visual de páginas.
- Añadir soporte para SEO meta tags específicos por página.
- Implementar historial de versiones/revisiones para páginas importantes.
- Añadir plantillas predefinidas para tipos comunes de páginas estáticas.
- Actualizar todos los componentes para usar SQL directo de manera consistente.
