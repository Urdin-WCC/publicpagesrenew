import React from "react";
import Link from "next/link";
import AdminHeaderClient from "./AdminHeaderClient";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  File,
  Paintbrush,
  BarChart2,
  Users,
  Settings,
  Folder,
  Wrench
} from "lucide-react";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/admin/blog", label: "Blog", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/portfolio", label: "Portfolio", icon: <FolderKanban className="w-5 h-5" /> },
  { href: "/admin/pages", label: "Páginas", icon: <File className="w-5 h-5" /> },
  { href: "/admin/theme", label: "Apariencia", icon: <Paintbrush className="w-5 h-5" /> },
  { href: "/admin/seo", label: "SEO", icon: <BarChart2 className="w-5 h-5" /> },
  { href: "/admin/users", label: "Usuarios", icon: <Users className="w-5 h-5" /> },
  {
    href: "/admin/settings",
    label: "Configuración",
    icon: <Settings className="w-5 h-5" />,
    children: [
      // Añadir enlace a Configuración del Blog
      { href: "/admin/settings/blog", label: "Blog", icon: <FileText className="w-4 h-4" /> },
      { href: "/admin/settings/header", label: "Encabezado", icon: <FileText className="w-4 h-4" /> },
      { href: "/admin/settings/footer", label: "Pie de página", icon: <FileText className="w-4 h-4" /> },
      { href: "/admin/settings/sidebar", label: "Barra lateral", icon: <FolderKanban className="w-4 h-4" /> },
      { href: "/admin/settings/social", label: "Redes sociales", icon: <Users className="w-4 h-4" /> },
      { href: "/admin/settings/sharing", label: "Botones compartir", icon: <BarChart2 className="w-4 h-4" /> }
    ]
  },
  { href: "/admin/files", label: "Archivos", icon: <Folder className="w-5 h-5" /> },
  { href: "/admin/maintenance", label: "Mantenimiento", icon: <Wrench className="w-5 h-5" /> }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Navegación lateral */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-8 tracking-wide text-center">Admin</h2>
        <nav className="flex flex-col gap-2">
          {navLinks.map(link => (
            <React.Fragment key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 transition group"
              >
                <span className="text-blue-400 group-hover:text-blue-300">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
              {/* Submenú para Configuración */}
              {link.children && (
                <div className="ml-6 flex flex-col gap-1">
                  {link.children.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 text-sm transition group"
                    >
                      <span className="text-blue-300">{child.icon}</span>
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </nav>
      </aside>
      {/* Contenido principal */}
      <main className="flex-1 flex flex-col">
        {/* Cabecera */}
        <header className="bg-white shadow p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Panel de Administración</h1>
          <AdminHeaderClient />
        </header>
        <section className="flex-1">{children}</section>
      </main>
    </div>
  );
}