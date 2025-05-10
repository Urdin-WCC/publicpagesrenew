# Actualización del Sistema de Acciones en el Módulo de Blog

## Resumen de Cambios

Se ha implementado un sistema unificado de acciones para el módulo de Blog, siguiendo el patrón ya establecido en el módulo de Portfolio. Esta actualización permite realizar acciones rápidas sobre los posts (publicar, archivar, destacar, etc.) directamente desde la interfaz de listado de posts, simplificando y agilizando el flujo de trabajo de los administradores.

## Cambios Implementados

### 1. Nuevo Endpoint API para Acciones

Se ha creado un nuevo endpoint para manejar acciones específicas sobre los posts:

- **Ruta**: `/api/blog/[id]/actions`
- **Método**: `POST`
- **Funcionalidad**: Permite ejecutar acciones como publicar, archivar, desarchivar y destacar/quitar destacado de un post

```typescript
// app/api/blog/[id]/actions/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const session = await auth();

  // Verificación de autenticación y permisos
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  // Verificar permisos para editar posts
  if (!hasPermission(session.user.role, 'edit_post')) {
    return NextResponse.json({ message: 'No tienes permiso para editar posts' }, { status: 403 });
  }

  try {
    // Obtener el post a modificar
    const existingPost = await prisma.post.findUnique({
      where: { id, deleted: false }
    });

    // Verificar existencia
    if (!existingPost) {
      return NextResponse.json({ message: 'Post no encontrado' }, { status: 404 });
    }

    // Verificar permisos específicos para este post
    const isAuthor = existingPost.authorId === session.user.id;
    const canEditAny = hasPermission(session.user.role, 'edit_any_post');

    if (!isAuthor && !canEditAny) {
      return NextResponse.json(
        { message: 'No tienes permiso para modificar este post' },
        { status: 403 }
      );
    }

    // Ejecutar acción según lo solicitado
    const { action } = await request.json();
    let updateData = {};

    switch (action) {
      case 'publish':
        // Verificar permiso específico para publicar
        if (!hasPermission(session.user.role, 'publish_post')) {
          return NextResponse.json({ message: 'No tienes permiso para publicar posts' }, { status: 403 });
        }
        updateData = { status: PostStatus.PUBLISHED, publishedAt: new Date() };
        break;
      case 'archive':
        updateData = { status: PostStatus.ARCHIVED };
        break;
      case 'unarchive':
        updateData = { status: PostStatus.DRAFT };
        break;
      case 'toggleFeatured':
        updateData = { featured: !existingPost.featured };
        break;
      default:
        return NextResponse.json({ message: 'Acción no válida' }, { status: 400 });
    }

    // Actualizar post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    // Registrar acción administrativa
    await logAdminAction(session.user.id, `${action.toUpperCase()}_POST`, `Acción ${action} en post: ${existingPost.title}`);

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error performing post action:', error);
    return NextResponse.json({ message: 'Error al realizar la acción sobre el post' }, { status: 500 });
  }
}
```

### 2. Actualización de la Interfaz de Administración

Se ha mejorado la interfaz de la página `app/(admin)/admin/blog/page.tsx` para incluir botones de acción contextual:

- **Botones contextuales**: Se muestran u ocultan según el estado actual del post y los permisos del usuario
- **Estilos consistentes**: Diseño visual unificado con el módulo de Portfolio
- **Feedback al usuario**: Notificaciones de éxito/error para cada acción

```typescript
// Función handlePostAction implementada en app/(admin)/admin/blog/page.tsx
const handlePostAction = async (id, action, title) => {
  try {
    const response = await fetch(`/api/blog/${id}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (response.ok) {
      // Mostrar mensaje de éxito según la acción realizada
      let successMessage = '';
      switch (action) {
        case 'publish': 
          successMessage = 'Post publicado correctamente'; 
          break;
        case 'archive': 
          successMessage = 'Post archivado correctamente'; 
          break;
        case 'unarchive': 
          successMessage = 'Post desarchivado correctamente'; 
          break;
        case 'toggleFeatured': 
          successMessage = 'Estado destacado actualizado correctamente'; 
          break;
      }
      toast.success(successMessage);
      mutate(); // Recargar datos automáticamente
    } else {
      // Manejar errores
      const data = await response.json();
      toast.error(data.message || 'Error al realizar la acción');
    }
  } catch (error) {
    console.error('Error performing action:', error);
    toast.error('Error al realizar la acción en el post');
  }
};
```

### 3. Botones de Acción Contextual

Se han añadido diversos botones de acción con lógica contextual:

| Acción | Icono | Condición de Visibilidad | Función |
|--------|-------|--------------------------|---------|
| Publicar | <Eye /> | Post en estado DRAFT + Permiso `publish_post` | Publica un post borrador |
| Archivar | <ArchiveIcon /> | Post en estado DRAFT o PUBLISHED | Archiva un post |
| Desarchivar | <SendToBack /> | Post en estado ARCHIVED | Devuelve un post archivado a estado borrador |
| Destacar/Quitar destacado | <Star /> | Siempre visible si hay permiso de edición | Alterna destacado de un post |
| Ver post | <Eye /> | Siempre visible | Abre el post en una nueva pestaña |
| Editar | <Edit /> | Usuario con permiso de edición | Redirige a pantalla de edición |
| Eliminar | <Trash2 /> | Usuario con permiso de eliminación | Ejecuta eliminación lógica del post |

**Ejemplo de implementación:**

```jsx
{/* Publicar (solo para borradores) */}
{canEdit && post.status === 'DRAFT' && hasPermission(session?.user?.role, 'publish_post') && (
  <Button
    variant="ghost"
    size="icon"
    className="text-green-500"
    onClick={() => handlePostAction(post.id, 'publish', post.title)}
    title="Publicar post"
  >
    <Eye className="h-4 w-4" />
  </Button>
)}

