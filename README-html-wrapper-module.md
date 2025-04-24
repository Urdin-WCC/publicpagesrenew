# Módulo HTML_Wrapper (Developer Custom Content Widget)

## Descripción General
Este módulo permite a los administradores con rol [MASTER] insertar contenido HTML personalizado que puede ser mostrado en diferentes secciones del sitio público como widgets.

## Características Principales

- **Interfaz Admin específica para [MASTER]**: Panel de administración exclusivo para usuarios con el rol más alto del sistema.
- **Campo developerHtmlContent**: Almacena el HTML personalizado en la tabla GlobalConfig.
- **Widget de renderización segura**: Implementación de widget para mostrar el contenido HTML en el sitio público.
- **UI completamente en español**: Siguiendo los requerimientos del proyecto.
- **Navegación exclusiva**: Enlace de acceso visible solo para usuarios [MASTER].
- **Auditoría de cambios**: Registro de modificaciones en el sistema de logs administrativos.

## Consideraciones de Seguridad

⚠️ **ADVERTENCIA**: Este módulo utiliza `dangerouslySetInnerHTML` para renderizar HTML arbitrario proporcionado por administradores. Esto conlleva riesgos de Cross-Site Scripting (XSS) si no se utiliza adecuadamente.

La seguridad se basa en dos pilares fundamentales:

1. **Restricción de acceso**: Solo los usuarios con rol [MASTER] pueden editar el contenido HTML.
2. **Advertencias claras**: La interfaz de usuario muestra alertas prominentes sobre los riesgos asociados.

## Estructura de Archivos

- `prisma/schema.prisma`: Actualizado con el campo `developerHtmlContent` en el modelo GlobalConfig.
- `add_developer_html_simple.sql`: Script SQL para añadir el nuevo campo a la base de datos.
- `app/(admin)/admin/developer-html/page.tsx`: Interfaz administrativa en español con validación de rol [MASTER].
- `app/api/settings/developer-html/route.ts`: API REST para gestión del contenido HTML.
- `components/public/widgets/WidgetDeveloperHTML.tsx`: Widget para renderizar el HTML en el sitio público.
- `components/admin/AdminSidebar.tsx`: Modificado para añadir un enlace de navegación exclusivo para [MASTER].
- `lib/constants.ts`: Actualizado para incluir el nuevo tipo de widget.

## Instalación

1. Añadir el campo `developerHtmlContent` a la tabla GlobalConfig usando el script SQL proporcionado:
   ```sql
   ALTER TABLE `GlobalConfig` ADD `developerHtmlContent` LONGTEXT NULL;
   ```

2. Añadir el widget a la lista `WIDGET_TYPES` en `lib/constants.ts`:
   ```typescript
   { value: "WidgetDeveloperHTML", label: "HTML Personalizado (Master)" }
   ```

## Uso

### Para Administradores [MASTER]

1. Acceder al panel de administración e iniciar sesión con una cuenta con rol [MASTER].
2. En la barra lateral, verá un enlace destacado "HTML Personalizado" visible solo para administradores [MASTER].
3. En esta interfaz, puede ingresar cualquier contenido HTML válido (y JavaScript).
4. Guardar los cambios, que serán registrados en el sistema de auditoría.

### Integración en el Sitio Público

El contenido HTML personalizado puede ser mostrado a través de:

1. El widget `WidgetDeveloperHTML` al seleccionarlo en la configuración de secciones (footer, sidebar, etc.).
2. Integración directa en componentes del sitio que utilicen `getGlobalConfig()` para acceder a `developerHtmlContent`.

## Riesgos y Consideraciones

- **XSS**: El contenido ingresado por los administradores no está sanitizado intencionalmente.
- **Rendimiento**: El HTML personalizado podría afectar el rendimiento del sitio si contiene scripts complejos.
- **Mantenimiento**: Los administradores deben tener conocimientos de HTML/JS para uso efectivo.

## Ejemplo de Uso

```html
<!-- Ejemplo de HTML válido para insertar -->
<div class="custom-container">
  <h2>Anuncio Especial</h2>
  <div class="content">
    <p>Este es un anuncio importante para nuestros usuarios.</p>
    <button onclick="alert('¡Gracias por leer!')">Click Me!</button>
  </div>
  <style>
    .custom-container {
      border: 2px solid #ff5722;
      padding: 15px;
      border-radius: 8px;
    }
  </style>
</div>
```

## Limitaciones Conocidas

- El contenido HTML se aplica globalmente, no por página o sección específica.
- No hay previsualización en tiempo real del HTML ingresado.
- No hay validación de HTML malformado.

---

Desarrollado como parte del proyecto Neurowitch, Módulo 14.
