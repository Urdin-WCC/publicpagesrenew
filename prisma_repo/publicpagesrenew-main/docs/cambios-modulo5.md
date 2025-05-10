# Documentación de Cambios - Módulo 2

## Problema Identificado

El proyecto presentaba un error crítico que impedía su ejecución. El error estaba relacionado con el módulo `node:async_hooks` que no estaba siendo manejado correctamente por Webpack en Next.js 15:

```
Module build failed: UnhandledSchemeError: Reading from "node:async_hooks" is not handled by plugins (Unhandled scheme).
Webpack supports "data:" and "file:" URIs by default.
You may need an additional plugin to handle "node:" URIs.
```

Este error se originaba en la cadena de importaciones:
```
node:async_hooks
./node_modules/@prisma/client/runtime/library.mjs
./node_modules/@auth/prisma-adapter/index.js
./lib/auth.ts
```

## Soluciones Implementadas

### 1. Eliminación del Adaptador de Prisma

El principal problema estaba relacionado con el uso de `PrismaAdapter` de Auth.js, que internamente utiliza módulos de Node.js con el prefijo `node:`. Para solucionarlo:

- Eliminamos el adaptador de Prisma (`PrismaAdapter`) de la configuración de Auth.js en:
  - `auth.ts`
  - `lib/auth-server.ts`

Esto permite que la autenticación siga funcionando con JWT sin depender del adaptador que causaba problemas.

### 2. Configuración de Webpack para Módulos de Node.js

Creamos un archivo `next.config.mjs` con la configuración adecuada para manejar los módulos de Node.js en el cliente:

```javascript
/**
 * Webpack configuration
 * 
 * This configuration handles Node.js built-in modules that are used by dependencies
 * like Prisma and Auth.js
 */
webpack: (config, { isServer }) => {
  if (!isServer) {
    // Polyfills para módulos de Node.js en el cliente
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      os: false,
      path: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      async_hooks: false,
    };
    
    // Manejar módulos con prefijo 'node:'
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:async_hooks': 'async_hooks-browserify',
      'node:buffer': 'buffer',
      'node:crypto': 'crypto-browserify',
      // ... otros módulos
    };
  }
  return config;
},
```

### 3. Reorganización del Código de Autenticación

Para mejorar la estructura y evitar problemas de importación circular:

- Reorganizamos el código de autenticación para separar claramente la lógica del cliente y del servidor
- Simplificamos `auth.ts` para que solo re-exporte funciones de `auth-server.ts` y `auth-client.ts`
- Actualizamos `lib/auth-client.ts` para incluir solo funciones seguras para el cliente
- Actualizamos `lib/auth-server.ts` para manejar la lógica del servidor sin el adaptador de Prisma

### 4. Instalación de Polyfills

Instalamos varios polyfills para los módulos de Node.js que se utilizan en el cliente:

```bash
npm install --save-dev browserify-fs browserify-zlib buffer crypto-browserify events https-browserify net-browserify os-browserify path-browserify stream-browserify stream-http url util --legacy-peer-deps
```

## Archivos Modificados

1. **auth.ts**:
   - Eliminamos el adaptador de Prisma
   - Simplificamos el archivo para re-exportar funciones de `auth-server.ts` y `auth-client.ts`

2. **lib/auth.ts**:
   - Simplificamos el archivo para re-exportar funciones de `auth-server.ts` y `auth-client.ts`

3. **lib/auth-server.ts**:
   - Eliminamos el adaptador de Prisma
   - Mantuvimos la lógica de autenticación del servidor

4. **lib/auth-client.ts**:
   - Actualizamos para incluir funciones seguras para el cliente
   - Añadimos funciones de utilidad para manejo de roles

5. **next.config.ts**:
   - Eliminado y reemplazado por `next.config.mjs`

6. **next.config.mjs**:
   - Creado con la configuración adecuada para manejar los módulos de Node.js

## Resultado

La aplicación ahora se inicia correctamente y todas las páginas se cargan sin errores. Hemos mantenido la funcionalidad existente sin modificar los requerimientos del proyecto.

Estos cambios permiten que la aplicación funcione correctamente con Next.js 15 y React 19, manteniendo la compatibilidad con las dependencias existentes como Prisma y Auth.js.
