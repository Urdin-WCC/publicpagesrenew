import { NextRequest, NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

const IMAGES_DIR = join(process.cwd(), "public", "uploads", "images");

export async function GET(req: NextRequest) {
  try {
    const files = await readdir(IMAGES_DIR);
    // Filtrar solo imágenes por extensión
    const images = files.filter(f =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
    ).map(f => `/uploads/images/${f}`);
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ error: "No se pudieron listar las imágenes." }, { status: 500 });
  }
}