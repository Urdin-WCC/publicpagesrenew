# Módulo de Configuración de Apariencia

## Descripción General
El Módulo de Configuración de Apariencia proporciona una interfaz de administración completa para personalizar la apariencia global del sitio Neurowitch. Permite a los administradores configurar temas predeterminados, asignar temas específicos a diferentes rutas, configurar el spinner de carga, el interruptor de tema, y elementos fijos.

## Funcionalidades

### 1. Temas Predeterminados
- Selección de temas para el modo claro y oscuro que se aplicarán globalmente en el sitio.
- Integración con el Módulo de Temas (Módulo 8) para utilizar los presets de temas disponibles.

### 2. Asignaciones Específicas de Temas
- Asignación de temas específicos a rutas particulares o elementos del sitio.
- Sistema flexible de asignación que permite configuraciones personalizadas para distintas secciones.

### 3. Spinner de Carga
- Control de visibilidad del spinner durante la carga de páginas.
- Personalización del color de overlay con soporte para transparencia.
- Opción para cargar una imagen personalizada para el spinner (soporta formatos PNG, JPEG, GIF y WebP).

### 4. Interruptor de Tema
- Configuración de visibilidad del interruptor de tema claro/oscuro.
- Opciones de estilo: solo icono o icono con texto.
- Configuración de posición: cuatro posiciones disponibles en la pantalla.

### 5. Elementos Fijos
- Configuración de qué elementos permanecerán fijos durante el desplazamiento:
  - Cabecera
  - Barra lateral
  - Pie de página
  - Interruptor de tema

## Estructura del Módulo

### Páginas de Administración
- **`app/(admin)/admin/settings/appearance/page.tsx`**: Página principal para la configuración de apariencia.

### Componentes
- **`components/admin/settings/AppearanceForm.tsx`**: Formulario React que gestiona la configuración de apariencia.

### API Routes
- **`app/api/settings/appearance/route.ts`**: API para obtener y actualizar la configuración de apariencia.

### Navegación
- Se agregó un enlace a la configuración de apariencia global en el menú de configuración en ambos layouts de administración:
  - **`app/(admin)/layout.tsx`**: En el submenú de Configuración
  - **`components/admin/AdminSidebar.tsx`**: En el menú lateral alternativo
- También se actualizó la página de configuración principal (**`app/(admin)/admin/settings/page.tsx`**) para incluir una tarjeta con enlace a la configuración de apariencia.

### Solución al Problema de Layouts Duplicados
Para resolver el problema de tener dos layouts diferentes en el panel de administración (uno cuando se accede a `/admin` y otro cuando se accede a rutas específicas como `/admin/blog`), se implementó una solución de redirección:

1. El archivo `app/admin/page.tsx` ahora redirige automáticamente a `/admin/dashboard`
2. El layout `app/admin/layout.tsx` ha sido marcado como obsoleto con una clara documentación
3. Este enfoque garantiza que todos los usuarios experimenten la misma interfaz consistente, utilizando siempre el layout definido en `app/(admin)/layout.tsx`

Esta solución es temporal mientras se completa la migración total a un único layout, pero proporciona una experiencia de usuario consistente en el interim.

## Integración con Otros Módulos
- **Módulo de Temas**: Utiliza la API `/api/theme/presets` para obtener los temas disponibles.
- **Módulo Core**: Utiliza `ImageUploader` para la gestión de imágenes personalizadas y funciones de autenticación para proteger las rutas.

## Modelo de Datos
Este módulo opera sobre los siguientes campos de la tabla `GlobalConfig`:
- `defaultLightThemePresetId`: ID del tema predeterminado para modo claro.
- `defaultDarkThemePresetId`: ID del tema predeterminado para modo oscuro.
- `themeAssignments`: JSON que almacena las asignaciones específicas de temas.
- `loadingSpinnerConfig`: JSON con la configuración del spinner de carga.
- `themeSwitcherConfig`: JSON con la configuración del interruptor de tema.
- `stickyElementsConfig`: JSON con la configuración de elementos fijos.

