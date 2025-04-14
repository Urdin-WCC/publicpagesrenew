"use client";

import { SessionProvider } from "next-auth/react";
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
export default function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
