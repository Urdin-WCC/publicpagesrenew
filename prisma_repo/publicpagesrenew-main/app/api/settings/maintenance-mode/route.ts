import { NextRequest, NextResponse } from "next/server";
import { getGlobalConfig } from "@/lib/config";
import { updateGlobalConfig } from "@/lib/config-server";
import { getServerSession, authOptions } from "@/lib/auth";
import { logAdminAction } from "@/lib/stats";

// Proteger la ruta para usuarios con rol admin o superior
async function checkUserRole() {
  const session = await getServerSession();
  return session?.user?.role === "ADMIN" || session?.user?.role === "MASTER";
}

// GET /api/settings/maintenance-mode
// Obtiene el estado actual del modo de mantenimiento
export async function GET(request: NextRequest) {
  // Verificar permisos
  const hasPermission = await checkUserRole();
  if (!hasPermission) {
    return NextResponse.json(
      { error: "No tienes permisos para acceder a esta funcionalidad" },
      { status: 403 }
    );
  }

  try {
    // Obtener configuración global
    const config = await getGlobalConfig();
    if (!config) {
      return NextResponse.json(
        { error: "No se pudo obtener la configuración global" },
        { status: 500 }
      );
    }

    // Devolver el estado del modo de mantenimiento
    return NextResponse.json({
      enabled: config.maintenanceMode || false,
    });
  } catch (error) {
    console.error("Error al obtener el estado del modo de mantenimiento:", error);
    return NextResponse.json(
      { error: "Error al obtener el estado del modo de mantenimiento" },
      { status: 500 }
    );
  }
}

// PUT /api/settings/maintenance-mode
// Actualiza el estado del modo de mantenimiento
export async function PUT(request: NextRequest) {
  // Verificar permisos
  const hasPermission = await checkUserRole();
  if (!hasPermission) {
    return NextResponse.json(
      { error: "No tienes permisos para acceder a esta funcionalidad" },
      { status: 403 }
    );
  }

  try {
    // Obtener datos de la petición
    const data = await request.json();
    const { enabled } = data;

    // Validar datos
    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "El valor 'enabled' debe ser booleano" },
        { status: 400 }
      );
    }

    // Actualizar configuración
    await updateGlobalConfig({
      maintenanceMode: enabled,
    });

    // Registrar acción
    const session = await getServerSession();
    await logAdminAction(
      session?.user?.id || "unknown",
      `${enabled ? "Activar" : "Desactivar"} modo de mantenimiento`,
      `El usuario cambió el modo de mantenimiento a: ${enabled ? "Activado" : "Desactivado"}`
    );

    // Devolver respuesta
    return NextResponse.json({
      success: true,
      enabled,
    });
  } catch (error) {
    console.error("Error al actualizar el modo de mantenimiento:", error);
    return NextResponse.json(
      { error: "Error al actualizar el modo de mantenimiento" },
      { status: 500 }
    );
  }
}