## Consideraciones Técnicas

### Mejoras en la Robustez de Base de Datos
Para garantizar el funcionamiento del módulo incluso con esquemas de base de datos inconsistentes, hemos implementado las siguientes mejoras:

1. **Consultas SQL Progresivas**: La función `getGlobalConfig` ahora utiliza un enfoque progresivo:
   - Primero intenta obtener solo campos básicos garantizados
   - Luego intenta obtener campos específicos del módulo de apariencia 
   - Finalmente, si todo falla, al menos recupera el ID básico

2. **Tipado Enriquecido**: Extendimos el tipo `GlobalConfig` de Prisma para incluir los campos personalizados:
   ```typescript
   export interface GlobalConfig extends PrismaGlobalConfig {
     defaultLightThemePresetId?: number | null;
     defaultDarkThemePresetId?: number | null;
     themeAssignments?: string | null | Record<string, any>;
     // ...otros campos
   }
   ```

3. **Verificación Multi-Estrategia**: La función `updateGlobalConfig` verifica la existencia del registro 'global' utilizando múltiples estrategias con fallbacks automáticos.

4. **Scripts SQL para Instalación**: Se incluyen scripts SQL para añadir las columnas necesarias faltantes en implementaciones nuevas:
   - `add_missing_columns.sql` para añadir todas las columnas requeridas
   - Instrucciones detalladas para la ejecución secuencial en phpMyAdmin

5. **Manejo Inteligente de SelectItem**: Evitamos valores vacíos en los componentes SelectItem utilizando valores significativos como "null" y "default".

6. **Soporte Ampliado para Formatos de Imagen**: El componente ImageUploader ahora soporta explícitamente formatos GIF y WebP, además de los formatos estándar.

### Manejo de Errores en Base de Datos
El sistema está diseñado para funcionar incluso con configuraciones imperfectas de base de datos:

- Las consultas SQL se adaptan dinámicamente a las columnas disponibles
- Múltiples capas de manejo de errores mantienen la funcionalidad básica incluso con errores
- Logs detallados facilitan la depuración de problemas en entornos de producción
- La serialización de JSON está protegida contra valores malformados

### Manejo de Errores en Archivos Grandes
Durante el desarrollo del módulo se identificaron problemas con la edición de archivos grandes o complejos, como truncamiento de contenido o corrupciones en la edición. Para evitar estos problemas, se recomiendan las siguientes estrategias:

1. **División en Componentes Más Pequeños**: Dividir componentes grandes en subcomponentes más pequeños y manejables. Por ejemplo, en lugar de un solo archivo `AppearanceForm.tsx`, podría dividirse en `GeneralSettingsTab.tsx`, `ThemeAssignmentsTab.tsx`, etc.

2. **Método de Creación por Partes**:
   - Cuando se trabaje con archivos grandes, crearlos por partes y luego combinarlos mediante comandos de terminal.
   - Ejemplo: Dividir el archivo en `Part1.tsx`, `Part2.tsx`, etc., y luego combinarlos con `Get-Content file1.tsx, file2.tsx | Set-Content finalFile.tsx`

3. **Actualizaciones Incrementales**:
   - Al modificar archivos grandes, realizar cambios pequeños e incrementales en lugar de actualizaciones extensas en una sola operación.
   - Probar cada cambio incremental antes de continuar con el siguiente.

4. **Verificación de Completitud**:
   - Después de crear o actualizar archivos grandes, siempre verificar que el contenido esté completo y correcto.
   - Utilizar herramientas como `Get-Content` para inspeccionar el archivo completo.

## Requisitos de Acceso
Solo usuarios con roles `ADMIN` y `MASTER` pueden acceder a la configuración de apariencia y modificarla. Cada modificación se registra utilizando el sistema `logAdminAction` del Módulo Core.

## Interfaz de Usuario
Toda la interfaz de usuario está en español, cumpliendo con los requisitos del proyecto. Se utilizan componentes de Shadcn UI para mantener una experiencia de usuario consistente con el resto de la aplicación.
