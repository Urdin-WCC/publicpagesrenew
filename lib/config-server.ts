import { prisma } from './prisma';
import type { GlobalConfig as PrismaGlobalConfig } from '@prisma/client';

// Extendemos el tipo GlobalConfig para incluir los campos personalizados
export interface GlobalConfig extends PrismaGlobalConfig {
  defaultLightThemePresetId?: number | null;
  defaultDarkThemePresetId?: number | null;
  themeAssignments?: string | null | Record<string, any>;
  loadingSpinnerConfig?: string | null | Record<string, any>;
  themeSwitcherConfig?: string | null | Record<string, any>;
  stickyElementsConfig?: string | null | Record<string, any>;
}

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

// Interfaz para la configuración específica del portfolio
export interface PortfolioConfig {
  projectsPerPage: number;
  defaultDisplayType: string;
  showSidebarInList: boolean;
  showSidebarInProject: boolean;
  layoutMode: 'grid' | 'list';
}

// Valores por defecto para la configuración del portfolio
export const defaultPortfolioConfig: PortfolioConfig = {
  projectsPerPage: 12,
  defaultDisplayType: 'GALLERY',
  showSidebarInList: true,
  showSidebarInProject: true,
  layoutMode: 'grid',
};

// Ya no necesitamos extender GlobalConfig, usamos el tipo directamente de Prisma

/**
 * Obtiene la configuración global del sitio (Server-Side Only).
 * @returns {Promise<GlobalConfig | null>} Objeto con la configuración global.
 */
