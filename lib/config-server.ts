import { prisma } from './prisma';
import { getGlobalConfig as getGlobalConfigRobust } from './config';
import { Prisma } from '@prisma/client';

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

// Definimos un nuevo tipo que no dependa de Prisma, pero que incluya todos los campos necesarios
export interface GlobalConfig {
  id: string;
  siteName: string;
  siteUrl: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  themeColor?: string | null;
  header?: string | null | JsonValue;
  footer?: string | null | JsonValue;
  sidebar?: string | null | JsonValue;
  social?: string | null | JsonValue;
  sharing: string | JsonValue;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
  blogConfig?: JsonValue;
  portfolioConfig?: JsonValue;
  defaultLightThemePresetId?: number | null;
  defaultDarkThemePresetId?: number | null;
  themeAssignments?: string | JsonValue;
  loadingSpinnerConfig?: string | JsonValue;
  themeSwitcherConfig?: string | JsonValue;
  stickyElementsConfig?: string | JsonValue;
  navigationMenu?: string | JsonValue;
  developerHtmlContent?: string | null;
  // Añadir otros campos según sea necesario
}

// Tipo para uso en Server Actions
export interface GlobalConfigWithCustomFields extends Partial<GlobalConfig> {
  // Cualquier tipo personalizado puede ir aquí
}

// Interfaz para la configuración específica del blog (debe coincidir con la API y el formulario)
export interface BlogConfig {
  postsPerPage: number;
  allowComments: boolean;
  showAuthorName: boolean; // Ahora usa pseudónimo si está presente, y nombre real solo si no existe pseudónimo
  showPublishDate: boolean;
  relatedPostsEnabled: boolean;
  relatedPostsCount: number;
  // Nuevas opciones
  listDisplayMode: 'grid' | 'list'; // Modo de visualización del listado de posts
  showSidebarInList: boolean;
  showSidebarInPost: boolean;
  sidebarPositionInList: 'left' | 'right';    // Lado barra listado
  sidebarPositionInPost: 'left' | 'right';    // Lado barra en publicación individual
  showSharingInPost: boolean;                 // Mostrar botones de compartir en post individual
}

// Valores por defecto para la configuración del blog
export const defaultBlogConfig: BlogConfig = {
  postsPerPage: 10,
  allowComments: false,
  showAuthorName: true,
  showPublishDate: true,
  relatedPostsEnabled: true,
  relatedPostsCount: 3,
  listDisplayMode: 'grid',
  showSidebarInList: true,
  showSidebarInPost: true,
  sidebarPositionInList: 'right',
  sidebarPositionInPost: 'right',
  showSharingInPost: true,
};

// Interfaz para la configuración específica del portfolio
export interface PortfolioConfig {
  projectsPerPage: number;
  defaultDisplayType: string;
  showSidebarInList: boolean;
  showSidebarInProject: boolean;
  sidebarPositionInList: 'left' | 'right';
  sidebarPositionInProject: 'left' | 'right';
  showSharingInProject: boolean;
  layoutMode: 'grid' | 'list';
}

// Valores por defecto para la configuración del portfolio
export const defaultPortfolioConfig: PortfolioConfig = {
  projectsPerPage: 12,
  defaultDisplayType: 'GALLERY',
  showSidebarInList: true,
  showSidebarInProject: true,
  sidebarPositionInList: 'right',
  sidebarPositionInProject: 'right',
  showSharingInProject: true,
  layoutMode: 'grid',
};

// Ya no necesitamos extender GlobalConfig, usamos el tipo directamente de Prisma

/**
 * Obtiene la configuración global del sitio (Server-Side Only).
 * @returns {Promise<GlobalConfig | null>} Objeto con la configuración global.
 */
