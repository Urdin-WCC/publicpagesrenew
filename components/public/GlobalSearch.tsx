'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface SearchResult {
  id: number;
  title: string;
  url: string;
  excerpt?: string;
  coverImage?: string;
  type: 'post' | 'project' | 'page';
  publishedAt?: string;
}

export interface GlobalSearchProps {
  maxResults?: number;
  placeholder?: string;
  showIcon?: boolean;
  className?: string;
}

export default function GlobalSearch({ 
  maxResults = 10, 
  placeholder = 'Buscar en el sitio...',
  showIcon = true,
  className = ''
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Reset search when navigating to a new page
  useEffect(() => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  }, [pathname]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search function
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${maxResults}`);
        const data = await response.json();
        
        if (data.results) {
          setResults(data.results);
          setTotalResults(data.total);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, maxResults]);

  // Handle form submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  // Handle result click
  const handleResultClick = () => {
    setShowResults(false);
    setQuery('');
  };

  // Get type label for the result
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return 'Blog';
      case 'project':
        return 'Portfolio';
      case 'page':
        return 'Página';
      default:
        return type;
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => query.trim() && setShowResults(true)}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 
                     focus:ring-primary focus:border-transparent transition-all
                     dark:bg-gray-800 dark:text-white dark:border-gray-700"
            aria-label="Buscar en todo el sitio"
          />
          {showIcon && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {isLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </span>
          )}
        </div>
        <button 
          type="submit" 
          className="ml-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
        >
          Buscar
        </button>
      </form>

      {showResults && query.trim() && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {results.length > 0 ? (
            <div>
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <Link 
                    key={`${result.type}-${result.id}`}
                    href={result.url} 
                    onClick={handleResultClick}
                    className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{result.title}</h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full ml-2">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      {result.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{result.excerpt}</p>
                      )}
                      {result.publishedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(result.publishedAt)}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {totalResults > maxResults && (
                <div className="px-4 py-2 text-center border-t border-gray-100 dark:border-gray-700">
                  <Link 
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={handleResultClick}
                    className="text-sm text-primary hover:underline"
                  >
                    Ver todos los {totalResults} resultados
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {isLoading ? 'Buscando...' : 'No se encontraron resultados'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
