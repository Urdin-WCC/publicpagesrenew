import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGlobalConfig } from "@/lib/config-server";
import { generatePageMetadata, GlobalConfig } from "@/lib/seoUtils";
import { getThemeConfigsForRoute, generateCssFromThemeConfigs } from "@/lib/themeUtils";
import FixedHtmlRenderer from "@/components/public/FixedHtmlRenderer";

interface StaticPageParams {
  slug: string;
}

/**
 * Obtiene la página estática usando una consulta SQL directa
 */
async function getStaticPage(slug: string) {
  try {
    console.log(`Buscando página con slug: ${slug}`);
    
    // Buscar directamente la página con el slug proporcionado
    const result = await prisma.$queryRaw`
      SELECT 
        id, 
        title, 
        slug, 
        contentHtml, 
        metaTitle, 
        metaDescription, 
        metaKeywords,
        showHeader,
        showFooter,
        showSidebar,
        sidebarPosition
      FROM StaticPage
      WHERE slug = ${slug}
      LIMIT 1
    `;
    
    if (Array.isArray(result) && result.length > 0) {
      const page = result[0];
      console.log(`Página encontrada: ${page.title}`);
      return page;
    }
    
    console.log(`No se encontró página con slug '${slug}'`);
    return null;
  } catch (error) {
    console.error(`Error al obtener la página '${slug}':`, error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: StaticPageParams }): Promise<Metadata> {
  // Asegúrate de que params sea esperado antes de usarlo
  const slug = String(params?.slug || '');
  
  // Obtener la página estática
  const page = await getStaticPage(slug);
  
  if (!page) {
    return {
      title: "Página no encontrada",
      description: "La página que estás buscando no existe",
    };
  }
  
  // Obtener configuración global para SEO predeterminada
  const config = await getGlobalConfig() as any as GlobalConfig;
  if (!config) {
    return {
      title: page.metaTitle || page.title,
      description: page.metaDescription,
    };
  }
  
  // Crear un extracto del contenido HTML si no hay descripción
  let description = page.metaDescription;
  if (!description && page.contentHtml) {
    // Eliminar etiquetas HTML y obtener primeros 160 caracteres
    description = page.contentHtml
      .replace(/<\/?[^>]+(>|$)/g, "") // Eliminar tags HTML
      .substring(0, 160) // Cortar a 160 caracteres
      .trim();
      
    if (description.length === 160) {
      description += "..."; // Agregar puntos suspensivos si se cortó
    }
  }
  
  // Usar función de utilidad para generar metadatos
  return generatePageMetadata(config, {
    title: page.metaTitle || page.title,
    description: description || config?.globalMetaDescription || undefined,
    url: `/${page.slug}`,
    type: "article",
  });
}

export default async function StaticPage({ params }: { params: StaticPageParams }) {
  // Asegúrate de que params sea esperado antes de usarlo
  const slug = String(params?.slug || '');
  
  // Obtener la página estática
  const page = await getStaticPage(slug);
  
  // Si no existe la página, mostrar 404
  if (!page) {
    notFound();
  }

  // Obtener configuración global para temas
  const globalConfig = await getGlobalConfig();
  
  // Obtener temas específicos para esta ruta
  const { lightConfig, darkConfig } = await getThemeConfigsForRoute(`/page/${slug}`, globalConfig);
  
  // Generar CSS para los temas específicos de esta página usando un selector específico
  // Usamos una clase que identifique unívocamente esta página por su slug
  const pageThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, `.page-${slug}`);

  // Configuración de visualización de página
  const pageConfig = {
    showHeader: page.showHeader !== undefined ? Boolean(page.showHeader) : true,
    showFooter: page.showFooter !== undefined ? Boolean(page.showFooter) : true,
    showSidebar: page.showSidebar !== undefined ? Boolean(page.showSidebar) : false,
    sidebarPosition: page.sidebarPosition || 'right'
  };
  
  // Almacenar la configuración para que el layout pueda acceder a ella
  const pageConfigScript = `
    <script>
      window.__PAGE_CONFIG__ = ${JSON.stringify(pageConfig)};
    </script>
  `;
  
  return (
    <>
      {/* Insertar script con configuración de página */}
      <div dangerouslySetInnerHTML={{ __html: pageConfigScript }} />
      
      {/* Inyectar CSS para los temas específicos de esta página */}
      {pageThemeCSS && (
        <style id={`page-${slug}-theme-css`} dangerouslySetInnerHTML={{ __html: pageThemeCSS }} />
      )}
      
      <div 
        className={`page-${slug} container mx-auto px-4 py-8`}
        style={{
          backgroundColor: 'var(--background-value, white)',
          color: 'var(--typography-paragraph-color, inherit)'
        }}
      >
        {/* Título de la página (opcional, depende del diseño) */}
        <h1 
          className="text-3xl font-bold mb-6"
          style={{
            fontFamily: 'var(--typography-heading-fontFamily, inherit)',
            color: 'var(--typography-heading-color, inherit)',
            fontWeight: 'var(--typography-heading-fontWeight, 600)',
            fontSize: 'var(--typography-heading-fontSize, 1.875rem)'
          }}
        >{page.title}</h1>
        
        {/* Contenido principal de la página */}
        <div 
          className="mb-12"
          style={{
            fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
            fontSize: 'var(--typography-paragraph-fontSize, inherit)'
          }}
        >
          {/* Usar el componente cliente FixedHtmlRenderer para renderizar HTML con corrección de doble codificación */}
          <FixedHtmlRenderer 
            content={page.contentHtml || ""} 
            className="prose max-w-none"
          />
        </div>
      </div>
    </>
  );
}
