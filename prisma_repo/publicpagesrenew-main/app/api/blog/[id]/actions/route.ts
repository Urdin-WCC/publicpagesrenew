import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/auth-utils';
import { logAdminAction } from '@/lib/stats';
import { PostStatus } from '@prisma/client';

interface RouteParams {
  params: { id: string };
}

// POST: Ejecutar acciones especiales sobre un post
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await Promise.resolve(params); // Para evitar el error de Next.js
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  const userRole = session.user?.role;
  const userId = session.user?.id;

  // Verificar permiso para editar posts
  if (!hasPermission(userRole, 'edit_post')) {
    return NextResponse.json({ message: 'No tienes permiso para editar posts' }, { status: 403 });
  }

  try {
    // Obtener el post actual para verificar
    const existingPost = await prisma.post.findUnique({
      where: { 
        id,
        deleted: false
      }
    });

    if (!existingPost) {
      return NextResponse.json({ message: 'Post no encontrado' }, { status: 404 });
    }

    // Verificar si el usuario tiene permiso para editar este post específico
    const isAuthor = existingPost.authorId === userId;
    const canEditAny = hasPermission(userRole, 'edit_any_post');

    if (!isAuthor && !canEditAny) {
      return NextResponse.json(
        { message: 'No tienes permiso para modificar este post' },
        { status: 403 }
      );
    }

    const { action } = await request.json();
    let updateData = {};
    let actionType = '';
    let actionDetails = '';

    switch (action) {
      case 'publish':
        // Solo los usuarios con permiso para publicar pueden hacerlo
        if (!hasPermission(userRole, 'publish_post')) {
          return NextResponse.json(
            { message: 'No tienes permiso para publicar posts' },
            { status: 403 }
          );
        }
        updateData = { 
          status: PostStatus.PUBLISHED,
          publishedAt: new Date()
        };
        actionType = 'PUBLISH_POST';
        actionDetails = `Post publicado: ${existingPost.title} (ID: ${id})`;
        break;

      case 'archive':
        updateData = { status: PostStatus.ARCHIVED };
        actionType = 'ARCHIVE_POST';
        actionDetails = `Post archivado: ${existingPost.title} (ID: ${id})`;
        break;

      case 'unarchive':
        updateData = { status: PostStatus.DRAFT };
        actionType = 'UNARCHIVE_POST';
        actionDetails = `Post desarchivado: ${existingPost.title} (ID: ${id})`;
        break;

      case 'toggleFeatured':
        const newFeaturedValue = !existingPost.featured;
        updateData = { featured: newFeaturedValue };
        actionType = newFeaturedValue ? 'FEATURE_POST' : 'UNFEATURE_POST';
        actionDetails = newFeaturedValue 
          ? `Post marcado como destacado: ${existingPost.title} (ID: ${id})`
          : `Post desmarcado como destacado: ${existingPost.title} (ID: ${id})`;
        break;

      default:
        return NextResponse.json({ message: 'Acción no válida' }, { status: 400 });
    }

    // Realizar actualización
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    // Registrar la acción administrativa
    await logAdminAction(
      userId,
      actionType,
      actionDetails
    );

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error performing post action:', error);
    return NextResponse.json({ message: 'Error al realizar la acción sobre el post' }, { status: 500 });
  }
}
