import { Role } from '@prisma/client'; // Importar enum Role de Prisma

// Definir la jerarquía de roles numéricamente para facilitar la comparación
const roleHierarchy: Record<Role, number> = {
  [Role.COLLABORATOR]: 1,
  [Role.EDITOR]: 2,
  [Role.ADMIN]: 3,
  [Role.MASTER]: 4,
};

// Definir permisos mínimos requeridos para acciones comunes (ajustar según sea necesario)
// Esto podría expandirse para ser más granular (ej. 'edit_own_post', 'edit_any_post')
const requiredPermissions: Record<string, Role> = {
    'view_admin_panel': Role.COLLABORATOR,
    'create_post': Role.COLLABORATOR,
    'edit_post': Role.COLLABORATOR,
    'edit_any_post': Role.EDITOR,
    'delete_post': Role.COLLABORATOR,
    'delete_any_post': Role.EDITOR,
    'publish_post': Role.EDITOR,
    'manage_blog_taxonomies': Role.EDITOR, // Añadir permiso para taxonomías (EDITOR+)
    'manage_users': Role.ADMIN,
    'manage_settings': Role.ADMIN,
    'manage_seo': Role.ADMIN,
    'manage_theme': Role.ADMIN,
};

/**
 * Verifica si un usuario tiene el permiso necesario basado en su rol.
 *
 * @param userRole El rol del usuario actual (puede ser undefined si no está autenticado).
 * @param requiredAction La acción o recurso que requiere permiso (clave de requiredPermissions).
 * @returns true si el usuario tiene permiso, false en caso contrario.
 */
export function hasPermission(userRole: Role | undefined | null, requiredAction: string): boolean {
  if (!userRole) {
    return false; // No autenticado, sin permisos
  }

  const requiredRole = requiredPermissions[requiredAction];
  if (!requiredRole) {
    console.warn(`Permiso desconocido solicitado: ${requiredAction}`);
    return false; // Acción no definida, denegar por seguridad
  }

  const userLevel = roleHierarchy[userRole] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole] ?? Infinity; // Si el rol requerido no está en la jerarquía, requerir nivel infinito

  return userLevel >= requiredLevel;
}

/**
 * Obtiene el rol del usuario desde la sesión de NextAuth.js.
 * Asegúrate de que el tipo Session y User en `types/next-auth.d.ts` incluya el campo 'role'.
 *
 * @param session La sesión obtenida de `useSession` o `auth()`.
 * @returns El rol del usuario o undefined si no hay sesión o rol.
 */
// import { Session } from 'next-auth'; // Asegúrate de importar el tipo correcto
// export function getUserRole(session: Session | null): Role | undefined {
//   return session?.user?.role;
// }

// Ejemplo de cómo extender la sesión en types/next-auth.d.ts:
/*
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "@prisma/client"; // Importa tu enum Role

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      role: Role; // Añade el campo role aquí
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role; // Añade el campo role aquí
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role; // Añade el campo role aquí
  }
}
*/
