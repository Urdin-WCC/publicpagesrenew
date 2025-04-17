"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { translations } from "@/app/translations";

/**
 * Admin header component props
 */
interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

/**
 * Admin header component
 *
 * This component displays the header for the admin panel.
 * All user-facing text is in Spanish as required.
 *
 * @param props - The component props
 * @returns The admin header component
 */
export default function AdminHeader({ user }: AdminHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /**
   * Toggle the user dropdown
   */
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center md:hidden">
        {/* TODO: Implementar funcionalidad del menú hamburguesa si es necesario */}
        <button className="text-gray-500 hover:text-gray-700" aria-label="Abrir menú">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 md:flex-initial">
        <Link href="/" target="_blank" className="text-sm text-gray-500 hover:text-primary">
          Ver sitio web
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 focus:outline-none"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "Usuario"}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span>{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</span>
            )}
          </div>
          <span className="text-sm font-medium hidden md:block">
            {user.name || user.email || "Usuario"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium">{user.name || "Usuario"}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">Rol: {user.role}</p>
            </div>
            <Link
              href="/admin/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsDropdownOpen(false)}
            >
              Mi Perfil
            </Link>
            <Link
              href="/admin/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsDropdownOpen(false)}
            >
              Configuración
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
