// Este archivo contiene funciones seguras para usar en componentes cliente ('use client')
// Ayuda a evitar que código de servidor (como PrismaAdapter) se incluya accidentalmente en el bundle del cliente.

/**
 * Polyfill temporal para el enum Role SOLO en cliente.
 * Evita errores de import/export de enums Prisma fuera de backend.
 */
export const Role = {
  COLLABORATOR: "COLLABORATOR",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
  MASTER: "MASTER"
} as const;
export type Role = typeof Role[keyof typeof Role];

import { useSession } from "next-auth/react";

/**
 * Hook to get the current user's role
 *
 * This hook can be used in client components to get the current user's role.
 * It uses the useSession hook from next-auth/react.
 *
 * @example
 * ```tsx
 * const role = useCurrentUserRole();
 * if (role === 'ADMIN') {
 *   // Show admin-only content
 * }
 * ```
 *
 * @returns The current user's role or null if not authenticated
 * @public
 */
export function useCurrentUserRole(): Role | null {
  const { data: session } = useSession();
  // @ts-ignore // Acceder a role aunque TS no lo reconozca por defecto en session.user
  return session?.user?.role || null;
}

/**
 * Check if the current user has the required role or higher
 *
 * This function checks if the user's role is sufficient for the required access level.
 * It follows the role hierarchy: MASTER > ADMIN > EDITOR > COLLABORATOR
 *
 * @example
 * ```tsx
 * const hasAccess = checkUserRole(currentRole, 'EDITOR');
 * if (hasAccess) {
 *   // User has EDITOR or higher role
 * }
 * ```
 *
 * @param currentRole - The current user's role
 * @param requiredRole - The minimum role required
 * @returns Boolean indicating if the user has sufficient permissions
 * @public
 */
export function checkUserRole(currentRole: Role | null, requiredRole: Role): boolean {
  if (!currentRole) return false;

  const roleHierarchy: Record<Role, number> = {
    [Role.COLLABORATOR]: 1,
    [Role.EDITOR]: 2,
    [Role.ADMIN]: 3,
    [Role.MASTER]: 4,
  };

  return (roleHierarchy[currentRole] ?? 0) >= (roleHierarchy[requiredRole] ?? Infinity);
}

// Re-export useSession para consistencia si se usa en otros lugares
export { useSession };

// Re-export signIn y signOut desde next-auth/react
export { signIn, signOut } from "next-auth/react";
