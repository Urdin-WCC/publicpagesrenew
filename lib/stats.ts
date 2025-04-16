import { prisma } from './prisma'; // Importar prisma si se va a usar para guardar en BD en el futuro
import { Role } from '@prisma/client';

/**
 * Registra una acción administrativa importante.
 * TODO: Implementar guardado en el modelo AdminAction de la base de datos (Módulo 13).
 *
 * @param userId ID del usuario que realiza la acción.
 * @param action Tipo de acción realizada (ej. 'CREATE_POST', 'UPDATE_USER', 'DELETE_CATEGORY').
 * @param details Detalles adicionales sobre la acción.
 */
export async function logAdminAction(
  userId: string,
  action: string,
  details: string
): Promise<void> {
  console.log(`[Admin Action] User: ${userId}, Action: ${action}, Details: ${details}`);

  // Implementación futura (Módulo 13):
  /*
  try {
    await prisma.adminAction.create({
      data: {
        userId,
        action,
        details,
        // timestamp: new Date(), // Prisma lo maneja por defecto si se llama createdAt
      },
    });
  } catch (error) {
    console.error("Error logging admin action to database:", error);
    // Considerar qué hacer si falla el log (¿lanzar error, loguear a archivo?)
  }
  */
}

// Otras funciones relacionadas con estadísticas podrían ir aquí en el futuro.