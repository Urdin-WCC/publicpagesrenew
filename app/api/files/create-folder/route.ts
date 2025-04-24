import { NextRequest, NextResponse } from 'next/server';
import { resolveSecurePath, sanitizeInput, ensureUploadsDirectory } from '@/lib/fileUtils';
import fs from 'fs/promises';
import path from 'path';
import { getCurrentUserRole } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAdminAction } from '@/lib/stats';

/**
 * POST handler for /api/files/create-folder
 * Creates a new folder in the uploads directory
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
    const { folderName, parentPath = '' } = await request.json();
    
    if (!folderName) {
      return NextResponse.json(
        { error: 'Nombre de carpeta no proporcionado' },
        { status: 400 }
      );
    }
    
    // 3. Sanitize the folder name
    const sanitizedFolderName = sanitizeInput(folderName);
    
    if (!sanitizedFolderName) {
      return NextResponse.json(
        { error: 'Nombre de carpeta inválido después de sanitización' },
        { status: 400 }
      );
    }
    
    // 4. Validate and resolve the parent path (critical security step)
    const parentDirPath = resolveSecurePath(parentPath);
    
    if (!parentDirPath) {
      return NextResponse.json(
        { error: 'Ruta de carpeta padre inválida o insegura' },
        { status: 400 }
      );
    }
    
    // 5. Create the full path for the new folder
    const newFolderPath = path.join(parentDirPath, sanitizedFolderName);
    
    // 6. Check if the path is still secure (extra validation)
    // This should always be true if resolveSecurePath worked properly,
    // but it's a good extra check for security-critical operations
    const securePath = resolveSecurePath(path.join(parentPath, sanitizedFolderName));
    
    if (!securePath || securePath !== newFolderPath) {
      return NextResponse.json(
        { error: 'Ruta de nueva carpeta inválida o insegura' },
        { status: 400 }
      );
    }
    
    // 7. Check if the folder already exists
    try {
      const stat = await fs.stat(newFolderPath);
      if (stat.isDirectory()) {
        return NextResponse.json(
          { error: 'La carpeta ya existe' },
          { status: 409 }
        );
      }
    } catch (error) {
      // Error means file doesn't exist, which is what we want
    }
    
    // 8. Create the folder
    await fs.mkdir(newFolderPath);
    
    // 9. Log the action
    await logAdminAction(
      userId,
      'CREATE_FOLDER',
      `Carpeta creada: ${path.join(parentPath, sanitizedFolderName)}`
    );
    
    // 10. Return success
    return NextResponse.json({ 
      success: true, 
      message: 'Carpeta creada correctamente',
      folderName: sanitizedFolderName,
      path: path.join(parentPath, sanitizedFolderName)
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Error al crear la carpeta' },
      { status: 500 }
    );
  }
}
