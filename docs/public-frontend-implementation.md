# Documentación de la Implementación de la Interfaz Pública

## Visión General

Este documento describe la implementación de la interfaz pública de la aplicación Neurowitch, que permite a los usuarios visualizar el contenido dinámico del sitio. La interfaz pública incluye páginas para:

- Página principal (Home)
- Blog (listado, detalle, categorías)
- Portfolio (listado, detalle, categorías)
- Páginas estáticas
- Búsqueda global

## Arquitectura

La implementación se basa en el patrón de rutas de Next.js App Router, utilizando principalmente Server Components para el renderizado del contenido dinámico y Client Components donde se necesita interactividad.

### Layout y Estructura Base

El punto de entrada principal es `PublicLayout` (`app/(public)/layout.tsx`), que configura:

1. **Estructura global**: Inyección de temas, cabecera, pie de página, y barra lateral
2. **Configuración dinámica**: Lectura de `GlobalConfig` para determinar apariencia y comportamiento
3. **Elementos condicionales**: Mostrar/ocultar componentes según configuración (banner de cookies, selector de tema, etc.)
4. **Registro de estadísticas**: Implementa el tracking de visitas a través de `PageViewTracker`

```tsx
// Ejemplo simplificado de PublicLayout
export default async function PublicLayout({ children }) {
  const config = await getGlobalConfig();
  
  // Obtener temas
  const { lightConfig, darkConfig } = await getThemeConfigsForRoute('/', config);
  
  // Verificar modo de mantenimiento
  if (config?.maintenanceMode) {
    return <MaintenanceMode />;
  }
  
  return (
    <>
      <style>{generateCssFromThemeConfigs(lightConfig, darkConfig)}</style>
      
      <Header config={config?.header} />
      
      <main>{children}</main>
      
      <Footer config={config?.footer} />
      
      {config?.cookieBannerText && (
        <CookieBanner text={config.cookieBannerText} />
      )}
      
      {config?.themeSwitcherConfig?.enabled && (
        <ThemeSwitcher config={config.themeSwitcherConfig} />
      )}
      
      <PageViewTracker />
    </>
  );
}
```

### Componentes Estructurales

#### Header (`components/public/Header.tsx`)
- Renderiza el menú de navegación obtenido de la base de datos
- Muestra logotipo e información del sitio
- Integra con la configuración del tema actual

#### Footer (`components/public/Footer.tsx`)
- Compuesto por widgets configurables
- Muestra HTML personalizado y widgets específicos
- Se adapta a la configuración dinámica

#### Sidebar (Opcional, `components/public/Sidebar.tsx`)
- Similar al Footer, compuesto por widgets configurables
- Visible/oculto según configuración de la página específica

### Widgets y Componentes Dinámicos

Los widgets son componentes modulares que pueden ser incorporados en diferentes partes de la interfaz (sidebar, footer). Cada widget tiene una función específica:

| Widget | Funcionalidad |
|--------|--------------|
| WidgetLatestPosts | Muestra las publicaciones más recientes del blog |
| WidgetCategories | Lista las categorías disponibles |
| WidgetSearch | Proporciona un formulario de búsqueda |
| WidgetTags | Muestra etiquetas relacionadas (sistema legacy) |
| SocialLinksWidget | Muestra enlaces a redes sociales |
| WidgetDeveloperHTML | Muestra HTML personalizado definido por el administrador |
| LatestProjectsWidget | Muestra los proyectos más recientes del portfolio |

Cada widget se carga dinamicamente mediante `next/dynamic` para optimizar el rendimiento.

### Páginas Implementadas

#### Página de Inicio (`app/(public)/page.tsx`)
- Muestra contenido de página estática con slug="inicio"
- Presenta proyectos destacados y posts recientes
- Implementa metadatos dinámicos para SEO

