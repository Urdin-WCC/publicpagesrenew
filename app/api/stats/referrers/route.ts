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
 * API para obtener estadísticas de los principales referentes
 * 
 * Este endpoint está protegido y solo accesible para usuarios con rol COLLABORATOR o superior.
 * Devuelve una lista de los sitios de referencia que más tráfico envían.
 * 
 * @param request Objeto Request de NextJS
 * @returns Lista de principales referentes
 */
export async function GET(request: Request) {
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
    
    // Obtener parámetros de consulta
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Validar parámetros
    const validDays = isNaN(days) || days <= 0 ? 30 : Math.min(days, 365);
    const validLimit = isNaN(limit) || limit <= 0 ? 10 : Math.min(limit, 100);
    
    // Calcular fecha límite
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - validDays);
    
    // Consultar los principales referentes usando Raw SQL
    // Filtramos valores nulos o vacíos
    const topReferrers = await prisma.$queryRaw<Array<{referrer: string, visits: BigInt}>>`
      SELECT 
        referrer, 
        COUNT(*) as visits 
      FROM PageView 
      WHERE 
        timestamp >= ${dateLimit} 
        AND referrer IS NOT NULL 
        AND referrer != ''
      GROUP BY referrer 
      ORDER BY visits DESC 
      LIMIT ${validLimit}
    `;
    
    // Convertir los resultados a formato compatible con JSON
    const results = topReferrers.map(row => ({
      referrer: row.referrer,
      visits: Number(row.visits)
    }));
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error getting top referrers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