{/* Archivar (para posts publicados o borradores) */}
{canEdit && (post.status === 'PUBLISHED' || post.status === 'DRAFT') && (
  <Button
    variant="ghost"
    size="icon"
    className="text-gray-500"
    onClick={() => handlePostAction(post.id, 'archive', post.title)}
    title="Archivar post"
  >
    <ArchiveIcon className="h-4 w-4" />
  </Button>
)}

{/* Desarchivar (solo para archivados) */}
{canEdit && post.status === 'ARCHIVED' && (
  <Button
    variant="ghost"
    size="icon"
    className="text-blue-500"
    onClick={() => handlePostAction(post.id, 'unarchive', post.title)}
    title="Desarchivar post"
  >
    <SendToBack className="h-4 w-4" />
  </Button>
)}

{/* Destacar/No destacar */}
{canEdit && (
  <Button
    variant="ghost"
    size="icon"
    className={`${post.featured ? 'text-yellow-500' : 'text-gray-400'}`}
    onClick={() => handlePostAction(post.id, 'toggleFeatured', post.title)}
    title={post.featured ? "Quitar destacado" : "Destacar post"}
  >
    <Star className="h-4 w-4" />
  </Button>
)}
```

### 4. Gestión de Permisos

Se mantiene la arquitectura de permisos existente:

- `edit_post`: Permiso básico para editar posts propios
- `edit_any_post`: Permiso para editar cualquier post
- `publish_post`: Permiso específico para publicar posts
- `delete_post`: Permiso para eliminar posts propios
- `delete_any_post`: Permiso para eliminar cualquier post

La visibilidad y habilitación de las acciones se ajustan dinámicamente según:
1. El rol del usuario y sus permisos
2. La autoría del post (si el usuario es el autor)
3. El estado actual del post

## Ventajas de la Nueva Implementación

1. **Eficiencia de flujo de trabajo**: Permite realizar acciones comunes directamente desde el listado, sin necesidad de acceder a la pantalla de edición.
2. **Experiencia de usuario mejorada**: Interfaz más intuitiva con feedback visual inmediato.
3. **Consistencia entre módulos**: Uniformidad en la experiencia de uso entre los módulos de Blog y Portfolio.
4. **Granularidad de permisos**: Control específico según el tipo de acción y el estado del post.
5. **Mantenimiento simplificado**: Código modularizado que facilita extender con nuevas acciones en el futuro.

## Implementación Técnica

### Infraestructura

- **API REST**: Punto final específico para acciones que sigue principios RESTful
- **Patrón modular**: Separación clara de responsabilidades entre componentes
- **Validación de seguridad**: Múltiples niveles de validación (autenticación, permisos generales, permisos específicos)
- **Notificaciones toast**: Feedback inmediato de éxito o error para cada acción
- **Revalidación automática**: Actualización inmediata de la interfaz tras acciones exitosas usando SWR

### Seguridad

Se han implementado múltiples capas de seguridad:

1. **Validación de sesión activa**: Verificación de la existencia de una sesión válida mediante NextAuth
2. **Verificación de permisos generales**: Validación del permiso básico para la operación
3. **Verificación de permisos específicos**: Verificación contextual según:
   - Autoría del post
   - Estado actual
   - Tipo de acción

## Compatibilidad

- La implementación es totalmente compatible con el flujo de trabajo existente
- Los usuarios pueden seguir utilizando el método tradicional (editar post) si lo prefieren
- No se han modificado APIs existentes, solo se ha añadido un nuevo endpoint

## Próximos Pasos Recomendados

1. **Extender acciones**: Considerar añadir más acciones específicas (desplazar en portada, duplicar, programar publicación, etc.)
2. **Mejorar permisos**: Implementar permisos más granulares para acciones específicas
3. **Historial de acciones**: Ampliar el registro de acciones administrativas con más detalles
4. **Optimización de rendimiento**: Posible implementación de websockets para actualizaciones en tiempo real

## Conclusión

La implementación del sistema de acciones en el módulo de Blog mejora significativamente la experiencia de administración, proporcionando un flujo de trabajo más eficiente y una interfaz más coherente con el resto del CMS. Esta mejora sigue el patrón ya establecido en el módulo de Portfolio, unificando la experiencia de usuario entre ambos módulos y simplificando el mantenimiento futuro del sistema. Los administradores ahora pueden gestionar posts de manera más ágil, especialmente cuando necesitan realizar acciones frecuentes como publicar, archivar o destacar contenido.
