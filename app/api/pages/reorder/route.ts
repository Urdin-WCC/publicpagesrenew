import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/stats";

// A type to help TypeScript recognize our new model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

// Type for the request body
interface OrderItem {
  id: number;
  menuOrder: number;
}

// PUT handler - Reorder pages
export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body: OrderItem[] = await request.json();

    // Validate the request body
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "Datos de reordenación inválidos" },
        { status: 400 }
      );
    }

    // Use the extended type to access the staticPage model
    const prismaExtended = prisma as PrismaWithStaticPage;
    
    // Use a transaction to update all page orders
    const updates = body.map((item) =>
      prismaExtended.staticPage.update({
        where: { id: item.id },
        data: { menuOrder: item.menuOrder },
      })
    );

    await prismaExtended.$transaction(updates);

    // Log admin action
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "REORDER_PAGES",
        `Páginas reordenadas: ${body.length} ítems actualizados`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Orden de páginas actualizado",
    });
  } catch (error) {
    console.error("Error reordering pages:", error);
    return NextResponse.json(
      { error: "Error al reordenar páginas" },
      { status: 500 }
    );
  }
}
