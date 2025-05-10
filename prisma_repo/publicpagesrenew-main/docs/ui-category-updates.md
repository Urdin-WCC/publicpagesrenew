# Actualización de Interfaces para Categoría Única

Este documento describe los cambios necesarios en las interfaces de usuario para adaptar la aplicación al nuevo modelo de categoría única tanto para blog como para portfolio.

## Resumen de Cambios

El cambio principal en la base de datos ha sido:
- Eliminar el campo `categoryIds` (JSON array)
- Añadir un campo `categoryId` (string único) con relación directa a la tabla Category

La API ya ha sido modificada para:
- Aceptar una categoría única (o la primera si se envía un array)
- Devolver las categorías en formato array (con un solo elemento o vacío) para compatibilidad

Ahora, necesitamos actualizar las interfaces de usuario para reflejar este cambio.

## Componentes a Modificar

### Área de Administración

1. **Formularios de Edición/Creación:**
   - `app/(admin)/admin/blog/edit/[id]/page.tsx`
   - `app/(admin)/admin/blog/new/page.tsx`
   - `app/(admin)/admin/portfolio/edit/[id]/page.tsx`
   - `app/(admin)/admin/portfolio/new/page.tsx`

2. **Páginas de Listado:**
   - `app/(admin)/admin/blog/page.tsx`
   - `app/(admin)/admin/portfolio/page.tsx`

### Área Pública

1. **Páginas de Listado:**
   - `app/(public)/blog/BlogListClient.tsx`
   - `app/(public)/portfolio/PortfolioListClient.tsx`

2. **Widgets:**
   - `components/public/widgets/LatestProjectsWidget.tsx`
   - `components/public/widgets/WidgetLatestPosts.tsx`

## Implementación Detallada

### 1. Modificación de Formularios

#### Cambio de Checkboxes a Selector Único

**ANTES**: Selector múltiple con checkboxes para categorías
```tsx
<Controller
  name="categories"
  control={control}
  render={({ field }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-2 rounded-md">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center space-x-2">
          <Checkbox
            id={`category-${cat.id}`}
            checked={field.value.includes(cat.id)}
            onCheckedChange={(checked) => {
              const updatedCategories = checked
                ? [...field.value, cat.id]
                : field.value.filter((id) => id !== cat.id);
              field.onChange(updatedCategories);
            }}
          />
          <Label htmlFor={`category-${cat.id}`} className="font-normal">
            {cat.name}
          </Label>
        </div>
      ))}
    </div>
  )}
/>
```

**DESPUÉS**: Selector único dropdown para categorías
```tsx
<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <Select
      onValueChange={(value) => field.onChange(value)}
      value={field.value || ""}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecciona una categoría" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Sin categoría</SelectItem>
        {categories?.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
/>
```

#### Cambio en la Inicialización de Formulario

**ANTES**: Inicialización de múltiples categorías
```tsx
reset({
  // otros campos...
  categories: post.categories.map(cat => cat.id),
});
```

**DESPUÉS**: Inicialización de categoría única
```tsx
reset({
  // otros campos...
  category: post.categories?.length > 0 ? post.categories[0].id : "",
});
```

#### Cambio en el Envío de Formulario

**ANTES**: Envío con múltiples categorías
```tsx
const payload = {
  // otros campos...
  categories: data.categories,
};
```

**DESPUÉS**: Envío con categoría única 
```tsx
const payload = {
  // otros campos...
  category: data.category, // O categories: [data.category] si la API aún espera un array
};
```

### 2. Modificación de Páginas de Lista (Admin)

En las páginas de listado, las categorías se muestran como badges. Actualizar para mostrar como máximo una categoría:

**ANTES**:
```tsx
<TableCell>
  <div className="flex flex-wrap gap-1">
    {post.categories.map((category) => (
      <Badge key={category.id} variant="outline">
        {category.name}
      </Badge>
    ))}
  </div>
</TableCell>
```

**DESPUÉS**:
```tsx
<TableCell>
  {post.categories && post.categories.length > 0 ? (
    <Badge variant="outline">
      {post.categories[0].name}
    </Badge>
  ) : (
    <span className="text-xs text-gray-500">Sin categoría</span>
  )}
</TableCell>
```

### 3. Modificación de Páginas Públicas

En las vistas públicas, las categorías se muestran como etiquetas o enlaces:

**ANTES**:
```tsx
{project.categories.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-3">
    {project.categories.map((category) => (
      <Link
        key={category.id}
        href={`/portfolio/category/${category.slug}`}
        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
      >
        {category.name}
      </Link>
    ))}
  </div>
)}
```

**DESPUÉS**:
```tsx
{project.categories && project.categories.length > 0 && (
  <div className="mt-3">
    <Link
      href={`/portfolio/category/${project.categories[0].slug}`}
      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
    >
      {project.categories[0].name}
    </Link>
  </div>
)}
```

## Plan de Implementación

1. **Fase 1: Actualizar interfaces de administración**
   - Comenzar con un formulario (ej. edit/[id]/page.tsx para blog)
   - Probar la creación y actualización
   - Aplicar el mismo patrón al resto de formularios

2. **Fase 2: Actualizar páginas de listado**
   - Actualizar componentes de listado tanto en admin como en público
   - Verificar que las categorías se muestran correctamente

3. **Fase 3: Actualizar widgets y componentes secundarios**
   - Asegurarse que todos los componentes que muestran categorías usen el nuevo formato

4. **Fase 4: Pruebas**
   - Probar la creación/edición de contenido
   - Verificar la visualización en todas las páginas
   - Confirmar el correcto funcionamiento de filtros por categoría

## Notas Importantes

1. **Compatibilidad Backend**: La API sigue aceptando arrays de categorías (pero solo usa la primera) y devolviendo categorías como array (con un solo elemento o vacío) para mantener compatibilidad.

2. **Actualización Gradual**: El frontend se puede actualizar gradualmente. Los componentes actualizados funcionarán con la API existente debido a la compatibilidad mencionada.

3. **Actualización de TypeScript**: Actualizar los tipos para reflejar el nuevo modelo:

```tsx
// ANTES
interface FormValues {
  // otros campos...
  categories: string[]; // Array de IDs
}

// DESPUÉS
interface FormValues {
  // otros campos...
  category: string; // Un solo ID
}
```
