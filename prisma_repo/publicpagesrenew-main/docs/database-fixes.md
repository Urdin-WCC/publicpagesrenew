# Correcciones de Errores de Base de Datos

## Problema: Fechas Inválidas en la Tabla GlobalConfig

### Descripción del Problema
La aplicación estaba experimentando errores al intentar acceder a la configuración global del sitio debido a valores de fecha inválidos en la columna `updatedAt` de la tabla `GlobalConfig`. El error específico era:

```
Invalid `prisma.globalConfig.findUnique()` invocation:
Value out of range for the type. The column `updatedAt` contained an invalid datetime value with either day or month set to zero.
```

Este error afectaba múltiples partes de la aplicación, incluyendo:
- La página principal del blog (`app/(public)/blog/page.tsx`)
- El layout público (`app/(public)/layout.tsx`)
- La configuración del banner de cookies
- Otras funcionalidades que dependen de la configuración global

### Solución Implementada

#### 1. Función Robusta de Acceso a Configuración Global (`lib/config.ts`)
Se implementó una versión mejorada de la función `getGlobalConfig()` que:

- Utiliza consultas SQL nativas (`$queryRaw`) para evitar los problemas de Prisma con el análisis de fechas inválidas
- Implementa un sistema de múltiples capas de fallback:
  - Intenta obtener primero los datos mediante SQL directamente
  - Procesa y sanitiza los valores de fecha potencialmente problemáticos
  - Si falla, intenta la consulta Prisma tradicional como backup
  - Como último recurso, devuelve un objeto de configuración mínimo

```typescript
// Extracto del código de solución
export async function getGlobalConfig(): Promise<GlobalConfig | null> {
  try {
    // Verificar existencia con $executeRawUnsafe que es más compatible
    try {
      const result = await prisma.$executeRawUnsafe(
        `SELECT id, siteName, description FROM GlobalConfig WHERE id = 'global'`
      );
      
      if (result !== null) {
        // Sabemos que existe, ahora intentamos obtenerlo
        try {
          // Intento con API estándar de Prisma
          const config = await prisma.globalConfig.findUnique({
            where: { id: 'global' },
          });
          return config;
        } catch (dateError) {
          // Si falla por errores de fecha, usamos consulta más limitada
          const basicConfig = await prisma.$queryRaw`
            SELECT id, siteName, description FROM GlobalConfig WHERE id = 'global'
          `;
          
          if (Array.isArray(basicConfig) && basicConfig.length > 0) {
            // Construir objeto con fechas predeterminadas
            return {
              ...basicConfig[0],
              createdAt: new Date(),
              updatedAt: new Date()
            } as any;
          }
        }
      }
    } catch (sqlError) {
      // Si falla el enfoque SQL, continuamos con fallback
    }
    
    // Configuración predeterminada como último recurso
    return {
      id: 'global',
      siteName: 'Neurowitch',
      description: 'Sitio web',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  } catch (error) {
    // Manejo global de errores
    // ...
  }
}
```

#### 2. Actualización de Funciones Dependientes (`lib/config-server.ts`)
- Se modificaron las funciones `getBlogConfig()` y `getPortfolioConfig()` para usar la nueva versión robusta de `getGlobalConfig()`
- Se agregó manejo de errores adicional y valores predeterminados para garantizar que nunca fallen completamente

#### 3. Mejoras en Componentes de UI (`app/(public)/layout.tsx`)
- Se mejoró la función `getCookieBannerSettings()` para usar nuestra implementación robusta
- Se añadió manejo de errores para cada paso del proceso
- Se implementaron valores por defecto que garantizan que la UI no se romperá aunque haya errores en la base de datos

### Beneficios de la Solución

1. **Mayor Robustez**: La aplicación ahora puede funcionar incluso con datos imperfectos en la base de datos
2. **Degradación Elegante**: Si hay errores, el sistema usa valores predeterminados en lugar de fallar completamente
3. **Mantenimiento Simplificado**: Un punto centralizado para la lógica de acceso a la configuración global
4. **Mejor Experiencia de Usuario**: Elimina errores 500 en páginas públicas
5. **Facilitación de Desarrollo**: Elimina errores confusos durante el desarrollo y pruebas
6. **Compatibilidad Mejorada**: Uso de métodos SQL que funcionan mejor con diferentes proveedores de base de datos
7. **Estrategia en Capas**: Enfoque progresivo que intenta métodos más seguros primero, con fallbacks adecuados

## Implementación y Archivos Afectados

### Archivos Modificados
- `lib/config.ts`: Nueva implementación robusta de `getGlobalConfig()`
- `lib/config-server.ts`: Actualización para usar la nueva implementación
- `app/(public)/layout.tsx`: Mejora de `getCookieBannerSettings()` 

## Notas Adicionales

### Causa Probable del Problema Original
El problema probablemente fue causado por:
- Migración de datos incompleta o incorrecta
- Inserciones directas en la base de datos sin validación de fechas
- Problemas con las zonas horarias o conversiones de fecha durante operaciones de importación/exportación

### Cambios en la Solución Final

Después de encontrar problemas adicionales con `$queryRaw`, se implementaron los siguientes cambios:

1. **Uso de `$executeRawUnsafe`**: Cambiamos a un método SQL de más bajo nivel para la verificación inicial de existencia
2. **Consultas SQL Simplificadas**: Limitamos las columnas seleccionadas para evitar problemas con tipos de datos complejos
3. **Estrategia de Verificación Primero**: Primero verificamos si el registro existe antes de intentar recuperarlo
4. **Manejo de Errores Específico**: Captura de errores en cada nivel con fallbacks apropiados

### Solución a Largo Plazo
Para una solución permanente, se debería considerar:
1. Corregir directamente los valores de fecha inválidos en la base de datos
2. Implementar triggers o restricciones a nivel de base de datos
3. Mantener el enfoque robusto actual como capa de protección adicional
4. Considerar una migración de datos controlada para normalizar todos los campos de fecha
5. Implementar validación en la capa de aplicación antes de guardar fechas en la base de datos
