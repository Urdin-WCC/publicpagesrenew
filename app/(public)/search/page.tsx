import { Metadata } from "next";
import { getGlobalConfig } from "@/lib/config-server";
import { getThemeConfigsForRoute, generateCssFromThemeConfigs } from "@/lib/themeUtils";
import GlobalSearch from "@/components/public/GlobalSearch";
import SearchResults from "@/components/public/SearchResults";

// Make this page dynamic to ensure fresh data
export const dynamic = 'force-dynamic';

interface SearchParams {
  q?: string;
  page?: string;
}

interface SearchPageProps {
  searchParams: SearchParams;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const searchQuery = searchParams.q || '';
  
  // Obtener configuración global para SEO
  const config = await getGlobalConfig();
  
  // Si no hay configuración global, devolver metadatos básicos
  return {
    title: searchQuery ? `Resultados de búsqueda: ${searchQuery}` : 'Búsqueda',
    description: searchQuery 
      ? `Resultados de búsqueda para "${searchQuery}" en ${config?.siteName || 'nuestro sitio web'}.` 
      : 'Buscar contenido en nuestro sitio web.',
    robots: { index: false, follow: true }
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const currentPage = parseInt(searchParams.page || '1', 10);
  
  // Obtener configuración global para la página
  const globalConfig = await getGlobalConfig();
  
  // Verificar si hay una configuración específica para la página de búsqueda
  // Utilizamos la misma función que usa el layout pero con la ruta específica '/search'
  const { lightConfig, darkConfig } = globalConfig 
    ? await getThemeConfigsForRoute('/search', globalConfig) 
    : { lightConfig: null, darkConfig: null };
  
  // Configuración de página
  const pageConfig = {
    showHeader: true,
    showFooter: true,
    showSidebar: false,
    sidebarPosition: 'right',
    // Incluir información de los temas específicos si existen
    themeConfig: {
      light: lightConfig ? true : false,
      dark: darkConfig ? true : false
    }
  };
  
  // Almacenar la configuración para que el layout pueda acceder a ella
  const pageConfigScript = `
    <script>
      window.__PAGE_CONFIG__ = ${JSON.stringify(pageConfig)};
      // Si hay temas específicos, convertir los datos a CSS en el cliente
      if (${lightConfig || darkConfig}) {
        window.__PAGE_SPECIFIC_THEMES__ = {
          light: ${JSON.stringify(lightConfig)},
          dark: ${JSON.stringify(darkConfig)}
        };
      }
    </script>
  `;
  
  // No hay query, mostrar solo el formulario de búsqueda
  if (!query) {
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: pageConfigScript }} />
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8 text-center">Buscar en nuestro sitio</h1>
          <div className="max-w-2xl mx-auto">
            <GlobalSearch className="mb-8" />
            <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
              Introduce un término de búsqueda para encontrar contenido en nuestro sitio web.
            </p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: pageConfigScript }} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Resultados para &quot;{query}&quot;
        </h1>
        
        <div className="mb-8">
          <GlobalSearch className="max-w-2xl" />
        </div>
        
        {/* Los resultados de búsqueda se mostrarán usando el componente cliente SearchResults */}
        <SearchResults query={query} page={currentPage} />
      </div>
    </>
  );
}
