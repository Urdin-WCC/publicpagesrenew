import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/stats";

// GET handler - Get appearance settings
export async function GET() {
  try {
    // Obtener configuración global - usar $queryRaw para evitar problemas de tipo
    const globalConfig = await prisma.$queryRaw`
      SELECT 
        defaultLightThemePresetId, defaultDarkThemePresetId,
        themeAssignments, loadingSpinnerConfig, 
        themeSwitcherConfig, stickyElementsConfig
      FROM GlobalConfig 
      WHERE id = 'global'
    `;

    // Convertir el resultado a un solo objeto
    const config = Array.isArray(globalConfig) && globalConfig.length > 0 
      ? globalConfig[0] 
      : null;

    if (!config) {
      return NextResponse.json(
        { error: "Configuración global no encontrada" },
        { status: 404 }
      );
    }

    // Parsear los campos JSON - usar any para evitar problemas de tipado
    const response = {
      ...config,
      themeAssignments: config.themeAssignments ? JSON.parse(config.themeAssignments as string) : {},
      loadingSpinnerConfig: config.loadingSpinnerConfig ? JSON.parse(config.loadingSpinnerConfig as string) : {},
      themeSwitcherConfig: config.themeSwitcherConfig ? JSON.parse(config.themeSwitcherConfig as string) : {},
      stickyElementsConfig: config.stickyElementsConfig ? JSON.parse(config.stickyElementsConfig as string) : {}
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching appearance settings:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración de apariencia" },
      { status: 500 }
    );
  }
}

// PUT handler - Update appearance settings
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

    // Preparar los datos para la actualización
    // Convertir objetos a strings JSON para almacenarlos en la base de datos
    const updateData: any = {
      defaultLightThemePresetId: body.defaultLightThemePresetId || null,
      defaultDarkThemePresetId: body.defaultDarkThemePresetId || null,
    };

    // Convertir objetos a JSON strings si están presentes
    if (body.themeAssignments !== undefined) {
      updateData.themeAssignments = JSON.stringify(body.themeAssignments);
    }

    if (body.loadingSpinnerConfig !== undefined) {
      updateData.loadingSpinnerConfig = JSON.stringify(body.loadingSpinnerConfig);
    }

    if (body.themeSwitcherConfig !== undefined) {
      updateData.themeSwitcherConfig = JSON.stringify(body.themeSwitcherConfig);
    }

    if (body.stickyElementsConfig !== undefined) {
      updateData.stickyElementsConfig = JSON.stringify(body.stickyElementsConfig);
    }

    // Update the GlobalConfig
    await prisma.globalConfig.update({
      where: { id: "global" },
      data: updateData
    });

    // Log admin action
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "UPDATE_APPEARANCE_SETTINGS",
        "Configuración de apariencia actualizada"
      );
    }

    return NextResponse.json({
      success: true,
      message: "Configuración de apariencia actualizada",
    });
  } catch (error) {
    console.error("Error updating appearance settings:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración de apariencia" },
      { status: 500 }
    );
  }
}
