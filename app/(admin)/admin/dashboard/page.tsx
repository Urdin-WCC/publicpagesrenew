import DashboardClient from "./DashboardClient";
import AdminPageContainer from "@/components/admin/AdminPageContainer";

/**
 * Página principal del panel de administración (Dashboard).
 * Renderiza el componente client que gestiona la sesión y los roles,
 * envuelto en un contenedor visual estándar para consistencia y usabilidad.
 */
export default function DashboardPage() {
  return (
    <AdminPageContainer>
      <DashboardClient />
    </AdminPageContainer>
  );
}
