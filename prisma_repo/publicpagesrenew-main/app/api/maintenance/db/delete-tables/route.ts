import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/stats";

// Proteger la ruta para usuarios con rol master
async function checkUserRole() {
  const session = await getServerSession();
  return session?.user?.role === "MASTER";
}

// POST /api/maintenance/db/delete-tables
// Elimina todas las tablas de la base de datos
export async function POST(request: NextRequest) {
  // Verificar permisos
  const hasPermission = await checkUserRole();
  if (!hasPermission) {
    return NextResponse.json(
      { error: "No tienes permisos para acceder a esta funcionalidad" },
      { status: 403 }
    );
  }

  try {
    // Desactivar verificación de claves foráneas para poder eliminar tablas con referencias
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);

    // Obtener todas las tablas de la base de datos
    const tablesResult = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE();
    `);

    if (!Array.isArray(tablesResult)) {
      throw new Error("No se pudo obtener la lista de tablas");
    }

    // Convertir el resultado a un array de nombres de tablas
    const tables = tablesResult.map((row: any) => row.table_name || row.TABLE_NAME);

    if (tables.length === 0) {
      return NextResponse.json({
        message: "No se encontraron tablas para eliminar",
      });
    }

    // Eliminar cada tabla
    let deletedTables = [];
    for (const table of tables) {
      try {
        // Utilizar $executeRawUnsafe con precaución
        // Aquí es seguro porque los nombres de las tablas vienen directamente de la base de datos
        await prisma.$executeRawUnsafe(`DROP TABLE \`${table}\`;`);
        deletedTables.push(table);
      } catch (tableError) {
        console.error(`Error al eliminar tabla ${table}:`, tableError);
      }
    }

    // Restaurar verificación de claves foráneas
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);

    // Registrar acción
    const session = await getServerSession();
    await logAdminAction(
      session?.user?.id || "unknown",
      "Eliminar todas las tablas",
      `El usuario eliminó ${deletedTables.length} tablas de la base de datos: ${deletedTables.join(", ")}`
    );

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      message: `Se eliminaron ${deletedTables.length} tablas correctamente`,
      deletedTables,
    });
  } catch (error) {
    console.error("Error al eliminar las tablas:", error);
    
    // Restaurar verificación de claves foráneas en caso de error
    try {
      await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
    } catch (resetError) {
      console.error("Error al restaurar FOREIGN_KEY_CHECKS:", resetError);
    }
    
    // Devolver error con detalles
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar las tablas",
        details: (error as Error).message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}
