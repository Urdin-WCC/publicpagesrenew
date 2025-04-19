# neurowitch
# Web App

# Neurowitch - Core Module

Este es el Módulo Core (Módulo 1) para la aplicación Neurowitch. Proporciona la base y los servicios compartidos para todos los demás módulos.

## Características

- **Autenticación y Autorización**: Autenticación de usuarios con Auth.js v5 (Next-Auth.js v5) y autorización basada en roles, siguiendo los requisitos de seguridad del Capítulo 0
- **Conexión a Base de Datos**: Conexión a base de datos MySQL con Prisma ORM
- **Componentes Compartidos**: Componentes reutilizables como ImageUploader y HtmlEditor
- **Utilidades**: Generación de slugs, gestión de configuración y más
- **Sistema de Traducciones**: Gestión centralizada de todos los textos de la interfaz en español, siguiendo los requisitos del Capítulo 0
- **Seguridad**: Limitación de tasa, cabeceras de seguridad y validación de entrada

## Módulo 4: Configuración del Sitio (Admin)

- Configuración avanzada del header: elige qué elementos (logo, texto, menú, iconos sociales, interruptor de tema, bloque HTML) están presentes y su posición (9 posiciones posibles).
- Gestión de widgets en footer y sidebar, con tipos configurables y ordenación flexible.
- Selector de iconos sociales y de botones para compartir, con soporte para WhatsApp y decenas de servicios.
- Selector de imágenes existente en el sitio y subida de nuevas imágenes en todos los formularios.
- Editor HTML moderno basado en Tiptap, compatible con React 18/19.
- Formularios protegidos por rol, validados y con feedback claro.
- Guardado y lectura de configuración mediante Server Actions seguras.
- Arquitectura desacoplada, escalable y lista para integración con otros módulos.

## Módulo 5: Blog (Gestión y Visualización)

Este módulo implementa toda la funcionalidad relacionada con el blog de la aplicación:

- **Gestión de Contenido (Admin)**:
    - CRUD completo para Posts, Categorías y Etiquetas en `/admin/blog/...`
    - Formularios con validación y componentes core (`HtmlEditor`, `ImageUploader`).
    - Lógica de permisos básica por rol (`COLLABORATOR` crea borradores, `EDITOR+` publica/gestiona todo).
    - Página de configuración específica del blog en `/admin/settings/blog` (posts por página, comentarios, etc.) para `ADMIN+`.
- **Visualización Pública**:
    - Listado de posts publicados en `/blog` con paginación.
    - Página de detalle de post en `/blog/[slug]`.
    - Páginas de archivo por categoría (`/blog/category/[slug]`) y etiqueta (`/blog/tag/[slug]`).
    - Página de búsqueda (`/blog/search?q=...`).
    - Generación de metadatos (título, descripción) para SEO en páginas de detalle.
- **API**:
    - Endpoints RESTful en `/api/blog`, `/api/blog/[id]`, `/api/blog/latest` para operaciones CRUD y obtención de datos.
    - Endpoint en `/api/settings/blog` para gestionar la configuración.
- **Modelos de Datos**:
    - `Post`, `Category`, `Tag` definidos en `prisma/schema.prisma` con relaciones adecuadas.

**Estructura relevante:**
- `app/(admin)/admin/blog/`: Páginas de administración del blog.
- `app/(admin)/admin/settings/blog/`: Página de configuración del blog.
- `app/(public)/blog/`: Páginas públicas del blog.
- `app/api/blog/`: Rutas API del blog.
- `app/api/settings/blog/`: Ruta API de configuración del blog.
- `prisma/schema.prisma`: Modelos `Post`, `Category`, `Tag`, `PostStatus`.

## Tema Multi-Ruta (Anexo B)

Se ha implementado un sistema de temas flexible que permite:

- Configuración separada de temas para modos claro y oscuro
- Asignación de diferentes temas según la ruta/contexto
- Control detallado de elementos UI como LoadingSpinner y ThemeSwitcher
- Configuración de posicionamiento sticky para elementos de interfaz

La refactorización incluyó:
- Nuevos modelos de datos para ThemePreset y campos en GlobalConfig
- Funciones de utilidad en `lib/themeUtils.ts`
- Actualización del layout público para usar el nuevo sistema
- Base para la futura interfaz administrativa de temas (Módulo 7)

Para más detalles, consulta la [documentación completa del sistema de temas](./docs/theme-system-refactoring.md).

## Primeros Pasos

### Requisitos Previos

- Node.js 18+ y npm
- Base de datos MySQL 5.7+

### Instalación

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno en `.env`:

```
DATABASE_URL="mysql://username:password@host:port/database"
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=60000
```

> **Nota**: A partir de Auth.js v5, las variables de entorno para autenticación usan el prefijo `AUTH_` en lugar de `NEXTAUTH_`.

4. Genera el cliente Prisma:

```bash
npx prisma generate
```

5. Aplica el esquema de la base de datos:

```bash
npx prisma db push
```

6. Alimenta la base de datos con usuarios predeterminados:

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

7. Inicia el servidor de desarrollo:

```bash
npm run dev
```

## Componentes del Módulo Core

### Autenticación

El sistema de autenticación utiliza Auth.js v5 (Next-Auth.js v5) con las siguientes características:

- Autenticación con email/contraseña mediante CredentialsProvider
- Estrategia de sesión JWT con rol e ID de usuario
- Autorización basada en roles (MASTER > ADMIN > EDITOR > COLLABORATOR)
- Limitación de tasa en intentos de inicio de sesión
- Configuración centralizada en el archivo `auth.ts` en la raíz del proyecto
- Componente `AuthProvider` para proporcionar el contexto de sesión a los componentes cliente

