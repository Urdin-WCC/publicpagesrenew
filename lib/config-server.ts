import { prisma } from './prisma';
import type { GlobalConfig } from '@prisma/client';

// Interfaz para la configuración específica del blog (debe coincidir con la API y el formulario)
export interface BlogConfig {
  postsPerPage: number;
  allowComments: boolean;
  showAuthorName: boolean;
  showPublishDate: boolean;
  relatedPostsEnabled: boolean;
  relatedPostsCount: number;
  // Nuevas opciones
  listDisplayMode: 'grid' | 'list'; // Modo de visualización del listado de posts
  showSidebarInList: boolean;      // Mostrar barra lateral en el listado de posts
  showSidebarInPost: boolean;      // Mostrar barra lateral en el post individual
}

// Valores por defecto para la configuración del blog
export const defaultBlogConfig: BlogConfig = {
  postsPerPage: 10,
  allowComments: false,
  showAuthorName: true,
  showPublishDate: true,
  relatedPostsEnabled: true,
  relatedPostsCount: 3,
  // Valores por defecto para las nuevas opciones
  listDisplayMode: 'grid',
  showSidebarInList: true,
  showSidebarInPost: true,
};

// Ya no necesitamos extender GlobalConfig, usamos el tipo directamente de Prisma

/**
 * Obtiene la configuración global del sitio (Server-Side Only).
 * @returns {Promise<GlobalConfig | null>} Objeto con la configuración global.
 */
export async function getGlobalConfig(): Promise<GlobalConfig | null> {
  const config = await prisma.globalConfig.findUnique({
    where: { id: 'global' }
  });
  // Prisma devuelve el tipo correcto, incluyendo campos Json?
  return config;
}

/**
 * Obtiene la configuración específica del blog combinada con los valores por defecto (Server-Side Only).
 * @returns {Promise<BlogConfig>} Objeto con la configuración completa del blog.
 */
export async function getBlogConfig(): Promise<BlogConfig> {
  const globalConfig = await getGlobalConfig();
  // Acceder a blogConfig (puede ser null o JsonValue) y castear de forma segura
  const savedBlogConfig = (globalConfig?.blogConfig as Partial<BlogConfig>) || {};

  // Combinar configuración guardada con valores por defecto
  const currentConfig = {
    ...defaultBlogConfig,
    ...savedBlogConfig,
  };

  return currentConfig;
}

/**
 * Actualiza la configuración global del sitio (Server-Side Only).
 * @param {Partial<GlobalConfig>} data - Campos a actualizar (usando el tipo base de Prisma).
 * @returns {Promise<GlobalConfig>} Objeto actualizado de configuración global.
 */
export async function updateGlobalConfig(data: Partial<GlobalConfig>): Promise<GlobalConfig> {
  // Usar upsert para manejar el caso de que 'global' no exista
  const updated = await prisma.globalConfig.upsert({
      where: { id: 'global' },
      update: data,
      create: {
          id: 'global',
          // Proporcionar valores por defecto para campos requeridos si 'data' no los incluye
          siteName: data.siteName ?? 'Neurowitch', // Ejemplo si siteName fuera requerido
          siteUrl: data.siteUrl ?? 'http://localhost:3000', // Ejemplo
          maintenanceMode: data.maintenanceMode ?? false, // Ejemplo
          ...data, // Incluir los datos proporcionados al crear
      },
  });
  return updated; // Prisma devuelve el tipo correcto
}