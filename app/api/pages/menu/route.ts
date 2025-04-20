import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// A type to help TypeScript recognize our new model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

// GET handler - Fetch pages for public menu
export async function GET() {
  try {
    // Use the extended type to access the staticPage model
    const prismaExtended = prisma as PrismaWithStaticPage;
    
    // Query to get menu pages
    // Include only visible pages that should be in the menu
    const menuPages = await prismaExtended.staticPage.findMany({
      where: {
        includeInMenu: true,
        isVisible: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        menuOrder: true,
      },
      orderBy: {
        menuOrder: "asc", // Sort by menu order
      },
    });

    return NextResponse.json(menuPages);
  } catch (error) {
    console.error("Error fetching menu pages:", error);
    return NextResponse.json(
      { error: "Error al obtener páginas de menú" },
      { status: 500 }
    );
  }
}