Esta implementación cumple con los requisitos de seguridad establecidos en el Capítulo 0, sección 0.5 "Security Requirements".

Usuarios predeterminados:
- master@app.com / 12345.Abcd (rol MASTER)
- admin@app.com / 12345.Abcd (rol ADMIN)
- editor@app.com / 12345.Abcd (rol EDITOR)
- collaborator@app.com / 12345.Abcd (rol COLLABORATOR)

### Base de Datos

La conexión a la base de datos se gestiona a través de Prisma con los siguientes modelos:

- User: Cuentas de usuario con roles
- Account, Session, VerificationToken: Modelos de Auth.js (Next-Auth.js)
- GlobalConfig: Configuración global de la aplicación
- AdminAction: Registro de auditoría para acciones administrativas

### Componentes Compartidos

- **ImageUploader**: Componente para subir y seleccionar imágenes
- **HtmlEditor**: Editor de texto enriquecido basado en React Quill

### Utilidades

- **generateSlug**: Función para generar slugs amigables para URLs a partir de títulos
- **logAdminAction**: Función para registrar acciones importantes en el panel de administración
- **getGlobalConfig/updateGlobalConfig**: Funciones para gestionar la configuración global

### Sistema de Traducciones

La aplicación utiliza un sistema centralizado de traducciones para todos los textos de la interfaz, implementando los requisitos del Capítulo 0, sección 0.5 "Application Language".

**Características principales:**

- Todos los textos visibles para el usuario están en español
- Centralización de textos en un solo archivo para fácil mantenimiento
- Preparado para futura internacionalización

**Cómo usar el sistema:**

Actualmente, se utiliza el objeto `translations` directamente. Ejemplo:
```tsx
import { translations } from "@/app/translations";

// Traducción simple
const textoGuardar = translations.common.save;

// Traducción con parámetros
const textoBienvenida = translations.admin.welcome.replace("{0}", "Usuario");
```

Consulta la [Documentación del Sistema de Traducciones](./docs/translation-system.md) o la [versión en español](./docs/sistema-traducciones.md) para más detalles.

### Obtención Dinámica de Contenido y Configuración

Todas las páginas públicas obtienen su contenido, apariencia y configuración dinámicamente desde la base de datos a través de las funciones del Core Module. No debe haber textos ni datos hardcoded en los componentes públicos. Los layouts y componentes principales reciben la configuración y los textos desde la base de datos y el sistema de traducciones.

---

## Dashboard de Administración (Módulo 3)

El dashboard de administración está implementado en `/admin/dashboard` y proporciona:
- Estadísticas generales del sitio.
- Logs de acciones administrativas (admin/master).
- Enlaces rápidos.
- Navegación lateral y cabecera de administración.

---

## Estructura de Carpetas

```text
neurowitch-app/
├── app/                      # Rutas principales (App Router)
│   ├── (admin)/              # Rutas del panel de administración
│   ├── (public)/             # Rutas públicas
│   ├── api/                  # Rutas API
│   │   ├── auth/             # Rutas de Next-Auth.js
│   │   └── core/             # Rutas API del core
│   ├── globals.css           # Estilos globales
│   └── layout.tsx            # Layout raíz
├── components/               # Componentes React reutilizables
│   ├── core/                 # Componentes core
│   ├── admin/                # Componentes de administración
│   └── public/               # Componentes públicos
├── lib/                      # Lógica compartida y utilidades
│   ├── auth.ts               # Configuración de Next-Auth.js
│   ├── prisma.ts             # Cliente Prisma
│   ├── utils.ts              # Funciones de utilidad
│   ├── stats.ts              # Funciones de estadísticas
│   ├── config.ts             # Funciones de configuración
│   ├── rate-limit.ts         # Utilidades de limitación de tasa
│   └── hooks/                # Hooks personalizados de React
├── app/
│   └── translations.ts       # Sistema de traducciones
├── prisma/                   # Configuración de Prisma
│   ├── schema.prisma         # Esquema de BD
│   └── seed.ts               # Script de alimentación
├── public/                   # Activos estáticos
│   └── uploads/              # Subidas de usuarios
├── docs/                     # Documentación
├── middleware.ts             # Middleware de Next.js
├── next.config.ts            # Configuración de Next.js
└── package.json              # Dependencias
```

## Documentación

### Sistemas

- [Authentication System](./docs/authentication-system.md): Authentication and authorization system based on Auth.js v5, implementing the requirements from Chapter 0
- [Translation System](./docs/translation-system.md): Documentation of the translation system that ensures all user-visible text is in Spanish
- [Portfolio Module](./docs/portfolio-module.md): Documentación del módulo de Portfolio, incluyendo mejoras de robustez y manejo de errores

### Guías para Desarrolladores

- [Guía para Desarrolladores](./lib/README.md): Información para desarrolladores sobre el uso del sistema de traducciones

## Seguridad

El Módulo Core implementa varias medidas de seguridad siguiendo los requisitos establecidos en el Capítulo 0, sección 0.5 "Security Requirements":

- Hashing de contraseñas con bcrypt
- Limitación de tasa en intentos de inicio de sesión
- Cabeceras de seguridad en next.config.ts
- Validación de entrada en rutas API
- Protección de rutas con middleware
- Autorización basada en roles (MASTER > ADMIN > EDITOR > COLLABORATOR)
- Autenticación con Auth.js v5 (Next-Auth.js v5)

## Desarrollo

Para ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) con tu navegador para ver el resultado.

---

## Flujo de trabajo con Git y despliegue

(Sección omitida para brevedad, mantener la versión existente si es relevante)

---
## Licencia

Este proyecto es propietario y confidencial.
