import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/stats";

// A type to help TypeScript recognize our new model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

// PUT handler - Set page as homepage
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
      SELECT id, title, slug, isHomePage
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

    // If already the homepage, no need to do anything
    if (page.isHomePage) {
      return NextResponse.json({
        success: true,
        message: "Esta página ya es la página de inicio",
      });
    }

    // Realizar las operaciones manualmente una tras otra
    // Primero, desmarcar cualquier página actual como homepage
    await prisma.$queryRaw`
      UPDATE StaticPage
      SET isHomePage = FALSE
      WHERE isHomePage = TRUE
    `;
    
    // Luego, establecer la página seleccionada como homepage
    await prisma.$queryRaw`
      UPDATE StaticPage
      SET isHomePage = TRUE
      WHERE id = ${id}
    `;

    // Log admin action
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "SET_HOMEPAGE",
        `Página establecida como inicio: ${page.title} (${page.slug})`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Página establecida como inicio",
    });
  } catch (error) {
    console.error("Error setting page as homepage:", error);
    return NextResponse.json(
      { error: "Error al establecer página como inicio" },
      { status: 500 }
    );
  }
}
