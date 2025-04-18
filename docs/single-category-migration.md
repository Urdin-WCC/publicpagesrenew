# Migración a Modelo de Categoría Única

## Resumen

Se ha implementado un cambio en la estructura de datos para simplificar el manejo de categorías tanto en posts como en proyectos. En lugar de usar `categoryIds` (un campo JSON con arrays de IDs), ahora cada post o proyecto tiene una única categoría asociada mediante el campo `categoryId`.

## Cambios Realizados

1. **Estructura de Base de Datos**:
   - Se eliminó la columna `categoryIds` de las tablas `Post` y `Project`.
   - Se añadió la columna `categoryId` a ambas tablas, con una relación de clave foránea a la tabla `Category`.

2. **Schema de Prisma**:
   - Se actualizó el schema de Prisma para reflejar los cambios.
   - Se definieron las relaciones `category` en los modelos `Post` y `Project`.
   - Se actualizó el modelo `Category` para incluir las relaciones inversas.

3. **Endpoints API**:
   - Se modificaron los endpoints para trabajar con una sola categoría.
   - En las funciones `POST` y `PUT`, se toma solo la primera categoría si se envía un array.
   - En las respuestas, se mantiene el formato de array para `categories` (con un solo elemento) para mantener compatibilidad con el frontend.

## Beneficios

1. **Simplificación**: Ya no es necesario convertir a/desde JSON para manejar las categorías.
2. **Mejor Rendimiento**: Las consultas son más eficientes al poder filtrar directamente por `categoryId`.
3. **Integridad Referencial**: La clave foránea garantiza la integridad de los datos.
4. **Compatibilidad con Frontend**: Aunque el modelo ahora usa una sola categoría, los endpoints API mantienen el formato de respuesta anterior para no romper el frontend.

## Ejemplo de Uso en API

```javascript
// Creación de post con categoría única
if (Array.isArray(categories) && categories.length > 0) {
  categoryId = categories[0]; // Tomamos sólo la primera categoría
}

await prisma.$executeRaw`
  UPDATE Post
  SET categoryId = ${categoryId}
  WHERE id = ${postId}
`;

// Al devolver respuesta, se formatea para mantener compatibilidad
const response = {
  ...post,
  categories: categoryData ? [categoryData] : []
};
```

## Notas Técnicas

- **SQL Directo**: La mayoría de las operaciones utilizan SQL directo en lugar del cliente de Prisma para mayor flexibilidad y rendimiento.
- **Compatibilidad Ascendente**: Esta implementación mantiene compatibilidad con versiones anteriores del frontend.
- **Migración Gradual**: Puede seguir utilizando el backend actualizado con frontends antiguos, ya que mantiene el mismo formato de respuesta.

## Prueba de Funcionalidad

Se han creado scripts de prueba para verificar que el nuevo modelo funciona correctamente:
- `single-category-migration.js`: Script para realizar la migración.
- `test-single-category-sql.js`: Script para probar las operaciones con la nueva estructura.

Para probar manualmente, ejecutar:
```
node test-single-category-sql.js
```
