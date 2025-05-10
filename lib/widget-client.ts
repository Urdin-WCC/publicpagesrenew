/**
 * Widget type enum polyfill para cliente
 * 
 * Este archivo contiene una versión segura del enum Widget_type para su uso en componentes
 * del lado del cliente. Esto evita los problemas relacionados con la importación directa
 * de enums de Prisma en archivos que se ejecutan en el navegador.
 */

export const WidgetType = {
  LATEST_POSTS: 'LATEST_POSTS',
  LATEST_PROJECTS: 'LATEST_PROJECTS',
  SEARCH: 'SEARCH',
  CATEGORIES: 'CATEGORIES',
  TAGS: 'TAGS',
  SOCIAL_LINKS: 'SOCIAL_LINKS',
  TEXT: 'TEXT',
  NEWSLETTER: 'NEWSLETTER',
  RECENT_COMMENTS: 'RECENT_COMMENTS'
} as const;

/**
 * Tipo TypeScript para WidgetType
 */
export type WidgetType = typeof WidgetType[keyof typeof WidgetType];
