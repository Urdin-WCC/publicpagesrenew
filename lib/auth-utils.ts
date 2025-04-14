import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Auth.js v5 utilities for authentication and authorization
 * 
 * This file contains utility functions for authentication and authorization
 * that work with Auth.js v5.
 */

/**
 * Get the current session
 * 
 * This is a wrapper around the auth() function from Auth.js v5.
 * 
 * @returns Promise resolving to the current session or null if not authenticated
 * @public
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Auth function for Next.js App Router
 * 
 * This is a wrapper around the auth() function from Auth.js v5.
 * 
 * @returns Promise resolving to the current session or null if not authenticated
 * @public
 */
export async function authFunction() {
  return await auth();
}

/**
 * Hook to get the current user's role
 * 
 * This hook returns the current user's role from the session.
 * It can be used in client components to check the user's role.
 * 
 * @returns The current user's role or null if not authenticated
 * @public
 */
export function useRole() {
  const { data: session } = useSession();
  return session?.user?.role;
}

/**
 * Check if the current user has the required role
 * 
 * This function checks if the current user has the required role.
 * It redirects to the login page if the user is not authenticated.
 * It redirects to the unauthorized page if the user doesn't have the required role.
 * 
 * @param requiredRole - The role required to access the page
 * @param redirectTo - The URL to redirect to if the user doesn't have the required role
 * @public
 */
export async function requireRole(requiredRole: Role, redirectTo = "/unauthorized") {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user?.role;

  if (!userRole) {
    redirect("/login");
  }

  const roleHierarchy: Record<Role, number> = {
    MASTER: 4,
    ADMIN: 3,
    EDITOR: 2,
    COLLABORATOR: 1,
  };

  if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
    redirect(redirectTo);
  }
}

/**
 * Check if the current user is authenticated
 * 
 * This function checks if the current user is authenticated.
 * It redirects to the login page if the user is not authenticated.
 * 
 * @public
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }
}

/**
 * Type definition for the session user with role
 * 
 * This type extends the default session user with the role property.
 * 
 * @public
 */
export interface SessionUserWithRole {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}
