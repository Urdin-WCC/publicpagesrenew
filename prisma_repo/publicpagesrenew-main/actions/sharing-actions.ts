"use server"; // Marcar como Server Actions

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';

/**
 * Nueva interfaz para SocialConfig (v2)
 * - textBefore: texto antes de los iconos
 * - iconSize: tamaño global de iconos
 * - icons: array de objetos SocialIcon v2 (name, url, svgLight, svgDark)
 */
export interface SocialIcon {
  name: string;
  url: string;
  svgLight: string; // url SVG en modo claro (local o externo)
  svgDark: string;  // url SVG en modo oscuro (local o externo)
  openInNewTab?: boolean;
}
export interface SocialConfig {
  textBefore?: string;
  iconSize?: string;
  icons: SocialIcon[];
}

const DEFAULT_SOCIAL_CONFIG: SocialConfig = {
  textBefore: "",
  iconSize: "20px",
  icons: [
    { name: "Facebook", url: "https://facebook.com/", svgLight: "Facebook.svg", svgDark: "Facebook_black.svg", openInNewTab: true },
    { name: "Twitter", url: "https://twitter.com/", svgLight: "Twitter.svg", svgDark: "Twitter_black.svg", openInNewTab: true },
    { name: "Instagram", url: "https://instagram.com/", svgLight: "Instagram.svg", svgDark: "Instagram_black.svg", openInNewTab: true }
  ]
};

/**
 * Obtiene la configuración de SocialConfig v2 directamente de la base de datos
 */
export async function fetchSocialConfig(): Promise<SocialConfig> {
  try {
    // Consulta SQL directa para obtener solo el campo social
    const result = await prisma.$queryRaw`
      SELECT sharing
      FROM GlobalConfig
      WHERE id = 'global'
    `;
    if (!result || !Array.isArray(result) || result.length === 0) {
      return DEFAULT_SOCIAL_CONFIG;
    }
    const sharingRaw = result[0].sharing;
    if (!sharingRaw) {
      return DEFAULT_SOCIAL_CONFIG;
    }
    try {
      const config = typeof sharingRaw === "string" ? JSON.parse(sharingRaw) : sharingRaw;
      if (Array.isArray(config.links) && !config.icons) {
        return {
          textBefore: "",
          iconSize: "20px",
          icons: config.links.map((l: any) => ({
            name: l.name,
            url: l.url,
            svgLight: l.icon ?? "",
            svgDark: l.icon ?? ""
          }))
        };
      }
      if (Array.isArray(config.icons)) {
        return {
          textBefore: config.textBefore ?? "",
          iconSize: config.iconSize ?? "20px",
          icons: config.icons
        };
      }
      return DEFAULT_SOCIAL_CONFIG;
    } catch (e) {
      return DEFAULT_SOCIAL_CONFIG;
    }
  } catch {
    return DEFAULT_SOCIAL_CONFIG;
  }
}

/**
 * Guarda la configuración v2 de redes sociales en la base de datos
 */
export async function saveSocialConfig(socialConfig: SocialConfig) {
  try {
    // Convertir a JSON string
    const socialJSON = JSON.stringify(socialConfig);
    // Actualizar directamente en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET sharing = ?
      WHERE id = 'global'
    `, socialJSON);
    revalidatePath("/");
    revalidatePath("/admin/settings/sharing");
    return { success: true, message: "Configuración de botones de compartir actualizada." };
  } catch (error) {
    return {
      success: false,
      message: "Error al guardar la configuración: " +
        (error instanceof Error ? error.message : String(error))
    };
  }
}
