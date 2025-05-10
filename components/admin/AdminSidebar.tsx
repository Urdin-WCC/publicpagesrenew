"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

// Definir la estructura (puede mejorarse en el futuro para variaciones por rol)
const navLinks = [
  // DASHBOARD
  { section: "dashboard", href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },

  // CONTENIDO
  { section: "contenido", href: "/admin/blog", label: "Blog", icon: <FileText className="w-5 h-5" /> },
  { section: "contenido", href: "/admin/blog/taxonomies", label: "Taxonomías", icon: <TagIcon className="w-5 h-5" /> },
  { section: "contenido", href: "/admin/portfolio", label: "Portfolio", icon: <FolderKanban className="w-5 h-5" /> },
  { section: "contenido", href: "/admin/pages", label: "Páginas", icon: <File className="w-5 h-5" /> },
  { section: "contenido", href: "/admin/files", label: "Archivos", icon: <Folder className="w-5 h-5" /> },
  
  // GESTIÓN
  { section: "gestion", href: "/admin/users", label: "Usuarios", icon: <Users className="w-5 h-5" /> },
  { section: "gestion", href: "/admin/seo", label: "SEO", icon: <BarChart2 className="w-5 h-5" /> },
  { section: "gestion", href: "/admin/theme", label: "Apariencia", icon: <Paintbrush className="w-5 h-5" /> },
  { section: "gestion", href: "/admin/maintenance", label: "Mantenimiento", icon: <Wrench className="w-5 h-5" /> },

  // CONFIGURACIÓN
  {
    section: "config",
    href: "/admin/settings",
    label: "Configuración",
    icon: <Settings className="w-5 h-5" />,
    children: [
      { href: "/admin/settings/blog", label: "Blog", icon: <FileText className="w-4 h-4" /> },
      { href: "/admin/settings/portfolio", label: "Portfolio", icon: <FolderKanban className="w-4 h-4" /> },
      { href: "/admin/settings/header", label: "Encabezado", icon: <FileText className="w-4 h-4" /> },
      { href: "/admin/settings/footer", label: "Pie de página", icon: <FileText className="w-4 h-4" /> },
      { href: "/admin/settings/sidebar", label: "Barra lateral", icon: <FolderKanban className="w-4 h-4" /> },
      { href: "/admin/settings/menu", label: "Menú de Navegación", icon: <FileText className="w-4 h-4" /> },
      { href: "/admin/settings/social", label: "Redes sociales", icon: <Users className="w-4 h-4" /> },
      { href: "/admin/settings/sharing", label: "Botones compartir", icon: <BarChart2 className="w-4 h-4" /> },
      { href: "/admin/settings/appearance", label: "Apariencia Global", icon: <Paintbrush className="w-4 h-4" /> }
    ]
  }
];
const navSections = [
  { key: "dashboard", title: null },
  { key: "contenido", title: "Contenido" },
  { key: "gestion", title: "Gestión" },
  { key: "config", title: "Configuración" },
];

import { useEffect, useState } from "react";
import { getAdminThemePresetConfigById, generateAdminCssFromThemeConfigs } from "@/lib/admin-themeUtils";

export default function AdminSidebar() {
  const pathname = usePathname();
  // NUEVO: theme-css local sólo para el sidebar
  const [themeCss, setThemeCss] = useState("");
  useEffect(() => {
    (async () => {
      let id = null;
      try {
        const res = await fetch("/api/settings/global");
        const json = await res.json();
        id = json && json.adminPanelThemePresetId ? json.adminPanelThemePresetId : null;
      } catch {}
      if (id) {
        const config = await getAdminThemePresetConfigById(id);
        if (config) {
          setThemeCss(generateAdminCssFromThemeConfigs(config, config, ".admin-sidebar"));
        }
      }
    })();
  }, []);
  return (
    <aside className="admin-sidebar w-64 bg-[var(--background)] text-[var(--foreground)] flex flex-col p-4 shadow-lg min-h-screen">
      {themeCss && <style>{themeCss}</style>}
      <h2
        className="text-2xl font-bold mb-6 tracking-wide text-center"
        style={{
          fontFamily: "var(--typography-heading-fontFamily, inherit)",
          color: "var(--typography-heading-color, var(--primary, #222))",
          fontWeight: "var(--typography-heading-fontWeight, 700)",
          fontSize: "var(--typography-heading-fontSize, 1.5rem)"
        }}
      >
        Neurowitch
        <span
          className="block text-sm mt-1"
          style={{
            fontFamily: "var(--typography-paragraph-fontFamily, inherit)",
            color: "var(--typography-paragraph-color, var(--muted-foreground, #666))",
            fontWeight: "var(--typography-paragraph-fontWeight, 400)",
            fontSize: "var(--typography-paragraph-fontSize, 0.9rem)"
          }}
        >
          Panel de Administración
        </span>
      </h2>
      <nav className="flex flex-col gap-0">
        {navSections.map((section, idx) => (
          <div key={section.key}>
            {section.title && (
              <div className="px-3 mt-3 mb-1 text-xs font-semibold text-[var(--muted-foreground)] tracking-wide uppercase select-none">
                {section.title}
              </div>
            )}
            <ul className="mb-2 space-y-1">
              {navLinks
                .filter(link => link.section === section.key)
                .map(link =>
                  link.children ? (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 px-3 py-2 rounded transition group font-medium hover:bg-[color-mix(in srgb, var(--background) 90%, var(--primary) 10%)]"
                        style={{
                          fontFamily: "var(--typography-link-fontFamily, inherit)",
                          color: "var(--typography-link-color, var(--primary, #006))",
                          fontWeight: "var(--typography-link-fontWeight, 500)",
                          fontSize: "var(--typography-link-fontSize, 1rem)"
                        }}
                      >
                        <span className="text-[var(--primary)] group-hover:text-[color-mix(in srgb, var(--primary) 80%, var(--foreground) 20%)]">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                      {/* Submenú para Configuración */}
                      <ul className="ml-6 mt-1 flex flex-col gap-0.5 border-l border-[var(--border)] pl-2">
                        {link.children.map(child => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="flex items-center gap-2 px-2 py-1 rounded text-sm transition group hover:bg-[color-mix(in srgb, var(--background) 92%, var(--primary) 8%)]"
                              style={{
                                fontFamily: "var(--typography-link-fontFamily, inherit)",
                                color: "var(--typography-link-color, var(--primary, #006))",
                                fontWeight: "var(--typography-link-fontWeight, 500)",
                                fontSize: "var(--typography-link-fontSize, 0.95rem)"
                              }}
                            >
                              <span className="text-[color-mix(in srgb, var(--primary) 70%, var(--foreground) 30%)]">{child.icon}</span>
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 px-3 py-2 rounded transition group font-medium hover:bg-[color-mix(in srgb, var(--background) 90%, var(--primary) 10%)]"
                        style={{
                          fontFamily: "var(--typography-link-fontFamily, inherit)",
                          color: "var(--typography-link-color, var(--primary, #006))",
                          fontWeight: "var(--typography-link-fontWeight, 500)",
                          fontSize: "var(--typography-link-fontSize, 1rem)"
                        }}
                      >
                        <span className="text-[var(--primary)] group-hover:text-[color-mix(in srgb, var(--primary) 80%, var(--foreground) 20%)]">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  )
                )}
            </ul>
            {idx < navSections.length - 1 && <hr className="my-2 border-[var(--border)]" />}
          </div>
        ))}
      </nav>
    </aside>
  );
}
