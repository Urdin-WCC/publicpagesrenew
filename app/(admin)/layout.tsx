"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Wrench,
  Tag as TagIcon
} from "lucide-react";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/admin/blog", label: "Blog", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/portfolio", label: "Portfolio", icon: <FolderKanban className="w-5 h-5" /> },
  { href: "/admin/blog/taxonomies", label: "Taxonomías", icon: <TagIcon className="w-5 h-5" /> },
  { href: "/admin/pages", label: "Páginas", icon: <File className="w-5 h-5" /> },
  { href: "/admin/theme", label: "Apariencia", icon: <Paintbrush className="w-5 h-5" /> },
  { href: "/admin/seo", label: "SEO", icon: <BarChart2 className="w-5 h-5" /> },
  { href: "/admin/users", label: "Usuarios", icon: <Users className="w-5 h-5" /> },
  {
    href: "/admin/settings",
    label: "Configuración",
    icon: <Settings className="w-5 h-5" />,
    children: [
      // Submenú de Configuración
      { href: "/admin/settings/blog", label: "Blog", icon: <FileText className="w-4 h-4" /> },
      { href: "/admin/settings/portfolio", label: "Portfolio", icon: <FolderKanban className="w-4 h-4" /> },
      { href: "/admin/settings/header", label: "Encabezado", icon: <FileText className="w-4 h-4" /> },
      { href: "/admin/settings/footer", label: "Pie de página", icon: <FileText className="w-4 h-4" /> },
      { href: "/admin/settings/sidebar", label: "Barra lateral", icon: <FolderKanban className="w-4 h-4" /> },
      { href: "/admin/settings/social", label: "Redes sociales", icon: <Users className="w-4 h-4" /> },
      { href: "/admin/settings/sharing", label: "Botones compartir", icon: <BarChart2 className="w-4 h-4" /> },
      { href: "/admin/settings/appearance", label: "Apariencia Global", icon: <Paintbrush className="w-4 h-4" /> }
    ]
  },
  { href: "/admin/files", label: "Archivos", icon: <Folder className="w-5 h-5" /> },
  { href: "/admin/maintenance", label: "Mantenimiento", icon: <Wrench className="w-5 h-5" /> }
];

// Componente para título dinámico
function DynamicPageTitle({ pathname }: { pathname: string }) {
  // Encontrar el título basado en pathname actual
  const getCurrentTitle = () => {
    // Buscar en navLinks el que coincida con pathname
    const currentLink = navLinks.find(link => link.href === pathname);
    if (currentLink) {
      return `${currentLink.label} - Panel de Administración`;
    }

    // Buscar en subelementos
    for (const link of navLinks) {
      if (link.children) {
        const childLink = link.children.find(child => child.href === pathname);
        if (childLink) {
          return `${childLink.label} - Panel de Administración`;
        }
      }
    }

    // Si no coincide con ninguno exacto, extraer de la ruta
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      // Obtener el último segmento y formatearlo
      const lastSegment = pathSegments[pathSegments.length - 1];
      // Convertir de kebab-case o snake_case a Title Case
      const formattedSegment = lastSegment
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return `${formattedSegment} - Panel de Administración`;
    }

    // Fallback default
    return "Panel de Administración";
  };

  return <h1 className="text-xl font-bold">{getCurrentTitle()}</h1>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Usar el hook usePathname para obtener la ruta actual
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Navegación lateral */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-8 tracking-wide text-center">Neurowitch<span className="block text-sm text-gray-400 mt-1">Panel de Administración</span></h2>
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
        {/* Cabecera con título dinámico */}
        <header className="bg-white shadow p-4 flex items-center justify-between">
          <DynamicPageTitle pathname={pathname} />
          <AdminHeaderClient />
        </header>
        <section className="flex-1">{children}</section>
      </main>
    </div>
  );
}
