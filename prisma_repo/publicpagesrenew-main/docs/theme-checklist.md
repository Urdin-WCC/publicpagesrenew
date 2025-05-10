# Checklist de Elementos Configurables del Módulo de Temas

> Basado en las especificaciones del documento new8.txt

## Aspectos Generales
- [x] Nombre del tema (campo requerido)
- [x] Almacenamiento en formato JSON estructurado en el campo `config` de `ThemePreset`

## Configuraciones por Categoría

### Fondo (Background)
- [x] Tipo de fondo (`color`, `gradient`, o `image`)
- [x] Valor del fondo (código de color, definición de gradiente)
- [x] URL de imagen (cuando el tipo es `image`)
- [x] Soporte para transparencia/alpha en colores

### Tipografía (Typography)
- **Encabezados (Headings)**
  - [x] Familia de fuente (`fontFamily`)
  - [x] Color del texto

- **Párrafos (Paragraphs)**
  - [x] Familia de fuente (`fontFamily`)
  - [x] Color del texto

- **Enlaces (Links)**
  - [x] Familia de fuente (`fontFamily`)
  - [x] Color del texto
  - [x] Color al pasar el cursor (`hoverColor`)

- **Botones de Texto (Button Text)**
  - [x] Familia de fuente (`fontFamily`)
  - [x] Color del texto

### Espaciado (Spacing)
- **Márgenes**
  - [x] Margen superior (`margin.top`)
  - [x] Margen derecho (`margin.right`)
  - [x] Margen inferior (`margin.bottom`)
  - [x] Margen izquierdo (`margin.left`)
  - [x] Margen base (`margin.base`) - para compatibilidad

- **Padding**
  - [x] Padding superior (`padding.top`)
  - [x] Padding derecho (`padding.right`)
  - [x] Padding inferior (`padding.bottom`)
  - [x] Padding izquierdo (`padding.left`)
  - [x] Padding base (`padding.base`) - para compatibilidad

### Tarjetas (Cards)
- [x] Radio del borde (`borderRadius`) - ejemplo: 'rounded-md', '8px'
- [x] Ancho del borde (`borderWidth`) - ejemplo: 'border', 'border-2'
- [x] Color del borde (`borderColor`) - valores RGBA
- [x] Configuración de fondo
  - [x] Tipo de fondo (`color`, `gradient`, o `image`)
  - [x] Valor del fondo
  - [x] URL de imagen (cuando corresponda)
- [x] Configuración detallada de sombra
  - [x] Desplazamiento X (`shadow.x`) - ejemplo: '0px'
  - [x] Desplazamiento Y (`shadow.y`) - ejemplo: '4px'
  - [x] Desenfoque (`shadow.blur`) - ejemplo: '6px' 
  - [x] Expansión (`shadow.spread`) - ejemplo: '0px'
  - [x] Color de sombra (`shadow.color`) - valores RGBA

### Botones (Buttons)
- **Botón Primario**
  - [x] Color de fondo
  - [x] Color de texto
  - [x] Radio del borde
  - [x] Color de fondo al pasar el cursor
  - [x] Color de texto al pasar el cursor

- **Botón Secundario**
  - [x] Color de fondo
  - [x] Color de texto
  - [x] Radio del borde
  - [x] Color de fondo al pasar el cursor
  - [x] Color de texto al pasar el cursor

### Formularios (Forms)
- **Campos de Entrada (Inputs)**
  - [x] Color de fondo
  - [x] Color de texto
  - [x] Color de borde
  - [x] Radio del borde
  - [x] Color de borde al enfocar

- **Etiquetas (Labels)**
  - [x] Color de texto
  - [x] Peso de fuente

### Efectos (Effects)
- [x] Transiciones (booleano para activar/desactivar)
- [x] Animaciones
  - [x] Tipo predefinido ( `none`, `zoomin`, `zoomout`, `scale`, `glow`, `bounce`, `pulse`, `shake`, `slide` o `custom`)
  - [x] Animación personalizada (cuando el tipo es `custom`)

## Funcionalidades de la Interfaz
- [x] Selector de color mejorado
  - [x] Soporte para transparencia (alpha)
  - [x] Botones de confirmación y cancelación para evitar cambios accidentales
  - [x] Vista previa en tiempo real
- [x] Selector de fuentes con opciones predefinidas
  - [x] Lista de fuentes comunes
  - [x] Input para fuentes personalizadas
  - [x] Vista previa del texto con la fuente seleccionada
- [x] Componente ImageUploader para fondos basados en imágenes
- [x] Inputs para valores de texto (fuentes, valores de espaciado)
- [x] Organización en secciones lógicas (fondos, tipografía, tarjetas, etc.)
- [x] Interfaz responsiva con diseño adaptativo
- [x] Formulario con validación
- [x] Todo el texto de la interfaz en español

## Operaciones CRUD
- [x] Creación de nuevos temas
- [x] Visualización de lista de temas existentes
- [x] Edición de temas existentes
- [x] Duplicación de temas existentes
- [x] Eliminación de temas (con confirmación)

## Rutas API Requeridas
- [x] GET `/api/theme/presets` - Listar todos los temas
- [x] POST `/api/theme/presets` - Crear nuevo tema
- [x] GET `/api/theme/presets/[id]` - Obtener un tema específico
- [x] PUT `/api/theme/presets/[id]` - Actualizar un tema existente
- [x] DELETE `/api/theme/presets/[id]` - Eliminar un tema
- [x] POST `/api/theme/presets/[id]/duplicate` - Duplicar un tema existente

## Seguridad y Acceso
- [x] Protección de rutas API para acceso solo de administradores
- [x] Registro de acciones administrativas con `logAdminAction`
- [x] Validación de datos en endpoints API
