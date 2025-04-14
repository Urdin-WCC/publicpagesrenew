"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
<<<<<<< HEAD
import { t } from "@/app/translations"; // Importar la función de traducción
=======
>>>>>>> feature/modulo4

/**
 * Admin sidebar component
 * 
 * This component displays the sidebar navigation for the admin panel.
 * All user-facing text is in Spanish as required.
 * 
 * @returns The admin sidebar component
 */
export default function AdminSidebar() {
  const pathname = usePathname();

<<<<<<< HEAD
  // Usar claves de traducción en lugar de nombres hardcodeados
  const menuItems = [
    { key: "dashboard", href: "/admin", icon: "📊" },
    { key: "blog", href: "/admin/blog", icon: "📝" },
    { key: "portfolio", href: "/admin/portfolio", icon: "🖼️" },
    { key: "pages", href: "/admin/pages", icon: "📄" },
    { key: "seo", href: "/admin/seo", icon: "🔍" },
    { key: "theme", href: "/admin/theme", icon: "🎨" },
    { key: "users", href: "/admin/users", icon: "👥" },
    { key: "files", href: "/admin/files", icon: "📁" },
    // Nota: La clave 'settingsModule' se usa para evitar conflicto con 'admin.settings' del header
    { key: "settingsModule", href: "/admin/settings", icon: "⚙️" },
    { key: "stats", href: "/admin/stats", icon: "📈" },
    { key: "maintenance", href: "/admin/maintenance", icon: "🔧" },
=======
  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Blog", href: "/admin/blog", icon: "📝" },
    { name: "Portfolio", href: "/admin/portfolio", icon: "🖼️" },
    { name: "Páginas", href: "/admin/pages", icon: "📄" },
    { name: "SEO", href: "/admin/seo", icon: "🔍" },
    { name: "Tema", href: "/admin/theme", icon: "🎨" },
    { name: "Usuarios", href: "/admin/users", icon: "👥" },
    { name: "Archivos", href: "/admin/files", icon: "📁" },
    { name: "Configuración", href: "/admin/settings", icon: "⚙️" },
    { name: "Estadísticas", href: "/admin/stats", icon: "📈" },
    { name: "Mantenimiento", href: "/admin/maintenance", icon: "🔧" },
>>>>>>> feature/modulo4
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="p-4 border-b border-gray-200">
<<<<<<< HEAD
        {/* Usar traducción para el nombre de la app y el título del panel */}
        <h1 className="text-xl font-bold">{t('common', 'appName')}</h1>
        <p className="text-sm text-gray-500">{t('admin', 'dashboard')}</p>
=======
        <h1 className="text-xl font-bold">Neurowitch</h1>
        <p className="text-sm text-gray-500">Panel de Administración</p>
>>>>>>> feature/modulo4
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
<<<<<<< HEAD
            <li key={item.key}> {/* Usar key como clave única */}
=======
            <li key={item.href}>
>>>>>>> feature/modulo4
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 rounded-md text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="mr-3">{item.icon}</span>
<<<<<<< HEAD
                {/* Traducir el nombre del item usando la clave */}
                {t('admin', item.key)}
=======
                {item.name}
>>>>>>> feature/modulo4
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
