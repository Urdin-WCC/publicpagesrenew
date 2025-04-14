import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Utilidad para obtener la fecha en formato YYYY-MM-DD
function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const now = new Date();
  const today = new Date(formatDate(now));
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);

  // Visitas diarias (últimos 7 días)
  const visitasDiarias = await prisma.visit.findMany({
    where: {
      date: {
        gte: sevenDaysAgo,
        lte: today,
      },
    },
    orderBy: { date: "asc" },
  });

  // Visitas últimas 24h (hoy)
  const visitas24h = await prisma.visit.findFirst({
    where: { date: today },
  });

  // Visitas últimos 7 días
  const visitas7d = await prisma.visit.aggregate({
    _sum: { count: true },
    where: {
      date: {
        gte: sevenDaysAgo,
        lte: today,
      },
    },
  });

  // Visitas últimos 30 días
  const visitas30d = await prisma.visit.aggregate({
    _sum: { count: true },
    where: {
      date: {
        gte: thirtyDaysAgo,
        lte: today,
      },
    },
  });

  // Páginas más visitadas hoy
  const paginasTop = await prisma.pageView.findMany({
    where: { date: today },
    orderBy: { count: "desc" },
    take: 3,
  });

  // Referers principales hoy
  const referersTop = await prisma.referrer.findMany({
    where: { date: today },
    orderBy: { count: "desc" },
    take: 3,
  });

  return NextResponse.json({
    visitas: {
      ultimas_24h: visitas24h?.count || 0,
      ultimos_7d: visitas7d._sum.count || 0,
      ultimos_30d: visitas30d._sum.count || 0,
    },
    visitas_diarias: visitasDiarias.map(v => ({
      fecha: formatDate(v.date),
      visitas: v.count,
    })),
    paginas_top: paginasTop.map(p => ({
      pagina: p.page,
      visitas: p.count,
    })),
    referers_top: referersTop.map(r => ({
      referer: r.referrer,
      visitas: r.count,
    })),
  });
}