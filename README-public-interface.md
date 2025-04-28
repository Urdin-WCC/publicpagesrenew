# Documentación de la Interfaz Pública

## Visión General
La interfaz pública de Neurowitch ha sido actualizada para proporcionar una experiencia visual consistente y personalizable a través de un sistema de temas.

## Sistema de Temas

### Variables CSS del Tema
El sistema utiliza variables CSS personalizables que se aplican de manera consistente en toda la interfaz:

```css
/* Variables principales del tema */
--background-value: color de fondo base
--background-image: imagen o gradiente de fondo
--foreground: color del texto principal
--spacing-padding: espaciado interno
--spacing-margin: espaciado externo
```

### Estructura del DOM
Los estilos del tema se aplican en el siguiente orden jerárquico:

1. **Layout Principal** (`app/(public)/layout.tsx`)
   - Define variables CSS globales del tema
   - Proporciona el contenedor base para todas las páginas

2. **Contenedor de Página**
   - Aplica los estilos del tema específicos de la página
   - Maneja el fondo y espaciado según las variables del tema

3. **Componentes Específicos**
   - Heredan y/o sobrescriben estilos según necesidad
   - Mantienen consistencia con el tema global

### Navegación y Secciones

#### Header
- Aplica variables del tema para fondos y colores
- Soporta posicionamiento fijo/sticky

#### Footer
- Mantiene consistencia visual con el tema
- Soporta widgets y contenido personalizado

#### Sidebar
- Se integra con el tema global
- Soporta posicionamiento y ancho personalizable

### Páginas Principales

#### Página de Blog
- Implementa todas las variables del tema
- Soporta diferentes modos de visualización (grid/list)
- Mantiene consistencia en subpáginas:
  * Lista de posts
  * Detalle de post
  * Categorías
  * Búsqueda

#### Página de Portfolio
- Aplica variables del tema de manera consistente
- Soporta diferentes layouts
- Mantiene consistencia en:
  * Galería de proyectos
  * Detalle de proyecto
  * Categorías
  * Búsqueda

#### Páginas Estáticas
- Heredan estilos del tema global
- Mantienen consistencia visual
- Soportan contenido personalizado

### Imágenes y Recursos

#### Sistema de Imágenes Universal
- Utiliza extensión `.img` para todas las imágenes
- No utiliza timestamps para evitar problemas de hidratación
- Maneja conversión automática de formatos

### Implementación de Temas

#### Variables Requeridas
```css
/* Variables mínimas requeridas */
:root {
  --background-value: #ffffff;
  --foreground: #333333;
  --spacing-padding: 2rem 1rem;
  --spacing-margin: 1rem;
}

/* Variables opcionales */
:root {
  --background-image: url(...) | linear-gradient(...) | none;
  --typography-heading-fontFamily: var(--font-primary);
  --typography-heading-fontSize: 2rem;
  --typography-heading-fontWeight: 600;
  --typography-heading-color: inherit;
}
```

#### Ejemplo de Uso
```tsx
<div 
  className="page-content"
  style={{
    backgroundColor: 'var(--background-value)',
    backgroundImage: 'var(--background-image)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: 'var(--foreground)',
    padding: 'var(--spacing-padding)',
    margin: 'var(--spacing-margin)'
  }}
>
  {/* Contenido de la página */}
</div>
```

### Consideraciones Especiales

1. **Hidratación**
   - Se eliminó el uso de timestamps en URLs de imágenes
   - Se simplificó el manejo de fondos para evitar discrepancias

2. **Responsividad**
   - Los estilos se adaptan a diferentes tamaños de pantalla
   - Las variables de espaciado soportan valores responsivos

3. **Accesibilidad**
   - Los colores del tema deben mantener contraste suficiente
   - Las variables de color incluyen valores por defecto accesibles

### Debugging y Solución de Problemas

#### Problemas Comunes

1. **Estilos no se aplican**
   - Verificar que las variables del tema estén definidas
   - Comprobar la jerarquía del DOM

2. **Inconsistencias Visuales**
   - Revisar que no haya estilos hardcodeados
   - Verificar que se usen las variables correctas

3. **Problemas de Hidratación**
   - No usar valores dinámicos en el renderizado inicial
   - Evitar timestamps y valores que cambian entre servidor y cliente

#### Depuración

```bash
# Verificar variables del tema
document.documentElement.style.getPropertyValue('--background-value')

# Inspeccionar jerarquía de estilos
# Usar las herramientas de desarrollo del navegador para:
- Verificar la cascada de CSS
- Comprobar la aplicación de variables
- Identificar sobreescrituras inesperadas
