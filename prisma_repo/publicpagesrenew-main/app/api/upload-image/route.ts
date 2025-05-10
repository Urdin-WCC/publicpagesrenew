import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "images");

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("file") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Solo se permiten imágenes." }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Nombre seguro: timestamp + nombre original (sin path traversal)
    const safeName = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const filePath = join(UPLOAD_DIR, safeName);

    await writeFile(filePath, buffer);

    urls.push(`/uploads/images/${safeName}`);
  }

  return NextResponse.json({ urls: urls.length === 1 ? urls[0] : urls });
}