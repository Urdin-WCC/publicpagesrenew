# Sistema de Posicionamiento de Elementos en Header

Este documento detalla el sistema de posicionamiento fijo implementado en el componente Header, que permite colocar elementos en una cuadrícula 3x3 sin que se empujen entre sí.

## Visión General

El Header utiliza un sistema de nueve posiciones en formato retícula 3x3, donde cada elemento tiene asignada una posición fija:

```
+-------------+-------------+-------------+
| top-left    | top-center  | top-right   |
+-------------+-------------+-------------+
| center-left | center-center | center-right |
+-------------+-------------+-------------+
| bottom-left | bottom-center | bottom-right |
+-------------+-------------+-------------+
```

Cada posición existe independientemente de si hay un elemento presente o no, lo que permite un diseño consistente y predecible.

## Implementación Técnica

### 1. Estructura Base

El header utiliza posicionamiento absoluto para cada uno de los slots de la cuadrícula 3x3:

```jsx
<div className="container mx-auto px-4 py-3 relative min-h-[100px]">
  {/* Slots con posicionamiento absoluto */}
  <div className="absolute top-0 left-0 ... header-position-layer">
    {renderHeaderElement(positionMatrix['top-left'])}
  </div>
  
  <div className="absolute top-0 left-1/2 -translate-x-1/2 ... header-position-layer">
    {renderHeaderElement(positionMatrix['top-center'])}
  </div>
  
  {/* Más slots para las 9 posiciones */}
</div>
```

### 2. Posicionamiento

- **Fila Superior**: `top-0` + posición horizontal (left-0, left-1/2 con transform, right-0)
- **Fila Central**: `top-1/2 -translate-y-1/2` + posición horizontal
- **Fila Inferior**: `bottom-0` + posición horizontal

### 3. Configuración de Elementos

Los elementos se configuran en un array de objetos con la siguiente estructura:

```javascript
{
  type: "logo", // Tipo de elemento: logo, text, menu, social, theme, html
  visible: true, // Si es visible
  position: "top-left", // Posición en la cuadrícula 3x3
  // Propiedades específicas dependiendo del tipo
  logoUrl?: string,
  html?: string,
  height?: string
}
```

Estos elementos se asignan a una matriz de posiciones:

```javascript
const positionMatrix = {
  'top-left': elementObject || null,
  'top-center': elementObject || null,
  // etc. para las 9 posiciones
};
```

## Elementos Soportados

1. **Logo** ("logo"): Muestra el logotipo del sitio.
   - Posición predeterminada: centro-izquierda (center-left)

2. **Texto/Título** ("text"): Muestra el nombre del sitio.
   - Posición predeterminada: arriba-centro (top-center)

3. **Menú de Navegación** ("menu"): Muestra los elementos de navegación.
   - Posición predeterminada: abajo-derecha (bottom-right)

4. **Iconos Sociales** ("social"): Muestra los iconos de redes sociales.
   - Posición predeterminada: arriba-derecha (top-right)

5. **Selector de Tema** ("theme"): Muestra un interruptor para cambiar entre tema claro/oscuro.
   - Posición predeterminada: arriba-izquierda (top-left)

6. **HTML Personalizado** ("html"): Permite insertar HTML personalizado (banners, anuncios, etc.).
   - Posición predeterminada: centro-centro (center-center)

## Estilos y Responsividad

### Estilos CSS Específicos

Se aplican estilos específicos para garantizar el correcto posicionamiento:

```css
.header-position-layer {
  padding: 8px;
  z-index: 1; /* Evita superposición */
  min-width: 80px; /* Garantiza espacio mínimo */
  min-height: 30px;
  pointer-events: auto; /* Asegura interactividad */
}

/* Espaciado vertical para posiciones */
.header-component [class*="top-"] {
  top: 10px; /* Margen superior para fila superior */
}

.header-component [class*="bottom-"] {
  bottom: 10px; /* Margen inferior para fila inferior */
}
```

### Responsividad

El sistema incorpora ajustes específicos para pantallas móviles:

```css
@media (max-width: 768px) {
  .header-position-layer {
    padding: 4px; /* Menor padding */
  }
  
  .header-component .container {
    min-height: 100px; /* Menor altura */
  }
}
```

## Ventajas de esta Implementación

1. **Posicionamiento Independiente**: Los elementos no se empujan entre sí, manteniendo siempre su posición asignada.

2. **Flexibilidad**: Se pueden colocar elementos en cualquiera de las 9 posiciones.

3. **Capas Separadas**: Cada elemento existe en su propia capa, evitando conflictos de diseño.

4. **Adaptabilidad a Contenido**: Funciona con elementos de diferentes tamaños.

5. **Fácil Configuración**: Solo se requiere configurar tipo y posición para añadir/modificar elementos.

## Configuración desde el Panel de Administración

El admin permite configurar:

1. La posición de cada elemento mediante un selector de posición
2. La visibilidad de cada elemento mediante un toggle
3. Contenido HTML personalizado para el elemento "html"
4. Altura personalizada del header

## Ejemplo de Uso en Código

```javascript
// Cargar la configuración
const headerConfig = { 
  elements: [
    { type: "logo", visible: true, position: "center-left" },
    { type: "menu", visible: true, position: "bottom-right" },
    { type: "social", visible: true, position: "top-right" },
    // etc.
  ]
};

// Aplicar
<Header config={headerConfig} />
```
