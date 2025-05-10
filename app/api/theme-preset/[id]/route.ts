import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const matches = url.pathname.match(/\/api\/theme-preset\/(\d+)/);
  const id = matches && matches[1] ? Number(matches[1]) : null;
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const result = await prisma.themePreset.findUnique({
      where: { id },
      select: { config: true }
    });

    if (!result) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    let config = result.config;
    if (typeof config === "string") {
      try {
        config = JSON.parse(config);
      } catch {
        // fallback: return as string
      }
    }
    return NextResponse.json({ config });
  } catch (err) {
    console.error("Error fetching theme preset:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
