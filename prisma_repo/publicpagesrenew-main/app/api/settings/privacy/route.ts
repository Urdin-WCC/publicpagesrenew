import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/stats";

// PUT handler - Update privacy settings (cookie banner)
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
    const body = await request.json();

    // Update the GlobalConfig with cookie banner settings
    // Using 'any' type to bypass TypeScript error since our schema fields are new
    await prisma.globalConfig.update({
      where: { id: "global" },
      data: {
        cookieBannerText: body.cookieBannerText,
        cookieBannerLinkPageId: body.cookieBannerLinkPageId 
          ? parseInt(body.cookieBannerLinkPageId)
          : null,
      } as any,
    });

    // Log admin action
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "UPDATE_PRIVACY_SETTINGS",
        "Configuración de privacidad actualizada (banner de cookies)"
      );
    }

    return NextResponse.json({
      success: true,
      message: "Configuración de privacidad actualizada",
    });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración de privacidad" },
      { status: 500 }
    );
  }
}
