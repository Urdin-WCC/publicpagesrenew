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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TagIcon, PlusCircle, Edit, Trash2, Search, Eye, ArchiveIcon, SendToBack, Star } from 'lucide-react';
import { toast } from 'sonner';
import PaginationControls from '@/components/public/PaginationControls';
import AdminPageContainer from "@/components/admin/AdminPageContainer";

// Define tipos para el post
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  coverImage?: string | null;
  createdAt: string;
  featured: boolean;
  author?: { name: string | null } | null;
  authorDisplayName?: string | null;
  categories?: { id: string; name: string }[];
}

// Tipo para la respuesta de la API
interface ApiResponse {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  totalPosts: number;
}

// Función para obtener datos de la API
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlogPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Construir URL con parámetros de búsqueda y filtro
  const apiUrl = `/api/blog?page=${page}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}${statusFilter && statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}`;

  // Obtener datos con SWR
  const { data, error, mutate } = useSWR<ApiResponse>(apiUrl, fetcher);

  // Verificar permisos
  const canCreate = hasPermission(session?.user?.role, 'create_post');
  const canEdit = hasPermission(session?.user?.role, 'edit_post');
  const canDelete = hasPermission(session?.user?.role, 'delete_post');

  // Manejar acciones de post (publicar, archivar, etc.)
  const handlePostAction = async (id: string, action: string, title: string) => {
    try {
      const response = await fetch(`/api/blog/${id}/actions`, {
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
            successMessage = 'Post publicado correctamente';
            break;
          case 'archive':
            successMessage = 'Post archivado correctamente';
            break;
          case 'unarchive':
            successMessage = 'Post desarchivado correctamente';
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
      toast.error('Error al realizar la acción en el post');
    }
  };

  // Manejar eliminación de post
  const handleDelete = async (id: string, title: string) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md mx-auto">
        <h3 className="font-medium text-lg mb-2">Confirmar eliminación</h3>
        <p className="mb-4">¿Estás seguro de que deseas eliminar el post "{title}"?</p>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toast.dismiss(t)} 
            className="px-3"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              toast.dismiss(t);
              try {
                const response = await fetch(`/api/blog/${id}`, {
                  method: 'DELETE',
                });

                if (response.ok) {
                  toast.success('Post eliminado correctamente');
                  mutate(); // Recargar datos
                } else {
                  const data = await response.json();
                  toast.error(data.message || 'Error al eliminar el post');
                }
              } catch (error) {
                console.error('Error deleting post:', error);
                toast.error('Error al eliminar el post');
              }
            }}
            className="px-3"
          >
            Eliminar
          </Button>
        </div>
      </div>
    ), {
      duration: 10000, // Duración más larga para dar tiempo a decidir
    });
  };

  // Renderizar estado del post con color
  const renderStatus = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-500">{translations.admin.blogList.statusPublished || 'Publicado'}</Badge>;
      case 'DRAFT':
        return <Badge className="bg-yellow-500">{translations.admin.blogList.statusDraft || 'Borrador'}</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-gray-500">{translations.admin.blogList.statusArchived || 'Archivado'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminPageContainer>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{translations.admin.blogList.title || 'Gestión del Blog'}</CardTitle>
          {canCreate && (
            <Button onClick={() => router.push('/admin/blog/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {translations.admin.blogList.newPostButton || 'Nuevo post'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 md:flex md:justify-between md:items-center gap-2">
              {/* Búsqueda */}
              <form onSubmit={(e) => { e.preventDefault(); }} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={translations.admin.blogList.searchPlaceholder || "Buscar posts..."}
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
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={translations.admin.blogList.statusFilterPlaceholder || "Filtrar por estado"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{translations.admin.blogList.statusAll || "Todos"}</SelectItem>
                <SelectItem value="PUBLISHED">{translations.admin.blogList.statusPublished || "Publicados"}</SelectItem>
                <SelectItem value="DRAFT">{translations.admin.blogList.statusDraft || "Borradores"}</SelectItem>
                <SelectItem value="ARCHIVED">{translations.admin.blogList.statusArchived || "Archivados"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de Posts */}
          {!data ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">{translations.common.loading}</p>
            </div>
          ) : !data.posts || data.posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {translations.admin.blogList.noPostsFound || "No se encontraron posts"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Categorías</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {post.coverImage && (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <div>{post.title}</div>
                            <div className="text-xs text-gray-500">
                              {post.authorDisplayName || post.author?.name || translations.common.unknown || 'Desconocido'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderStatus(post.status)}</TableCell>
                      <TableCell>
                        {Array.isArray(post.categories) && post.categories.length > 0 ? (
                          <Badge variant="outline">
                            {post.categories[0].name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-500">Sin categoría</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Ver post */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                            title="Ver post"
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          
                          {/* Editar post */}
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                              title="Editar post"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Publicar (solo para borradores) */}
                          {canEdit && post.status === 'DRAFT' && hasPermission(session?.user?.role, 'publish_post') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-500"
                              onClick={() => handlePostAction(post.id, 'publish', post.title)}
                              title="Publicar post"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Archivar (para posts publicados o borradores) */}
                          {canEdit && (post.status === 'PUBLISHED' || post.status === 'DRAFT') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500"
                              onClick={() => handlePostAction(post.id, 'archive', post.title)}
                              title="Archivar post"
                            >
                              <ArchiveIcon className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Desarchivar (solo para archivados) */}
                          {canEdit && post.status === 'ARCHIVED' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-500"
                              onClick={() => handlePostAction(post.id, 'unarchive', post.title)}
                              title="Desarchivar post"
                            >
                              <SendToBack className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Destacar/No destacar */}
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`${post.featured ? 'text-yellow-500' : 'text-gray-400'}`}
                              onClick={() => handlePostAction(post.id, 'toggleFeatured', post.title)}
                              title={post.featured ? "Quitar destacado" : "Destacar post"}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Eliminar post */}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(post.id, post.title)}
                              title="Eliminar post"
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
          )}
          
          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <PaginationControls
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                basePath="/admin/blog"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageContainer>
  );
}
