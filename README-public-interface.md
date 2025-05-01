# Documentación de la Interfaz Pública

## Visión General
La interfaz pública de Neurowitch ha sido actualizada para proporcionar una experiencia visual consistente y personalizable a través de un sistema de temas.

## Sistema de Temas
<!-- ... (restante sin cambios) ... -->

## Redes Sociales y Botones de Compartir

A partir de la versión 2025-05, el sistema de iconos sociales y botones de compartir ha sido modernizado y unificado bajo dos configuraciones centralizadas: `social` y `sharing`, ambas definidas y administradas desde el panel de administración.

### Modelo de Datos

Ambos sistemas usan el siguiente esquema:
```jsonc
{
  "textBefore": "Síguenos en las redes:",
  "iconSize": "24px",
  "icons": [
    {
      "name": "Facebook",
      "url": "https://facebook.com/tu-cuenta",
      "svgLight": "Facebook.svg",
      "svgDark": "Facebook_black.svg"
    },
    {
      "name": "Twitter",
      "url": "https://twitter.com/tu-cuenta",
      "svgLight": "Twitter.svg",
      "svgDark": "Twitter_black.svg"
    }
    // ...otros iconos configurables, con soporte también para SVG externo vía URL
  ]
}
```
- `textBefore` define (opcionalmente) un texto previo tipo “Síguenos”, antes del listado.
- `iconSize` es el tamaño global de los iconos (puede ser px, em, %, etc).
- Cada icono incluye:
  - `name`: Nombre visual
  - `url`: Enlace absoluto (social) o enlace de compartir (sharing)
  - `svgLight`: Asset SVG para modo claro (puede ser filename local o URL externa)
  - `svgDark`: Asset SVG para modo oscuro (puede ser filename local o URL externa)

### Administración

La edición y gestión de estos bloques se realiza desde `/admin/settings/social` y `/admin/settings/sharing` respectivamente, permitiendo:

- Añadir, editar, eliminar y reordenar iconos
- Configurar SVG locales o externos
- Personalizar texto y tamaño

### Integración en UI Pública

#### Componente Social

Importa y utiliza el componente:
```tsx
import Social from "@/components/public/Social";

// Obten la configuración con:
import { fetchSocialConfig } from "@/actions/social-actions";

const socialConfig = await fetchSocialConfig();
<Social config={socialConfig} inline /> // Para mostrar en header o de forma horizontal
```

#### Componente Sharing

Para botones de compartir en posts, proyectos, etc:
```tsx
import Sharing from "@/components/public/Sharing";
import { fetchSocialConfig as fetchSharingConfig } from "@/actions/sharing-actions";

const sharingConfig = await fetchSharingConfig();
<Sharing config={sharingConfig} /> // Flex layout por defecto, o inline para variantes
```

#### Integración en Header

Header detecta la config de social y la renderiza automáticamente:
```tsx
<Social config={socialConfig} inline />
```
Solo necesitas asegurarte de tener configurados y visibles los iconos en el panel de administración.

#### En Posts y Proyectos

En los detalles de blog y portfolio, luego del contenido principal:
```tsx
const sharingConfig = await fetchSharingConfig();
<Sharing config={sharingConfig} />
```

### Deprecación y Limpieza

- El antiguo widget/bloque SocialLinksWidget y toda lógica acoplada a arrays de links simples está obsoleto y ha sido eliminado del proyecto.
- Los componentes modernos deben consumir directamente desde la nueva configuración, usando los assets SVG elegidos desde el panel.
- El sistema es compatible con SSR, client y puede usarse como widget, bloque fijo o en layouts personalizados.

<!-- ... (puedes reintegrar las secciones de sistema de temas, debugging, etc. tal como ya están redactadas arriba) ... -->
