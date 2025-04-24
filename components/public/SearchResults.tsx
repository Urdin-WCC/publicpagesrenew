'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  id: number;
  title: string;
  url: string;
  excerpt?: string;
  coverImage?: string;
  type: 'post' | 'project' | 'page';
  publishedAt?: string;
}

interface SearchResultsProps {
  query: string;
  page: number;
}

export default function SearchResults({ query, page }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Resultados por página
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  // Cargar resultados cuando cambia la consulta o la página
  // Effect to apply specific themes if available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__PAGE_SPECIFIC_THEMES__) {
      const themes = window.__PAGE_SPECIFIC_THEMES__;
      const isDark = document.documentElement.classList.contains('dark');
      const theme = isDark && themes.dark ? themes.dark : (!isDark && themes.light ? themes.light : null);
      
      if (theme) {
        const customStyle = document.createElement('style');
        customStyle.id = 'search-results-theme';
        customStyle.innerHTML = `.search-results-container { 
          /* Apply theme specific CSS here */
          background-color: ${theme.background || 'inherit'};
          color: ${theme.foreground || 'inherit'};
        }`;
        document.head.appendChild(customStyle);
        
        return () => {
          const styleElement = document.getElementById('search-results-theme');
          if (styleElement) document.head.removeChild(styleElement);
        };
      }
    }
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError('');
      
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error('Fallo al cargar resultados');
        }
        
        const data = await response.json();
        
        setResults(data.results || []);
        setTotalResults(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / limit));
      } catch (err) {
        console.error('Error buscando:', err);
        setError('Ha ocurrido un error al buscar. Por favor, inténtalo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [query, page]);
  
  // Cambiar de página
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };
  
  // Obtener etiqueta para el tipo de resultado
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return 'Artículo';
      case 'project':
        return 'Proyecto';
      case 'page':
        return 'Página';
      default:
        return type;
    }
  };
  
  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Error
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center my-8">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  // Sin resultados
  if (results.length === 0) {
    return (
      <div className="text-center my-12">
        <p className="text-xl mb-4">No se encontraron resultados para &quot;{query}&quot;</p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Intenta con otros términos o revisa la ortografía.
        </p>
      </div>
    );
  }
  
  return (
    <div className="search-results-container">
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'} encontrado{totalResults !== 1 ? 's' : ''}
      </p>
      
      <div className="space-y-8">
        {results.map((result) => (
          <div key={`${result.type}-${result.id}`} className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            {/* Imagen (si existe) */}
            {result.coverImage && (
              <div className="w-full md:w-1/4 md:flex-shrink-0">
                <div className="relative h-48 md:h-full w-full rounded-md overflow-hidden">
                  <img
                    src={result.coverImage}
                    alt={result.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}
            
            {/* Contenido del resultado */}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {getTypeLabel(result.type)}
                </span>
                {result.publishedAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {formatDate(result.publishedAt)}
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-semibold mb-2">
                <Link href={result.url} className="hover:text-primary transition-colors">
                  {result.title}
                </Link>
              </h2>
              
              {result.excerpt && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {result.excerpt}
                </p>
              )}
              
              <Link 
                href={result.url}
                className="text-primary hover:text-primary-dark hover:underline inline-flex items-center transition-colors"
              >
                <span>Ver {result.type === 'post' ? 'artículo' : (result.type === 'project' ? 'proyecto' : 'página')}</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-12">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            &larr; Anterior
          </button>
          
          <div className="text-sm">
            Página {page} de {totalPages}
          </div>
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Página siguiente"
          >
            Siguiente &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
