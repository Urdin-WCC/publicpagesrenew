'use client';

import React, { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation'; // Hooks de navegación
import { Post, Category, Tag, User, PostStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { translations } from '@/app/translations';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { hasPermission } from '@/lib/auth-utils';
import PaginationControls from '@/components/public/PaginationControls'; // Reutilizar paginación
import { Badge } from '@/components/ui/badge'; // Para mostrar estado

// Tipo extendido para los posts en la lista
type PostListItem = Post & {
  author: { name: string | null } | null;
  categories: Pick<Category, 'id' | 'name'>[];
  tags: Pick<Tag, 'id' | 'name'>[];
};

// Tipo para la respuesta de la API
interface ApiResponse {
  posts: PostListItem[];
  totalPages: number;
  currentPage: number;
  totalPosts: number;
}

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || translations.admin.blogList.fetchError);
    }
    return res.json();
});

const AdminBlogListPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<PostStatus | ''>(searchParams.get('status') as PostStatus | '' || '');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10; // O configurable

  // Construir URL para SWR basada en filtros y paginación
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('limit', limit.toString());
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter) params.set('status', statusFilter);
    return `/api/blog?${params.toString()}`;
  }, [currentPage, searchTerm, statusFilter, limit]);

  const { data: apiResponse, error, isLoading, mutate } = useSWR<ApiResponse>(apiUrl, fetcher, { keepPreviousData: true });

  // Permisos
  const canCreate = hasPermission(session?.user?.role, 'create_post');
  const canEditAny = hasPermission(session?.user?.role, 'edit_any_post'); // Permiso para editar cualquier post
  const canDeleteAny = hasPermission(session?.user?.role, 'delete_any_post'); // Permiso para eliminar cualquier post

  // Función para actualizar los parámetros de búsqueda en la URL
  const updateSearchParams = useCallback((newParams: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
            current.set(key, value);
        } else {
            current.delete(key); // Eliminar si el valor está vacío
        }
    });
     // Resetear a página 1 cuando cambian los filtros/búsqueda
     if (newParams.search !== undefined || newParams.status !== undefined) {
        current.set('page', '1');
     }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  }, [searchParams, router, pathname]);


  // Manejadores para filtros y búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      updateSearchParams({ search: searchTerm });
  };

  const handleStatusChange = (value: string) => {
    const status = value === 'all' ? '' : (value as PostStatus);
    setStatusFilter(status);
    updateSearchParams({ status });
  };

  // Eliminar post
  const handleDelete = (post: PostListItem) => {
    // Verificar permiso específico para este post
    const canDeleteThis = canDeleteAny || (hasPermission(session?.user?.role, 'delete_post') && session?.user?.id === post.authorId);
    if (!canDeleteThis) {
        toast.error(translations.auth.unauthorized);
        return;
    }

    const promise = fetch(`/api/blog/${post.id}`, { method: 'DELETE' })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || translations.admin.blogList.deleteError);
        }
        mutate(); // Refrescar lista
        return { name: post.title };
      });

    toast.promise(promise, {
      loading: `Eliminando post "${post.title}"...`,
      success: (data) => `Post "${data.name}" eliminado correctamente.`,
      error: (err) => err.message || translations.admin.blogList.deleteError,
    });
  };

  // Helper para mostrar el badge de estado
  const StatusBadge = ({ status }: { status: PostStatus }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let text = translations.common.unknown;
    switch (status) {
        case PostStatus.PUBLISHED:
            variant = "default"; // Verde o color primario
            text = translations.admin.blogList.statusPublished;
            break;
        case PostStatus.DRAFT:
            variant = "outline"; // Gris
            text = translations.admin.blogList.statusDraft;
            break;
        case PostStatus.ARCHIVED:
            variant = "destructive"; // Rojo o naranja
            text = translations.admin.blogList.statusArchived;
            break;
    }
     // Ajustar estilos si se usa Shadcn/ui Badge
     const colorClasses = {
        default: "bg-green-100 text-green-800 border-green-200",
        outline: "bg-gray-100 text-gray-800 border-gray-200",
        destructive: "bg-red-100 text-red-800 border-red-200",
        secondary: "bg-yellow-100 text-yellow-800 border-yellow-200" // Para estados desconocidos o pendientes
     }

    return <Badge variant={variant} className={colorClasses[variant]}>{text}</Badge>;
  };


  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{translations.admin.blogList.title}</h1>
        {canCreate && (
          <Link href="/admin/blog/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {translations.admin.blogList.newPostButton}
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
         <form onSubmit={handleSearchSubmit} className="flex-grow flex">
            <Input
                type="search"
                placeholder={translations.admin.blogList.searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                className="rounded-r-none"
            />
            <Button type="submit" variant="outline" className="rounded-l-none border-l-0">
                <Search className="h-4 w-4" />
            </Button>
         </form>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={translations.admin.blogList.statusFilterPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{translations.admin.blogList.statusAll}</SelectItem>
            <SelectItem value={PostStatus.DRAFT}>{translations.admin.blogList.statusDraft}</SelectItem>
            <SelectItem value={PostStatus.PUBLISHED}>{translations.admin.blogList.statusPublished}</SelectItem>
            <SelectItem value={PostStatus.ARCHIVED}>{translations.admin.blogList.statusArchived}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla de Posts */}
      {isLoading && <p>{translations.common.loading}...</p>}
      {error && <p className="text-red-500">{error.message}</p>}
      {!isLoading && !error && apiResponse && (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{translations.admin.blogList.tableTitle}</TableHead>
                  <TableHead>{translations.admin.blogList.tableAuthor}</TableHead>
                  <TableHead>{translations.admin.blogList.tableStatus}</TableHead>
                  <TableHead>{translations.admin.blogList.tableCategories}</TableHead>
                  <TableHead>{translations.admin.blogList.tableTags}</TableHead>
                  <TableHead>{translations.admin.blogList.tableDate}</TableHead>
                  <TableHead className="text-right">{translations.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiResponse.posts.length > 0 ? (
                  apiResponse.posts.map((post) => {
                    const canEditThis = canEditAny || (hasPermission(session?.user?.role, 'edit_post') && session?.user?.id === post.authorId);
                    const canDeleteThis = canDeleteAny || (hasPermission(session?.user?.role, 'delete_post') && session?.user?.id === post.authorId);
                    return (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.author?.name || 'N/A'}</TableCell>
                        <TableCell><StatusBadge status={post.status} /></TableCell>
                        <TableCell className="text-xs">
                          {post.categories.map(c => c.name).join(', ')}
                        </TableCell>
                        <TableCell className="text-xs">
                           {post.tags.map(t => t.name).join(', ')}
                        </TableCell>
                        <TableCell>
                          {new Date(post.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {canEditThis && (
                            <Link href={`/admin/blog/edit/${post.id}`} passHref>
                              <Button variant="outline" size="icon" title={translations.admin.blogList.editAction}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {canDeleteThis && (
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(post)} title={translations.admin.blogList.deleteAction}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      {translations.admin.blogList.noPostsFound}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Paginación */}
          {apiResponse.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <PaginationControls
                currentPage={apiResponse.currentPage}
                totalPages={apiResponse.totalPages}
                basePath={pathname} // Usa el pathname actual para mantener filtros
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminBlogListPage;