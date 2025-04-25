# Solución de Problemas en Componentes de Interfaz Pública

Este documento detalla problemas comunes y sus soluciones relacionados con los componentes de la interfaz pública. Sirve como referencia de mantenimiento para desarrolladores.

## Problemas de Dimensiones

### Problema: El ancho del Sidebar no se aplica correctamente

**Síntoma**: El valor configurado para el ancho del Sidebar (p.ej. '350px') no se respeta visualmente.

**Causa**: El ancho se estaba aplicando como una clase de Tailwind (`widthClass`) en lugar de como un estilo inline con unidades CSS válidas.

**Solución implementada**:
```jsx
<aside 
  className={`sidebar-component p-4 ${positionClasses} ${className}`}
  style={{
    backgroundColor: 'var(--background-value, #f5f5f5)',
    color: 'var(--typography-paragraph-color, inherit)',
    width: sidebarConfig.width || 'auto',
    maxWidth: sidebarConfig.width || '320px'
  }}
>
```

### Problema: La altura del Footer no se aplica correctamente

**Síntoma**: El Footer no respeta la altura configurada.

**Solución**: Aplicación directa del valor como estilo inline:
```jsx
style={{
  backgroundColor: 'var(--background-value, white)',
  color: 'var(--typography-paragraph-color, inherit)',
  height: footerConfig.height !== 'auto' ? footerConfig.height : 'auto'
}}
```

## Problemas con Widgets

### Problema: Widgets no se muestran en Sidebar o Footer

**Síntomas**:
- Los widgets están configurados pero no aparecen
- Error en consola sobre propiedades faltantes o tipos incompatibles

**Causas**:
1. Los widgets provienen de múltiples fuentes (configuración, secciones)
2. Incompatibilidad de tipos entre diferentes definiciones de Widget
3. ID faltantes o inválidos en algunos widgets

**Solución implementada**:
1. Garantizar IDs válidos para todos los widgets:
```javascript
// En Footer.tsx
const configWidgets = (footerConfig.widgets || []).map((widget, index) => ({
  ...widget,
  id: widget.id || `footer-widget-${index}` // Garantizar siempre un ID
}));

// En Sidebar.tsx
const configWidgets = (sidebarConfig.widgets || []).map((widget, index) => ({
  ...widget,
  id: widget.id || `sidebar-widget-${index}`
}));
```

2. Uso de casting de tipos cuando sea necesario para compatibilidad:
```javascript
<WidgetRenderer 
  key={widget.id || `widget-${index}`} 
  widget={widget as any} 
/>
```

## Problemas de Tipado

### Problema: Conflicto entre diferentes definiciones de Widget

**Síntoma**: Error de TypeScript sobre tipos incompatibles:
```
Type 'FooterWidget' is not assignable to type 'Widget'.
Types of property 'id' are incompatible.
```

**Causa**: Múltiples definiciones de la interfaz Widget con diferentes requisitos (id obligatorio vs opcional).

**Soluciones**:
1. Definir interfaces específicas por componente (FooterWidget, SidebarWidget)
2. Garantizar que todos los widgets tienen un ID válido antes de utilizarlos
3. Utilizar casting de tipos cuando sea necesario para la compatibilidad

## Problemas de Configuración

### Problema: Errores al parsear la configuración JSON

**Síntomas**:
- Valores de configuración no disponibles
- Errores en consola durante el parseo

**Solución implementada**: Manejo seguro con valores por defecto y captura de errores:
```javascript
// Parse config con valores predeterminados
let sidebarConfig: SidebarConfig = {
  showWidgets: true,
  backgroundColor: 'bg-gray-50',
  textColor: 'text-gray-700',
  width: 'w-64',
  visible: true,
  customHtml: ''
};

try {
  // Parse sidebar configuration if available
  if (config) {
    // Si es string, intentar parsearlo
    const configData = typeof config === 'string' ? JSON.parse(config) : config;
    
    // Combinar con valores predeterminados
    sidebarConfig = {
      ...sidebarConfig,
      ...configData,
    };
  }
} catch (error) {
  console.error('Error parsing sidebar config:', error);
}
```

## Prácticas Recomendadas

1. **Aplicar dimensiones**: Usar siempre estilos inline para dimensiones que aceptan unidades CSS (ancho, alto).

2. **Garantizar IDs**: Asegurar que todos los elementos, especialmente widgets, tengan IDs válidos.

3. **Manejo de configuración**:
   - Implementar valores por defecto para toda configuración
   - Usar estructuras try/catch al parsear JSON
   - Validar la estructura esperada

4. **Compatibilidad de tipos**:
   - Proporcionar interfaces específicas para cada componente
   - Implementar conversiones de tipo seguras cuando sea necesario
   - Documentar requisitos de tipo en interfaces compartidas

5. **Pruebas específicas**:
   - Probar componentes con configuraciones extremas (vacía, valores mínimos/máximos)
   - Verificar que los sistemas de fallback funcionen correctamente
