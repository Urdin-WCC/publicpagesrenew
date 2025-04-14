/**
 * Translation system for the Neurowitch application
 *
 * This file contains all the translations for the application in Spanish.
 * All user-facing text should be referenced from here to facilitate
 * future internationalization.
 */

// Spanish translations
export const translations = {
  "common": {
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "create": "Crear",
    "back": "Volver",
    "next": "Siguiente",
    "previous": "Anterior",
    "search": "Buscar",
    "filter": "Filtrar",
    "sort": "Ordenar",
    "view": "Ver",
    "download": "Descargar",
    "upload": "Subir",
    "yes": "Sí",
    "no": "No",
    "confirm": "Confirmar",
<<<<<<< HEAD
    "actions": "Acciones", // Añadir coma faltante
    "appName": "Neurowitch", // Añadir coma faltante
    "maintenanceModeTitle": "Sitio en Mantenimiento",
    "maintenanceModeText": "Estamos realizando tareas de mantenimiento. Volveremos pronto.",
=======
    "actions": "Acciones"
>>>>>>> feature/modulo4
  },
  "auth": {
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "contactAdmin": "Contacta con el administrador del sistema",
    "loggingIn": "Iniciando sesión...",
    "invalidCredentials": "Credenciales inválidas. Por favor, inténtalo de nuevo.",
    "loginError": "Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.",
    "rateLimitExceeded": "Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo después de {0} minutos.",
    "unauthorized": "No tienes permiso para acceder a esta página.",
    "sessionExpired": "Tu sesión ha expirado. Por favor, inicia sesión de nuevo."
  },
  "admin": {
    "dashboard": "Panel de Administración",
    "welcome": "Bienvenido, {0}",
    "loggedInAs": "Has iniciado sesión como: {0}",
    "viewWebsite": "Ver sitio web",
    "profile": "Mi Perfil",
    "settings": "Configuración",
    "role": "Rol: {0}",

    "blog": "Blog",
    "blogDescription": "Gestiona artículos y categorías del blog",
    "portfolio": "Portfolio",
    "portfolioDescription": "Gestiona proyectos y categorías del portfolio",
    "pages": "Páginas",
    "pagesDescription": "Gestiona páginas estáticas del sitio",
    "seo": "SEO",
    "seoDescription": "Configura metadatos, sitemap y robots.txt",
    "theme": "Tema",
    "themeDescription": "Personaliza la apariencia del sitio",
<<<<<<< HEAD
    "switchToLight": "Cambiar a tema claro",
    "switchToDark": "Cambiar a tema oscuro",
=======
>>>>>>> feature/modulo4
    "users": "Usuarios",
    "usersDescription": "Gestiona usuarios y permisos",
    "files": "Archivos",
    "filesDescription": "Gestiona archivos y medios",
    "settingsModule": "Configuración",
    "settingsDescription": "Configura opciones generales del sitio",
    "stats": "Estadísticas",
    "statsDescription": "Visualiza estadísticas y análisis del sitio",
    "maintenance": "Mantenimiento",
    "maintenanceDescription": "Realiza tareas de mantenimiento del sitio"
  },
  "public": {
    "home": "Inicio",
    "blogPublic": "Blog",
    "portfolioPublic": "Portfolio",
    "contact": "Contacto",
    "about": "Acerca de",
    "services": "Servicios",
    "readMore": "Leer más",
    "viewProject": "Ver proyecto",
    "categories": "Categorías",
    "tags": "Etiquetas",
    "recentPosts": "Publicaciones recientes",
    "relatedPosts": "Publicaciones relacionadas",
    "postedOn": "Publicado el {0}",
    "by": "por",
    "in": "en",
    "comments": "Comentarios",
    "noResults": "No se encontraron resultados",
    "searchResults": "Resultados de búsqueda para \"{0}\""
  },
  "imageUploader": {
    "dropImage": "Arrastra y suelta una imagen aquí, o haz clic para seleccionar",
    "dropImageActive": "Suelta la imagen aquí...",
    "allowedFormats": "Formatos permitidos: JPG, PNG, GIF, WEBP, SVG, ICO (máx. {0}MB)",
    "uploading": "Subiendo imagen...",
    "uploadError": "Error al subir la imagen. Por favor, inténtalo de nuevo.",
    "fileTooLarge": "El archivo es demasiado grande. El tamaño máximo es {0}MB.",
    "invalidFileType": "Tipo de archivo no válido. Solo se permiten JPG, PNG, GIF, WEBP, SVG e ICO."
  },
  "htmlEditor": {
    "placeholder": "Escribe aquí..."
  },
  "errorPages": {
    "notFound": "Página no encontrada",
    "notFoundDescription": "La página que estás buscando no existe.",
    "goHome": "Ir a la página principal",
    "accessDenied": "Acceso Denegado",
    "accessDeniedDescription": "No tienes permisos suficientes para acceder a esta página.",
    "goToDashboard": "Volver al Dashboard",
    "serverError": "Error del Servidor",
    "serverErrorDescription": "Ha ocurrido un error en el servidor. Por favor, inténtalo de nuevo más tarde."
  },
  "notifications": {
    "saveSuccess": "Guardado correctamente",
    "saveError": "Error al guardar",
    "deleteSuccess": "Eliminado correctamente",
    "deleteError": "Error al eliminar",
    "createSuccess": "Creado correctamente",
    "createError": "Error al crear",
    "updateSuccess": "Actualizado correctamente",
    "updateError": "Error al actualizar",
    "confirmDelete": "¿Estás seguro de que deseas eliminar esto? Esta acción no se puede deshacer."
  }
};
<<<<<<< HEAD
=======

/**
 * Interface for translation options
 */
export interface TranslationOptions {
  /**
   * Parameters to replace in the translation string
   * For example, if the translation is "Hello, {0}", and params is ["World"],
   * the result will be "Hello, World"
   */
  params?: (string | number)[];
}

/**
 * Get a translation by key
 *
 * @param group - The translation group (e.g., 'common', 'auth')
 * @param key - The translation key
 * @param options - Translation options (e.g., parameters to replace)
 * @returns The translated string, or the key if the translation is not found
 *
 * @example
 * ```ts
 * // Get a simple translation
 * const text = t('common', 'save'); // "Guardar"
 *
 * // Get a translation with parameters
 * const text = t('admin', 'welcome', { params: ['John'] }); // "Bienvenido, John"
 * ```
 */
export function t(group: string, key: string, options?: TranslationOptions): string {
  // Get the translation
  const groupTranslations = translations[group as keyof typeof translations] || {};
  let translation = groupTranslations[key as keyof typeof groupTranslations] || `${group}.${key}`;

  // Replace parameters if provided
  if (options?.params) {
    options.params.forEach((param, index) => {
      translation = translation.replace(`{${index}}`, String(param));
    });
  }

  return translation;
}

/**
 * Create a translator for a specific group
 *
 * @param group - The translation group (e.g., 'common', 'auth')
 * @returns A function that gets translations from the specified group
 *
 * @example
 * ```ts
 * const tCommon = createTranslator('common');
 * const text = tCommon('save'); // "Guardar"
 * ```
 */
export function createTranslator(group: string) {
  return (key: string, options?: TranslationOptions) => t(group, key, options);
}
>>>>>>> feature/modulo4
