import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig, Session, User } from "next-auth";
import type { AdapterUser } from "@auth/core/adapters"; // Importar AdapterUser
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { Role } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

/**
 * NextAuth configuration options (Server-Side)
 *
 * This configuration sets up authentication with the following features:
 * - PrismaAdapter for database integration
 * - JWT session strategy
 * - Custom login page
 * - CredentialsProvider for email/password login (uses bcrypt - server only)
 * - Role-based authorization
 *
 * @public
 */
// Define el tipo para las credenciales explícitamente
type CredentialsType = Partial<Record<string, unknown>>;

/**
 */
export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Authorize function for credentials provider (Server-Side Only)
       * @param credentials - The credentials provided by the user.
       * @returns The user object if credentials are valid, null otherwise.
       */
      async authorize(credentials: CredentialsType) {
        // Validar que email y password sean strings
        if (typeof credentials?.email !== 'string' || typeof credentials?.password !== 'string') {
          return null;
        }

        // Find the user by email
        const user = await prisma.user.findUnique({
          // Usar el email validado
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        // Compare the provided password with the hashed password (uses bcryptjs)
        // Usar el password validado
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
     * @param token The token object.
     * @param user The user object (only available on sign in).
     * @returns The updated token.
     */
    async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
      // Asegurarse de que user y user.role existen antes de asignarlos
      const userRole = (user as any)?.role; // Usar 'as any' si el tipo User no tiene role directamente
      if (user && userRole) {
        token.role = userRole;
        token.id = user.id;
      }
      return token;
    },
    /**
     * Session callback
     * @param session The session object.
     * @param token The token object.
     * @returns The updated session.
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        // Usar la extensión de tipos definida en types/next-auth.d.ts
        session.user.role = token.role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};


// --- Server-Side Helper Functions ---

import { redirect } from "next/navigation";
import { auth as nextAuthGetServerSession } from "@/auth"; // Assuming this is the server-side auth export
import { checkUserRole } from "./auth"; // Import client-safe checkUserRole

/**
 * Server function to get the current session
 */
export async function getServerSession() {
  // Pass the server-side authOptions to the underlying function
  return await nextAuthGetServerSession(authOptions);
}

/**
 * Auth function for Next.js App Router (Server Components, Middleware)
 */
export async function auth() {
  // Pass the server-side authOptions to the underlying function
  return await nextAuthGetServerSession(authOptions);
}

/**
 * Server function to get the current user's role
 */
export async function getCurrentUserRole(): Promise<Role | null> {
  const session = await getServerSession();
  return session?.user?.role || null;
}

/**
 * Middleware helper to protect routes based on role
 */
export function withRoleProtection(requiredRole: Role) {
  return async function() {
    const session = await getServerSession();

    if (!session?.user) {
      redirect("/login");
    }

    // Use the imported checkUserRole function
    const hasRequiredRole = checkUserRole(session.user.role, requiredRole);

    if (!hasRequiredRole) {
      redirect("/unauthorized"); // Ensure this route exists
    }
  };
}
