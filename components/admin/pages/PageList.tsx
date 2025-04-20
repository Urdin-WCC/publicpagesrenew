"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { PenIcon, TrashIcon, HomeIcon } from "lucide-react";

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Type for static page
type StaticPage = {
  id: number;
  title: string;
  slug: string;
  menuOrder: number;
  includeInMenu: boolean;
  isHomePage: boolean;
  isVisible: boolean;
};

export default function PageList() {
  const router = useRouter();
  const [pageToDelete, setPageToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch pages data
  const { data, error, isLoading, mutate } = useSWR<StaticPage[]>(
    "/api/pages",
    fetcher
  );

  // Handle loading and error states
  if (isLoading) return <p>Cargando páginas...</p>;
  if (error) return <p>Error al cargar las páginas: {error.message}</p>;

  // Function to toggle page visibility
  const toggleVisibility = async (id: number) => {
    try {
      const response = await fetch(`/api/pages/${id}/toggle-visibility`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error al cambiar visibilidad");
      }

      // Update the local data
      mutate();
      toast.success("Visibilidad actualizada");
    } catch (error) {
      toast.error("Error al cambiar visibilidad");
      console.error(error);
    }
  };

  // Function to toggle menu inclusion
  const toggleMenu = async (id: number) => {
    try {
      const response = await fetch(`/api/pages/${id}/toggle-menu`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error al cambiar inclusión en menú");
      }

      // Update the local data
      mutate();
      toast.success("Inclusión en menú actualizada");
    } catch (error) {
      toast.error("Error al cambiar inclusión en menú");
      console.error(error);
    }
  };

  // Function to set page as homepage
  const setHomePage = async (id: number) => {
    try {
      const response = await fetch(`/api/pages/${id}/set-home`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error al establecer como página de inicio");
      }

      // Update the local data
      mutate();
      toast.success("Página de inicio establecida");
    } catch (error) {
      toast.error("Error al establecer como página de inicio");
      console.error(error);
    }
  };

  // Function to handle page deletion
  const handleDelete = async () => {
    if (!pageToDelete) return;

    try {
      const response = await fetch(`/api/pages/${pageToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la página");
      }

      // Update the local data
      mutate();
      setIsDeleteDialogOpen(false);
      toast.success("Página eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar la página");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestionar Páginas Estáticas</h1>
        <Button onClick={() => router.push("/admin/pages/new")}>
          Crear Nueva Página
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead>En Menú</TableHead>
            <TableHead>Es Inicio</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{page.title}</TableCell>
              <TableCell>{page.slug}</TableCell>
              <TableCell>
                <Switch
                  checked={page.isVisible}
                  onCheckedChange={() => toggleVisibility(page.id)}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={page.includeInMenu}
                  onCheckedChange={() => toggleMenu(page.id)}
                />
              </TableCell>
              <TableCell>
                {page.isHomePage ? (
                  <HomeIcon className="text-primary size-5" />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHomePage(page.id)}
                    title="Marcar como página de inicio"
                  >
                    <HomeIcon className="size-5 text-muted-foreground" />
                  </Button>
                )}
              </TableCell>
              <TableCell className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/pages/edit/${page.id}`)}
                >
                  <PenIcon className="size-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setPageToDelete(page.id);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <TrashIcon className="size-4 mr-1" />
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta página? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
