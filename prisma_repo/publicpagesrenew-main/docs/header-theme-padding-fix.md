# Patrón estándar para tematización de componentes públicos (padding, fondo, bordes, tipografía, imágenes de fondo...)

## Soporte multiplataforma y dual-tema

- **Asignación flexible:** Puedes asignar cualquier preset de tema a cualquier elemento visual (header, footer, sidebar, etc.) para modo claro y oscuro de forma *independiente*. El sistema asigna un preset para cada modo y usa automáticamente los valores correctos según el tema activo.
- **Variables CSS con prefijo:** Todas las propiedades de cards (fondo, radio, sombra, color, etc.) y generales (padding, background, etc.) del preset se exponen como variables CSS con prefijo específico de componente y se actualizan automáticamente. Por ejemplo:
  - `--footer-cards-background`, `--footer-cards-borderRadius`, `--sidebar-cards-background`, etc.

## Fondo de widgets/cards: color, gradiente o imagen

- **El fondo del widget/card** en sidebar y footer se controla 100% desde el panel de temas mediante la sección “cards”. El admin puede elegir:
  - **Color**: fondo liso configurado en "cards.background" del preset.
  - **Gradiente**: se integra como variable y valor CSS, automáticamente conmutando a dark y light.
  - **Imagen**: cuando en "cards.background.type" es "image", la url del archivo es `/images/backgrounds/card-(ID del preset para ese modo).jpg` (por ejemplo: `card-2.jpg` para dark, `card-1.jpg` para light). La lógica asigna el id correcto automáticamente según asignación de modo en themeAssignments.

## Widgets tratados como cards tematizados

- Todos los widgets incluidos en sidebar y footer son renderizados dentro de un wrapper `.widget-card` que toma directamente todas las propiedades del tema (`background`, `border`, `shadow`, `radius`, etc) definidas para cards del preset correspondiente al modo y componente. 
- Al utilizar `background: var(--footer-cards-background, #f5f5f5)`, los widgets reflejan exactamente la configuración del panel para el preset asignado.

## Reactividad con cambio de tema

- El cambio de modo claro/oscuro es transparente: simplemente selecciona el preset asignado, genera las variables CSS correctas y todo el sistema reacciona instantáneamente. El fondo, decorado, colores, radio y bordes de las cards/widgets cambian sin intervención JS ni recarga, a través de la variable correspondiente definida en cada modo del CSS.
- Este patrón es igual para header, footer, sidebar, y se puede extender a otros elementos fácilmente.

## Ejemplo de la convención

- **Imagen de fondo:**  
  Para modo claro:  
  `/images/backgrounds/card-1.jpg` (si `themeAssignments.footer.light = 1`)  
  Para oscuro:  
  `/images/backgrounds/card-2.jpg` (si `themeAssignments.footer.dark = 2`)

- **Gradient**  
  En el preset:  
  ```json
  "cards": {
    "background": { "type": "gradient", "value": "linear-gradient(...)" }
  }
  ```
  Variable CSS generada:
  ```css
  --footer-cards-background: var(--cards-background-gradient, linear-gradient(...));
  ```

- **Color**  
  `"cards": { "background": { "type": "color", "value": "#27B2D6" } }`

## Lógica aplicada (resumen técnico)

- El archivo `lib/themeUtils.ts` genera las variables CSS y pone la url de la imagen como background solo si el tipo es "image" y el id es válido, siguiendo el mismo patrón que el header.
- En el wrapper `.widget-card` del footer/sidebar el fondo se aplica con:`background: var(--footer-cards-background, #f5f5f5);`  y la variable se actualiza automáticamente por el selector del tema.
- El layout es completamente dual-tema, reactivo y robusto a cualquier combinación de presets.

## Consideraciones de seguridad y actualización

- Al editar archivos grandes/dividir lógica o actualizar componentes, se recomienda siempre:
  - Copia de seguridad previa.
  - Cambios incrementales.
  - Verificación visual del resultado tras cada cambio, especialmente cuando hay layouts complejos o temas duales.

---

**Este sistema permite flexibilidad total al administrador: cualquier widget puede verse como una card temática, y todos los cambios de estilo en el panel de temas (color, gradient, imagen o cualquier decoración) se reflejan fielmente en tiempo real.**

## Widget logo universal

El widget tipo "logo" ahora siempre muestra la imagen `/images/logo.png` ocupando el 100% del espacio del contenedor (con object-fit: contain, no deformable) y enlaza, al hacer click, a la página de inicio (`/`). No tiene textos adicionales ni configuraciones condicionales. Esto asegura máxima robustez, simplicidad y consistencia en cualquier ubicación (sidebar/footer).
