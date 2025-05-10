"use client";
import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardStats from "@/components/admin/DashboardStats";
import DashboardLogs from "@/components/admin/DashboardLogs";

/**
 * Componente client que gestiona la sesión y el renderizado condicional por rol.
 */
const DashboardClient: React.FC = () => {
  const { data: session } = useSession();

  // Función auxiliar para verificar roles
  const hasRole = (role: string) => {
    const hierarchy = ["collaborator", "editor", "admin", "master"];
    const userRole = session?.user?.role?.toLowerCase() || "";
    return hierarchy.indexOf(userRole) >= hierarchy.indexOf(role);
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>

      {/* Enlaces rápidos: solo para colaborador o superior */}
      {hasRole("collaborator") && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Enlaces rápidos</h2>
          <div className="flex gap-4">
            <Link
              href="/admin/blog/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Crear Publicación
            </Link>
            <Link
              href="/admin/portfolio/new"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Crear Proyecto
            </Link>
          </div>
        </section>
      )}

      {/* Estadísticas: solo para colaborador o superior */}
      {hasRole("collaborator") && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Estadísticas generales</h2>
          <DashboardStats />
        </section>
      )}

      {/* Logs y funciones admin: solo para admin o master */}
      {hasRole("admin") && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Registros de administración</h2>
          <DashboardLogs />
        </section>
      )}
    </div>
  );
};

export default DashboardClient;