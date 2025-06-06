# Sistema de Asignación de Temas por Sección

## Descripción

El sistema de asignación de temas por sección permite definir temas visuales específicos para cada componente principal del sitio web, tanto para modo claro como para modo oscuro. Esto proporciona un nivel de personalización avanzado, permitiendo que cada sección tenga su propia identidad visual mientras se mantiene la coherencia general del sitio.

## ACTUALIZACIÓN (2025-Q2): Gestión Centralizada de Temas

El sistema ha sido completamente mejorado para proporcionar una gestión centralizada de asignaciones de temas. Todas las asignaciones ahora se configuran desde una única interfaz en **Administración → Configuración → Apariencia → Asignaciones Específicas**, simplificando el mantenimiento y evitando configuraciones contradictorias.

### Beneficios del Nuevo Sistema

- **Experiencia de usuario mejorada**: Interfaz unificada y coherente
- **Prevención de errores**: Elimina la posibilidad de asignaciones redundantes o contradictorias
- **Mayor visibilidad**: Todas las asignaciones visibles de un vistazo
- **Selector inteligente**: Ahora muestra tanto elementos del sistema como páginas estáticas disponibles
- **Opciones personalizadas**: Mantiene la posibilidad de asignar temas a rutas personalizadas

## Componentes y Rutas Soportados

El sistema de asignación centralizado soporta los siguientes destinos:

### Elementos del Sistema
1. **Blog** - Configuración específica para el módulo de blog
2. **Portfolio** - Configuración para el módulo de portfolio
3. **Header** - Tema específico para el encabezado
4. **Footer** - Tema para el pie de página
5. **Sidebar** - Personalización de la barra lateral

### Páginas Estáticas
- Todas las páginas estáticas creadas en el sistema aparecen automáticamente como opciones disponibles
- Cada página puede tener un tema específico para modo claro y otro para modo oscuro

### Rutas Personalizadas
- Posibilidad de asignar temas a rutas específicas que no correspondan a ninguna de las anteriores
- Útil para secciones personalizadas o páginas gestionadas programáticamente

## Estructura de Datos

Las asignaciones de tema se almacenan en la configuración global del sitio, específicamente en el campo `themeAssignments` con la siguiente estructura JSON:

```json
{
  "themeAssignments": {
    "blog": { 
      "light": 1,  // ID del tema para modo claro
      "dark": 2    // ID del tema para modo oscuro
    },
    "pages": { 
      "light": 3, 
      "dark": 4 
    },
    "portfolio": { 
      "light": 5, 
      "dark": null  // null indica que se usará el tema por defecto del sitio
    },
    "header": { 
      "light": null, 
      "dark": 6 
    },
    "footer": { 
      "light": 7, 
      "dark": 8 
    },
    "sidebar": { 
      "light": null, 
      "dark": null 
    }
  }
}
```

## Funcionamiento

El sistema funciona de la siguiente manera:

1. Cada componente carga su configuración específica desde la API o acciones del servidor.
2. Al mismo tiempo, carga las asignaciones de tema desde `themeAssignments` en la configuración global.
3. Cuando se guarda la configuración de una sección:
   - Los datos propios de la sección se guardan en su ubicación específica (p.ej., `footer`, `blog`, etc.)
   - Las asignaciones de tema se extraen y se guardan separadamente en `themeAssignments`
4. Las asignaciones están disponibles en la parte pública del sitio, donde el componente `ThemeSwitcher` utilizará esta información para aplicar los temas adecuados según la sección actual y el modo seleccionado (claro/oscuro).

## Interfaz de Usuario

Cada página de configuración incluye:

- Selectores para elegir el tema en modo claro y oscuro
- Opción "Tema por defecto del sitio" que equivale a `null` en la base de datos
- Vista previa del nombre del tema seleccionado

## Implementación Técnica

La implementación se basa en varios componentes clave:

1. **Carga de temas disponibles**:
   ```tsx
   const { data: themes } = useSWR<ThemePreset[]>('/api/theme/presets', fetcher);
   ```

2. **Manejadores de cambio de tema**:
   ```tsx
   const handleLightThemeChange = (value: string) => {
     setValue('lightThemeId', value && value !== 'default' ? parseInt(value) : null);
   };
   ```

3. **Carga de asignaciones existentes**:
   ```tsx
   useEffect(() => {
     // ... carga normal de configuración
     
     if (config?.themeAssignments) {
       try {
         const assignments = JSON.parse(config.themeAssignments);
         if (assignments.sectionName) {
           if (assignments.sectionName.light) {
             setValue('lightThemeId', assignments.sectionName.light);
           }
           if (assignments.sectionName.dark) {
             setValue('darkThemeId', assignments.sectionName.dark);
           }
         }
       } catch (e) {
         console.error('Error parsing theme assignments:', e);
       }
     }
   }, [setValue]);
   ```

4. **Guardado de asignaciones**:
   ```tsx
   const onSubmit = async (data) => {
     const { lightThemeId, darkThemeId, ...sectionData } = data;
     
     // Guardar datos normales de la sección
     const result = await saveGlobalConfig({ sectionName: sectionData });
     
     if (result.success) {
       // Obtener asignaciones existentes
       const currentConfig = await fetchGlobalConfig();
       let themeAssignments = {};
       
       if (currentConfig?.themeAssignments) {
         themeAssignments = JSON.parse(currentConfig.themeAssignments);
       }
       
       // Actualizar asignación para esta sección
       themeAssignments = {
         ...themeAssignments,
         sectionName: {
           light: lightThemeId,
           dark: darkThemeId
         }
       };
       
       // Guardar asignaciones actualizadas
       await saveGlobalConfig({
         themeAssignments: JSON.stringify(themeAssignments)
       });
     }
   };
   ```

## Ventajas del Sistema

- **Flexibilidad visual** - Cada sección puede tener su propia identidad visual
- **Coherencia estructural** - Los datos de configuración se mantienen organizados
- **Experiencia de usuario mejorada** - La interfaz es intuitiva y consistente entre secciones
- **Separación de responsabilidades** - Las asignaciones de tema están separadas de la configuración funcional
