import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAdminAction } from '@/lib/stats';
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
 * API para eliminar todos los registros de visitas a páginas
 * 
 * Este endpoint está protegido y solo accesible para usuarios con rol ADMIN o superior.
 * Elimina todos los registros de PageView de la base de datos.
 * CRÍTICO: Esta operación no se puede deshacer una vez completada.
 * 
 * @param request Objeto Request de NextJS
 * @returns Confirmación de la eliminación de registros
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await auth();
    
    // Si el usuario no está autenticado, devolver 401 Unauthorized
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verificar que el usuario tenga rol ADMIN o superior
    if (!hasRequiredRole(session.user.role as Role, Role.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Opcional: Extraer información adicional del body para configurar el borrado
    const body = await request.json().catch(() => ({}));
    const { includeAdminLogs = false } = body;
    
    // Obtener el conteo actual para fines de registro
    const pageViewCount = await prisma.$queryRaw<[{count: BigInt}]>`
      SELECT COUNT(*) as count FROM PageView
    `;
    const count = Number(pageViewCount[0]?.count || 0);
    
    // Eliminar todos los registros de PageView
    await prisma.$executeRaw`TRUNCATE TABLE PageView`;
    
    // Registrar esta acción administrativa importante
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'STATS_RESET',
      details: {
        recordsDeleted: count,
        includeAdminLogs
      }
    });
    
    // Si la opción está activada, eliminar también los logs administrativos
    if (includeAdminLogs) {
      // Hacemos una copia de seguridad del registro de esta acción para no perderla en el truncate
      const lastActionId = await prisma.$queryRaw<[{lastId: number}]>`
        SELECT MAX(id) as lastId FROM AdminLog
      `;
      const lastId = lastActionId[0]?.lastId;
      
      // Truncar la tabla AdminLog
      await prisma.$executeRaw`TRUNCATE TABLE AdminLog`;
      
      // Registrar de nuevo esta acción para que quede constancia
      await logAdminAction({
        userId: session.user.id,
        userEmail: session.user.email,
        action: 'ADMIN_LOGS_RESET',
        details: {
          recordsDeleted: lastId
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Se han eliminado ${count} registros de visitas a páginas${includeAdminLogs ? ' y todos los logs administrativos' : ''}.`
    });
    
  } catch (error) {
    console.error('Error resetting stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
