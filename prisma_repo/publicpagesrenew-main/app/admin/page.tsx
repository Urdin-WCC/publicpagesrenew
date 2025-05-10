import { redirect } from "next/navigation";

/**
 * Redirección a la página de dashboard principal
 * 
 * Esta página redirige automáticamente a los usuarios al dashboard principal
 * ubicado en app/(admin)/admin/dashboard para asegurar que todos los usuarios
 * tengan una experiencia consistente utilizando el mismo layout.
 */
export default function AdminRedirect() {
  redirect("/admin/dashboard");
}
