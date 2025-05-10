"use client";
import { useSession } from "next-auth/react";
import { signOut } from "@/lib/auth-client"; // Importar signOut desde el archivo cliente
import Link from "next/link";
import { LogOut, Home, User } from "lucide-react";

import { useEffect, useState } from "react";
import { getAdminThemePresetConfigById, generateAdminCssFromThemeConfigs } from "@/lib/admin-themeUtils";

export default function AdminHeaderClient() {
  const { data: session, status } = useSession();

  // NUEVO: theme-css local sólo para el header
  const [themeCss, setThemeCss] = useState("");
  useEffect(() => {
    // Intenta obtener el id del tema admin desde window/global, o pide a /api/settings/global
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
          setThemeCss(generateAdminCssFromThemeConfigs(config, config, ".admin-header"));
        }
      }
    })();
  }, []);

  return (
    <div className="admin-header flex items-center gap-4" style={{ fontFamily: "var(--heading-font, inherit)" }}>
      {themeCss && <style>{themeCss}</style>}
      <Link
        href="/"
        className="flex items-center gap-1 transition"
        style={{
          fontFamily: "var(--typography-link-fontFamily, inherit)",
          color: "var(--typography-link-color, var(--primary, #006))",
          fontWeight: "var(--typography-link-fontWeight, 500)",
          fontSize: "var(--typography-link-fontSize, 1rem)"
        }}
        title="Ir a la página pública"
      >
        <Home className="w-5 h-5" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>
      <div
        className="flex items-center gap-1 px-3 py-1 rounded"
        style={{
          fontFamily: "var(--typography-paragraph-fontFamily, inherit)",
          color: "var(--typography-paragraph-color, var(--muted-foreground, #666))",
          fontWeight: "var(--typography-paragraph-fontWeight, 400)",
          fontSize: "var(--typography-paragraph-fontSize, 1rem)",
          background: "var(--input, #eee)"
        }}
      >
        <User className="w-4 h-4" />
        <span className="font-medium">
          {/* Mostrar estado de carga o nombre */}
          {status === 'loading' ? 'Cargando...' : (session?.user?.name || 'Usuario')}
        </span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-1 px-3 py-1 rounded transition"
        style={{
          fontFamily: "var(--typography-button-fontFamily, inherit)",
          color: "var(--typography-button-color, var(--accent-foreground, #a00))",
          background: "var(--accent, #ffe0e0)",
          fontWeight: "var(--typography-button-fontWeight, 500)",
          fontSize: "var(--typography-button-fontSize, 1rem)"
        }}
        title="Cerrar sesión"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
}
