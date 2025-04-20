"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { translations } from "@/app/translations";

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

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Blog", href: "/admin/blog", icon: "📝" },
    { name: "Portfolio", href: "/admin/portfolio", icon: "🖼️" },
    { name: "Taxonomías", href: "/admin/blog/taxonomies", icon: "🏷️" },
    { name: "Páginas", href: "/admin/pages", icon: "📄" },
    { name: "SEO", href: "/admin/seo", icon: "🔍" },
    { name: "Tema", href: "/admin/theme", icon: "🎨" },
    { name: "Usuarios", href: "/admin/users", icon: "👥" },
    { name: "Archivos", href: "/admin/files", icon: "📁" },
    { name: "Configuración", href: "/admin/settings", icon: "⚙️" },
    { name: "Estadísticas", href: "/admin/stats", icon: "📈" },
    { name: "Mantenimiento", href: "/admin/maintenance", icon: "🔧" },
  ];
  
  // Submenu items for settings
  const settingsSubItems = [
    { name: "Blog", href: "/admin/settings/blog", icon: "📝" },
    { name: "Portfolio", href: "/admin/settings/portfolio", icon: "🖼️" },
    { name: "Encabezado", href: "/admin/settings/header", icon: "📋" },
    { name: "Pie de página", href: "/admin/settings/footer", icon: "📋" },
    { name: "Barra lateral", href: "/admin/settings/sidebar", icon: "📑" },
    { name: "Redes sociales", href: "/admin/settings/social", icon: "👥" },
    { name: "Botones compartir", href: "/admin/settings/sharing", icon: "📤" },
    { name: "Apariencia Global", href: "/admin/settings/appearance", icon: "🎨" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Neurowitch</h1>
        <p className="text-sm text-gray-500">Panel de Administración</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
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
                {item.name}
              </Link>
              
              {/* Display submenu for Settings if we're on settings page or a settings subpage */}
              {item.name === "Configuración" && 
               (pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")) && (
                <ul className="mt-1 ml-7 space-y-1 border-l-2 border-gray-200 pl-2">
                  {settingsSubItems.map((subItem) => (
                    <li key={subItem.href}>
                      <Link
                        href={subItem.href}
                        className={cn(
                          "flex items-center px-3 py-1 rounded-md text-xs transition-colors",
                          pathname === subItem.href
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <span className="mr-2">{subItem.icon}</span>
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
