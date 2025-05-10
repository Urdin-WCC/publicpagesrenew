# Documentación del Módulo de Administración de Usuarios (User_Admin_Module)

## Introducción

El módulo de administración de usuarios (User_Admin_Module) permite a los administradores del sitio gestionar usuarios, roles y configuraciones de seguridad del sistema. Este módulo proporciona una interfaz completa para la creación, edición y eliminación de usuarios, así como para la configuración de políticas de seguridad globales.

## Características

- Gestión completa de usuarios (CRUD): crear, leer, actualizar y eliminar
- Sistema jerárquico de roles (MASTER > ADMIN > EDITOR > COLLABORATOR)
- Perfil de usuario para edición de datos personales
- Cambio y restablecimiento de contraseñas
- Configuración global de seguridad (requisitos de contraseñas, duración de sesiones, etc.)
- Validación de permisos basada en roles
- API RESTful para todas las operaciones

## Estructura del Módulo

### Modelo de Datos

El módulo utiliza los siguientes modelos definidos en el esquema de Prisma:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String
  role          Role      @default(COLLABORATOR)
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  posts         Post[]
  projects      Project[]
  sessions      Session[]
}

enum Role {
  MASTER
  ADMIN
  EDITOR
  COLLABORATOR
}
```

Además, se han añadido campos de configuración de seguridad al modelo GlobalConfig:

```sql
-- Campos de seguridad añadidos a GlobalConfig
ALTER TABLE GlobalConfig ADD passwordMinLength INT DEFAULT 8;
ALTER TABLE GlobalConfig ADD passwordRequireUppercase BOOLEAN DEFAULT true;
ALTER TABLE GlobalConfig ADD passwordRequireNumber BOOLEAN DEFAULT true;
ALTER TABLE GlobalConfig ADD passwordRequireSymbol BOOLEAN DEFAULT true;
ALTER TABLE GlobalConfig ADD sessionDuration INT DEFAULT 24;
ALTER TABLE GlobalConfig ADD maxLoginAttempts INT DEFAULT 5;
ALTER TABLE GlobalConfig ADD captchaEnabled BOOLEAN DEFAULT false;
ALTER TABLE GlobalConfig ADD accountLockoutDuration INT DEFAULT 30;
```

### Rutas API

El módulo expone las siguientes rutas API:

| Método  | Ruta                              | Descripción                          | Acceso        |
|---------|-----------------------------------|--------------------------------------|---------------|
| GET     | `/api/users`                      | Obtener lista de usuarios            | [admin+]      |
| POST    | `/api/users`                      | Crear nuevo usuario                  | [admin+]      |
| GET     | `/api/users/{id}`                 | Obtener usuario por ID               | [admin+]      |
| PUT     | `/api/users/{id}`                 | Actualizar usuario existente         | [admin+]      |
| DELETE  | `/api/users/{id}`                 | Eliminar usuario                     | [admin+]      |
| PUT     | `/api/users/{id}/reset-password`  | Restablecer contraseña de usuario    | [admin+]      |
| GET     | `/api/users/profile`              | Obtener perfil del usuario actual    | [collaborator+] |
| PUT     | `/api/users/profile`              | Actualizar perfil del usuario actual | [collaborator+] |
| PUT     | `/api/users/profile/password`     | Cambiar contraseña del usuario actual| [collaborator+] |
| GET     | `/api/settings/security`          | Obtener configuración de seguridad   | [admin+]      |
| PUT     | `/api/settings/security`          | Actualizar configuración de seguridad| [admin+]      |

Las rutas están protegidas según el nivel de acceso requerido, donde [admin+] significa que el usuario debe tener rol ADMIN o MASTER, y [collaborator+] significa cualquier usuario autenticado.

### Componentes UI

El módulo incluye los siguientes componentes React:

1. **UserList**: Tabla de usuarios con acciones para editar y eliminar
2. **UserForm**: Formulario para crear/editar usuarios con:
   - Validación de campos requeridos
   - Selector de roles limitado según la jerarquía
   - Verificación de permisos para acciones
3. **ProfileForm**: Formulario para edición del perfil personal
4. **SecuritySettingsForm**: Configuración global de seguridad del sistema

### Páginas Admin

El módulo proporciona las siguientes páginas en el panel de administración:

1. `/admin/profile` - Página de perfil personal (acceso: [collaborator+])
2. `/admin/users` - Lista de usuarios del sistema (acceso: [admin+])
3. `/admin/users/new` - Página para crear nuevo usuario (acceso: [admin+])
4. `/admin/users/edit/[id]` - Página para editar usuario existente (acceso: [admin+])
5. `/admin/settings/security` - Configuración global de seguridad (acceso: [admin+])

## Guía de Uso

### Edición del Perfil Personal

1. Navegar a `/admin/profile` en el panel de administración
2. Modificar nombre o correo electrónico según sea necesario
3. Para cambiar la contraseña, hacer clic en "Cambiar Contraseña"
4. Ingresar la contraseña actual y la nueva contraseña (con confirmación)
5. Hacer clic en "Actualizar Perfil" o "Cambiar Contraseña" para guardar los cambios

### Gestión de Usuarios

1. Navegar a `/admin/users` en el panel de administración
2. Ver la lista de usuarios existentes
3. Para crear un nuevo usuario:
   - Hacer clic en "Nuevo Usuario"
   - Completar el formulario con nombre, correo, contraseña y rol
   - El selector de roles solo mostrará roles inferiores al rol del usuario actual
   - Hacer clic en "Crear Usuario" para guardar
4. Para editar un usuario:
   - Hacer clic en "Editar" junto al usuario deseado
   - Modificar los campos necesarios
   - Hacer clic en "Actualizar Usuario" para guardar
5. Para eliminar un usuario:
   - Hacer clic en "Eliminar" junto al usuario deseado
   - Confirmar la acción en el diálogo de confirmación
6. Para restablecer contraseña:
   - En la página de edición, hacer clic en "Restablecer Contraseña"
   - Ingresar la nueva contraseña
   - Hacer clic en "Restablecer Contraseña" para guardar

### Configuración de Seguridad

1. Navegar a `/admin/settings/security` en el panel de administración
2. Configurar parámetros de seguridad:
   - Requisitos de contraseñas (longitud mínima, caracteres especiales, etc.)
   - Duración de sesiones
   - Intentos máximos de inicio de sesión
   - Duración del bloqueo de cuenta
   - Habilitar/deshabilitar CAPTCHA
3. Hacer clic en "Guardar Configuración" para aplicar los cambios

## Integración con Otros Módulos

Este módulo se integra con varios componentes del sistema:

1. **Core_Module**: Utiliza el cliente Prisma, las funciones de autenticación y el sistema de registro de acciones
2. **UI_Framework_Module**: Emplea componentes UI y estructuras de layout
3. **Stats_Module**: Registra todas las acciones administrativas mediante `logAdminAction`

### Flujo de Autenticación y Permisos

El sistema de permisos implementa una jerarquía estricta de roles:

```
MASTER > ADMIN > EDITOR > COLLABORATOR
```

Las principales reglas aplicadas son:

1. Un usuario puede editar su propio perfil, independientemente de su rol
2. Un usuario solo puede ver/editar/eliminar otros usuarios con roles inferiores al suyo
3. Los usuarios MASTER pueden ver/editar/eliminar a cualquier usuario
4. Un usuario no puede asignar un rol igual o superior al suyo (excepto MASTER)
5. Un usuario no puede eliminarse a sí mismo
6. Ciertas páginas y acciones están restringidas según el nivel de rol
7. La comprobación de permisos se realiza tanto en el cliente como en el servidor
8. Todas las operaciones administrativas se registran mediante `logAdminAction`

## Consideraciones Técnicas

### Seguridad de Contraseñas

- Las contraseñas se almacenan hasheadas mediante bcrypt
- La contraseña actual debe verificarse antes de cualquier cambio
- Los requisitos de complejidad se configuran globalmente
- La validación se realiza tanto en el cliente como en el servidor

### Hooks y Helpers de Autenticación

Para la verificación de roles y autenticación, se utilizan los siguientes helpers:

```typescript
// Cliente (React hooks)
const currentUserRole = useCurrentUserRole();
const hasAccess = checkUserRole(currentUserRole, Role.ADMIN);

