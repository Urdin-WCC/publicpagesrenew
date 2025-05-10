import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { copyFile, mkdir, readdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join, extname, dirname, basename } from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    // Verificar permisos - solo admins/editor pueden modificar imágenes
    if (!session || !session.user?.role || !['ADMIN', 'EDITOR', 'MASTER'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { sourceUrl } = body;
    
    if (!sourceUrl) {
      return NextResponse.json({ error: "URL de origen no proporcionada" }, { status: 400 });
    }
    
    // Obtener la extensión del archivo de origen
    const fileExtension = extname(sourceUrl);
    
    // Configurar las rutas
    const publicDir = process.env.NODE_ENV === 'development' 
      ? join(process.cwd(), 'public') 
      : join(process.cwd(), 'public');
    
    const imagesDir = join(publicDir, 'images');
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }
    
    // Ruta de origen (eliminar el leading slash si existe)
    const sourcePath = join(publicDir, sourceUrl.startsWith('/') ? sourceUrl.substring(1) : sourceUrl);
    
    // Ruta de destino para el spinner
    const spinnerBasePath = join(imagesDir, 'spinner');
    const targetPath = `${spinnerBasePath}${fileExtension}`;
    
    // Eliminar imágenes de spinner existentes con diferentes extensiones
    async function removeExistingFiles(basePath: string) {
      const dir = dirname(basePath);
      const baseName = basename(basePath);
      
      try {
        // Leer todos los archivos en el directorio
        const files = await readdir(dir);
        
        // Filtrar archivos que empiecen con el nombre base (spinner)
        for (const file of files) {
          if (file.startsWith(baseName)) {
            // Eliminar el archivo existente
            await unlink(join(dir, file));
            console.log(`Archivo eliminado: ${join(dir, file)}`);
          }
        }
      } catch (error) {
        console.error("Error al eliminar archivos existentes:", error);
      }
    }
    
    // Eliminar spinners existentes antes de copiar el nuevo
    await removeExistingFiles(spinnerBasePath);
    
    // Copiar el archivo
    await copyFile(sourcePath, targetPath);
    
    // Convertir la ruta del destino en URL relativa
    const relativePath = targetPath.substring(publicDir.length).replace(/\\/g, '/');
    
    return NextResponse.json({
      url: relativePath,
      success: true
    });
    
  } catch (error) {
    console.error("Error al copiar la imagen para spinner:", error);
    return NextResponse.json(
      { error: "Error al copiar la imagen para spinner" },
      { status: 500 }
    );
  }
}
