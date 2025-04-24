import { prisma } from './prisma';
import { Role } from '@prisma/client';

/**
 * Interface for logAdminAction options
 */
interface LogAdminActionOptions {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  details?: Record<string, any> | null;
  module?: string;
}

/**
 * Registra una acción administrativa importante en la base de datos.
 * Esta función almacena información sobre acciones administrativas para auditoria y análisis.
 * 
 * @param options Objeto con opciones de registro
 * @returns Promise<void>
 */
export async function logAdminAction(
  options: LogAdminActionOptions | string,
  action?: string,
  details?: string | Record<string, any>
): Promise<void> {
  try {
    // Mantener compatibilidad con versiones anteriores de la función
    if (typeof options === 'string') {
      // Formato antiguo: logAdminAction(userId, action, details)
      const userId = options;
      console.log(`[Admin Action] User: ${userId}, Action: ${action}, Details: ${details}`);
      
      // Usar $queryRaw para evitar problemas con Prisma
      await prisma.$queryRaw`
        INSERT INTO AdminLog (userId, action, details)
        VALUES (${userId}, ${action}, ${JSON.stringify(details || {})})
      `;
    } else {
      // Nuevo formato: logAdminAction({ userId, userEmail, action, details })
      console.log(`[Admin Action] User: ${options.userId || 'system'}, Email: ${options.userEmail || 'unknown'}, Action: ${options.action}, Details:`, options.details);
      
      // Usar $queryRaw para evitar problemas con Prisma
      await prisma.$queryRaw`
        INSERT INTO AdminLog (userId, userEmail, action, details)
        VALUES (${options.userId}, ${options.userEmail}, ${options.action}, ${options.details ? JSON.stringify(options.details) : null})
      `;
    }
  } catch (error) {
    // Manejar errores sin interrumpir la operación principal
    console.error("Error logging admin action to database:", error);
    // No relanzamos el error para evitar interrumpir operaciones principales
  }
}

/**
 * Transforma una dirección IP para anonimizarla
 * Reemplaza el último octeto de IPv4 o los últimos 80 bits de IPv6 con ceros
 * 
 * @param ip Dirección IP a anonimizar
 * @returns Dirección IP anonimizada
 */
export function anonymizeIp(ip: string): string {
  if (!ip) return '';
  
  // Anonimizar IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
  }
  
  // Anonimizar IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    // Reemplazar los últimos 5 segmentos (80 bits) con ceros
    const truncatedParts = parts.slice(0, Math.max(3, parts.length - 5));
    while (truncatedParts.length < 3) truncatedParts.push('0');
    return truncatedParts.join(':') + '::0';
  }
  
  return ip; // Devolver la IP original si no coincide con ningún formato conocido
}

/**
 * Obtiene la dirección IP real del cliente desde los encabezados de la solicitud
 * 
 * @param request Objeto Request de NextJS
 * @returns Dirección IP del cliente o una cadena vacía si no se puede determinar
 */
export function getClientIp(request: Request): string {
  // Intentar obtener la IP del encabezado x-forwarded-for (común en entornos con proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for puede contener múltiples IPs separadas por comas
    // La primera es la del cliente original
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }
  
  // Si no hay x-forwarded-for, intentar con otros encabezados comunes
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();
  
  // No se pudo determinar la IP
  return '';
}

// Exportar otras funciones de utilidad relacionadas con estadísticas aquí
