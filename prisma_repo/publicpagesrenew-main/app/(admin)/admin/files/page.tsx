import { withRoleProtection } from '@/lib/auth';
import { Role } from '@prisma/client';
import FileExplorer from '@/components/admin/files/FileExplorer';

// Protect this page - only ADMIN and MASTER roles can access it
export const beforeRender = withRoleProtection(Role.ADMIN);

export const metadata = {
  title: 'Explorador de Archivos | Neurowitch Admin',
  description: 'Gestión de archivos y carpetas en el servidor',
};

export default function FilesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explorador de Archivos</h1>
        <p className="text-gray-500">
          Gestione archivos y carpetas en el directorio de imágenes. 
          Puede crear carpetas, navegar por el directorio y eliminar archivos o carpetas.
        </p>
      </div>

      {/* File Explorer Component */}
      <FileExplorer />
    </div>
  );
}