// Servidor (Funciones asíncronas)
const currentUserRole = await getCurrentUserRole();
export const beforeRender = withRoleProtection('ADMIN');

// Obtener la sesión del usuario actual
const { auth } = await import("@/lib/auth");
const session = await auth();
const currentUserId = session?.user?.id;
```

### Permisos Especiales para Usuarios MASTER

Los usuarios con rol MASTER tienen permisos especiales:

- Pueden ver y editar su propio perfil, independientemente de las reglas de jerarquía de roles
- Pueden crear nuevos usuarios con cualquier rol, incluido MASTER
- Pueden asignar el rol MASTER a otros usuarios al editarlos
- Son los únicos que pueden gestionar a otros usuarios MASTER
- Pueden restablecer contraseñas de otros usuarios MASTER

Estas excepciones a la jerarquía estándar de roles permiten una administración efectiva del sistema con múltiples administradores de nivel superior.

#### Implementación de Permisos para MASTER

Para implementar estas reglas especiales, se utilizan verificaciones condicionales que combinan el rol del usuario con su ID:

```typescript
// Para permisos de edición
if (currentUserRole !== Role.MASTER && currentUserId !== id && targetRoleValue >= currentRoleValue) {
  return NextResponse.json(
    { error: "No tienes permiso para modificar este usuario" },
    { status: 403 }
  );
}

// Para asignación de roles
if (currentUserRole !== Role.MASTER && requestedRoleValue >= currentRoleValue) {
  return NextResponse.json(
    { error: "No puedes asignar un rol igual o superior al tuyo" },
    { status: 403 }
  );
}
```

En la interfaz de usuario, los componentes también reconocen estos permisos especiales:

```tsx
// UserForm.tsx - Selector de roles
if (currentUserRole === Role.MASTER) {
  // MASTER users can assign any role, including MASTER
  filteredRoles = [...allRoles];
} else {
  // Other users can only assign roles lower than their own
  filteredRoles = allRoles.filter(role => hasHigherRole(currentUserRole, role));
}

// UserList.tsx - Botones de acción
{(currentUserRole === Role.MASTER || hasHigherRole(currentUserRole, user.role)) && (
  // Mostrar botones de editar/eliminar
)}
```

### Almacenamiento de Configuración de Seguridad

La configuración de seguridad se almacena en la tabla `GlobalConfig` y se accede mediante helpers específicos:

```typescript
// Obtener configuración
const securitySettings = await getGlobalConfig();

// Actualizar configuración
await updateGlobalConfig({
  passwordMinLength: 10,
  passwordRequireUppercase: true,
  // Otros parámetros...
});
```

## Mejoras Futuras Posibles

- Soporte para autenticación de doble factor (2FA)
- Gestión de permisos más granular a nivel de funciones
- Soporte para recuperación de contraseñas vía email
- Historial de actividades de usuario con filtros avanzados
- Exportación de datos de usuarios en diferentes formatos
- Personalización de correos electrónicos de notificación
- Gestión de grupos de usuarios para asignación colectiva de permisos
