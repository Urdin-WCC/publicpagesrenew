# Mejores Prácticas para Componentes Cliente y Servidor en Next.js

## Introducción

Next.js 13+ introdujo un nuevo paradigma de renderizado con la App Router, que distingue entre componentes de servidor y componentes de cliente. Este documento explica las mejores prácticas para separar y organizar estos componentes para evitar errores comunes y optimizar el rendimiento de la aplicación.

## Distinción entre Componentes de Servidor y Cliente

### Componentes de Servidor
- **Características**: 
  - Son el valor predeterminado en la App Router de Next.js
  - Ejecutados sólo en el servidor, no se envían al cliente
  - Pueden acceder directamente a recursos del servidor (DB, filesystem)
  - No pueden usar hooks de React ni estado

### Componentes de Cliente
- **Características**:
  - Declarados con la directiva `"use client"` al inicio del archivo
  - Incluyen interactividad del lado del cliente
  - Pueden usar hooks de React, estado y efectos
  - No tienen acceso directo a recursos del servidor

## Problema Común: Mezcla de Componentes

Un error frecuente es intentar mezclar lógica de servidor y cliente en un solo archivo, como:

```tsx
// ❌ INCORRECTO
import { getServerData } from '@/lib/server'; // Server-side

export default async function Page() {
  const data = await getServerData();

  // Componente de cliente dentro de un componente de servidor
  'use client';
  
  import { useState } from 'react'; // Client-side hook
  
  function ClientComponent({ data }) {
    const [state, setState] = useState(false);
    // ...
  }
  
  return <ClientComponent data={data} />;
}
```

Este enfoque genera errores como:

```
Error: The "use client" directive must be placed before other expressions.
```

## Solución: Separación de Responsabilidades

La solución óptima es separar claramente los componentes de servidor y cliente en archivos diferentes:

### 1. Componentes de Cliente (`*.tsx` con directiva "use client")

```tsx
// components/client/MyClientComponent.tsx
'use client';

import { useState } from 'react';

export default function MyClientComponent({ data }) {
  const [state, setState] = useState(false);
  // Lógica interactiva del cliente...
  
  return (/* JSX con interactividad */);
}
```

### 2. Componentes de Servidor (sin directiva)

```tsx
// app/page.tsx (componente de servidor)
import { getServerData } from '@/lib/server';
import MyClientComponent from '@/components/client/MyClientComponent';

export default async function Page() {
  // Operaciones de servidor
  const data = await getServerData();
  
  // Renderizar componente de cliente con datos del servidor
  return (
    <div>
      <h1>Mi Página</h1>
      <MyClientComponent data={data} />
    </div>
  );
}
```

## Beneficios de la Separación

1. **Claridad Estructural**: Cada archivo tiene un propósito claro
2. **Optimización de Rendimiento**:
   - Menos JavaScript enviado al cliente
   - Mejor caching y previsibilidad
3. **Prevención de Errores**: Evita errores comunes de compilación y runtime
4. **Mantenibilidad**: Más fácil de entender y actualizar por otros desarrolladores

## Casos de Estudio: Refactorización de Componentes en el Proyecto

### 1. Refactorización del Módulo SEO

En el proyecto Neurowitch, se identificó un error en el módulo SEO debido a la combinación de código de servidor y cliente en un solo archivo:

#### Problema Original:

En `app/(admin)/admin/seo/page.tsx`:
- La parte superior contenía un componente de servidor
- La parte inferior definía un componente de cliente con `'use client'` en medio del archivo
- Esto resultaba en errores de compilación con mensajes como:
  ```
  Error: The "use client" directive must be placed before other expressions.
  ```

#### Solución Implementada:

1. **Separación en Archivos**:
   - Componente de cliente: `components/admin/seo/SEOSettingsForm.tsx` (con `'use client'` al inicio)
   - Componente de servidor: `app/(admin)/admin/seo/page.tsx` (importando el componente de cliente)

2. **Componente de Cliente**:
```tsx
// components/admin/seo/SEOSettingsForm.tsx
'use client';

import { useState } from 'react';
// Resto del código cliente...
```

