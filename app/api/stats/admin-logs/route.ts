import { NextRequest, NextResponse } from "next/server";

const LOGS_PER_PAGE = 5;

const allLogs = [
  { id: 1, usuario: "admin", accion: "Inicio de sesión", fecha: "2025-04-14 09:00" },
  { id: 2, usuario: "master", accion: "Actualizó configuración", fecha: "2025-04-14 08:45" },
  { id: 3, usuario: "admin", accion: "Exportó logs", fecha: "2025-04-13 17:30" },
  { id: 4, usuario: "editor", accion: "Editó página", fecha: "2025-04-13 16:10" },
  { id: 5, usuario: "admin", accion: "Reinició estadísticas", fecha: "2025-04-13 15:00" },
  { id: 6, usuario: "collaborator", accion: "Creó publicación", fecha: "2025-04-12 12:00" },
  { id: 7, usuario: "admin", accion: "Eliminó usuario", fecha: "2025-04-12 10:30" },
  { id: 8, usuario: "master", accion: "Agregó usuario", fecha: "2025-04-11 18:00" },
  { id: 9, usuario: "editor", accion: "Editó proyecto", fecha: "2025-04-11 14:20" },
  { id: 10, usuario: "admin", accion: "Cerró sesión", fecha: "2025-04-10 20:00" },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);

  const start = (page - 1) * LOGS_PER_PAGE;
  const end = start + LOGS_PER_PAGE;
  const logs = allLogs.slice(start, end);

  return NextResponse.json({
    logs,
    total: allLogs.length,
    page,
    perPage: LOGS_PER_PAGE,
    totalPages: Math.ceil(allLogs.length / LOGS_PER_PAGE),
  });
}