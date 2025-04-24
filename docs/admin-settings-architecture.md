# Arquitectura de Módulos de Configuración

Este documento describe la arquitectura y metodología implementada para los módulos de configuración en el panel de administración.

## Visión General

Todas las páginas de configuración del administrador siguen una arquitectura común de tres capas:

1. **Acciones del Servidor (Server Actions)** - Archivos en `/actions/`
2. **Componentes de Formulario** - Archivos en `/components/admin/settings/`
3. **Páginas** - Archivos en `/app/(admin)/admin/settings/`

Esta arquitectura proporciona una separación clara de responsabilidades, facilita el mantenimiento, y mejora el rendimiento de la aplicación.

## 1. Acciones del Servidor (Server Actions)

### Propósito

Las acciones del servidor encapsulan la lógica de acceso a datos y manipulación de la base de datos, separándola completamente de la interfaz de usuario.

### Características

- Archivo por módulo (ej: `blog-actions.ts`, `portfolio-actions.ts`)
- Funciones con marca `"use server"` para ejecutarse exclusivamente en el servidor
- Operaciones típicas:
  - `fetch{Module}Config` - Carga la configuración actual
  - `save{Module}Config` - Persiste cambios en la base de datos
  - `getDefault{Module}Config` - Proporciona valores predeterminados

### Patrón de Implementación

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';

// Re-exportar tipos para ser usados en el cliente
export type { ModuleConfig } from '@/lib/config-server';

/**
 * Obtiene la configuración del módulo
 */
export async function fetchModuleConfig() {
  try {
    // Consulta directa a la base de datos
    const result = await prisma.$queryRaw`...`;
    
    // Parseo y validación de datos
    
    // Retorno con valores por defecto si es necesario
    return config;
  } catch (error) {
    // Manejo de errores
    console.error("Error:", error);
    return defaultConfig;
  }
}

/**
 * Guarda la configuración del módulo
 */
export async function saveModuleConfig(config: ModuleConfig) {
  try {
    // Validación opcional
    
    // Convertir a formato adecuado para almacenamiento
    const configJSON = JSON.stringify(config);
    
    // Actualizar en la base de datos
    await prisma.$executeRawUnsafe(`...`, configJSON);
    
    // Revalidar rutas afectadas
    revalidatePath("/path1");
    revalidatePath("/path2");
    
    return { success: true, message: "Configuración actualizada." };
  } catch (error) {
    // Manejo de errores
    return { 
      success: false, 
      message: "Error: " + error.message 
    };
  }
}
```

### Consideraciones Importantes

- **Restricción de Next.js 14**: Los archivos con `"use server"` solo pueden exportar funciones asíncronas
- **Tipos de Datos**: Exportar tipos con `export type { Type }` para evitar errores
- **Revalidación**: Siempre revalidar todas las rutas afectadas por los cambios

## 2. Componentes de Formulario

### Propósito

Los componentes de formulario encapsulan toda la lógica de UI para la gestión y manipulación de la configuración, incluyendo estados, validaciones y presentación.

### Características

- Implementados como componentes cliente (`"use client"`)
- Utilizan React Hook Form para manejo de formularios
- Interactúan con server actions para operaciones de datos

### Patrón de Implementación

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { fetchModuleConfig, saveModuleConfig } from "@/actions/module-actions";
import { toast } from "sonner";

export default function ModuleFormComplete() {
  // Estados
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // Inicializar formulario
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isSubmitting, isDirty },
    reset
  } = useForm({
    defaultValues: { ... }
  });
  
  // Cargar datos iniciales
  useEffect(() => {
    if (configLoaded) return;
    
    const loadConfig = async () => {
      try {
        const config = await fetchModuleConfig();
        reset(config);
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      } catch (error) {
        toast.error('Error al cargar la configuración');
        setIsInitialDataLoaded(true);
        setConfigLoaded(true);
      }
    };
    
    loadConfig();
  }, [reset, configLoaded]);

  // Enviar formulario  
  const onSubmit = async (data) => {
    try {
      const result = await saveModuleConfig(data);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error al guardar la configuración");
    }
  };

  // Renderizado condicional durante la carga
  if (!isInitialDataLoaded) {
    return <LoadingIndicator />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Campos de formulario */}
    </form>
  );
}
```

