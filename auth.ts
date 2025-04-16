import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Eliminamos la importación del adaptador de Prisma
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { Role } from "@prisma/client";

/**
 * NextAuth.js v5 configuration
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  // Eliminamos el adaptador de Prisma para evitar problemas con node:async_hooks
  session: { strategy: "jwt" },
  // Eliminar configuración 'pages' para usar valores por defecto
  // pages: {
  //   signIn: "/login",
  //   error: "/login",
  // },
  callbacks: {
    async jwt({ token, user }) {
      // console.log("JWT Callback - User:", user); // Log temporal
      // console.log("JWT Callback - Token In:", token); // Log temporal
      // Restaurar lógica personalizada
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // console.log("JWT Callback - Token Out:", token); // Log temporal
      return token;
    },
    async session({ session, token }) {
      // console.log("Session Callback - Token:", token); // Log temporal
      // console.log("Session Callback - Session In:", session); // Log temporal
      // Restaurar lógica personalizada
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role; // Asegurarse que 'Role' se importa si se descomenta
      }
      // console.log("Session Callback - Session Out:", session); // Log temporal
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdminPanel = request.nextUrl.pathname.startsWith("/admin");

      if (isOnAdminPanel) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // console.log(`[Auth] Authorize attempt for: ${credentials.email as string}`); // Log eliminado
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          // console.log(`[Auth] User not found: ${credentials.email as string}`); // Log eliminado
          return null;
        }
        // console.log(`[Auth] User found: ${user.id}`); // Log eliminado

        // Añadir try-catch para la comparación de contraseña por si bcrypt falla
        let isPasswordValid = false;
        try {
          // Añadir aserciones de tipo para password
          isPasswordValid = await compare(credentials.password as string, user.password as string);
        } catch (compareError) {
          // console.error("[Auth] Error comparing password:", compareError); // Log eliminado
          return null; // Fallar si hay error en la comparación
        }


        if (!isPasswordValid) {
          // console.log(`[Auth] Invalid password for user: ${user.id}`); // Log eliminado
          return null;
        }
        // console.log(`[Auth] Password valid for user: ${user.id}`); // Log eliminado

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
