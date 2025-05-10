"use client";
import { useSession } from "next-auth/react";
import { signOut } from "@/lib/auth-client"; // Importar signOut desde el archivo cliente
import Link from "next/link";
import { LogOut, Home, User } from "lucide-react";

export default function AdminHeaderClient() {
  // Obtener también el estado de la sesión
  const { data: session, status } = useSession();

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/"
        className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
        title="Ir a la página pública"
      >
        <Home className="w-5 h-5" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>
      <div className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 text-gray-700">
        <User className="w-4 h-4" />
        <span className="font-medium">
          {/* Mostrar estado de carga o nombre */}
          {status === 'loading' ? 'Cargando...' : (session?.user?.name || 'Usuario')}
        </span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
        title="Cerrar sesión"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
}