```tsx
export default async function HomePage() {
  const [homepage, featuredProjects, recentPosts] = await Promise.all([
    getHomePage(),
    getFeaturedProjects(3),
    getRecentPosts(3)
  ]);
  
  // Configuración de visualización basada en config de página
  const pageConfig = {
    showHeader: homepage.showHeader !== undefined ? Boolean(homepage.showHeader) : true,
    // ... otras configuraciones
  };
  
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: createPageConfigScript(pageConfig) }} />
      <div className="container mx-auto px-4 py-8">
        {/* Contenido principal */}
        <h1>{homepage.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: homepage.contentHtml || "" }} />
        
        {/* Proyectos destacados */}
        {featuredProjects.length > 0 && (
          <section>
            <h2>Proyectos destacados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ... renderizado de proyectos */}
            </div>
          </section>
        )}
        
        {/* Posts recientes */}
        {/* ... */}
      </div>
    </>
  );
}
```

#### Blog (`app/(public)/blog/...`)
- **Listado** (`page.tsx`): Paginación y filtrado de posts
- **Detalle** (`[slug]/page.tsx`): Visualización de post individual
- **Categoría** (`category/[slug]/page.tsx`): Filtrado por categoría

#### Portfolio (`app/(public)/portfolio/...`)
- **Listado** (`page.tsx`): Muestra proyectos en grid o lista
- **Detalle** (`[slug]/page.tsx`): Visualización de proyecto con galerías
- **Categoría** (`category/[slug]/page.tsx`): Filtrado por categoría

#### Búsqueda Global (`app/(public)/search/page.tsx`)
- Busca en todos los tipos de contenido (posts, proyectos, páginas)
- Utiliza SQL directo para búsquedas complejas
- Presenta resultados agrupados por tipo con interface unificada

#### Páginas Estáticas (`app/(public)/[slug]/page.tsx`)
- Renderiza contenido HTML almacenado en la base de datos
- Controla la visibilidad de elementos (header, footer, sidebar)
- Implementa metadatos dinámicos para SEO

### Funcionalidades Transversales

#### Estadísticas de Visitas (`components/public/PageViewTracker.tsx`)
- Componente cliente que registra cada visita de página
- Almacena información de URL, referrer, y datos de usuario
- Envía datos al endpoint `/api/stats/log-page-view`

#### Selector de Tema (`components/public/ThemeSwitcher.tsx`)
- Permite alternar entre tema claro y oscuro
- Guarda preferencias en localStorage
- Posicionable según configuración

#### Banner de Cookies (`components/public/CookieBanner.tsx`)
- Muestra mensaje de consentimiento configurado
- Enlaza a la política de privacidad
- Almacena aceptación en localStorage

### Manejo de Datos

La aplicación obtiene datos principalmente a través de:

1. **Prisma ORM**: Para la mayoría de consultas a la base de datos
2. **SQL directo**: Para consultas complejas o con relaciones avanzadas
3. **Caché y SSR**: Aprovechando las capacidades de Next.js para optimizar rendimiento

## Extendiendo la Implementación

Para añadir nuevos tipos de widgets o funcionalidades:

1. Crear un nuevo componente en `components/public/widgets/`
2. Registrarlo en `WidgetRenderer.tsx`
3. Actualizar el enum `WIDGET_TYPES` en `lib/constants.ts` si es necesario

Para añadir nuevos tipos de páginas:

1. Crear ruta en `app/(public)/`
2. Utilizar el layout público existente
3. Implementar el fetching de datos con Prisma o SQL directo

## Consideraciones de Seguridad

- Todo el HTML dinámico se renderiza con `dangerouslySetInnerHTML`, que aunque es necesario, representa un riesgo
- La seguridad se basa en que solo administradores pueden editar contenido
- Las consultas SQL utilizan parámetros preparados para evitar inyecciones

## Rendimiento

- Uso extensivo de Server Components para minimizar JavaScript enviado al cliente
- Carga dinámica de widgets para reducir el tamaño inicial de la página
- Suspense y Streaming para mejorar la experiencia percibida

## Próximos Pasos y Mejoras Posibles

1. Implementar cache más agresiva para contenido estático
2. Mejorar rendimiento de búsqueda con un índice dedicado
3. Añadir capacidades de previsualización para contenido no publicado
4. Integrar análisis de rendimiento con Web Vitals
