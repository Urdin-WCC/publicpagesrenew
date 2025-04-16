"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth"; // Importar tipo Session
import { ReactNode } from "react";

/**
 * Auth provider component
 * 
 * This component wraps the application with the SessionProvider from next-auth/react.
 * It allows client components to access the session using the useSession hook.
 * 
 * @param children - The child components
 * @returns The auth provider component
 */
interface AuthProviderProps {
  children: ReactNode;
  session?: Session | null; // Hacer la sesión opcional
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
  // Pasar la sesión (o undefined si no se proporciona) al SessionProvider
  return <SessionProvider session={session ?? undefined}>{children}</SessionProvider>;
}
