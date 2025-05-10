'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusIcon, Pencil, Copy, Trash2 } from 'lucide-react';

interface ThemePreset {
  id: number;
  name: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PresetList() {
  const { data, error, isLoading, mutate } = useSWR('/api/theme/presets', fetcher);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<ThemePreset | null>(null);

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (!presetToDelete) return;
    
    try {
      const response = await fetch(`/api/theme/presets/${presetToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the data after successful deletion
        mutate();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'No se pudo eliminar el tema'}`);
      }
    } catch (error) {
      console.error('Error deleting theme:', error);
      alert('Error al eliminar el tema');
    }
    
    // Close the dialog
    setDeleteDialogOpen(false);
    setPresetToDelete(null);
  };

  // Handle duplicate
  const handleDuplicate = async (id: number) => {
    try {
      const response = await fetch(`/api/theme/presets/${id}/duplicate`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh the data after successful duplication
        mutate();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'No se pudo duplicar el tema'}`);
      }
    } catch (error) {
      console.error('Error duplicating theme:', error);
      alert('Error al duplicar el tema');
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Cargando temas...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error al cargar los temas</div>;
  }

  const presets: ThemePreset[] = data || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Temas Visuales</h1>
        <Link href="/admin/theme/new" passHref>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Crear Nuevo Tema
          </Button>
        </Link>
      </div>

      {presets.length === 0 ? (
        <div className="p-8 text-center border rounded-lg">
          <p className="text-gray-500 mb-4">No hay temas creados</p>
          <Link href="/admin/theme/new" passHref>
            <Button>Crear Primer Tema</Button>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {presets.map((preset) => (
              <TableRow key={preset.id}>
                <TableCell>{preset.id}</TableCell>
                <TableCell>{preset.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/theme/edit/${preset.id}`} passHref>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDuplicate(preset.id)}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Duplicar</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setPresetToDelete(preset);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el tema 
              "{presetToDelete?.name}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
