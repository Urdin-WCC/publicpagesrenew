import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/stats";
import { spawn } from "child_process";

// Proteger la ruta para usuarios con rol master
async function checkUserRole() {
  const session = await getServerSession();
  return session?.user?.role === "MASTER";
}

// POST /api/maintenance/db/migrate
// Ejecuta las migraciones pendientes de Prisma
export async function POST(request: NextRequest) {
  // Verificar permisos
  const hasPermission = await checkUserRole();
  if (!hasPermission) {
    return NextResponse.json(
      { error: "No tienes permisos para acceder a esta funcionalidad" },
      { status: 403 }
    );
  }

  return new Promise<NextResponse>(async (resolve) => {
    try {
      // Usar spawn para ejecutar npx prisma migrate deploy
      // spawn es más seguro que exec porque evita inyección de comandos
      const process = spawn("npx", ["prisma", "migrate", "deploy"], {
        shell: true,
        // No pasamos datos de usuario, así que es seguro
      });

      // Capturar la salida
      let stdout = "";
      let stderr = "";

      process.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      process.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      // Manejar el fin del proceso
      process.on("close", async (code) => {
        // Registrar acción
        const session = await getServerSession();
        await logAdminAction(
          session?.user?.id || "unknown",
          "Ejecutar migraciones",
          `El usuario ejecutó las migraciones pendientes con resultado: ${code === 0 ? "Éxito" : "Error"}`
        );

        if (code === 0) {
          // Éxito
          resolve(
            NextResponse.json({
              success: true,
              message: "Migraciones aplicadas correctamente",
              output: stdout,
            })
          );
        } else {
          // Error
          resolve(
            NextResponse.json(
              {
                success: false,
                error: "Error al aplicar las migraciones",
                output: stdout,
                errorOutput: stderr,
                exitCode: code,
              },
              { status: 500 }
            )
          );
        }
      });

      // Manejar errores del proceso
      process.on("error", async (error) => {
        console.error("Error al ejecutar las migraciones:", error);

        // Registrar acción
        const session = await getServerSession();
        await logAdminAction(
          session?.user?.id || "unknown",
          "Ejecutar migraciones",
          `Error al ejecutar las migraciones: ${error.message}`
        );

        // Devolver error
        resolve(
          NextResponse.json(
            {
              success: false,
              error: "Error al ejecutar las migraciones",
              details: error.message,
            },
            { status: 500 }
          )
        );
      });
    } catch (error) {
      console.error("Error al ejecutar las migraciones:", error);
      
      // Registrar acción
      try {
        const session = await getServerSession();
        await logAdminAction(
          session?.user?.id || "unknown",
          "Ejecutar migraciones",
          `Error al ejecutar las migraciones: ${(error as Error).message}`
        );
      } catch (logError) {
        console.error("Error al registrar acción:", logError);
      }
      
      // Devolver error
      resolve(
        NextResponse.json(
          {
            success: false,
            error: "Error al ejecutar las migraciones",
            details: (error as Error).message || "Error desconocido",
          },
          { status: 500 }
        )
      );
    }
  });
}
