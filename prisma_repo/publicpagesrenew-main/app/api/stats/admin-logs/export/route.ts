import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
 * Convierte un objeto en string con formato CSV
 * 
 * @param value Valor a convertir a formato CSV
 * @returns String en formato CSV
 */
function formatCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    // Convertir objetos a JSON string y escapar comillas dobles
    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
  }
  
  // Convertir a string y escapar comillas dobles si es necesario
  const stringValue = String(value);
  return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
}

/**
 * API para exportar registros de actividad administrativa como CSV
 * 
 * Este endpoint está protegido y solo accesible para usuarios con rol ADMIN o superior.
 * Devuelve un archivo CSV con todas las acciones administrativas registradas.
 * 
 * @param request Objeto Request de NextJS
 * @returns Archivo CSV para descargar
 */
export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await auth();
    
    // Si el usuario no está autenticado, devolver 401 Unauthorized
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Verificar que el usuario tenga rol ADMIN o superior
    if (!hasRequiredRole(session.user.role as Role, Role.ADMIN)) {
      return new Response('Forbidden', { status: 403 });
    }
    
    // Manejar posibles parámetros de filtrado
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Preparar fechas de filtro si están presentes
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;
    
    // Obtener todos los registros de AdminLog para exportar
    let logs;
    
    if (startDateObj && endDateObj) {
      // Filtrar por rango de fechas
      logs = await prisma.$queryRaw`
        SELECT id, userId, userEmail, action, details, timestamp 
        FROM AdminLog 
        WHERE timestamp >= ${startDateObj} AND timestamp <= ${endDateObj}
        ORDER BY timestamp DESC
      `;
    } else if (startDateObj) {
      // Filtrar solo por fecha inicial
      logs = await prisma.$queryRaw`
        SELECT id, userId, userEmail, action, details, timestamp 
        FROM AdminLog 
        WHERE timestamp >= ${startDateObj}
        ORDER BY timestamp DESC
      `;
    } else if (endDateObj) {
      // Filtrar solo por fecha final
      logs = await prisma.$queryRaw`
        SELECT id, userId, userEmail, action, details, timestamp 
        FROM AdminLog 
        WHERE timestamp <= ${endDateObj}
        ORDER BY timestamp DESC
      `;
    } else {
      // Sin filtros de fecha
      logs = await prisma.$queryRaw`
        SELECT id, userId, userEmail, action, details, timestamp 
        FROM AdminLog 
        ORDER BY timestamp DESC
      `;
    }
    
    // Generar timestamp para el nombre del archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Definir encabezados para el CSV
    const headers = [
      'ID',
      'User ID',
      'User Email',
      'Action',
      'Details',
      'Timestamp'
    ];
    
    // Generar filas del CSV
    const rows = Array.isArray(logs) ? logs.map(log => [
      formatCsvValue(log.id),
      formatCsvValue(log.userId),
      formatCsvValue(log.userEmail),
      formatCsvValue(log.action),
      formatCsvValue(log.details),
      formatCsvValue(new Date(log.timestamp).toISOString())
    ]) : [];
    
    // Generar contenido CSV con encabezados y filas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Configurar encabezados para descarga de archivo
    const responseHeaders = {
      'Content-Disposition': `attachment; filename="admin_logs_${timestamp}.csv"`,
      'Content-Type': 'text/csv; charset=utf-8'
    };
    
    // Devolver el archivo CSV
    return new Response(csvContent, {
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Error exporting admin logs:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
