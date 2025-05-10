import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Definimos los roles como constantes para evitar problemas de inicialización
const ROLES = {
  COLLABORATOR: 'COLLABORATOR',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
  MASTER: 'MASTER'
} as const;

type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * Verifica si el usuario tiene el rol requerido o superior
 * 
 * @param currentRole Rol actual del usuario
 * @param requiredRole Rol mínimo requerido
 * @returns true si el usuario tiene permisos suficientes, false en caso contrario
 */
function hasRequiredRole(currentRole: string | null | undefined, requiredRole: string): boolean {
  if (!currentRole) return false;

  const roleHierarchy: Record<string, number> = {
    [ROLES.COLLABORATOR]: 1,
    [ROLES.EDITOR]: 2,
    [ROLES.ADMIN]: 3,
    [ROLES.MASTER]: 4,
  };

  return (roleHierarchy[currentRole] || 0) >= (roleHierarchy[requiredRole] || Infinity);
}

/**
 * API para obtener registros de actividad administrativa
 * 
 * Este endpoint está protegido y solo accesible para usuarios con rol ADMIN o superior.
 * Devuelve un listado paginado de las acciones administrativas registradas.
 * 
 * @param request Objeto Request de NextJS
 * @returns Listado paginado de logs administrativos
 */
export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await auth();
    
    // Si el usuario no está autenticado, devolver 401 Unauthorized
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verificar que el usuario tenga rol ADMIN o superior
    if (!hasRequiredRole(session.user.role, ROLES.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Obtener parámetros de paginación
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    // Validar parámetros
    const validPage = isNaN(page) || page <= 0 ? 1 : page;
    const validLimit = isNaN(limit) || limit <= 0 ? 20 : Math.min(limit, 100);
    const offset = (validPage - 1) * validLimit;
    
    // Obtener total de registros para paginación
    const totalCountResult = await prisma.$queryRaw<[{count: BigInt}]>`
      SELECT COUNT(*) as count FROM AdminLog
    `;
    const totalCount = Number(totalCountResult[0]?.count || 0);
    
    // Si no hay resultados, devolver array vacío
    if (totalCount === 0) {
      return NextResponse.json({
        logs: [],
        totalCount: 0,
        page: validPage,
        limit: validLimit,
        totalPages: 0
      });
    }
    
    // Obtener registros paginados
    const logs = await prisma.$queryRaw`
      SELECT 
        id, 
        userId, 
        userEmail, 
        action, 
        details, 
        timestamp 
      FROM AdminLog 
      ORDER BY timestamp DESC 
      LIMIT ${offset}, ${validLimit}
    `;
    
    // Procesar los resultados para asegurar compatibilidad JSON
    const formattedLogs = Array.isArray(logs) ? logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userEmail: log.userEmail,
      action: log.action,
      details: log.details,
      timestamp: new Date(log.timestamp).toISOString()
    })) : [];
    
    // Calcular número total de páginas
    const totalPages = Math.ceil(totalCount / validLimit);
    
    // Devolver resultados paginados
    return NextResponse.json({
      logs: formattedLogs,
      totalCount,
      page: validPage,
      limit: validLimit,
      totalPages
    });
    
  } catch (error) {
    console.error('Error getting admin logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
