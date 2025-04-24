# Módulo de Estadísticas (Statistics Backend Module)

## Descripción General

El Módulo de Estadísticas proporciona la funcionalidad de backend para registrar, analizar y visualizar datos estadísticos sobre el uso del sitio Neurowitch. Este módulo incluye el registro de visitas a páginas, registro de acciones administrativas importantes, y APIs para recuperar estos datos de forma agregada.

## Funcionalidades

### 1. Registro de Visitas a Páginas
- Registra automáticamente cada visita a una página del sitio
- Captura URL, referrer, dirección IP anonimizada y user-agent
- Se integra en el layout público para funcionar sin configuración adicional

### 2. Registro de Acciones Administrativas
- Función `logAdminAction` para registrar acciones importantes realizadas en el panel de administración
- Captura el usuario, acción, y detalles para auditoría y seguimiento

### 3. API de Estadísticas
- **Resumen**: Datos agregados como visitas hoy, ayer, últimos 7 días, últimos 30 días
- **Páginas**: Lista de páginas más visitadas
- **Referrers**: Lista de sitios que envían más tráfico
- **Logs Administrativos**: Historial de acciones administrativas con paginación
- **Exportación CSV**: Permite descargar logs administrativos en formato CSV 
- **Reset**: Permite eliminar registros de visitas (acceso restringido)

## Estructura del Módulo

### Modelos de Datos
- `PageView`: Almacena información sobre visitas a páginas
- `AdminLog`: Almacena información sobre acciones administrativas

### Componentes Cliente
- `components/public/PageViewTracker.tsx`: Componente que registra visitas a páginas automáticamente

### Archivos de Utilidad
- `lib/stats.ts`: Contiene funciones de utilidad como `logAdminAction`, `anonymizeIp` y `getClientIp`

### API Routes
- `app/api/stats/log-page-view/route.ts`: Endpoint para registrar visitas a páginas
- `app/api/stats/summary/route.ts`: Endpoint para obtener estadísticas agregadas
- `app/api/stats/pages/route.ts`: Endpoint para obtener páginas más visitadas
- `app/api/stats/referrers/route.ts`: Endpoint para obtener referrers principales
- `app/api/stats/admin-logs/route.ts`: Endpoint para obtener logs administrativos paginados
- `app/api/stats/admin-logs/export/route.ts`: Endpoint para exportar logs administrativos en CSV
- `app/api/stats/reset/route.ts`: Endpoint para eliminar registros de visitas

## Integración con Otros Módulos

- **Módulo Core**: Utiliza el cliente Prisma y funciones de autenticación para proteger las rutas
- **Módulo Dashboard**: Consume las APIs de estadísticas para mostrar datos en el panel de administración
- **Layout Público**: Integra el componente PageViewTracker para registrar visitas automáticamente
- **Módulos con escritura**: Utilizan la función `logAdminAction` para registrar acciones importantes

## Protección de Datos y Privacidad

- Las direcciones IP se anonimizan antes de almacenarse en la base de datos
- Las APIs con datos sensibles están protegidas con autenticación y control de acceso basado en roles:
  - `/summary`, `/pages`, `/referrers`: [collaborator+]
  - `/admin-logs`, `/admin-logs/export`, `/reset`: [admin+]
- El endpoint de registro de visitas (`/log-page-view`) está abierto pero no devuelve datos sensibles

## Uso del Módulo

### Registrar una Visita (Automático)
El componente `PageViewTracker` registra automáticamente las visitas a páginas cuando se incluye en el layout.

### Registrar una Acción Administrativa
```typescript
import { logAdminAction } from '@/lib/stats';

// Formato nuevo con objeto de opciones
await logAdminAction({
  userId: user.id,
  userEmail: user.email,
  action: 'POST_UPDATE',
  details: { postId: 123, title: 'Post actualizado' }
});

// Formato compatible con versiones anteriores
await logAdminAction(userId, 'POST_DELETE', 'Eliminación de post');
```

### Obtener Estadísticas (Desde Frontend)
```typescript
// Obtener resumen de estadísticas
const stats = await fetch('/api/stats/summary').then(res => res.json());

// Obtener páginas más visitadas (últimos 30 días, top 10)
const pages = await fetch('/api/stats/pages').then(res => res.json());

// Obtener páginas más visitadas (últimos 7 días, top 5)
const pages = await fetch('/api/stats/pages?days=7&limit=5').then(res => res.json());
```

## Notas de Mantenimiento

- El endpoint `/api/stats/reset` debe usarse con precaución ya que elimina permanentemente los datos
- Para mejorar el rendimiento, considerar añadir un trabajo programado para agregar datos históricos en tablas resumidas
- En aplicaciones de gran volumen, considerar utilizar una cola para el registro de visitas y así no impactar la experiencia del usuario
