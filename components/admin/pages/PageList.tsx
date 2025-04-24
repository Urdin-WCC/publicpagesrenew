"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  DialogClose,
} from "@/components/ui/dialog";

import { PenIcon, TrashIcon } from "lucide-react";

// Fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function PageList() {
  const router = useRouter();
  const [pageToDelete, setPageToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, error, isLoading, mutate } = useSWR("/api/pages", fetcher);

  // Handle loading and error states
  if (isLoading) return <p>Cargando páginas...</p>;
  if (error) return <p>Error al cargar las páginas: {error.message}</p>;

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
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{page.title}</TableCell>
              <TableCell>{page.slug}</TableCell>
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
