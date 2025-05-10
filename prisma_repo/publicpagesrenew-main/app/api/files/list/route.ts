import { NextRequest, NextResponse } from 'next/server';
import { resolveSecurePath, BASE_UPLOADS_PATH, getRelativePath, ensureUploadsDirectory } from '@/lib/fileUtils';
import fs from 'fs/promises';
import path from 'path';
import { getCurrentUserRole } from '@/lib/auth';
import { Role } from '@prisma/client';

// Type representing a file or folder
interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string; // Relative path
  size?: number; // Size in bytes (only for files)
  modifiedAt?: string; // Last modified date (ISO string)
  extension?: string; // File extension (only for files)
}

/**
 * GET handler for /api/files/list
 * Lists all files and folders in the uploads directory
 * Requires ADMIN or higher role
 */
export async function GET(request: NextRequest) {
  try {
    // 0. Ensure the uploads directory exists
    await ensureUploadsDirectory();
    
    // 1. Check user role (ADMIN or higher)
    const userRole = await getCurrentUserRole();
    
    if (!userRole || (userRole !== Role.ADMIN && userRole !== Role.MASTER)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }
    
    // 2. Get target directory from query params (optional for future subdirectory navigation)
    const params = request.nextUrl.searchParams;
    const relativeDirPath = params.get('path') || ''; // Default to root directory
    
    // 3. Validate and resolve the directory path (critical security step)
    const targetDirPath = resolveSecurePath(relativeDirPath);
    
    if (!targetDirPath) {
      return NextResponse.json(
        { error: 'Ruta inválida' },
        { status: 400 }
      );
    }
    
    // 4. Read directory contents
    const dirContents = await fs.readdir(targetDirPath, { withFileTypes: true });
    
    // 5. Format the results
    const items: FileItem[] = await Promise.all(
      dirContents.map(async (item) => {
        const itemPath = path.join(targetDirPath, item.name);
        const relPath = getRelativePath(itemPath);
        
        // Base item
        const fileItem: FileItem = {
          name: item.name,
          type: item.isDirectory() ? 'folder' : 'file',
          path: relPath,
        };
        
        // Add extra info for files
        if (!item.isDirectory()) {
          try {
            const stats = await fs.stat(itemPath);
            fileItem.size = stats.size;
            fileItem.modifiedAt = stats.mtime.toISOString();
            fileItem.extension = path.extname(item.name).toLowerCase().substring(1);
          } catch (error) {
            // Continue even if we can't get stats
            console.error(`Error getting stats for ${itemPath}:`, error);
          }
        }
        
        return fileItem;
      })
    );
    
    // 6. Return the formatted results
    return NextResponse.json({ items, currentPath: relativeDirPath });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Error al listar archivos' },
      { status: 500 }
    );
  }
}
