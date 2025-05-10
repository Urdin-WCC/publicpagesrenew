"use client";

import React from "react";
import { useCurrentUserRole, checkUserRole } from "@/lib/auth";
import AppearanceForm from "@/components/admin/settings/AppearanceForm";

export default function AppearancePage() {
  const role = useCurrentUserRole();

  if (!checkUserRole(role, "ADMIN")) {
    return <div className="p-8 text-red-600 font-bold">Acceso denegado. Se requiere rol ADMIN.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Configuración de Apariencia Global</h1>
      <p className="text-gray-600 mb-6">
        En esta sección puedes configurar la apariencia global del sitio, incluyendo
        temas predeterminados, spinner de carga, interruptor de tema y elementos fijos.
      </p>
      
      <AppearanceForm />
    </div>
  );
}