### Solución a Problemas de Rendimiento

Para resolver problemas de congelamiento y rendimiento:

1. **Control de Estados**:
   - Separar el estado de `isInitialDataLoaded` y `configLoaded`
   - Ambos previenen condiciones de carrera y bucles infinitos

2. **Optimización de useEffect**:
   - Dependencias mínimas necesarias (`[reset, configLoaded]`)
   - Guarda temprana con `if (configLoaded) return`

3. **Manejo de Radio Buttons**:
   - Evitar controladores duplicados para el mismo campo
   - Usar `register()` en lugar de `Controller` cuando sea posible

4. **Radio Buttons Simples**:
   - Usar inputs nativos en lugar de componentes personalizados si causan problemas
   ```tsx
   <input
     type="radio"
     {...register('optionName')}
     value="value1"
   />
   ```

5. **Evitar useEffect sin Control**:
   - Siempre asegurarse de que el useEffect pueda detenerse
   - Incluir un mecanismo para prevenir ejecuciones múltiples

## 3. Páginas

### Propósito

Las páginas son componentes ligeros que simplemente importan y muestran el componente de formulario, junto con cualquier contexto adicional.

### Características

- Mínima lógica, solo presentación y contexto
- Información útil para el usuario (alertas, descripciones)
- Esquema de diseño consistente

### Patrón de Implementación

```tsx
import ModuleFormComplete from "@/components/admin/settings/ModuleFormComplete";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function ModuleSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración del Módulo</h1>
      
      <Alert className="mb-6 bg-blue-50">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Información contextual importante...
        </AlertDescription>
      </Alert>
      
      <p className="text-muted-foreground mb-6">
        Descripción de qué hace esta página de configuración...
      </p>
      
      <ModuleFormComplete />
    </div>
  );
}
```

## Proceso de Depuración de Problemas

Cuando un componente causa problemas de rendimiento o congelamiento:

1. **Divide y vencerás**:
   - Dividir componentes grandes en partes más manejables
   - Identificar qué parte específica causa el problema

2. **Revisión de dependencias en useEffect**:
   - Reducir al mínimo estrictamente necesario
   - Asegurar terminación adecuada de efectos

3. **Eliminación de código duplicado**:
   - Buscar controladores o suscripciones duplicadas
   - Asegurar que los eventos no se registren múltiples veces

4. **Uso de useState vs useForm**:
   - En casos extremos, considerar un enfoque más simple con useState
   - Especialmente útil para formularios muy complejos

5. **Test progresivo**:
   - Agregar funcionalidad gradualmente para identificar problemas
   - Probar después de cada cambio significativo

## Módulos Actualmente Implementados

- Blog (`blog-actions.ts`, `BlogFormComplete.tsx`)
- Portfolio (`portfolio-actions.ts`, `PortfolioFormComplete.tsx`)
- Encabezado (`header-actions.ts`, `HeaderFormComplete.tsx`)
- Pie de página (`footer-actions.ts`, `FooterFormComplete.tsx`)
- Barra lateral (`sidebar-actions.ts`, `SidebarFormComplete.tsx`)
- Redes sociales (`social-actions.ts`, `SocialFormComplete.tsx`)
- Compartir (`sharing-actions.ts`, `SharingFormComplete.tsx`)

## Recomendaciones para Implementaciones Futuras

1. **Mantenga la cohesión**: Cada módulo debe enfocarse en un aspecto específico
2. **Evite la duplicación**: Extraiga lógica común a hooks o utilidades compartidas
3. **Tests unitarios**: Agregue pruebas para las Server Actions críticas
4. **Documentación**: Actualice este documento al agregar nuevos patrones
