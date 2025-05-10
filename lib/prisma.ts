import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient singleton instance con configuración optimizada de conexiones
 * 
 * Este es un singleton de PrismaClient que debe usarse en toda la aplicación.
 * Está adjunto al objeto global en desarrollo para prevenir agotar el límite de conexiones.
 * 
 * Para aumentar los límites de conexión, añade a .env:
 * DATABASE_URL="mysql://user:pass@host:port/db?connection_limit=20&pool_timeout=30"
 * 
 * @example
 * ```ts
 * import { prisma } from '@/lib/prisma';
 * 
 * // Usar el cliente prisma
 * const users = await prisma.user.findMany();
 * ```
 * 
 * @public
 */

// Definir un tipo para el objeto global con la propiedad prisma
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Anular límites por defecto de conexiones (solo si no están en DATABASE_URL)
const dbUrl = process.env.DATABASE_URL || '';

// Añadir parámetros al DATABASE_URL si no existen ya
let enhancedDbUrl = dbUrl;
if (dbUrl && !dbUrl.includes('connection_limit=') && !dbUrl.includes('pool_timeout=')) {
  const separator = dbUrl.includes('?') ? '&' : '?';
  enhancedDbUrl = `${dbUrl}${separator}connection_limit=20&pool_timeout=30`;
  console.log('Prisma: Aumentando límites de conexión por defecto');
}

// Crear un singleton de PrismaClient con configuración optimizada
export const prisma = globalForPrisma.prisma 
  || new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: enhancedDbUrl,
        },
      },
    });

// In development, attach the prisma client to the global object
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

globalForPrisma.prisma = prisma;

export default prisma;
