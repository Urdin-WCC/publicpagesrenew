import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const iconsDir = path.join(process.cwd(), "public", "icons");
  let icons: string[] = [];
  try {
    icons = fs
      .readdirSync(iconsDir)
      .filter((file) => file.toLowerCase().endsWith(".svg"));
  } catch (e) {
    return NextResponse.json({ icons: [] }, { status: 500 });
  }
  return NextResponse.json({ icons });
}
