import { prisma } from './prisma';
import type { GlobalConfig } from '@prisma/client'; // Usar el tipo generado por Prisma

// Extender el tipo GlobalConfig si es necesario añadir campos no mapeados directamente
// (Aunque los campos JSON deberían ser manejados por Prisma)
export interface GlobalConfigWithCustomFields extends GlobalConfig {
  header?: any;
  footer?: any;
  sidebar?: any;
  social?: any;
  sharing?: any;
}

/**
 * Obtiene la configuración global del sitio (Server-Side Only).
 * @returns {Promise<GlobalConfigWithCustomFields | null>} Objeto con la configuración global.
 */
export async function getGlobalConfig(): Promise<GlobalConfigWithCustomFields | null> {
  const config = await prisma.globalConfig.findUnique({
    where: { id: 'global' }
  });
  // Prisma debería devolver los campos JSON correctamente, pero casteamos por si acaso
  return config as GlobalConfigWithCustomFields | null;
}

/**
 * Actualiza la configuración global del sitio (Server-Side Only).
 * @param {Partial<GlobalConfigWithCustomFields>} data - Campos a actualizar.
 * @returns {Promise<GlobalConfigWithCustomFields>} Objeto actualizado de configuración global.
 */
export async function updateGlobalConfig(data: Partial<GlobalConfigWithCustomFields>): Promise<GlobalConfigWithCustomFields> {
  const updated = await prisma.globalConfig.update({
    where: { id: 'global' },
    // Asegurarse de que los datos JSON se pasen correctamente
    data: data,
  });
  return updated as GlobalConfigWithCustomFields;
}