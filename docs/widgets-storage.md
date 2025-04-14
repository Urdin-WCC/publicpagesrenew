# Almacenamiento de la configuración de widgets

Actualmente, la configuración de los widgets para la barra lateral y el pie de página se almacena como un array de objetos JSON dentro de los campos `sidebar` y `footer` de la tabla `GlobalConfig`. Cada objeto representa una instancia de widget, con su tipo y opciones configurables.

## Ventajas de este enfoque

- Permite flexibilidad total: cada widget puede tener su propia configuración y orden.
- Es fácil de serializar/deserializar y manipular desde la API y el frontend.
- Permite múltiples instancias del mismo tipo de widget sin interferencias.
- No requiere migraciones complejas ni relaciones adicionales en la base de datos.

## ¿Cuándo considerar tablas específicas para widgets?

- Si se requiere relacionar widgets con otros modelos (usuarios, permisos, estadísticas, etc).
- Si se necesitan búsquedas complejas o filtrados avanzados sobre los widgets.
- Si se quiere reutilizar configuraciones de widgets entre diferentes sitios o usuarios.
- Si el número de widgets o la complejidad de la configuración crece significativamente.

## Recomendación actual

Mantener la configuración de widgets en JSON dentro de `GlobalConfig` es suficiente y eficiente para la arquitectura y requisitos actuales del proyecto. Si en el futuro surgen necesidades más avanzadas, se podrá migrar a un modelo relacional sin pérdida de datos.

---
_Este documento debe revisarse si cambian los requisitos de almacenamiento o relación de widgets._