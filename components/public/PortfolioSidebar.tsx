import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getGlobalConfig } from '@/lib/config-server';
import { translations } from '@/app/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WidgetRenderer from '@/components/public/WidgetRenderer';

export default async function PortfolioSidebar() {
  // Obtener categorías
  let categories = [];
  let recentProjects = [];

  try {
    // Verificar si el modelo ProjectCategory existe
    if (prisma.projectCategory) {
      categories = await prisma.projectCategory.findMany({
        include: {
          _count: {
            select: {
              projects: {
                where: {
                  status: 'PUBLISHED',
                  deleted: false,
                },
              },
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    }

    // Verificar si el modelo Project existe
    if (prisma.project) {
      // Obtener proyectos recientes
      recentProjects = await prisma.project.findMany({
        where: {
          status: 'PUBLISHED',
          deleted: false,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
    }
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    // En caso de error, usar arrays vacíos
    categories = [];
    recentProjects = [];
  }

  // Obtener configuración global
  const globalConfig = await getGlobalConfig();
  const sidebarConfig = globalConfig?.sidebar || { widgets: [] };

  return (
    <div className="space-y-6">
      {/* Categorías */}
      {categories.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{translations.public.categories}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/portfolio/category/${category.slug}`}
                    className="text-gray-700 hover:text-primary flex justify-between items-center py-1"
                  >
                    <span>{category.name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {category._count.projects}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Proyectos recientes */}
      {recentProjects.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{translations.public.recentProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentProjects.map((project) => (
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
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Widgets personalizados */}
      {sidebarConfig.widgets.map((widget, index) => (
        <WidgetRenderer key={index} widget={widget} />
      ))}
    </div>
  );
}
