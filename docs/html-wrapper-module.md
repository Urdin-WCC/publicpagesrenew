# Módulo HTML_Wrapper (Developer Custom Content Widget)

## Descripción General

El Módulo HTML_Wrapper (Módulo 14) implementa una funcionalidad especializada para permitir a los administradores con rol MASTER insertar contenido HTML personalizado en el sitio. Este módulo responde a la necesidad ocasional de incorporar elementos HTML/JavaScript avanzados sin requerir modificaciones al código base.

## Arquitectura y Componentes

### Modelo de Datos
- Se extiende el modelo `GlobalConfig` con un nuevo campo `developerHtmlContent` de tipo `LONGTEXT` para almacenar HTML arbitrario.
- La integración con la base de datos se realiza a través de consultas SQL nativas (`$queryRaw`) para máxima compatibilidad.

### Interfaz Administrativa
- Página específica en `app/(admin)/admin/developer-html/page.tsx` protegida exclusivamente para el rol MASTER.
- Interfaz con advertencias claras sobre los riesgos de XSS.
- Sistema completo de feedback para confirmación y errores.

### API Backend
- Endpoint en `app/api/settings/developer-html/route.ts` con protección estricta para MASTER.
- Implementación de auditoría mediante `logAdminAction` para registrar cambios.

### Widget para Visualización
- Componente `WidgetDeveloperHTML` que implementa `dangerouslySetInnerHTML` con comentarios claros de seguridad.
- Obtención del contenido desde `GlobalConfig` para renderizado en el sitio público.

### Navegación Administrativa
- Enlace especial en el sidebar administrativo visible solo para usuarios MASTER.
- Distintivo visual para indicar su naturaleza restringida.

## Consideraciones de Seguridad

Este módulo implementa un caso excepcional donde se permite intencionalmente la inyección de HTML/JavaScript arbitrario. Las consideraciones de seguridad incluyen:

### Mitigaciones Implementadas
1. **Control de Acceso Estricto**: Restricción a nivel de UI y API exclusivamente para el rol MASTER.
2. **Advertencias Visuales**: La interfaz incluye alertas prominentes sobre los riesgos.
3. **Auditoría Completa**: Cada modificación queda registrada con detalles en el sistema de logs.
4. **Aislamiento**: El contenido HTML personalizado se ejecuta en contextos específicos y controlados.

### Riesgos Residuales
- Posible utilización inadecuada por administradores con privilegios MASTER.
- Potencial inyección de scripts maliciosos si las credenciales de MASTER son comprometidas.

## Integración con el Sistema de Widgets

El módulo se integra con el sistema de widgets existente mediante la adición del tipo `WidgetDeveloperHTML` a la lista de widgets disponibles en `WIDGET_TYPES`. Esto permite que el contenido HTML personalizado pueda ser seleccionado como un widget en las secciones configurables del sitio (footer, sidebar).

## Consideraciones para el Futuro

Posibles mejoras para versiones futuras:

1. **Previsualización en Tiempo Real**: Implementar un sistema de previsualización del HTML antes de guardarlo.
2. **Validadores de Seguridad**: Agregar opciones de sanitización básica o validación de estructura HTML.
3. **Múltiples Instancias**: Permitir múltiples bloques HTML independientes para diferentes propósitos.
4. **Editor Visual**: Incorporar un editor visual tipo WYSIWYG específico para este propósito.

## Documentación Relacionada

- [README-html-wrapper-module.md](../README-html-wrapper-module.md): Documentación principal del módulo con ejemplos y guía de uso.
- [appearance-config-module.md](./appearance-config-module.md): Documentación del Módulo de Configuración de Apariencia, con el que este módulo se integra.
