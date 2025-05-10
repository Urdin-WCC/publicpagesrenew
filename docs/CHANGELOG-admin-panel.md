# CHANGELOG - Cambios recientes en el panel de administración

## 2025-05-08 — Fix críticos tras reinstalación Prisma y enums/UI/fondos unificados

- Se corrige un error crítico tras reinstalación Prisma que afectaba a los enums en cliente/SSR:
  - Error "Cannot read properties of undefined (reading 'HEADER')" por referencia no disponible a SectionType
  - Error WidgetType no disponible en páginas cliente
  - Creados archivos polyfill seguros para enums: lib/section-client.ts, lib/widget-client.ts, similares a auth-client.ts
- Se optimizó la pool de conexiones a base de datos en prisma.ts para prevenir timeouts por saturación:
  - Aumentado a 20 conexiones (anteriormente 5)
  - Aumentados timeouts de pool y conexión de 10s a 30s
  - Documentación sobre cómo configurar estos parámetros vía DATABASE_URL
- Se arregló un problema en getSectionWithItems por cambio en los nombres de relaciones en prisma/schema.prisma:
  - Adaptado el código para permitir compatibilidad API aunque los nombres de relaciones cambien
  - Se mantienen los nombres de propiedades (menuItems, widgets) independientemente de los nombres en base de datos

## 2025-05-08 — Integración avanzada de tematización, fondos, bordes y UI global

- Se implementa en todo el panel admin la tematización avanzada basada en CSS variables siguiendo patrón público (tokens --typography..., --background, --spacing-padding, --spacing-margin, etc.).
- Soporte para fondos personalizados en widgets de la sidebar y footer del panel, siguiendo la misma lógica de la página admin/theme.
- Nuevo sistema para aplicar paddings y márgenes globales a layout, main, section, header y contenedores/Card de cada página, usando siempre las variables del tema.
- Sistema de fondo de página y de Card: si el tema admin define un fondo de tipo "image" en cards.background.type, se usa automáticamente la imagen /images/backgrounds/card-(id).img siguiendo convención, y si es "gradient"/"color", se toma el string de cards.background.value. 
- Nuevo patrón para botones y formularios: <AdminButton> y <AdminInput> sustituyen progresivamente a los componentes UI públicos, asegurando color y fuente temáticos.
- Todos los enlaces, títulos y textos principales han sido adaptados al sistema de tokens CSS: utilizan fontFamily, fontWeight y color dinámicos del tema en style.
- Eliminados o sustituidos todos los hardcodes relevantes de background, width, padding/margin por variables temáticas fusionando tokens públicos y privados.
- El panel ahora es visualmente coherente, escalable y totalmente personalizable desde el editor de temas, exactamente igual que la frontend pública.
- Documentada la convención para background images: NO necesitan url en config, basta declarar type: "image" y el nombre/id; la ruta es /images/backgrounds/card-(id).img.
- Documentados los nuevos patrones (wrapper + Card temático) para todos los listados, paneles y formularios importantes del admin.
- Para futuras ampliaciones, siempre que se cree un nuevo input, botón o card admin, debe usarse el patrón AdminButton/AdminInput y style temático; nunca valores por defecto Tailwind.

## Última actualización: 2025-05-07

### Corrección mayor: Gestión de Roles y Enums en cliente/SSR

- Se detectó un error crítico por el uso directamente desde "@prisma/client" del enum Role en páginas y componentes del cliente (admin), lo que provocaba fallos en todas las comprobaciones de permisos (`Cannot read properties of undefined (reading 'ADMIN')`).
- Se solucionó redefiniendo un polyfill seguro (objeto Role/const) en los entrypoints críticos: lib/auth-client.ts y lib/auth-utils.ts.
- Se actualizaron todas las páginas admin privadas para importar Role desde "@/lib/auth-client" en vez de "@prisma/client". Esto permite reusar la lógica (if userRole === Role.ADMIN) y mantiene el código limpio y DRY.
- Importante: NUNCA importar enums de Prisma directamente en archivos que se usen en cliente/admin. Usar siempre el polyfill local (lib/auth-client).

### Widget SocialLinksWidget

- El widget SocialLinksWidget faltaba en la build, ocasionando error "Module not found". Se ha creado un archivo independiente y reutilizable en components/public/widgets/SocialLinksWidget.tsx que expone un pequeño listado de redes sociales editable.
- WidgetRenderer.tsx fue reparado para importar correctamente el widget y cerrar correctamente el switch-case.

### Otras correcciones estructurales

- Se validó y restauró la función default/cierre de WidgetRenderer.tsx tras detectar errores de cierre en el switch.
- Se documenta que futuros widgets deben añadirse/registrarse en su propio archivo bajo `components/public/widgets/` y añadirse al switch en WidgetRenderer.
- El sistema detecta y muestra debidamente widgets desconocidos.

### Consideraciones para debugging futuro

- Si vuelve a aparecer error con enums de roles (Role.ADMIN, Role.MASTER, etc.) en el cliente/admin, revisar SIEMPRE que la importación venga de "@/lib/auth-client" y no de "@prisma/client".
- Si algún widget dinámico vuelve a dar error de "module not found", primero buscar el archivo en la carpeta widgets y si falta, crearlo como archivo mínimo/documentar la necesidad.

### Pendientes

- Página de gestión de usuarios sigue teniendo problemas y debe ser revisada de forma separada.
- Es recomendable probar todas las rutas críticas tras limpiar cachés y recompilar (`npm run build` / `npm run dev`) en un entorno lo más limpio posible.
- Actualizar user docs/código para que nuevos desarrolladores sepan de esta convención de enums/roles.

---

Más detalles o incidentes pueden agregarse aquí para mantener el seguimiento histórico de cambios críticos del panel.
