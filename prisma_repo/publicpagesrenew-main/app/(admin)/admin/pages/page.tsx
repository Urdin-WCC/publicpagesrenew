import { Metadata } from "next";
import PageList from "@/components/admin/pages/PageList";

export const metadata: Metadata = {
  title: "Gestionar Páginas Estáticas | Panel de Administración",
  description: "Gestión de páginas estáticas del sitio web",
};

export default function PagesAdminPage() {
  return (
    <div className="container mx-auto py-6">
      <PageList />
    </div>
  );
}
