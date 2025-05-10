/**
 * Section type enum polyfill para cliente
 * 
 * Este archivo contiene una versión segura del enum SectionType para su uso en componentes
 * del lado del cliente. Esto evita los problemas relacionados con la importación directa
 * de enums de Prisma en archivos que se ejecutan en el navegador.
 */

export const SectionType = {
  HEADER: 'HEADER',
  FOOTER: 'FOOTER',
  SIDEBAR: 'SIDEBAR'
} as const;

/**
 * Tipo TypeScript para SectionType
 */
export type SectionType = typeof SectionType[keyof typeof SectionType];
