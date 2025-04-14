# Checklist de Requisitos - Módulo 4 (Site_Configuration_Module) Neurowitch

## Requisitos Generales del Proyecto

- [x] **Stack obligatorio:** Next.js 14+, TypeScript, React 18+, Prisma, Tailwind CSS, Next-Auth.js, React Hook Form, Shadcn/ui (opcional), Zustand, MySQL.
- [x] **Estructura de carpetas recomendada** (app/(admin)/admin/settings/ y subpáginas).
- [x] **Base de datos:** Modelo GlobalConfig extendido con campos JSON (o longtext) para header, footer, sidebar, social, sharing.
- [x] **Funciones para leer/escribir configuración global** (Server Actions y lógica de backend).
- [x] **Componentes Core:** ImageUploader y HtmlEditor (Tiptap, compatible React 18/19).
- [x] **Idioma:** Todo el texto visible al usuario está en español y centralizado en el sistema de traducciones.
- [x] **Protección por rol:** Acceso a páginas y APIs restringido a ADMIN o superior.
- [x] **Formularios:** Usar react-hook-form y useFieldArray donde corresponde.
- [x] **UI responsiva y accesible:** Usar Tailwind CSS y buenas prácticas WCAG 2.1 AA.
- [x] **Código limpio y documentado:** Comentarios y TSDoc en lógica compleja.
- [x] **Manejo de errores:** Mensajes claros y amigables en UI y API.
- [x] **Seguridad:** Validación de entrada, protección CSRF/XSS, headers seguros, protección de rutas y APIs por rol.
- [x] **Performance:** Optimización de carga y consultas.
- [x] **Consistencia:** Usar utilidades y componentes del Core_Module siempre que sea posible.
- [x] **Backups:** Realizar backups regulares (responsabilidad del project manager).

## Requisitos Específicos del Módulo 4

- [x] **Crear páginas bajo `/app/(admin)/admin/settings/`**: header, footer, sidebar, social, sharing.
- [x] **Usar AdminLayout** en todas las páginas.
- [x] **Formularios de configuración**:
  - [x] Header: Formulario para campos de header, usar ImageUploader para logo, y (pendiente) gestión avanzada de elementos y posiciones.
  - [x] Footer: Formulario para widgets (useFieldArray), altura, HtmlEditor para HTML secundario (solo master).
  - [x] Sidebar: Formulario para widgets, posición, ancho.
  - [x] Social: Formulario para lista de enlaces sociales (useFieldArray) con selector de iconos (incluido WhatsApp).
  - [x] Sharing: Formulario para lista de botones para compartir (useFieldArray) con selector de iconos.
- [x] **APIs protegidas/Server Actions**: Guardado y lectura de configuración solo desde el backend.
- [x] **Definir WIDGET_TYPES**: Constante/enum en `lib/constants.ts` para los widgets disponibles.
- [x] **Textos en español y centralizados** en el sistema de traducciones.
- [x] **Uso de Shadcn/ui** (opcional, recomendado para UI consistente).

## Mejoras y próximos pasos

- [ ] Añadir gestión avanzada de elementos del header: presencia, tipo, posición (9 posiciones), y wrapper HTML.
- [ ] Mejorar la UX de los selectores de iconos (mostrar icono junto al nombre).
- [ ] Documentar en el README y docs/widgets.md los nuevos requisitos y opciones del header.
- [ ] Pruebas de integración y validación final.

---

**Leyenda:**  
[x] Cumplido  
[ ] Pendiente

Este checklist se irá actualizando conforme se avance en la integración y mejoras.