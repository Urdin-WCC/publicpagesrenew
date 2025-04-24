import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/stats";

// Proteger la ruta para usuarios con rol master
async function checkUserRole() {
  const session = await getServerSession();
  return session?.user?.role === "MASTER";
}

// GET /api/maintenance/db/check
// Verifica la conexión a la base de datos
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
    // Intentar ejecutar una consulta simple para verificar la conexión
    const result = await prisma.user.findFirst({
      select: { id: true },
      take: 1,
    });

    // Registrar acción
    const session = await getServerSession();
    await logAdminAction(
      session?.user?.id || "unknown",
      "Verificar conexión DB",
      "El usuario verificó la conexión a la base de datos"
    );

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Conexión a la base de datos correcta",
    });
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error);
    
    // Devolver error con detalles
    return NextResponse.json(
      {
        success: false,
        error: "Error al conectar con la base de datos",
        details: (error as Error).message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}
