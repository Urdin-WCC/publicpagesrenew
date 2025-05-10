'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { FolderIcon, FileIcon, ImageIcon, TrashIcon, FolderPlusIcon, XCircleIcon, ArrowLeftIcon } from 'lucide-react';
import LoadingSpinner from '@/components/core/LoadingSpinner';
import ImageUploader from '@/components/core/ImageUploader';

// Interface for file items coming from the API
interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  modifiedAt?: string;
  extension?: string;
}

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function FileExplorer() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  // Fetch the list of files
  const apiUrl = `/api/files/list${currentPath ? `?path=${encodeURIComponent(currentPath)}` : ''}`;
  const { data, error: swrError, mutate } = useSWR(apiUrl, fetcher);

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('El nombre de la carpeta no puede estar vacío');
      return;
    }

    setIsCreatingFolder(true);
    setError(null);

    try {
      const response = await fetch('/api/files/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName: newFolderName,
          parentPath: currentPath,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la carpeta');
      }

      // Close the dialog and reset the form
      setNewFolderOpen(false);
      setNewFolderName('');
      
      // Refresh the file list
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la carpeta');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Handle preparing for deletion
  const prepareForDelete = (item: FileItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };
  
  // Handle file/folder deletion
  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/files/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relativePath: itemToDelete.path,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar');
      }

      // Close the dialog
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      
      // Refresh the file list
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle folder navigation
  const navigateToFolder = (item: FileItem) => {
    if (item.type === 'folder') {
      setCurrentPath(item.path);
    }
  };

  // Handle navigating back to parent folder
  const navigateToParent = () => {
    // Split the path by '/' and remove the last segment
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    
    // Join the remaining parts back together
    setCurrentPath(pathParts.length > 0 ? pathParts.join('/') : '');
  };

  // Format file size for display (KB, MB, etc.)
  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined) return 'Desconocido';
    
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    
    if (bytes < kilobyte) {
      return `${bytes} B`;
    } else if (bytes < megabyte) {
      return `${(bytes / kilobyte).toFixed(2)} KB`;
    } else {
      return `${(bytes / megabyte).toFixed(2)} MB`;
    }
  };

  // Render file icon based on extension
  const renderFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <FolderIcon className="h-10 w-10 text-blue-500" />;
    }

    // For image files, show a thumbnail
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (item.extension && imageExtensions.includes(item.extension.toLowerCase())) {
      return (
        <div className="relative h-16 w-16 overflow-hidden">
          <Image 
            src={`/uploads/images/${item.path}`} 
            alt={item.name}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded"
          />
        </div>
      );
    }

    // Default file icon
    return <FileIcon className="h-10 w-10 text-gray-500" />;
  };

  // Loading state
  if (!data && !swrError) {
    return <LoadingSpinner />;
  }

  // Error state
  if (swrError) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded">
        <h3 className="text-lg font-semibold">Error</h3>
        <p>No se pudieron cargar los archivos. Por favor, intente de nuevo.</p>
        <Button 
          variant="outline" 
          onClick={() => mutate()}
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  // Render file explorer
  return (
    <div className="space-y-4">
      {/* Path navigation and actions */}
      <div className="flex items-center justify-between">
        {/* Current path display and back button */}
        <div className="flex items-center space-x-2">
          {currentPath && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={navigateToParent}
              className="flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Atrás
            </Button>
          )}
          <div className="text-sm font-medium">
            Ubicación: {currentPath || 'Raíz'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center"
          >
            {showUploadForm ? 'Cancelar' : 'Subir Archivo'}
          </Button>
          <Button 
            onClick={() => setNewFolderOpen(true)}
            className="flex items-center"
          >
            <FolderPlusIcon className="h-4 w-4 mr-1" />
            Crear Carpeta
          </Button>
        </div>
      </div>

      {/* Show error if any */}
      {error && (
        <div className="bg-red-50 p-3 rounded flex items-center justify-between">
          <p className="text-red-600">{error}</p>
          <button onClick={() => setError(null)}>
            <XCircleIcon className="h-5 w-5 text-red-500" />
          </button>
        </div>
      )}
      
      {/* File upload form */}
      {showUploadForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-3">Subir Archivo</h3>
          <ImageUploader 
            value={uploadedImageUrl} 
            onChange={(url) => {
              setUploadedImageUrl(url);
              // Refresh file list after upload
              mutate();
              // Hide upload form after successful upload
              setShowUploadForm(false);
              // Show success message
              setError(null);
            }}
            label="Arrastra o selecciona un archivo para subir"
          />
        </div>
      )}

      {/* File/folder grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.items?.length > 0 ? (
          data.items.map((item: FileItem) => (
            <Card 
              key={item.path} 
              className="p-3 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
            >
              <div 
                className="flex-grow flex flex-col items-center justify-center p-2"
                onClick={() => navigateToFolder(item)}
              >
                {renderFileIcon(item)}
                <h3 className="mt-2 font-medium text-center truncate w-full">
                  {item.name}
                </h3>
                {item.type === 'file' && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.size)}
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50 w-full flex items-center justify-center" 
                onClick={() => prepareForDelete(item)}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
            <ImageIcon className="h-16 w-16 mb-4 opacity-30" />
            <p>No hay archivos o carpetas en esta ubicación</p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p>
              ¿Está seguro que desea eliminar '{itemToDelete?.name}'? Esta acción no se puede deshacer.
            </p>
            {itemToDelete?.type === 'folder' && (
              <p className="mt-2 text-red-500 font-medium">
                Nota: Solo se pueden eliminar carpetas vacías.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create folder dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Carpeta</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folderName" className="block mb-2">
              Nombre de la Carpeta
            </Label>
            <Input
              id="folderName"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Mi carpeta"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewFolderOpen(false)}
              disabled={isCreatingFolder}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateFolder}
              disabled={isCreatingFolder}
            >
              {isCreatingFolder ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
