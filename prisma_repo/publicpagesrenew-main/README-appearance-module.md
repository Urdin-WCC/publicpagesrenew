# Módulo de Configuración de Apariencia

Este módulo proporciona una interfaz completa para gestionar la apariencia global del sitio web, permitiendo la configuración de temas, spinners de carga, selectores de tema y elementos fijos.

## Características Principales

- **Gestión de Temas**: Asigna diferentes temas por defecto para modos claro y oscuro
- **Asignaciones Específicas**: Configura temas diferentes para rutas o elementos específicos
- **Spinner de Carga**: Personalización completa del spinner durante la navegación
- **Selector de Tema**: Control sobre la visibilidad y apariencia del selector de tema
- **Elementos Fijos**: Configura qué elementos permanecen fijos durante el desplazamiento

## Instalación

Para instalar el módulo en un proyecto existente:

1. Añade los archivos del módulo en la estructura correspondiente del proyecto
2. Ejecuta el script SQL `add_missing_columns.sql` para crear las columnas necesarias en la base de datos
3. Actualiza las dependencias con `npm install`

### Requisitos de Base de Datos

Si encuentras errores relacionados con columnas faltantes en la tabla `GlobalConfig`, ejecuta los scripts SQL proporcionados:

```sql
-- Columnas esenciales
ALTER TABLE GlobalConfig ADD activeThemeId VARCHAR(255);
ALTER TABLE GlobalConfig ADD defaultLightThemePresetId INT;
ALTER TABLE GlobalConfig ADD defaultDarkThemePresetId INT;
ALTER TABLE GlobalConfig ADD themeAssignments TEXT;
ALTER TABLE GlobalConfig ADD loadingSpinnerConfig TEXT;
ALTER TABLE GlobalConfig ADD themeSwitcherConfig TEXT;
ALTER TABLE GlobalConfig ADD stickyElementsConfig TEXT;
```

## Uso

Accede al módulo desde el panel de administración navegando a:
```
/admin/settings/appearance
```

El módulo está organizado en pestañas para facilitar la configuración:

1. **General**: Configura temas predeterminados
2. **Asignaciones**: Asigna temas a rutas específicas
3. **Spinner**: Configura el spinner de carga
4. **Interruptor de Tema**: Configura la visibilidad y posición
5. **Elementos Fijos**: Configura qué elementos son fijos

## Características Técnicas

- Robustez mejorada para manejar esquemas de base de datos inconsistentes
- Soporte para formatos GIF y WebP en el selector de imágenes
- Manejo avanzado de temas con asignaciones específicas por ruta
- Sistema de fallback multi-nivel para máxima resiliencia

## Documentación Detallada

Para más información, consulta el archivo `docs/appearance-config-module.md` que contiene:

- Descripción completa de la arquitectura
- Detalles de integración con otros módulos
- Estrategias para manejar archivos grandes
- Consideraciones técnicas para desarrollo y mantenimiento

---

*Este módulo forma parte del sistema de gestión de contenido Neurowitch.*
