'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Search, ArchiveIcon, SendToBack, Star, Eye, Tag as TagIcon } from 'lucide-react';
import { toast } from 'sonner';
import PaginationControls from '@/components/public/PaginationControls';
// Define the types directly since the import might not work with the custom Prisma client path
type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type ProjectDisplayType = 'SINGLE' | 'GALLERY' | 'SLIDER' | 'GRID';

// Tipo extendido para los proyectos en la lista
type ProjectListItem = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  displayType: ProjectDisplayType;
  coverImage: string | null;
  publishedAt: string | null;
  featured: boolean;
  authorDisplayName: string | null;
  author: { name: string | null } | null;
  categories: { id: string; name: string }[];
  createdAt: string;
};

// Tipo para la respuesta de la API
interface ApiResponse {
  projects: ProjectListItem[];
  totalPages: number;
  currentPage: number;
  totalProjects: number;
}

// Función para obtener datos de la API
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PortfolioPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Construir URL con parámetros de búsqueda y filtro
  const apiUrl = `/api/portfolio?page=${page}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}${statusFilter && statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}`;

  // Obtener datos con SWR
  const { data, error, mutate } = useSWR<ApiResponse>(apiUrl, fetcher);

  // Verificar permisos
  const canCreate = hasPermission(session?.user?.role, 'create_post'); // Reutilizamos el permiso de posts
  const canEdit = hasPermission(session?.user?.role, 'edit_post');
  const canDelete = hasPermission(session?.user?.role, 'delete_post');

  // Manejar acciones de proyecto (publicar, archivar, etc.)
  const handleProjectAction = async (id: string, action: string, title: string) => {
    try {
      const response = await fetch(`/api/portfolio/${id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        let successMessage = '';
        
        switch (action) {
          case 'publish':
            successMessage = 'Proyecto publicado correctamente';
            break;
          case 'archive':
            successMessage = 'Proyecto archivado correctamente';
            break;
          case 'unarchive':
            successMessage = 'Proyecto desarchivado correctamente';
            break;
          case 'toggleFeatured':
            successMessage = 'Estado destacado actualizado correctamente';
            break;
        }
        
        toast.success(successMessage);
        mutate(); // Recargar datos
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error al realizar la acción');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Error al realizar la acción en el proyecto');
    }
  };

  // Manejar eliminación de proyecto
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`${translations.admin.portfolioList.deleteConfirm} "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(translations.admin.portfolioList.deleteSuccess);
        mutate(); // Recargar datos
      } else {
        const data = await response.json();
        toast.error(data.message || translations.admin.portfolioList.deleteError);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(translations.admin.portfolioList.deleteError);
    }
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Renderizar estado del proyecto con color
  const renderStatus = (status: ProjectStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-500">{translations.admin.portfolioList.statusPublished}</Badge>;
      case 'DRAFT':
        return <Badge className="bg-yellow-500">{translations.admin.portfolioList.statusDraft}</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-gray-500">{translations.admin.portfolioList.statusArchived}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Renderizar tipo de visualización
  const renderDisplayType = (displayType: ProjectDisplayType) => {
    switch (displayType) {
      case 'SINGLE':
        return 'Individual';
      case 'GALLERY':
        return 'Galería';
      case 'SLIDER':
        return 'Slider';
      case 'GRID':
        return 'Cuadrícula';
      default:
        return displayType;
    }
  };

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Resetear página al buscar
  };

  // Manejar cambio de filtro de estado
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Resetear página al filtrar
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {translations.admin.portfolioList.fetchError}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{translations.admin.portfolioList.title}</CardTitle>
          {canCreate && (
            <Button onClick={() => router.push('/admin/portfolio/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {translations.admin.portfolioList.newProjectButton}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 md:flex md:justify-between md:items-center gap-2">
              {/* Búsqueda */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={translations.admin.portfolioList.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </form>
              
              {/* Enlace a Categorías */}
              <Link href="/admin/blog/taxonomies" className="hidden md:flex items-center text-sm text-primary hover:underline mb-2 md:mb-0">
                <TagIcon className="w-4 h-4 mr-1" />
                Gestionar categorías
              </Link>
            </div>

            {/* Filtro de estado */}
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={translations.admin.portfolioList.statusFilterPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{translations.admin.portfolioList.statusAll}</SelectItem>
                <SelectItem value="PUBLISHED">{translations.admin.portfolioList.statusPublished}</SelectItem>
                <SelectItem value="DRAFT">{translations.admin.portfolioList.statusDraft}</SelectItem>
                <SelectItem value="ARCHIVED">{translations.admin.portfolioList.statusArchived}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de proyectos */}
          {!data ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">{translations.common.loading}</p>
            </div>
          ) : data.projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {translations.admin.portfolioList.noProjectsFound}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{translations.admin.portfolioList.tableTitle}</TableHead>
                      <TableHead>{translations.admin.portfolioList.tableStatus}</TableHead>
                      <TableHead>{translations.admin.portfolioList.tableDisplayType}</TableHead>
                      <TableHead>{translations.admin.portfolioList.tableCategories}</TableHead>
                      <TableHead>{translations.admin.portfolioList.tableDate}</TableHead>
                      <TableHead>{translations.admin.portfolioList.tableActions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {project.coverImage && (
                              <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <div>{project.title}</div>
                              <div className="text-xs text-gray-500">
                                {project.author?.name || project.authorDisplayName || translations.common.unknown}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderStatus(project.status)}</TableCell>
                        <TableCell>{renderDisplayType(project.displayType)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {project.categories.map((category) => (
                              <Badge key={category.id} variant="outline">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(project.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Editar proyecto */}
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/admin/portfolio/edit/${project.id}`)}
                                title={translations.admin.portfolioList.editAction}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Publicar (solo para borradores) */}
                            {canEdit && project.status === 'DRAFT' && hasPermission(session?.user?.role, 'publish_post') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-500"
                                onClick={() => handleProjectAction(project.id, 'publish', project.title)}
                                title="Publicar proyecto"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Archivar (para proyectos publicados o borradores) */}
                            {canEdit && (project.status === 'PUBLISHED' || project.status === 'DRAFT') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500"
                                onClick={() => handleProjectAction(project.id, 'archive', project.title)}
                                title="Archivar proyecto"
                              >
                                <ArchiveIcon className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Desarchivar (solo para archivados) */}
                            {canEdit && project.status === 'ARCHIVED' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-500"
                                onClick={() => handleProjectAction(project.id, 'unarchive', project.title)}
                                title="Desarchivar proyecto"
                              >
                                <SendToBack className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Destacar/No destacar */}
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`${project.featured ? 'text-yellow-500' : 'text-gray-400'}`}
                                onClick={() => handleProjectAction(project.id, 'toggleFeatured', project.title)}
                                title={project.featured ? "Quitar destacado" : "Destacar proyecto"}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Eliminar proyecto */}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(project.id, project.title)}
                                title={translations.admin.portfolioList.deleteAction}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {data.totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <PaginationControls
                    currentPage={data.currentPage}
                    totalPages={data.totalPages}
                    basePath="/admin/portfolio"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
