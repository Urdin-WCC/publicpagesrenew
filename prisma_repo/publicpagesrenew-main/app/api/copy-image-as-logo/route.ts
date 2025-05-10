import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { mkdir, copyFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { sourceUrl } = data;

    if (!sourceUrl) {
      return NextResponse.json({ error: "URL de origen no proporcionada" }, { status: 400 });
    }

    // Eliminar las partes iniciales de la URL
    const cleanedUrl = sourceUrl.startsWith('/') ? sourceUrl.substring(1) : sourceUrl;

    // Construir las rutas
    const publicPath = join(process.cwd(), "public");
    
    const sourcePath = join(publicPath, cleanedUrl);
    
    const logoDir = join(publicPath, "images");
    const logoPath = join(logoDir, "logo.png");

    // Asegurar que el directorio existe
    await mkdir(logoDir, { recursive: true });

    // Copiar el archivo
    await copyFile(sourcePath, logoPath);

    // Devolver la URL del logo
    return NextResponse.json({ 
      url: "/images/logo.png", 
      success: true 
    });

  } catch (error) {
    console.error("Error al copiar imagen como logo:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen." },
      { status: 500 }
    );
  }
}
