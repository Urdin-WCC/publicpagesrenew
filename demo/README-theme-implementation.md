# Adaptación del Sistema de Temas con Estilos con Ámbito

## Problema identificado

Actualmente el sistema de temas tiene dos problemas principales:

1. El mismo conjunto de variables CSS (--background-value, --typography-heading-color, etc.) se está definiendo tanto a nivel global (en :root) como a nivel de componente (.header-component, etc.)
2. Los componentes no están aplicando activamente esas variables en sus elementos visuales

## Solución propuesta

El enfoque debe ser:

1. **Mantener la generación de tema por componente** - Cada componente debe seguir obteniendo su propia configuración de tema
2. **Aplicar efectivamente esas variables** - Los componentes deben usar las variables CSS en sus estilos

## Pasos de implementación

1. **Modificar generateCssFromThemeConfigs** en themeUtils.ts para generar variables CSS con prefijos específicos para componentes cuando se proporciona un selector.
   Por ejemplo:
   ```css
/* En lugar de: */
   .header-component {
     --background-value: #4a6da7;
   }
   
   /* Usar: */
   .header-component {
     --header-background-value: #4a6da7;
   }
   
   Y luego aplicar en los estilos del componente:
   background-color: var(--header-background-value);
```

2. **Modificar los componentes visualmente**:
   - Header.tsx: Agregar estilos inline que utilicen las variables CSS de tema
   - Footer.tsx: Igual
   - Sidebar.tsx: Igual
   
3. **Mantener un solo lugar para generación de tema por componente**:
   - Eliminar la generación de tema global en layout.tsx
   - Dejar que cada componente genere su propio tema

## Beneficios

- Cada componente puede tener su propio conjunto de variables de tema
- Los cambios de tema en un componente no afectan a otros
- Los temas se aplican correctamente a nivel visual
