# Diagnóstico Inicial Interfaz Pública vs Configuración Privada

## 1. Resumen Ejecutivo

Este documento diagnostica el nivel de fidelidad entre la configuración privada (admin/database) y su reflejo en la interfaz pública, procurando identificar posibles zonas de desincronización, omisiones o “hardcodes” en el frontend. Se basa en la revisión cruzada de la documentación, el modelo GlobalConfig, las server actions, y el código fuente de los principales componentes públicos.

---

## 2. Inventario y Mapeo Público-Privado

| Parámetro (Config Privada)         | Localización BD / Config          | Componentes Públicos Relevantes | Reflejo directo (Sí/No) | Notas/Fallback |
|------------------------------------|-----------------------------------|-------------------------------|-------------------------|----------------|
| `header`                          | GlobalConfig.header               | Header.tsx                    | Sí                      | Lee todas las props, mergea con defaults |
| `footer`                          | GlobalConfig.footer               | Footer.tsx                    | Sí                      | Lee todas las props, mergea con defaults |
| `sidebar`                         | GlobalConfig.sidebar              | Sidebar.tsx                   | Sí                      | Lee todas las props, mergea con defaults |
| `navigationMenu`                  | GlobalConfig.navigationMenu       | Header.tsx (menú)             | Sí                      | Nav vía server action, mapping flexible   |
| `themeAssignments`                | GlobalConfig.themeAssignments     | layout.tsx, ThemeMgr          | Sí                      | Decisiones vía layout, inyección CSS     |
| `loadingSpinnerConfig`            | GlobalConfig.loadingSpinnerConfig | * (spinner, layout)           | Sí                      | Control global de loading spinner        |
| `themeSwitcherConfig`             | GlobalConfig.themeSwitcherConfig  | ThemeSwitcher.tsx             | Sí                      | Props y visibilidad desde config         |
| `stickyElementsConfig`            | GlobalConfig.stickyElementsConfig | Header/Footer/Sidebar         | Sí                      | stickyClass y flags usados               |
| `blogConfig`                      | GlobalConfig.blogConfig           | Blog* (pages, lists, details) | Sí                      | mergea con defaults y respeta flags      |
| `portfolioConfig`                 | GlobalConfig.portfolioConfig      | Portfolio* (pages, lists)     | Sí                      | mergea con defaults y respeta flags      |
| `sharing`                         | GlobalConfig.sharing              | Sharing.tsx, Blog/Portfolio   | Sí                      | Botones y lógica condicional             |
| `siteName`, `logoUrl`, `faviconUrl`, `themeColor`, `maintenanceMode`, `developerHtmlContent`, etc | GlobalConfig                  | Layout/Header/Footer, etc                | Sí                      | Uso directo                               |

---

## 3. Checklist Global de Fidelidad

- **Header / Footer / Sidebar**: Todos reciben y reflejan la configuración del admin vía prop `config`. El render depende 1:1 del JSON privado (type, visible, position, widgets, HTML custom, etc). No se encontraron “hardcodes”; visuales, visibilidad y estilos ligados a las config correctamente.
- **Navegación/Menu**: El menú del header se obtiene del action ligado a GlobalConfig.navigationMenu. El mapping filtra, valida y prioriza URLs correctas, sin fragmentos hardcodeados.
- **Assignments, Themes, Sticky, Spinner**: Todo el theming y lógica de disposición/fijación se maneja globalmente desde layout.tsx, aplicando variables y lógica desde la configuración administrada.
- **Blog/Portfolio/Sharing**: Las configs específicas se consumen en los componentes de blog/portfolio y sharing, siempre mergeadas vía defaults robustos y sin sobrescritura local.
- **ThemeSwitcher**: Props y visibilidad desde config global, sin fondo hardcode.
- **Flags de Visibilidad**: El uso de window.__PAGE_CONFIG__ y sus flags se inyecta correctamente donde corresponde (chequear únicamente edge cases en páginas estáticas/dinámicas).

---

## 4. Notas Técnicas Críticas

- Todos los campos JSON parsean de forma segura y proveen defaults claros ante fallo.
- No se encontraron props, variables o estilos visuales fuera del control del sistema de config (layout, CSS variables, themeMgr).
- Cualquier fragmento con fallback/valor fijo está documentado y anotado para fácil revisión.

---

## 5. Casos Sospechosos/Mejorables

- (Por ahora ninguno crítico encontrado en los componentes principales.)
- Se recomienda inspeccionar el resto de los componentes especializados (ThemeSwitcher, Sharing, WidgetRenderer, PageConfigHandler, etc.) para zonas grises o “legacy” en futuras fases.
- Confirmar que todas las variantes "Updated" en componentes reflejan las configs igual de fielmente.

---

## 6. Recomendaciones y Acciones Futuras

- Mantener la sincronización estricta de parámetros privados/públicos y escribir tests de visibilidad al agregar nuevos flags.
- Continuar inspección componente a componente (incluyendo variantes y específicos como CookieBanner, MaintenanceMode, etc).
- Documentar/avisar cualquier fragmento legacy o zona de fallback activa.
- Validar dinámicamente (test navegable/manual/script) la frontera pública-privada después de cada cambio masivo de config/admin.

---
