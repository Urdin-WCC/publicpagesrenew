import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/stats";

// A type to help TypeScript recognize our new model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

// PUT handler - Toggle menu inclusion
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    
    // Check for auth (only admin or higher can access this)
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error("Error in auth:", authError);
      return NextResponse.json(
        { error: "Error de autenticación" },
        { status: 401 }
      );
    }
    const userRole = session?.user?.role as string | undefined;
    
    if (!session?.user || !userRole || !["ADMIN", "MASTER"].includes(userRole)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Usar SQL directo en lugar de prisma.staticPage que no está disponible
    console.log(`Verificando existencia de página con ID: ${id}`);
    const pageResult = await prisma.$queryRaw`
      SELECT id, title, slug, includeInMenu
      FROM StaticPage
      WHERE id = ${id}
      LIMIT 1
    `;
    
    const page = Array.isArray(pageResult) && pageResult.length > 0
      ? pageResult[0]
      : null;

    if (!page) {
      return NextResponse.json(
        { error: "Página no encontrada" },
        { status: 404 }
      );
    }

    // Toggle menu inclusion with SQL UPDATE
    const newIncludeInMenu = !page.includeInMenu;
    console.log(`Cambiando includeInMenu a: ${newIncludeInMenu}`);
    
    await prisma.$queryRaw`
      UPDATE StaticPage
      SET includeInMenu = ${newIncludeInMenu}
      WHERE id = ${id}
    `;
    
    // Get updated page
    const updatedPageResult = await prisma.$queryRaw`
      SELECT id, title, slug, includeInMenu
      FROM StaticPage
      WHERE id = ${id}
      LIMIT 1
    `;
    
    const updatedPage = Array.isArray(updatedPageResult) && updatedPageResult.length > 0
      ? updatedPageResult[0]
      : null;
    
    if (!updatedPage) {
      throw new Error("Failed to retrieve updated page");
    }

    // Log admin action
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "TOGGLE_PAGE_MENU",
        `Inclusión en menú cambiada para: ${page.title} (${page.slug}). Nuevo estado: ${!page.includeInMenu ? "Incluido" : "No incluido"}`
      );
    }

    return NextResponse.json({
      success: true,
      includeInMenu: updatedPage.includeInMenu,
    });
  } catch (error) {
    console.error("Error toggling menu inclusion:", error);
    return NextResponse.json(
      { error: "Error al cambiar inclusión en menú" },
      { status: 500 }
    );
  }
}
