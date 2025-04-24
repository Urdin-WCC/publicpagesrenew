# Módulo de Explorador de Archivos (Módulo 11)

## Descripción General
El Módulo de Explorador de Archivos proporciona una interfaz administrativa para gestionar archivos y carpetas en el directorio de imágenes (`public/uploads/images`). Permite a los administradores explorar el sistema de archivos, ver imágenes con miniaturas, subir nuevos archivos, crear carpetas y eliminar elementos existentes, todo ello con una interfaz intuitiva y medidas de seguridad robustas.

## Funcionalidades Principales

### 1. Navegación de Archivos
- Exploración intuitiva del directorio de imágenes
- Vista en cuadrícula con miniaturas para archivos de imagen
- Soporte para navegación entre carpetas con botón "Atrás"
- Visualización del tamaño de archivos y tipo de contenido

### 2. Gestión de Contenido
- **Subida de Archivos**: Integración con el componente `ImageUploader` existente
- **Creación de Carpetas**: Interfaz para crear nuevas carpetas con validación de nombres
- **Eliminación de Elementos**: Eliminación de archivos y carpetas con diálogos de confirmación

### 3. Seguridad
- Validación estricta de rutas para prevenir ataques de traversal
- Protección de APIs con verificación de roles (ADMIN+)
- Registro de todas las acciones administrativas
- Sanitización de nombres de archivo y carpeta

## Estructura del Módulo

### Utilidades (lib/)
- **`lib/fileUtils.ts`**: Funciones de utilidad para:
  - Validación segura de rutas
  - Sanitización de nombres de archivos
  - Funciones auxiliares para operaciones con archivos
  - Creación automática del directorio de uploads si no existe

### APIs (app/api/files/)
- **`app/api/files/list/route.ts`**: Listado de archivos y carpetas con validación de seguridad
- **`app/api/files/delete/route.ts`**: Eliminación segura de archivos y carpetas
- **`app/api/files/create-folder/route.ts`**: Creación de nuevas carpetas con validación

### Componentes de UI
- **`components/admin/files/FileExplorer.tsx`**: Componente principal que proporciona:
  - Interfaz para navegación de archivos
  - Formulario de subida de archivos
  - Funcionalidad para crear carpetas
  - Acciones para eliminar elementos

### Página de Administración
- **`app/(admin)/admin/files/page.tsx`**: Página de administración protegida que:
  - Integra el componente FileExplorer
  - Aplica protección de roles
  - Proporciona un layout consistente con el diseño administrativo

## Integración con Módulos Existentes
- **Módulo Core**: Utiliza funcionalidades de autenticación, persistencia de base de datos y registro de acciones
- **Módulo de Carga de Imágenes**: Reutiliza el componente `ImageUploader` existente
- **Módulo de UI**: Utiliza componentes de Shadcn UI para dialogs, botones y otros elementos visuales

## Seguridad y Robustez
- **Prevención de Path Traversal**: Validación estricta de todas las rutas de archivo
- **Manejo de Errores**: Gestión robusta de errores con mensajes claros para el usuario
- **Protección API**: Todas las rutas API protegidas con verificación de roles ADMIN+
- **Auditoría**: Registro de todas las acciones críticas (creación/eliminación)

## Uso

### Acceso al Explorador
- Accesible desde el panel de administración en la ruta `/admin/files`
- Requiere autenticación con rol ADMIN o superior

### Subir Archivos
1. Hacer clic en el botón "Subir Archivo"
2. Usar el selector de archivos o arrastrar y soltar una imagen
3. El archivo se carga automáticamente y aparece en la lista

### Crear Carpetas
1. Hacer clic en el botón "Crear Carpeta"
2. Ingresar un nombre de carpeta válido
3. Confirmar la creación

### Eliminación de Elementos
1. Hacer clic en el botón de eliminar junto al archivo o carpeta
2. Confirmar la acción en el diálogo de confirmación
3. Nota: solo las carpetas vacías pueden ser eliminadas

## Consideraciones Técnicas

### Gestión de Rutas
El módulo implementa un sistema robusto para el manejo de rutas:
- Las rutas relativas se resuelven respecto al directorio base
- Se aplica validación para asegurar que ninguna operación acceda a archivos fuera del directorio designado
- Se utiliza un enfoque "fail-safe" por defecto

### Validación de Entrada
- Los nombres de carpeta y archivo se sanitizan para eliminar caracteres peligrosos
- Las rutas de archivo se validan mediante funciones especializadas para prevenir ataques

### Mejoras de Usabilidad
- Retroalimentación visual inmediata después de cada operación
- Miniaturas para archivos de imagen para facilitar la identificación
- Sistema de navegación intuitivo para explorar directorios anidados

## Notas Adicionales
- El explorador se ha diseñado inicialmente para imágenes pero soporta la visualización de todos los tipos de archivo
- Existe potencial para extensiones futuras como vista previa de contenido, búsqueda, y filtrado por tipo de archivo
