'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { translations } from '@/app/translations';
import PaginationControls from '@/components/public/PaginationControls';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Tipo para proyectos
type Project = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  featured: boolean;
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
};

// Tipo para la respuesta de la API
interface ApiResponse {
  projects: Project[];
  totalPages: number;
  currentPage: number;
  totalProjects: number;
  portfolioConfig: {
    layoutMode: 'grid' | 'list';
  };
}

export default function PortfolioListClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener parámetros de la URL
  const page = searchParams.get('page') || '1';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', page);
        queryParams.set('status', 'PUBLISHED'); // Always use published status in public views
        if (category) queryParams.set('categoryId', category);
        if (search) queryParams.set('search', search);
        
        const response = await fetch(`/api/portfolio?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar los proyectos');
        }
        
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, category, search]);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/portfolio/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Mostrar carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  // Mostrar mensaje si no hay proyectos
  if (!data || data.projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No hay proyectos disponibles</h2>
        <p className="text-gray-500">No se encontraron proyectos para mostrar.</p>
      </div>
    );
  }

  // Renderizar lista de proyectos
  return (
    <div>
      {/* Barra de búsqueda */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={translations.public.searchPortfolioPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <Button type="submit" className="absolute right-0 top-0">
            {translations.public.searchPortfolioButton}
          </Button>
        </div>
      </form>

      {/* Lista de proyectos */}
      <div className={data.portfolioConfig.layoutMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-6"
      }>
        {data.projects.map((project) => (
          <Card key={project.id} className={data.portfolioConfig.layoutMode === 'list' ? "flex flex-col md:flex-row" : ""}>
            {project.coverImage && (
              <div className={data.portfolioConfig.layoutMode === 'list' ? "md:w-1/3" : ""}>
                <Link href={`/portfolio/${project.slug}`}>
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                    {project.featured && (
                      <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                        Destacado
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            )}
            <div className={data.portfolioConfig.layoutMode === 'list' ? "md:w-2/3 p-4" : "p-4"}>
              <CardHeader className="p-0 mb-2">
                <Link href={`/portfolio/${project.slug}`}>
                  <CardTitle className="text-xl hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {project.excerpt && (
                  <p className="text-gray-600 mt-2 line-clamp-3">{project.excerpt}</p>
                )}
                {project.categories && project.categories.length > 0 && (
                  <div className="mt-3">
                    <Link
                      href={`/portfolio/category/${project.categories[0].slug}`}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      {project.categories[0].name}
                    </Link>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-0 mt-4">
                <Link href={`/portfolio/${project.slug}`}>
                  <Button variant="outline" size="sm">
                    Ver proyecto
                  </Button>
                </Link>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {data.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <PaginationControls
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            basePath="/portfolio"
          />
        </div>
      )}
    </div>
  );
}
