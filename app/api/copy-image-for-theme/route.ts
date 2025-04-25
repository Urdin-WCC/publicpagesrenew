import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { mkdir, copyFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { sourceUrl, themeId, imageType } = data;

    if (!sourceUrl) {
      return NextResponse.json({ error: "URL de origen no proporcionada" }, { status: 400 });
    }

    if (!themeId) {
      return NextResponse.json({ error: "ID del tema no proporcionado" }, { status: 400 });
    }

    if (!imageType || (imageType !== "main" && imageType !== "card")) {
      return NextResponse.json({ error: "Tipo de imagen no válido" }, { status: 400 });
    }

    // Eliminar las partes iniciales de la URL
    const cleanedUrl = sourceUrl.startsWith('/') ? sourceUrl.substring(1) : sourceUrl;

    // Construir las rutas
    const publicPath = join(process.cwd(), "public");
    
    const sourcePath = join(publicPath, cleanedUrl);
    
    const backgroundsDir = join(publicPath, "images", "backgrounds");
    const targetFilename = `${imageType}-${themeId}.jpg`;
    const targetPath = join(backgroundsDir, targetFilename);

    // Asegurar que el directorio existe
    await mkdir(backgroundsDir, { recursive: true });

    // Copiar el archivo
    await copyFile(sourcePath, targetPath);

    // Devolver la URL de la imagen de tema
    return NextResponse.json({ 
      url: `/images/backgrounds/${targetFilename}`, 
      success: true 
    });

  } catch (error) {
    console.error("Error al copiar imagen para tema:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen." },
      { status: 500 }
    );
  }
}
