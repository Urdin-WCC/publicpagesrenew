import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient singleton instance
 * 
 * This is a singleton instance of PrismaClient that should be used throughout the application.
 * It's attached to the global object in development to prevent exhausting the database connection limit.
 * 
 * @example
 * ```ts
 * import { prisma } from '@/lib/prisma';
 * 
 * // Use the prisma client
 * const users = await prisma.user.findMany();
 * ```
 * 
 * @public
 */

// Define a type for the global object with prisma property
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a singleton instance of PrismaClient
export const prisma = globalForPrisma.prisma || new PrismaClient();

// In development, attach the prisma client to the global object
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
