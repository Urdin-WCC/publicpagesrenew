import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, unlink, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join, extname, dirname } from "path";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";
import { getGlobalConfig } from "@/lib/config-server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    // Verificar permisos - solo admins/editor pueden subir imágenes
    if (!session || !session.user?.role || !['ADMIN', 'EDITOR', 'MASTER'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Procesar la subida del archivo
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const targetType = formData.get("targetType") as string;
    const themeId = formData.get("themeId") as string;
    const imageType = formData.get("imageType") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Archivo no proporcionado" },
        { status: 400 }
      );
    }

    // Obtener la extensión original del archivo
    const originalExtension = extname(file.name);
    
    // Ruta base del directorio público
    const publicDir = process.env.NODE_ENV === 'development' 
      ? join(process.cwd(), 'public') 
      : join(process.cwd(), 'public');

    // Definir la ruta de destino según el tipo de imagen
    let targetPath = '';
    let originalName = '';
    const fileBuffer = await file.arrayBuffer();

    // Preparar el directorio si no existe
    const imagesDir = join(publicDir, 'images');
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }

    // Eliminar archivos anteriores con el mismo nombre base pero diferentes extensiones
    async function removeExistingFiles(basePath: string) {
      // Obtiene el directorio y el nombre base del archivo
      const dir = dirname(basePath);
      const baseName = basePath.substring(basePath.lastIndexOf('/') + 1);
      
      try {
        // Leer todos los archivos en el directorio
        const files = await readdir(dir);
        
        // Filtrar archivos que empiecen con el nombre base (incluida la extensión)
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

    switch (targetType) {
      case "logo":
        // Establece la ruta para el logo
        originalName = "logo";
        targetPath = join(publicDir, 'images', `logo${originalExtension}`);
        
        // Eliminar versiones anteriores del logo con otras extensiones
        await removeExistingFiles(join(publicDir, 'images', 'logo'));
        break;

      case "theme":
        // Establece la ruta para imágenes de tema
        if (!themeId || !imageType) {
          return NextResponse.json(
            { error: "Faltan parámetros para imagen de tema" },
            { status: 400 }
          );
        }
        originalName = `${imageType}-${themeId}`;
        
        // Asegurar que existe el directorio de fondos
        const backgroundsDir = join(imagesDir, 'backgrounds');
        if (!existsSync(backgroundsDir)) {
          await mkdir(backgroundsDir, { recursive: true });
        }
        
        // Construir la ruta con la extensión original
        targetPath = join(backgroundsDir, `${imageType}-${themeId}${originalExtension}`);
        
        // Eliminar versiones anteriores con otras extensiones
        await removeExistingFiles(join(backgroundsDir, `${imageType}-${themeId}`));
        break;
        
      case "spinner":
        // Establece la ruta para el spinner de carga
        originalName = "spinner";
        targetPath = join(publicDir, 'images', `spinner${originalExtension}`);
        
        // Eliminar versiones anteriores del spinner con otras extensiones
        await removeExistingFiles(join(publicDir, 'images', 'spinner'));
        break;

      default:
        // Para otros tipos de imágenes, usar un nombre aleatorio
        const uniqueId = uuidv4();
        targetPath = join(publicDir, 'images', 'uploads', `${uniqueId}${originalExtension}`);
        
        // Asegurar que existe el directorio de uploads
        const uploadsDir = join(imagesDir, 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }
        break;
    }

    // Guardar el archivo
    await writeFile(targetPath, Buffer.from(fileBuffer));

    // Obtener la ruta relativa para devolver la URL
    const relativePath = targetPath.substring(publicDir.length).replace(/\\/g, '/');
    
    return NextResponse.json({
      url: relativePath,
      originalName: originalName,
      originalExtension: originalExtension
    });

  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}