3. **Componente de Servidor**:
```tsx
// app/(admin)/admin/seo/page.tsx
import { getGlobalConfig } from '@/lib/config-server';
import SEOSettingsForm from '@/components/admin/seo/SEOSettingsForm';

export default async function SEOSettingsPage() {
  const config = await getGlobalConfig();
  return (
    <div>
      <SEOSettingsForm initialData={config} />
    </div>
  );
}
```

### 2. Mejoras en el Módulo de Usuarios

El módulo de administración de usuarios también se optimizó siguiendo estas prácticas:

#### Problema Detectado:

- Acceso directo a la tabla `Session` en bases de datos que resultaba en inconsistencias
- Código difícil de mantener con lógica de autenticación duplicada
- Mensajes de error como "No se pudo identificar al usuario actual"

#### Solución:

1. **Uso de la API de Autenticación de Next.js**:
```tsx
// Reemplazando el acceso directo a la base de datos:
const session = await prisma.session.findFirst({
  where: { expires: { gt: new Date() } }
}); // ❌ Problemático

// Con la API oficial de autenticación:
const { auth } = await import("@/lib/auth");
const session = await auth();
const currentUserId = session?.user?.id; // ✅ Recomendado
```

2. **Beneficios Obtenidos**:
   - Mayor robustez en sistema de autenticación
   - Menos código duplicado
   - Consistencia en toda la aplicación
   - Eliminación de errores de identificación de usuario

## Guía para Migrar Componentes Mezclados

Si tienes componentes que mezclan lógica de cliente y servidor:

1. Identifica la responsabilidad principal: ¿Es principalmente cliente o servidor?
2. Extrae la lógica de cliente a un componente separado con `'use client'`
3. Mantén la lógica de servidor en el componente original
4. Pasa datos del servidor al componente cliente mediante props
5. Verifica que la directiva `'use client'` esté al principio del archivo cliente

## Manejo de Params en API Routes Dinámicas

En Next.js 13+, existe una recomendación específica para manejar los parámetros en rutas API dinámicas:

```typescript
// ❌ INCORRECTO: Desestructurar params directamente
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Error: Route used `params.id`. `params` should be awaited before using its properties.
  // ...
}

// ✅ CORRECTO: Usar context.params con await Promise.resolve
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  // First await the context.params object
  const params = await Promise.resolve(context.params);
  const id = params.id;
  // ...
}
```

Seguir este patrón evita advertencias y posibles errores con los parámetros dinámicos de ruta.

### Manejo de Params en Componentes Cliente

En componentes cliente, también se debe tener cuidado al manejar parámetros de rutas dinámicas, especialmente en hooks como useEffect:

```tsx
// ❌ INCORRECTO: Acceder directamente a params.id en useEffect
export default function EditPage({ params }: { params: { id: string } }) {
  useEffect(() => {
    fetchData(params.id); // Error: Route used `params.id`. `params` should be awaited.
  }, [params.id]); // Problemas en el array de dependencias
}

// ✅ MEJOR PRÁCTICA: Usar el hook useParams de next/navigation
import { useParams } from 'next/navigation';

export default function EditPage() {
  // useParams es el método recomendado para acceder a parámetros de ruta
  const params = useParams();
  
  // Extraer y verificar el tipo del ID de forma segura
  const itemId = typeof params?.id === 'string' ? params.id : null;
  
  useEffect(() => {
    if (itemId) {
      fetchData(itemId);
    }
  }, [itemId]); // Dependencia segura
}
```

Esta protección contra nulls y accesos condicionales evita errores cuando el objeto params aún no está completamente resuelto.

## Conclusiones

Siguiendo estas prácticas, mejorarás significativamente:

- La arquitectura de tu aplicación Next.js
- El rendimiento al cargar menos JavaScript en el cliente
- La mantenibilidad del código
- La robustez, evitando errores comunes de renderizado

Recuerda siempre: **Separa claramente los componentes de servidor y cliente en archivos diferentes** para evitar problemas y aprovechar al máximo la arquitectura híbrida de Next.js.
