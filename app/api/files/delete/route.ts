import { NextRequest, NextResponse } from 'next/server';
import { resolveSecurePath, getFileType, ensureUploadsDirectory } from '@/lib/fileUtils';
import fs from 'fs/promises';
import { getCurrentUserRole } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAdminAction } from '@/lib/stats';

/**
 * POST handler for /api/files/delete
 * Deletes a file or folder in the uploads directory
 * Requires ADMIN or higher role
 */
export async function POST(request: NextRequest) {
  try {
    // 0. Ensure the uploads directory exists
    await ensureUploadsDirectory();
    
    // 1. Check user role (ADMIN or higher)
    const userRole = await getCurrentUserRole();
    const session = await import('@/lib/auth').then(mod => mod.getServerSession());
    const userId = session?.user?.id;
    
    if (!userRole || (userRole !== Role.ADMIN && userRole !== Role.MASTER) || !userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }
    
    // 2. Parse the request body
    const { relativePath } = await request.json();
    
    if (!relativePath) {
      return NextResponse.json(
        { error: 'Ruta no proporcionada' },
        { status: 400 }
      );
    }
    
    // 3. Validate and resolve the path (critical security step)
    const targetPath = resolveSecurePath(relativePath);
    
    if (!targetPath) {
      return NextResponse.json(
        { error: 'Ruta inválida o insegura' },
        { status: 400 }
      );
    }
    
    // 4. Check if the item exists and what type it is
    const itemType = await getFileType(targetPath);
    
    if (!itemType) {
      return NextResponse.json(
        { error: 'El archivo o carpeta no existe' },
        { status: 404 }
      );
    }
    
    // 5. Delete the item based on its type
    if (itemType === 'file') {
      await fs.unlink(targetPath);
      
      // Log the action
      await logAdminAction(
        userId,
        'DELETE_FILE',
        `Archivo eliminado: ${relativePath}`
      );
    } else {
      // For folders, we'll only delete if empty to be safer
      // If recursive deletion is needed, use fs.rm with { recursive: true, force: true }
      try {
        await fs.rmdir(targetPath);
        
        // Log the action
        await logAdminAction(
          userId,
          'DELETE_FOLDER',
          `Carpeta eliminada: ${relativePath}`
        );
      } catch (error: any) {
        // Check if the error is because the directory is not empty
        if (error.code === 'ENOTEMPTY') {
          return NextResponse.json(
            { error: 'La carpeta no está vacía' },
            { status: 400 }
          );
        }
        throw error; // Re-throw other errors to be caught by the main try/catch
      }
    }
    
    // 6. Return success
    return NextResponse.json({ 
      success: true, 
      message: `${itemType === 'file' ? 'Archivo' : 'Carpeta'} eliminado correctamente`
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el archivo o carpeta' },
      { status: 500 }
    );
  }
}
