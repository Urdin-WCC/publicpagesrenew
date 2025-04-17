import React from 'react';
import Link from 'next/link';
import { translations } from '@/app/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Tipo para el widget
interface LatestProjectsWidgetProps {
  limit?: number;
  showFeaturedOnly?: boolean;
}

// Tipo para proyectos
type Project = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  publishedAt: string | null;
};

export default async function LatestProjectsWidget({
  limit = 5,
  showFeaturedOnly = false,
}: LatestProjectsWidgetProps) {
  // Construir URL con parámetros
  const queryParams = new URLSearchParams();
  queryParams.set('limit', limit.toString());
  queryParams.set('status', 'PUBLISHED'); // Always filter by PUBLISHED status in public views
  if (showFeaturedOnly) {
    queryParams.set('featured', 'true');
  }

  // Obtener proyectos recientes
  let projects: Project[] = [];
  try {
    // Usar URL absoluta para evitar errores de parseo
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/portfolio/latest?${queryParams.toString()}`, {
      next: { revalidate: 3600 }, // Revalidar cada hora
    });

    if (response.ok) {
      projects = await response.json();
    }
  } catch (error) {
    console.error('Error fetching latest projects:', error);
  }

  // Si no hay proyectos, no mostrar el widget
  if (projects.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{translations.public.recentProjects}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id} className="flex gap-3">
              {project.coverImage && (
                <Link href={`/portfolio/${project.slug}`} className="shrink-0">
                  <div className="w-16 h-16 rounded overflow-hidden">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              )}
              <div>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="font-medium hover:text-primary line-clamp-2"
                >
                  {project.title}
                </Link>
                {project.publishedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(project.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
