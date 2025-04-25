import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir, copyFile } from "fs/promises";
import { existsSync } from "fs";

const UPLOAD_DIR_GENERAL = join(process.cwd(), "public", "uploads", "images");
const UPLOAD_DIR_LOGO = join(process.cwd(), "public", "images");
const UPLOAD_DIR_THEME_BG = join(process.cwd(), "public", "images", "backgrounds");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const targetType = formData.get("targetType") as string;
    const themeId = formData.get("themeId") as string;
    const imageType = formData.get("imageType") as string;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Solo se permiten imágenes." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let targetPath: string;
    let targetUrl: string;

    // Determinar la ruta de destino según el tipo
    if (targetType === "logo") {
      // Asegurar que el directorio existe
      await mkdir(UPLOAD_DIR_LOGO, { recursive: true });
      targetPath = join(UPLOAD_DIR_LOGO, "logo.png");
      targetUrl = "/images/logo.png";
    } else if (targetType === "theme" && themeId && imageType) {
      // Para imágenes de tema, necesitamos el ID del tema y el tipo (main o card)
      await mkdir(UPLOAD_DIR_THEME_BG, { recursive: true });
      
      // Convertir el nombre a un formato seguro
      const validImageType = imageType === "card" ? "card" : "main";
      const filename = `${validImageType}-${themeId}.jpg`;
      
      targetPath = join(UPLOAD_DIR_THEME_BG, filename);
      targetUrl = `/images/backgrounds/${filename}`;
    } else {
      // Si no es un tipo especial, usar la ruta normal con timestamp
      await mkdir(UPLOAD_DIR_GENERAL, { recursive: true });
      
      // Nombre seguro: timestamp + nombre original (sin path traversal)
      const safeName = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
      
      targetPath = join(UPLOAD_DIR_GENERAL, safeName);
      targetUrl = `/uploads/images/${safeName}`;
    }

    // Guardar el archivo
    await writeFile(targetPath, buffer);

    return NextResponse.json({ url: targetUrl });
  } catch (error) {
    console.error("Error al procesar la subida de imagen:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen." },
      { status: 500 }
    );
  }
}
