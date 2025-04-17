import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth'; // Descomentar para protección de ruta
import { logAdminAction } from '@/lib/stats'; // Descomentar para logging
// import { getUserRole } from '@/lib/auth-utils'; // Helper para obtener rol

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = params;
  // const session = await auth(); // Descomentar para obtener sesión
  // const userRole = getUserRole(session);

  try {
    // Obtener post con todos los campos incluyendo categoryIds
    const post = await prisma.post.findUnique({
      where: { id, deleted: false }, // No encontrar posts borrados lógicamente
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ message: 'Post no encontrado' }, { status: 404 });
    }

    // Obtener las categorías desde el campo JSON categoryIds y añadirlas al post
    type CategoryType = { id: string; name: string; slug: string };
    let categories: CategoryType[] = [];

    try {
      // Parsear categoryIds si existe
      // @ts-ignore - El campo categoryIds existe en la base de datos pero no en el tipo TypeScript
      const categoryIds: string[] = post.categoryIds ? JSON.parse(post.categoryIds as string) : [];
      
      // Si hay categorías, obtener sus detalles
      if (categoryIds.length > 0) {
        // Consultar las categorías por sus IDs
        const foundCategories = await prisma.category.findMany({
          where: { 
            id: { in: categoryIds } 
          },
          select: { 
            id: true, 
            name: true, 
            slug: true 
          },
        });
        
        categories = foundCategories;
      }
    } catch (error) {
      console.error(`Error parsing categories for post ${id}:`, error);
      categories = [];
    }

    // Añadir las categorías al post antes de devolverlo
    const postWithCategories = {
      ...post,
      categories,
    };

    // TODO: Implementar lógica de acceso basada en rol si es necesario
    // (ej. solo el autor o editores+ pueden ver borradores)
    // if (post.status === 'DRAFT' && (!session || post.authorId !== session.user.id && !['EDITOR', 'ADMIN', 'MASTER'].includes(userRole))) {
    //   return NextResponse.json({ message: 'No autorizado para ver este borrador' }, { status: 403 });
    // }

    return NextResponse.json(postWithCategories);
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return NextResponse.json({ message: 'Error al obtener el post' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = params;
  const session = await auth();
  // const userRole = getUserRole(session); // Obtener rol si se necesita para lógica más fina

  if (!session?.user?.id) { // Verificar ID de usuario
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }
  const userId = session.user.id; // Guardar userId

  try {
    const postToUpdate = await prisma.post.findUnique({ where: { id, deleted: false } });

    if (!postToUpdate) {
      return NextResponse.json({ message: 'Post no encontrado' }, { status: 404 });
    }

    // TODO: Implementar lógica de autorización estricta por rol
    // const canEdit = session.user.id === postToUpdate.authorId || ['EDITOR', 'ADMIN', 'MASTER'].includes(userRole);
    // if (!canEdit) {
    //   return NextResponse.json({ message: 'No autorizado para editar este post' }, { status: 403 });
    // }
    // // Colaboradores solo pueden editar sus propios posts y no pueden cambiar el estado a PUBLISHED directamente
    // if (userRole === 'COLLABORATOR' && session.user.id !== postToUpdate.authorId) {
    //    return NextResponse.json({ message: 'No autorizado para editar posts de otros' }, { status: 403 });
    // }

    const body = await request.json();
    const { title, content, slug, status, categoryIds, tagIds, coverImage, excerpt, featured } = body;

    // TODO: Validar datos de entrada (ej. con Zod)

    // Verificar si el nuevo slug (si se cambia) ya existe en otro post
    if (slug && slug !== postToUpdate.slug) {
      const existingSlug = await prisma.post.findUnique({ where: { slug } });
      if (existingSlug) {
        return NextResponse.json({ message: 'El nuevo slug ya existe' }, { status: 409 });
      }
    }

    // // Impedir que Colaboradores publiquen directamente si no son editores+
    // let finalStatus = status;
    // if (userRole === 'COLLABORATOR' && status === 'PUBLISHED' && !['EDITOR', 'ADMIN', 'MASTER'].includes(userRole)) {
    //   finalStatus = postToUpdate.status; // Mantener estado actual o DRAFT si era nuevo
    //   // Opcional: Podría implementarse un estado 'PENDING_REVIEW'
    // }

    // Organizar los datos para la actualización del post
    const updateData: any = {
      title: title ?? postToUpdate.title,
      content: content ?? postToUpdate.content,
      slug: slug ?? postToUpdate.slug,
      status: status ?? postToUpdate.status, // Usar finalStatus si se implementa lógica de roles
      coverImage: coverImage !== undefined ? coverImage : postToUpdate.coverImage,
      excerpt: excerpt !== undefined ? excerpt : postToUpdate.excerpt,
      featured: featured !== undefined ? featured : postToUpdate.featured,
      publishedAt: (status === 'PUBLISHED' && postToUpdate.status !== 'PUBLISHED') 
        ? new Date() 
        : (status !== 'PUBLISHED' ? null : postToUpdate.publishedAt),
    };
    
    // Si se proporcionan categorías, actualizarlas como JSON
    if (categoryIds !== undefined) {
      updateData.categoryIds = JSON.stringify(categoryIds.filter(Boolean));
    }
    
    // Realizar la actualización del post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: { 
        author: { select: { id: true, name: true } },
      }
    });
    
    // Obtener categorías para el post actualizado
    type CategoryType = { id: string; name: string; slug: string };
    let categories: CategoryType[] = [];
    try {
      // @ts-ignore - El campo categoryIds existe en la base de datos
      const postCategoryIds: string[] = updatedPost.categoryIds ? JSON.parse(updatedPost.categoryIds as string) : [];
      
      if (postCategoryIds.length > 0) {
        categories = await prisma.category.findMany({
          where: { id: { in: postCategoryIds } },
          select: { id: true, name: true, slug: true }
        });
      }
    } catch (error) {
      console.error(`Error parsing categories for updated post ${id}:`, error);
      categories = [];
    }
    
    // Añadir las categorías al post actualizado
    const postWithCategories = {
      ...updatedPost,
      categories,
    };

    // Registrar acción administrativa
    await logAdminAction(
      userId,
      'BLOG_UPDATE_POST',
      `Post actualizado: ${updatedPost.title} (ID: ${id})`
    );

    return NextResponse.json(postWithCategories);
  } catch (error) {
    console.error(`Error updating post ${id}:`, error);
    return NextResponse.json({ message: 'Error al actualizar el post' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = params;
  const session = await auth();
  // const userRole = getUserRole(session);

  if (!session?.user?.id) { // Verificar ID de usuario
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }
  const userId = session.user.id; // Guardar userId

  try {
    const postToDelete = await prisma.post.findUnique({ where: { id, deleted: false } });

    if (!postToDelete) {
      return NextResponse.json({ message: 'Post no encontrado o ya eliminado' }, { status: 404 });
    }

    // TODO: Implementar lógica de autorización estricta por rol
    // const canDelete = session.user.id === postToDelete.authorId || ['EDITOR', 'ADMIN', 'MASTER'].includes(userRole);
    // if (!canDelete) {
    //   return NextResponse.json({ message: 'No autorizado para eliminar este post' }, { status: 403 });
    // }

    // Borrado lógico en lugar de físico
    await prisma.post.update({
      where: { id },
      data: { deleted: true, status: 'ARCHIVED' }, // Marcar como borrado y archivado
    });

    // Registrar acción administrativa
    await logAdminAction(
      userId,
      'BLOG_DELETE_POST',
      `Post eliminado (lógicamente): ${postToDelete.title} (ID: ${id})`
    );

    return NextResponse.json({ message: 'Post eliminado correctamente' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    return NextResponse.json({ message: 'Error al eliminar el post' }, { status: 500 });
  }
}
