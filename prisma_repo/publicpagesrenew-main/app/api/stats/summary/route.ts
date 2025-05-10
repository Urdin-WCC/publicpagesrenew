import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';

/**
 * Verifica si el usuario tiene el rol requerido o superior
 * 
 * @param currentRole Rol actual del usuario
 * @param requiredRole Rol mínimo requerido
 * @returns true si el usuario tiene permisos suficientes, false en caso contrario
 */
function hasRequiredRole(currentRole: Role | null, requiredRole: Role): boolean {
  if (!currentRole) return false;

  const roleHierarchy: Record<Role, number> = {
    COLLABORATOR: 1,
    EDITOR: 2,
    ADMIN: 3,
    MASTER: 4,
  };

  return (roleHierarchy[currentRole] || 0) >= (roleHierarchy[requiredRole] || Infinity);
}

/**
 * API para obtener un resumen de las estadísticas de visitas
 * 
 * Este endpoint está protegido y solo accesible para usuarios con rol COLLABORATOR o superior.
 * Devuelve estadísticas agregadas de visitas para diferentes períodos de tiempo.
 * 
 * @param request Objeto Request de NextJS
 * @returns Objeto JSON con estadísticas de visitas
 */
export async function GET() {
  try {
    // Verificar autenticación
    const session = await auth();
    
    // Si el usuario no está autenticado, devolver 401 Unauthorized
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verificar que el usuario tenga rol COLLABORATOR o superior
    if (!hasRequiredRole(session.user.role as Role, Role.COLLABORATOR)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Calcular fechas para los diferentes períodos
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    
    // Obtener estadísticas usando Raw SQL para mejor rendimiento y evitar problemas con Prisma
    
    // Visitas de hoy
    const todayVisits = await prisma.$queryRaw<[{count: BigInt}]>`
      SELECT COUNT(*) as count FROM PageView 
      WHERE timestamp >= ${today}
    `;
    
    // Visitas de ayer
    const yesterdayVisits = await prisma.$queryRaw<[{count: BigInt}]>`
      SELECT COUNT(*) as count FROM PageView 
      WHERE timestamp >= ${yesterday} AND timestamp < ${today}
    `;
    
    // Visitas de los últimos 7 días
    const last7DaysVisits = await prisma.$queryRaw<[{count: BigInt}]>`
      SELECT COUNT(*) as count FROM PageView 
      WHERE timestamp >= ${last7Days}
    `;
    
    // Visitas de los últimos 30 días
    const last30DaysVisits = await prisma.$queryRaw<[{count: BigInt}]>`
      SELECT COUNT(*) as count FROM PageView 
      WHERE timestamp >= ${last30Days}
    `;
    
    // Datos diarios para gráficos (últimos 30 días)
    const dailyVisits = await prisma.$queryRaw<Array<{date: Date, count: BigInt}>>`
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count 
      FROM PageView 
      WHERE timestamp >= ${last30Days}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;
    
    // Convertir los resultados a formato compatible con JSON
    const dailyStats = dailyVisits.map(row => ({
      date: row.date.toISOString().split('T')[0],
      count: Number(row.count)
    }));
    
    // Devolver los datos agregados
    return NextResponse.json({
      today: Number(todayVisits[0]?.count || 0),
      yesterday: Number(yesterdayVisits[0]?.count || 0),
      last7Days: Number(last7DaysVisits[0]?.count || 0),
      last30Days: Number(last30DaysVisits[0]?.count || 0),
      dailyStats
    });
    
  } catch (error) {
    console.error('Error getting stats summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
