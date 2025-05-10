"use client";

import React, { useEffect, useState } from "react";
import { getAdminThemePresetConfigById, generateAdminCssFromThemeConfigs } from "@/lib/admin-themeUtils";
import useSWR from "swr";

// Hook para obtener la configuración global (simplificado)
async function fetchGlobalConfig() {
  const res = await fetch("/api/settings/global"); // endpoint más habitual
  if (!res.ok) throw new Error("No se pudo cargar configuración global");
  return res.json();
}

export default function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [adminThemeId, setAdminThemeId] = useState<number | null>(null);
  const [themeVars, setThemeVars] = useState<string>("");

  // Cargar el themeId del admin desde la config global
  useEffect(() => {
    let isMounted = true;
    fetchGlobalConfig()
      .then(config => {
        if (isMounted) {
          setAdminThemeId(config.adminPanelThemePresetId || null);
        }
      })
      .catch(() => setAdminThemeId(null));
    return () => { isMounted = false; };
  }, []);

  // Cargar preset y generar CSS
  useEffect(() => {
    let cancelled = false;
    if (adminThemeId) {
      console.log(`AdminThemeProvider: Cargando preset con ID ${adminThemeId}`); 
      getAdminThemePresetConfigById(adminThemeId).then(config => {
        console.log('AdminThemeProvider: Config recibida', config);
        if (config && !cancelled) {
          const css = generateAdminCssFromThemeConfigs(config, config, ":root");
          console.log('AdminThemeProvider: CSS generado', css.substring(0, 200) + '...');
          setThemeVars(css);
        } else {
          console.warn('AdminThemeProvider: Config vacía o request cancelada');
        }
      }).catch(error => {
        console.error('AdminThemeProvider: Error al cargar tema', error);
      });
    } else {
      console.warn('AdminThemeProvider: No hay adminThemeId configurado');
    }
    return () => { cancelled = true; };
  }, [adminThemeId]);

  // Inyectar CSS generado como bloque <style> global solo para la parte admin
  return (
    <div className="admin-theme-container">
      {/* Depuración */}
      <div style={{display: 'none'}}>
        AdminThemeProvider activo: ID={adminThemeId || 'none'}
      </div>
      
      {/* Variables generadas dinámicamente */}
      {themeVars ? (
        <style id="admin-theme-vars" dangerouslySetInnerHTML={{ __html: themeVars }} />
      ) : (
        <style id="admin-theme-fallback">{`
          /* Fallback admin theme variables */
          :root {
            --background: #f8f9fa;
            --foreground: #212529;
            --card: #ffffff;
            --card-foreground: #212529;
            --primary: #007bff;
            --primary-foreground: #ffffff;
            --border: #dee2e6;
          }
        `}</style>
      )}
      
      {children}
    </div>
  );
}
