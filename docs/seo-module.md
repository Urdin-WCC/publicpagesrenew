# Módulo SEO (Módulo 9)

## Descripción General
El Módulo SEO proporciona una gestión centralizada de la optimización para motores de búsqueda en Neurowitch. Permite configurar metadatos globales, generar archivos esenciales para SEO (robots.txt, sitemap.xml) y aplicar dinámicamente metaetiquetas en las páginas públicas utilizando la Metadata API de Next.js.

## Funcionalidades Principales

### 1. Configuración Global de SEO
- Panel de administración para configurar ajustes SEO globales
- Campos para título meta, descripción, palabras clave, imagen para redes sociales
- Configuración personalizada del robots.txt
- Integración con Google Analytics y Google Tag Manager

### 2. Generación de Archivos SEO
- Generación dinámica de robots.txt usando la Metadata API de Next.js
- Generación dinámica de sitemap.xml incluyendo todas las páginas públicas
- Función de regeneración manual del sitemap

### 3. Metadatos Dinámicos
- Metadatos base para todas las páginas públicas
- Metadatos específicos para cada página, post y proyecto
- Datos estructurados (JSON-LD) para mejorar la comprensión de los motores de búsqueda
- Etiquetas Open Graph y Twitter Cards para redes sociales

## Estructura Técnica del Módulo

### Base de Datos
El módulo utiliza los siguientes campos en el modelo `GlobalConfig`:

```prisma
model GlobalConfig {
  // Campos existentes...
  
  // Campos SEO
  globalMetaTitle           String?
  globalMetaDescription     String?  @db.Text
  globalKeywords            String?  @db.Text
  defaultSocialShareImage   String?
  robotsTxtContent          String?  @db.LongText
  googleAnalyticsId         String?
  googleTagManagerId        String?
}
```

### Panel de Administración
- **Ruta**: `app/(admin)/admin/seo/page.tsx`
- **Componentes**: Formulario con tabs para diferentes secciones (General, Meta Tags, Robots.txt, Analytics)
- **Protección**: Accesible solo para usuarios con rol ADMIN o superior
- **API**: Actualiza la configuración mediante llamadas a `PUT /api/seo/settings`

### Archivos SEO
1. **robots.txt**:
   - **Implementación**: `app/robots.ts` (utilizando la API de Metadatos de Next.js)
   - **Funcionalidad**: Genera el contenido basado en la configuración almacenada
   - **Procesamiento**: Asegura que se incluya el sitemap y reglas básicas

2. **sitemap.xml**:
   - **Implementación**: `app/sitemap.ts` (utilizando la API de Metadatos de Next.js)
   - **Contenido**: URLs de todas las páginas estáticas, posts, proyectos y categorías
   - **Robustez**: Utiliza consultas SQL directas para mayor compatibilidad

### Metadatos en Páginas Públicas
1. **Layout Público**:
   - **Archivo**: `app/(public)/layout.tsx`
   - **Funcionalidad**: Genera metadatos base para todas las páginas
   - **Scripts**: Incluye GA/GTM condicionalmente según configuración

2. **Páginas Específicas**:
   - **Ejemplo**: `app/(public)/[slug]/page.tsx`
   - **Implementación**: Función `generateMetadata` que extrae datos de la página específica
   - **Extracción**: Obtiene descripción automáticamente del contenido cuando es necesario

### Utilidades y Componentes
1. **Utilidades SEO** (`lib/seoUtils.ts`):
   - `generateBaseMetadata`: Genera metadatos base comunes
   - `generatePageMetadata`: Genera metadatos específicos para una página
   - `generateWebsiteJsonLd`: Genera datos estructurados para el sitio web
   - `generateArticleJsonLd`: Genera datos estructurados para artículos
   - `generateBreadcrumbsJsonLd`: Genera datos estructurados para migas de pan
   - `processRobotsTxt`: Procesa el contenido personalizado del robots.txt

2. **Componente JsonLd** (`components/core/JsonLdScript.tsx`):
   - Renderiza datos estructurados en formato JSON-LD
   - Mejora la comprensión del contenido por parte de los motores de búsqueda

### API Endpoints
1. **Configuración SEO**:
   - **Ruta**: `app/api/seo/settings/route.ts`
   - **Método**: PUT
   - **Protección**: Acceso restringido a ADMIN+
   - **Funcionalidad**: Actualiza campos SEO en GlobalConfig

2. **Regeneración de Sitemap**:
   - **Ruta**: `app/api/seo/sitemap/regenerate/route.ts`
   - **Método**: POST
   - **Protección**: Acceso restringido a ADMIN+
   - **Funcionalidad**: Fuerza la regeneración del sitemap.xml

## Consideraciones Técnicas

### Integración con Prisma
Debido a la experiencia previa con retos en Prisma, se implementó una estrategia híbrida:
- Uso de la API estándar de Prisma para consultas simples
- Uso de consultas SQL directas (`prisma.$queryRaw`) para operaciones más complejas
- Manejo de errores robusto para resolver posibles problemas

### Manejo de Archivos Grandes
Para evitar problemas con archivos grandes:
1. Se ha dividido la lógica en componentes y archivos más pequeños y manejables
2. Se han implementado verificaciones para asegurar que los archivos se completan correctamente
3. Se utilizan bloques try-catch para manejar errores potenciales

### Rendimiento
- Generación eficiente de sitemap.xml y robots.txt usando la API de Next.js
- Uso del patrón de Static Site Generation cuando es posible
- Validación y sanitización de datos para evitar problemas de rendimiento

## Uso del Módulo

### Para Administradores
1. Acceder al panel de administración en `/admin/seo`
2. Configurar los ajustes SEO globales (título, descripción, palabras clave, etc.)
3. Personalizar el contenido del robots.txt si es necesario
4. Añadir IDs de Google Analytics o Google Tag Manager si se desea
5. Usar el botón "Regenerar Sitemap" cuando se añada nuevo contenido

### Para Desarrolladores
1. Usar las utilidades en `lib/seoUtils.ts` para implementar metadatos en nuevas páginas
2. Seguir el patrón de `generateMetadata` para asegurar consistencia
3. Utilizar el componente `JsonLdScript` para añadir datos estructurados

## Interacción con Otros Módulos
- **Core Module**: Utiliza `prisma.ts`, `config-server.ts` y `stats.ts`
- **UI Framework**: Se integra con el layout del panel de administración
- **Módulos de Contenido**: Obtiene datos de páginas estáticas, posts y proyectos
