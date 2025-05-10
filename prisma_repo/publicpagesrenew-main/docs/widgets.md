# Widgets disponibles para Sidebar y Pie de Página

## Tipos de Widgets

1. **Últimas publicaciones**
   - Configurable: texto, número de elementos a mostrar, tipo de listado.
2. **Últimos proyectos**
   - Configurable: texto, número de elementos a mostrar, tipo de listado.
3. **Listado de redes sociales**
   - Configurable: texto, opciones de alineado y estilo.
   - El listado de redes sociales se configura en otra sección.
4. **Formulario de contacto**
5. **Datos de contacto**
6. **Mapa interactivo**
7. **HTML personalizado**
   - Wrapper para código HTML (banners, anuncios, multimedia, etc).
8. **Logo del sitio con texto personalizado**
9. **Navegación**
   - Estilo configurable.

## Bloque HTML secundario (solo master)

- Es una franja al pie de la página, de ancho completo, pensada para enlaces legales, créditos, acceso discreto al dashboard, etc.
- Solo editable por usuarios con rol MASTER.
- Debe adaptarse al contenido (altura mínima para una línea de texto, márgenes adecuados).
- Visualmente discreto y separado del resto del footer.
- Se recomienda que el renderizado público lo coloque siempre al final del todo, tras los widgets del footer.

## Reglas de uso y disposición

- Se puede usar más de una copia del mismo tipo de widget sin que interfieran entre sí.
- Los widgets pueden implementarse tanto en la barra lateral como en el pie de página.
- **Barra lateral:** 
  - Respetan el ancho configurado para la barra.
  - Espaciado, márgenes y altura variable según contenido.
  - Ordenación: de arriba a abajo.
- **Pie de página:**
  - Respetan la altura configurada para el pie.
  - El ancho se reparte a partes iguales entre los widgets presentes (por ejemplo, 3 widgets = ~33% cada uno).
  - Ordenación: de izquierda a derecha.
- Se puede elegir el orden de los widgets en ambas ubicaciones.

## Notas Técnicas

- **Compatibilidad de tipos**: Los widgets ahora implementan garantías de IDs únicos para asegurar el renderizado correcto.
- **Estilo adaptado**: Los widgets se adaptan automáticamente a los temas aplicados utilizando variables CSS.
- **Optimización de rendimiento**: La carga de widgets utiliza importaciones dinámicas con React.Suspense para mejor performance.
- **Respuesta a dimensiones**: Los widgets respetan el ancho inline del sidebar (ya no como clase Tailwind) y la altura del footer.
- **Ajuste de columnas**: El footer ahora implementa un sistema de grid automático basado en la configuración de columnas.

---
_Este documento debe mantenerse actualizado si se añaden, eliminan o modifican widgets._
