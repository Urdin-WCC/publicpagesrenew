<<<<<<< HEAD
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { auth as nextAuthGetServerSession } from "@/auth";

/**
 * NextAuth configuration options
 *
 * This configuration sets up authentication with the following features:
 * - PrismaAdapter for database integration
 * - JWT session strategy
 * - Custom login page
 * - CredentialsProvider for email/password login
 * - Role-based authorization
 *
 * @public
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Authorize function for credentials provider
       *
       * This function verifies the user's credentials by:
       * 1. Finding the user by email
       * 2. Comparing the provided password with the hashed password in the database
       * 3. Returning the user object with role if valid
       *
       * @param credentials - The credentials provided by the user
       * @returns The user object if credentials are valid, null otherwise
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find the user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Return the user object with role
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback
     *
     * This function is called whenever a JWT is created or updated.
     * It adds the user's role and ID to the token.
     *
     * @param params - Object containing token and user
     * @returns The modified token
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    /**
     * Session callback
     *
     * This function is called whenever a session is checked.
     * It adds the user's role and ID to the session.
     *
     * @param params - Object containing session and token
     * @returns The modified session
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
=======
// lib/auth.ts - Client-side safe utilities and hooks
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
export { useSession };
import { redirect } from "next/navigation";
// No importar nada de servidor aquí

// Re-export Role for convenience
export { Role };
>>>>>>> feature/modulo4

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
  return session?.user?.role || null;
}

<<<<<<< HEAD
/**
 * Server function to get the current user's role
 *
 * This function can be used in server components to get the current user's role.
 *
 * @example
 * ```tsx
 * const role = await getCurrentUserRole();
 * if (role === 'ADMIN') {
 *   // Show admin-only content
 * }
 * ```
 *
 * @returns Promise resolving to the current user's role or null if not authenticated
 * @public
 */
export async function getCurrentUserRole(): Promise<Role | null> {
  const session = await getServerSession();
  return session?.user?.role || null;
}
=======
// MOVIDO a lib/auth-server.ts
>>>>>>> feature/modulo4

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

  const roleHierarchy = {
    MASTER: 4,
    ADMIN: 3,
    EDITOR: 2,
    COLLABORATOR: 1,
  };

  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
}

<<<<<<< HEAD
/**
 * Server function to get the current session
 *
 * This is a wrapper around the getServerSession function from next-auth.
 *
 * @example
 * ```tsx
 * const session = await getServerSession();
 * if (session?.user) {
 *   // User is authenticated
 * }
 * ```
 *
 * @returns Promise resolving to the current session or null if not authenticated
 * @public
 */
export async function getServerSession() {
  return await nextAuthGetServerSession(authOptions);
}

/**
 * Auth function for Next.js App Router
 *
 * This is a wrapper around the getServerSession function from next-auth.
 * It's used by the middleware and server components.
 *
 * @returns Promise resolving to the current session or null if not authenticated
 * @public
 */
export async function auth() {
  return await nextAuthGetServerSession(authOptions);
}

/**
 * Middleware to protect routes based on role
 *
 * This function can be used to protect routes based on the user's role.
 * It redirects to the login page if the user is not authenticated,
 * and to the unauthorized page if the user doesn't have the required role.
 *
 * @example
 * ```tsx
 * // In a page.tsx file
 * export default async function AdminPage() {
 *   await withRoleProtection('ADMIN')();
 *   // Rest of the page component
 * }
 * ```
 *
 * @param requiredRole - The minimum role required to access the route
 * @returns An async function that checks the user's role and redirects if necessary
 * @public
 */
export function withRoleProtection(requiredRole: Role) {
  return async function() {
    const session = await getServerSession();

    if (!session?.user) {
      redirect("/login");
    }

    const hasRequiredRole = checkUserRole(session.user.role, requiredRole);

    if (!hasRequiredRole) {
      redirect("/unauthorized");
    }
  };
}
=======
// MOVIDO a lib/auth-server.ts

// MOVIDO a lib/auth-server.ts

// MOVIDO a lib/auth-server.ts
>>>>>>> feature/modulo4
