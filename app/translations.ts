/**
 * Translation system for the Neurowitch application
 *
 * This file contains all the translations for the application in Spanish.
 * All user-facing text should be referenced from here to facilitate
 * future internationalization, except the content editable by the user like posts, projects or static pages (text stored in the database).
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
    "actions": "Acciones",
    "appName": "Neurowitch",
    "maintenanceModeTitle": "Sitio en Mantenimiento",
    "maintenanceModeText": "Estamos realizando tareas de mantenimiento. Volveremos pronto.",
    "unknown": "Desconocido" // Añadido para traducciones faltantes
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
    "switchToLight": "Cambiar a tema claro",
    "switchToDark": "Cambiar a tema oscuro",
    "users": "Usuarios",
    "usersDescription": "Gestiona usuarios y permisos",
    "files": "Archivos",
    "filesDescription": "Gestiona archivos y medios",
    "settingsModule": "Configuración",
    "settingsDescription": "Configura opciones generales del sitio",
    "stats": "Estadísticas",
    "statsDescription": "Visualiza estadísticas y análisis del sitio",
    "maintenance": "Mantenimiento",
    "maintenanceDescription": "Realiza tareas de mantenimiento del sitio",

    // Traducciones específicas para la lista de posts del blog en admin
    "blogList": {
        "title": "Gestionar Posts del Blog",
        "newPostButton": "Nuevo Post",
        "searchPlaceholder": "Buscar posts por título o contenido...",
        "statusFilterPlaceholder": "Filtrar por estado",
        "statusAll": "Todos los Estados",
        "statusPublished": "Publicado",
        "statusDraft": "Borrador",
        "statusArchived": "Archivado",
        "tableTitle": "Título",
        "tableAuthor": "Autor",
        "tableStatus": "Estado",
        "tableCategories": "Categorías",
        "tableTags": "Etiquetas",
        "tableDate": "Fecha Creación",
        "tableActions": "Acciones",
        "editAction": "Editar post",
        "deleteAction": "Eliminar post",
        "deleteConfirm": "¿Estás seguro de que deseas eliminar el post", // Se completará con el título
        "deleteSuccess": "Post eliminado correctamente.",
        "deleteError": "Error al eliminar el post.",
        "fetchError": "Error al cargar los posts.",
        "genericError": "Ocurrió un error inesperado.",
        "noPostsFound": "No se encontraron posts.",
        "createError": "Error al crear el post." // Añadida clave faltante
    },
    // Traducciones para la página de gestión de taxonomías (categorías/etiquetas)
    "taxonomies": {
        "pageTitle": "Gestionar Taxonomías del Blog",
        "categoriesTitle": "Categorías",
        "tagsTitle": "Etiquetas",
        // Placeholder para futuras traducciones de CRUD
        "addCategory": "Añadir Categoría",
        "editCategory": "Editar Categoría",
        "deleteCategory": "Eliminar Categoría",
        "addTag": "Añadir Etiqueta",
        "editTag": "Editar Etiqueta",
        "deleteTag": "Eliminar Etiqueta",
        "nameLabel": "Nombre",
        "slugLabel": "Slug",
        "descriptionLabel": "Descripción",
        "confirmDeleteCategory": "¿Estás seguro de que deseas eliminar la categoría '{0}'?",
        "confirmDeleteTag": "¿Estás seguro de que deseas eliminar la etiqueta '{0}'?",
        "fetchError": "Error al cargar las taxonomías.",
        "saveSuccess": "Taxonomía guardada correctamente.",
        "saveError": "Error al guardar la taxonomía.",
        "deleteSuccess": "Taxonomía eliminada correctamente.",
        "deleteError": "Error al eliminar la taxonomía."
    }
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
    "searchResults": "Resultados de búsqueda para \"{0}\"",
    "postsInCategory": "Posts en la categoría:", // Nueva traducción
    "category": "Categoría", // Nueva traducción
    "tag": "Etiqueta", // Añadir también para la página de etiquetas
    "postsInTag": "Posts con la etiqueta:",
    // Traducciones para la búsqueda pública
    "searchTitle": "Buscar en el Blog",
    "searchPlaceholder": "Escribe tu búsqueda...",
    "searchButton": "Buscar",
    "searchResultsFor": "Resultados de búsqueda para: {0}", // Corregido (antes era searchResults)
    "noResultsFor": "No se encontraron resultados para: {0}" // Nueva clave
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
// Fin del objeto translations
// Fin del objeto translations
