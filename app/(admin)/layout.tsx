"use client";

import AdminHeaderClient from "./AdminHeaderClient";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { usePathname } from "next/navigation";
import React from "react";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";

// Componente para título dinámico
function DynamicPageTitle({ pathname }: { pathname: string }) {
  // Solo renderiza la ruta como último segmento capitalizado
  const pathSegments = pathname.split('/').filter(Boolean);
  const lastSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "";
  const formattedSegment = lastSegment
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return (
    <h1
      className="text-xl font-bold"
      style={{
        fontFamily: "var(--typography-heading-fontFamily, inherit)",
        color: "var(--typography-heading-color, var(--primary, #222))",
        fontWeight: "var(--typography-heading-fontWeight, 700)",
        fontSize: "var(--typography-heading-fontSize, 1.25rem)"
      }}
    >
      {formattedSegment ? `${formattedSegment} - Panel de Administración` : "Panel de Administración"}
    </h1>
  );
}

import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/global");
        const json = await res.json();
        const id = json?.adminPanelThemePresetId;
        let style: React.CSSProperties = {};
        if (id) {
          const tc = await import("@/lib/admin-themeUtils").then(m =>
            m.getAdminThemePresetConfigById(id)
          );
          if (tc && tc.background && tc.background.type === "image") {
            style = {
              backgroundImage: `url(/images/backgrounds/main-${id}.img)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            };
          } else {
            // color o gradiente del tema
            style = {
              background: "var(--background)"
            };
          }
        }
        setBgStyle(style);
      } catch {
        setBgStyle({});
      }
    })();
  }, []);

  return (
    <AdminThemeProvider>
      <div
        className="min-h-screen flex admin-app-bg"
        style={bgStyle}
      >
        {/* Navegación lateral */}
        <AdminSidebar />
        {/* Contenido principal */}
        <main
          className="flex-1 flex flex-col"
          style={{
            padding: "var(--spacing-padding, 0)",
            margin: "var(--spacing-margin, 0)",
            background: "transparent"
          }}
        >
          {/* Cabecera con título dinámico */}
          <header
            className="bg-[var(--card)] shadow flex items-center justify-between border-b border-[var(--border)]"
            style={{
              padding: "var(--spacing-padding, 1.5rem 2rem)",
              margin: "var(--spacing-margin, 0)"
            }}
          >
            <DynamicPageTitle pathname={pathname} />
            <AdminHeaderClient />
          </header>
          <section
            className="flex-1 overflow-auto"
            style={{
              padding: "var(--spacing-padding, 0)",
              margin: "var(--spacing-margin, 0)",
              background: "transparent"
            }}
          >
            {children}
          </section>
        </main>
      </div>
    </AdminThemeProvider>
  );
}
