import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/stats";
import { spawn } from "child_process";

// Proteger la ruta para usuarios con rol master
async function checkUserRole() {
  const session = await getServerSession();
  return session?.user?.role === "MASTER";
}

// GET /api/maintenance/db/backup
// Crea una copia de seguridad de la base de datos usando mysqldump
export async function GET(request: NextRequest) {
  // Verificar permisos
  const hasPermission = await checkUserRole();
  if (!hasPermission) {
    return NextResponse.json(
      { error: "No tienes permisos para acceder a esta funcionalidad" },
      { status: 403 }
    );
  }

  return new Promise<Response>(async (resolve) => {
    try {
      // Verificar primero si mysqldump está disponible en el sistema
      const checkMysqldump = spawn("mysqldump", ["--version"], {
        shell: true
      });

      let mysqldumpVersion = "";
      let mysqldumpError = "";
      
      checkMysqldump.stdout.on("data", (data) => {
        mysqldumpVersion += data.toString();
      });
      
      checkMysqldump.stderr.on("data", (data) => {
        mysqldumpError += data.toString();
      });
      
      checkMysqldump.on("close", async (code) => {
        if (code !== 0) {
          // mysqldump no está disponible
          const session = await getServerSession();
          await logAdminAction(
            session?.user?.id || "unknown",
            "Crear copia de seguridad",
            `Error: mysqldump no está instalado o no está disponible en el sistema`
          );
          
          resolve(
            NextResponse.json(
              {
                success: false,
                error: "Herramienta de backup no disponible",
                details: "mysqldump no está instalado en el servidor o no está en el PATH. Por favor, instale MySQL Client Tools para habilitar esta funcionalidad.",
              },
              { status: 500 }
            )
          );
          return;
        }
        
        // Si llegamos aquí, mysqldump está disponible, continuar con el backup
        // Obtener variables de entorno de la conexión a la base de datos
        const databaseUrl = process.env.DATABASE_URL;
        
        if (!databaseUrl) {
          resolve(
            NextResponse.json(
              { error: "No se encontró la URL de la base de datos en las variables de entorno" },
              { status: 500 }
            )
          );
          return;
        }

        // Parsear la URL de la base de datos para obtener las credenciales
        const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
        const matches = databaseUrl.match(regex);

        if (!matches || matches.length < 6) {
          resolve(
            NextResponse.json(
              { error: "No se pudieron extraer las credenciales de la base de datos" },
              { status: 500 }
            )
          );
          return;
        }

        const [, user, password, host, port, database] = matches;

        // Crear nombre del archivo con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `neurowitch_backup_${timestamp}.sql`;

        // Crear el stream para el archivo
        const stream = new ReadableStream({
          async start(controller) {
            try {
              // Usar spawn para ejecutar mysqldump
              // No concatenamos las credenciales en la línea de comandos para evitar riesgos de seguridad
              const mysqldump = spawn("mysqldump", [
                `--user=${user}`,
                `--password=${password}`,
                `--host=${host}`,
                `--port=${port}`,
                "--single-transaction",
                "--skip-lock-tables",
                database
              ], {
                shell: true
              });

              // Capturar la salida
              mysqldump.stdout.on("data", (data) => {
                controller.enqueue(data);
              });

              // Capturar errores
              let stderr = "";
              mysqldump.stderr.on("data", (data) => {
                stderr += data.toString();
                console.error("mysqldump stderr:", data.toString());
              });

              // Manejar el fin del proceso
              mysqldump.on("close", async (code) => {
                // Registrar acción
                const session = await getServerSession();
                await logAdminAction(
                  session?.user?.id || "unknown",
                  "Crear copia de seguridad",
                  `El usuario creó una copia de seguridad de la base de datos con resultado: ${code === 0 ? "Éxito" : "Error"}`
                );

                if (code === 0) {
                  // Finalizar el stream
                  controller.close();
                } else {
                  // Enviar error en el stream
                  controller.error(new Error(`Error en mysqldump (código ${code}): ${stderr}`));
                }
              });

              // Manejar errores del proceso
              mysqldump.on("error", (error) => {
                console.error("Error al ejecutar mysqldump:", error);
                controller.error(error);
              });
            } catch (error) {
              console.error("Error al iniciar el proceso de backup:", error);
              controller.error(error);
            }
          }
        });

        // Crear la respuesta con el stream
        const response = new Response(stream, {
          headers: {
            "Content-Type": "application/sql",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });

        resolve(response);
      });
    } catch (error) {
      console.error("Error al crear la copia de seguridad:", error);
      
      // Registrar acción
      try {
        const session = await getServerSession();
        await logAdminAction(
          session?.user?.id || "unknown",
          "Crear copia de seguridad",
          `Error al crear la copia de seguridad: ${(error as Error).message}`
        );
      } catch (logError) {
        console.error("Error al registrar acción:", logError);
      }
      
      // Devolver error
      resolve(
        NextResponse.json(
          {
            success: false,
            error: "Error al crear la copia de seguridad",
            details: (error as Error).message || "Error desconocido",
          },
          { status: 500 }
        )
      );
    }
  });
}