export async function getGlobalConfig(): Promise<GlobalConfig | null> {
  try {
    console.log("🔍 Iniciando getGlobalConfig - Buscando configuración global...");
    
    // Ahora que tenemos un schema de Prisma completo, podemos usar findUnique directamente
    const config = await prisma.globalConfig.findUnique({
      where: { id: 'global' }
    });
    
    if (!config) {
      console.log("❌ No se encontró configuración global");
      return null;
    }
    
    console.log("✅ Configuración global encontrada con id:", config.id);
    
    // Procesar campos JSON para convertirlos a objetos si son strings
    const processedConfig = { ...config } as Record<string, any>;
    
    // Campos que sabemos que pueden ser JSON
    const jsonFields = ['themeAssignments', 'loadingSpinnerConfig', 'themeSwitcherConfig', 
      'stickyElementsConfig', 'blogConfig', 'portfolioConfig', 'header', 'footer', 'sidebar', 
      'social', 'sharing', 'navigationMenu'];
    
    // Parsear campos JSON
    jsonFields.forEach(field => {
      if (typeof processedConfig[field] === 'string' && processedConfig[field]) {
        try {
          processedConfig[field] = JSON.parse(processedConfig[field]);
        } catch (e) {
          console.log(`Error parsing ${field}:`, e);
          // Mantener como string si no se puede parsear
        }
      }
    });
    
    return processedConfig as unknown as GlobalConfig;
  } catch (error) {
    console.error("Error fetching global config:", error);
    
    // Si hay un error específico de Prisma, mostrar más detalles
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Código de error: ${error.code}`);
      console.error(`Mensaje: ${error.message}`);
      console.error(`Metadatos: ${JSON.stringify(error.meta)}`);
    }
    
    return null;
  }
}

/**
 * Obtiene la configuración específica del blog combinada con los valores por defecto (Server-Side Only).
 * @returns {Promise<BlogConfig>} Objeto con la configuración completa del blog.
 */
export async function getBlogConfig(): Promise<BlogConfig> {
  try {
    // Usar la versión robusta de getGlobalConfig
    const globalConfig = await getGlobalConfigRobust();
    
    // Acceder a blogConfig (puede ser null o JsonValue) y castear de forma segura
    const savedBlogConfig = (globalConfig?.blogConfig as Partial<BlogConfig>) || {};

    // Combinar configuración guardada con valores por defecto
    const currentConfig = {
      ...defaultBlogConfig,
      ...savedBlogConfig,
    };

    return currentConfig;
  } catch (error) {
    console.error("Error fetching blog config:", error);
    // En caso de error, devolver la configuración por defecto
    return { ...defaultBlogConfig };
  }
}

/**
 * Obtiene la configuración específica del portfolio combinada con los valores por defecto (Server-Side Only).
 * @returns {Promise<PortfolioConfig>} Objeto con la configuración completa del portfolio.
 */
export async function getPortfolioConfig(): Promise<PortfolioConfig> {
  try {
    // Usar la versión robusta de getGlobalConfig
    const globalConfig = await getGlobalConfigRobust();
    
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
  } catch (error) {
    console.error("Error fetching portfolio config:", error);
    // En caso de error, devolver la configuración por defecto
    return { ...defaultPortfolioConfig };
  }
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
    
    console.log("🔍 updateGlobalConfig - Datos recibidos:", JSON.stringify(data, null, 2));
    
    // Preparar los datos para la actualización, manejando objetos JSON
    const preparedData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id') { // No permitimos actualizar el ID
        // Convertimos objetos y arreglos a JSON strings
        if (typeof value === 'object' && value !== null) {
          preparedData[key] = JSON.stringify(value);
          console.log(`📦 Campo '${key}' convertido a JSON string`);
        } else {
          preparedData[key] = value;
          console.log(`📦 Campo '${key}' mantenido como ${typeof value}`);
        }
      }
    });
    
    console.log("📋 updateGlobalConfig - Datos preparados:", JSON.stringify(preparedData, null, 2));
    
    if (exists) {
      // Si existe, actualizamos los campos proporcionados
      console.log("Encontrada configuración global, actualizando...");
      
      // Ahora que tenemos un schema de Prisma actualizado, podemos usar el cliente Prisma directamente
      try {
        // Añadir timestamp de actualización
        preparedData.updatedAt = new Date();
        
        try {
          // Intentar usar Prisma Client directo primero
          await prisma.globalConfig.update({
            where: { id: 'global' },
            data: preparedData
          });
          
          console.log("Configuración global actualizada exitosamente con Prisma Client");
        } catch (prismaUpdateError) {
          console.error("Error con Prisma Client, intentando con SQL directo:", prismaUpdateError);
          
          // Fallback: Usar SQL directo para actualizar los campos
          // Construir la consulta SQL dinámicamente
          const setClauses = Object.entries(preparedData)
            .map(([key, value]) => {
              // Escapar comillas simples para valores de cadena
              const escapedValue = typeof value === 'string' 
                ? value.replace(/'/g, "''")
                : value;
              
              // Formatear el valor para SQL
              const sqlValue = value === null 
                ? 'NULL'
                : typeof value === 'string' 
                  ? `'${escapedValue}'`
                  : typeof value === 'boolean'
                    ? value ? '1' : '0'
                    : value instanceof Date
                      ? `'${value.toISOString()}'`
                      : String(value);
              
              return `${key} = ${sqlValue}`;
            })
            .join(', ');
          
          // Ejecutar la consulta SQL
          if (setClauses) {
            await prisma.$executeRawUnsafe(
              `UPDATE GlobalConfig SET ${setClauses} WHERE id = 'global'`
            );
            console.log("Configuración global actualizada exitosamente con SQL directo");
          } else {
            console.log("No hay datos para actualizar");
          }
        }
      } catch (updateError) {
        console.error("Error actualizando configuración global:", updateError);
        
        // Si todavía hay problemas, mostramos más detalles para diagnóstico
        if (updateError instanceof Prisma.PrismaClientKnownRequestError) {
          console.error(`Código de error: ${updateError.code}`);
          console.error(`Mensaje: ${updateError.message}`);
          console.error(`Metadatos: ${JSON.stringify(updateError.meta)}`);
        }
        
        throw updateError;
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
