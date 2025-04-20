import { Metadata } from "next";
import PageForm from "@/components/admin/pages/PageForm";

export const metadata: Metadata = {
  title: "Crear Nueva Página | Panel de Administración",
  description: "Formulario para crear una nueva página estática",
};

export default function NewPagePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nueva Página</h1>
      <PageForm />
    </div>
  );
}