export async function getGlobalConfig(): Promise<GlobalConfig | null> {
  try {
    // Intentar una consulta básica que solo incluya columnas que sabemos que existen
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          id, siteName, siteUrl, logoUrl, faviconUrl, themeColor
        FROM GlobalConfig 
        WHERE id = 'global'
      `;
      
      if (!Array.isArray(result) || result.length === 0) {
        console.log("No se encontró configuración global");
        return null;
      }
      
      // Si tenemos las columnas básicas, intentamos obtener también las columnas de apariencia
      const config = result[0] as GlobalConfig;
      
      try {
        // Intentar obtener las columnas de temas separadamente
        const themeResult = await prisma.$queryRaw`
          SELECT 
            defaultLightThemePresetId, defaultDarkThemePresetId,
            themeAssignments, loadingSpinnerConfig, 
            themeSwitcherConfig, stickyElementsConfig
          FROM GlobalConfig 
          WHERE id = 'global'
        `;
        
        if (Array.isArray(themeResult) && themeResult.length > 0) {
          // Combinar con el resultado básico
          Object.assign(config, themeResult[0]);
        }
      } catch (themeError) {
        console.log("No se pudieron obtener campos de temas:", themeError);
        // No fallamos completamente, seguimos con lo que tenemos
      }
      
      return config;
    } catch (mainError) {
      console.error("Error en consulta principal:", mainError);
      
      // Último recurso: intentar con la consulta más básica posible
      try {
        const existence = await prisma.$queryRaw`SELECT id FROM GlobalConfig WHERE id = 'global'`;
        
        if (Array.isArray(existence) && existence.length > 0) {
          // Al menos sabemos que el registro existe
          console.log("Configuración global existe pero no se pueden leer todos los campos");
          return { id: 'global' } as GlobalConfig;
        }
      } catch (finalError) {
        console.error("Error en consulta final:", finalError);
      }
      
      return null;
    }
  } catch (error) {
    console.error("Error fetching global config:", error);
    return null;
  }
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
 * Obtiene la configuración específica del portfolio combinada con los valores por defecto (Server-Side Only).
 * @returns {Promise<PortfolioConfig>} Objeto con la configuración completa del portfolio.
 */
export async function getPortfolioConfig(): Promise<PortfolioConfig> {
  const globalConfig = await getGlobalConfig();
  
  // Intentar extraer la configuración de portfolio desde blogConfig
  let savedPortfolioConfig: Partial<PortfolioConfig> = {};
  
  if (globalConfig?.blogConfig) {
    try {
      // Parsear blogConfig que es un string JSON
      const blogConfig = typeof globalConfig.blogConfig === 'string' 
        ? JSON.parse(globalConfig.blogConfig) 
        : globalConfig.blogConfig;
      
      // Acceder a la propiedad portfolio dentro de blogConfig
      if (blogConfig && blogConfig.portfolio) {
        savedPortfolioConfig = blogConfig.portfolio;
      }
    } catch (error) {
      console.error('Error parsing portfolio config from blogConfig:', error);
    }
  }

  // Combinar configuración guardada con valores por defecto
  const currentConfig = {
    ...defaultPortfolioConfig,
    ...savedPortfolioConfig,
  };

  return currentConfig;
}

/**
 * Actualiza la configuración global del sitio (Server-Side Only).
 * @param {Partial<GlobalConfig>} data - Campos a actualizar (usando el tipo base de Prisma).
 * @returns {Promise<GlobalConfig>} Objeto actualizado de configuración global.
 */
export async function updateGlobalConfig(data: any): Promise<any> {
  try {
    // Verificamos si el registro 'global' existe
    // Usamos una variable let para poder intentar diferentes enfoques si uno falla
    let exists = false;
    
    try {
      // Primer intento: try/catch con la aproximación más directa
      const checkResult = await prisma.globalConfig.findUnique({
        where: { id: 'global' },
        select: { id: true }
      });
      
      exists = !!checkResult;
      console.log(`Verificación de existencia con findUnique: ${exists ? 'Existe' : 'No existe'}`);
    } catch (checkError) {
      console.log('Error al verificar con findUnique, intentando fallback...');
      
      try {
        // Fallback: consulta SQL que solo requiere operación COUNT que es más simple
        const result = await prisma.$executeRawUnsafe(
          `SELECT COUNT(*) as count FROM GlobalConfig WHERE id = 'global'`
        );
        
        // El resultado podría variar según la base de datos, pero normalmente devuelve un número
        exists = typeof result === 'number' ? result > 0 : false;
        console.log(`Verificación de existencia con SQL COUNT: ${exists ? 'Existe' : 'No existe'}`);
      } catch (fallbackError) {
        console.error('Error en verificación fallback:', fallbackError);
        // Si todo falla, asumimos que no existe para intentar crear uno nuevo
        exists = false;
      }
    }
    
    // Preparar los datos para la actualización, manejando objetos JSON
    const preparedData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id') { // No permitimos actualizar el ID
        // Convertimos objetos y arreglos a JSON strings
        if (typeof value === 'object' && value !== null) {
          preparedData[key] = JSON.stringify(value);
        } else {
          preparedData[key] = value;
        }
      }
    });
    
    if (exists) {
      // Si existe, actualizamos los campos proporcionados
      console.log("Encontrada configuración global, actualizando...");
      
      // Construir la consulta UPDATE
      let setClause = '';
      const updateParams: any[] = [];
      
      Object.entries(preparedData).forEach(([key, value], index) => {
        if (index > 0) setClause += ', ';
        setClause += `${key} = ?`;
        updateParams.push(value);
      });
      
      // Solo ejecutar si hay campos para actualizar
      if (setClause && updateParams.length > 0) {
        try {
          await prisma.$executeRawUnsafe(
            `UPDATE GlobalConfig SET ${setClause} WHERE id = 'global'`,
            ...updateParams
          );
          console.log("Configuración global actualizada exitosamente");
        } catch (updateError) {
          console.error("Error actualizando configuración global:", updateError);
          throw updateError;
        }
      }
    } else {
      // Si no existe, creamos una nueva entrada con valores predeterminados
      console.log("La configuración global no existe, creando nueva entrada");
      
      try {
        // Definir valores por defecto
        const defaultValues = {
          id: 'global',
          siteName: 'Neurowitch',
          siteUrl: 'http://localhost:3000',
          maintenanceMode: false,
          themeAssignments: '{}',
          loadingSpinnerConfig: '{}',
          themeSwitcherConfig: '{}',
          stickyElementsConfig: '{}'
        };
        
        // Combinar con los datos proporcionados
        const finalData = { ...defaultValues, ...preparedData };
        
        // Usar Prisma Client directamente para mayor seguridad
        await prisma.globalConfig.upsert({
          where: { id: 'global' },
          update: preparedData,
          create: finalData
        });
        
        console.log("Configuración global creada exitosamente");
      } catch (createError) {
        console.error("Error creando configuración global:", createError);
        throw createError;
      }
    }
    
    // Intentar obtener la configuración actualizada
    try {
      return await getGlobalConfig();
    } catch (getError) {
      console.error("Error obteniendo configuración actualizada:", getError);
      // Devolver un objeto básico para evitar errores adicionales
      return { id: 'global', ...preparedData };
    }
  } catch (error) {
    console.error("Error updating global config:", error);
    throw error;
  }
}
