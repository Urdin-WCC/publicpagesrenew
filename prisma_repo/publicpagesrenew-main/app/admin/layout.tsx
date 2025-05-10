import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * DEPRECATED: Este layout está OBSOLETO y no debería usarse.
 * 
 * Se mantiene únicamente por compatibilidad mientras se completa la migración.
 * Las nuevas rutas deben usar app/(admin)/layout.tsx para asegurar consistencia.
 * 
 * Todas las páginas en este directorio deberían redirigir a sus equivalentes
 * en app/(admin)/ para garantizar que todas las páginas usen el mismo layout.
 */
export default async function DeprecatedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Solo verificamos autenticación básica
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // NO renderizamos ninguna UI, ya que esperamos que todas las páginas
  // redirijan a sus equivalentes en app/(admin)/
  return <>{children}</>;
}
