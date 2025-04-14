"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

/**
 * Admin dashboard page component
 * 
 * This page displays the admin dashboard with various modules.
 * All user-facing text is in Spanish as required.
 * 
 * @returns The admin dashboard page component
 */
export default function AdminDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Bienvenido, {session?.user?.name || "Usuario"}</h2>
        <p className="text-gray-600 mb-4">
          Has iniciado sesión como: <span className="font-medium">{session?.user?.role}</span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium mb-2">Blog</h3>
            <p className="text-sm text-gray-500">Gestiona artículos y categorías del blog</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium mb-2">Portfolio</h3>
            <p className="text-sm text-gray-500">Gestiona proyectos y categorías del portfolio</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium mb-2">Páginas</h3>
            <p className="text-sm text-gray-500">Gestiona páginas estáticas del sitio</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium mb-2">SEO</h3>
            <p className="text-sm text-gray-500">Configura metadatos, sitemap y robots.txt</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium mb-2">Tema</h3>
            <p className="text-sm text-gray-500">Personaliza la apariencia del sitio</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium mb-2">Usuarios</h3>
            <p className="text-sm text-gray-500">Gestiona usuarios y permisos</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium mb-2">Archivos</h3>
            <p className="text-sm text-gray-500">Gestiona archivos y medios</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium mb-2">Configuración</h3>
            <p className="text-sm text-gray-500">Configura opciones generales del sitio</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium mb-2">Estadísticas</h3>
            <p className="text-sm text-gray-500">Visualiza estadísticas y análisis del sitio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
