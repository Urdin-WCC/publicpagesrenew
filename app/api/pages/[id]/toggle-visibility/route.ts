import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/stats";

// A type to help TypeScript recognize our new model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

// PUT handler - Toggle page visibility
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check for auth (only admin or higher can access this)
    const session = await auth();
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

    // Use the extended type to access the staticPage model
    const prismaExtended = prisma as PrismaWithStaticPage;
    
    // Check if the page exists
    const page = await prismaExtended.staticPage.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Página no encontrada" },
        { status: 404 }
      );
    }

    // Toggle the visibility
    const updatedPage = await prismaExtended.staticPage.update({
      where: { id },
      data: {
        isVisible: !page.isVisible,
      },
    });

    // Log admin action
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "TOGGLE_PAGE_VISIBILITY",
        `Visibilidad de página cambiada para: ${page.title} (${page.slug}). Nuevo estado: ${!page.isVisible ? "Visible" : "No visible"}`
      );
    }

    return NextResponse.json({
      success: true,
      isVisible: updatedPage.isVisible,
    });
  } catch (error) {
    console.error("Error toggling page visibility:", error);
    return NextResponse.json(
      { error: "Error al cambiar visibilidad de la página" },
      { status: 500 }
    );
  }
}
