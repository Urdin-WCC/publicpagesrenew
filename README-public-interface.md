# Documentación de la Interfaz Pública

## Introducción

La interfaz pública es la parte visible de la aplicación para usuarios externos. Consiste en varios componentes clave:

- **Header**: Muestra el logo, nombre del sitio, menú de navegación y enlaces sociales
- **Footer**: Muestra widgets, texto de copyright y contenido HTML personalizado
- **Sidebar**: Muestra widgets y contenido HTML personalizado, puede estar a la izquierda o derecha
- **Main Content**: Contenido principal de la página (blogs, páginas estáticas, etc.)

Cada uno de estos componentes puede tener su propio tema, configuración y visibilidad.

## Arquitectura de Componentes

### 1. Estructura Básica

```
<PublicLayout>
  <PageConfigHandler /> (cliente)
  <Header />
  <div className="flex">
    <Sidebar position="left" />
    <main>{children}</main>
    <Sidebar position="right" />
  </div>
  <Footer />
  <ThemeSwitcher />
</PublicLayout>
```

### 2. Sistema de Temas

Cada componente puede tener su propio tema definido en la base de datos. Estos temas se cargan usando:

```tsx
const { lightConfig, darkConfig } = globalConfig 
  ? await getThemeConfigsForComponent('header', pathname, globalConfig)
  : { lightConfig: null, darkConfig: null };

const componentThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.component-class');
```

### 3. Visibilidad de Componentes

La visibilidad de los componentes se controla mediante:

1. **Configuración de Página**: Cada página puede definir qué componentes son visibles:

```js
window.__PAGE_CONFIG__ = {
  showHeader: true,
  showFooter: true,
  showSidebar: true,
  sidebarPosition: 'right'
};
```

2. **Clases CSS**: Las clases determinan la visibilidad:
```css
body.hide-header header { display: none !important; }
body.hide-footer footer { display: none !important; }
.sidebar-component { display: block !important; } /* Forzado visible para debug */
```

## Flujo de Control y Carga de Datos

### 1. Obtención de Configuraciones

Cada componente obtiene su configuración de tres formas posibles:

- **API Dedicada**: Acciones del servidor (`fetchHeaderConfig`, `fetchFooterConfig`, `fetchSidebarConfig`)
- **GlobalConfig**: De la tabla `GlobalConfig` en la base de datos
- **Valores por Defecto**: Cuando no se encuentra ninguna configuración

### 2. Asignación de Temas

Los temas se asignan según la siguiente jerarquía:

1. Temas específicos de componente para una ruta específica
2. Temas específicos de componente (predeterminados)
3. Temas globales para una ruta específica
4. Temas globales predeterminados

### 3. Manipulación del DOM

La gestión de visibilidad se maneja mediante:

- `PageConfigHandler`: Componente cliente que aplica clases al body después de la hidratación
- **Clases CSS**: Controlan la visibilidad en lugar de manipulación directa de `style.display`
- **No manipulación directa**: Evitamos cambiar directamente el DOM para prevenir errores de hidratación

## Troubleshooting

### 1. Errores de Hidratación

Si experimentas errores como:
```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

Solución:
- No manipules `style.display` directamente, usa clases CSS
- Evita bifurcaciones condicionales basadas en `typeof window !== 'undefined'`
- Usa hooks del ciclo de vida como `useEffect` para código específico del cliente

### 2. Componentes No Visibles

Si los componentes no aparecen:
- Verifica que existan las configuraciones correctas en la base de datos
- Asegúrate de que la clase CSS `.sidebar-component` esté visible (temporalmente forzada)
- Comprueba los bordes de colores de depuración para confirmar que los componentes se están renderizando

### 3. Diagnóstico Visual

Hemos añadido información de depuración y bordes coloreados para facilitar la identificación:
- **Header** - Borde azul (`#2196f3`)
- **Footer** - Borde verde (`#4caf50`)
- **Sidebar** - Borde naranja (`#ff5722`)

## Mejoras Recientes

1. **Sistema de visibilidad CSS-first**: Reemplazo de manipulación directa del DOM por clases CSS
2. **Manejo adecuado de parámetros dinámicos**: Corrección para `params.slug` en rutas dinámicas
3. **Soporte para múltiples formatos de tema**: Compatibilidad con diferentes estructuras JSON
4. **Mejoras de diagnóstico**: Información visual y registros detallados

## Próximos Pasos

- **Documentación de Componentes**: Añadir JSDoc a todos los componentes
- **Testing Automatizado**: Implementar pruebas para garantizar la coherencia visual
- **Mejora de Rendimiento**: Optimizar la carga de temas y configuraciones
