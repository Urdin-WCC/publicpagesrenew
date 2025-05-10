import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/auth-utils';
import { logAdminAction } from '@/lib/stats'; // Importar logAdminAction
import { generateSlug } from '@/lib/utils';
import { translations } from '@/app/translations';

interface RouteParams {
  params: { id: string };
}

// PUT - Actualizar una etiqueta existente
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  const tagId = params.id;

  // Verificar autenticación y permisos (ej. EDITOR+)
  if (!session?.user?.id) {
    return NextResponse.json({ message: translations.auth.unauthorized }, { status: 401 });
  }
  const userId = session.user.id;
  const userRole = session.user.role;
  if (!hasPermission(userRole, 'manage_blog_taxonomies')) { // Usar permiso específico
    return NextResponse.json({ message: 'No autorizado para gestionar etiquetas' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name } = body; // Solo nombre para etiquetas

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'El nombre es obligatorio y debe ser un texto.' }, { status: 400 });
    }

    // Generar nuevo slug si el nombre cambia
    const slug = generateSlug(name);

    // Verificar si ya existe OTRA etiqueta con el mismo slug
    const existingTag = await prisma.tag.findFirst({
      where: {
        slug: slug,
        id: { not: tagId }, // Excluir la etiqueta actual
      },
    });

    if (existingTag) {
      return NextResponse.json({ message: `Ya existe otra etiqueta con el slug '${slug}'.` }, { status: 409 });
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name: name.trim(),
        slug: slug,
      },
    });

    // Registrar acción administrativa
    await logAdminAction(
      userId,
      'BLOG_UPDATE_TAG',
      `Etiqueta actualizada: ${updatedTag.name} (ID: ${tagId})`
    );

    return NextResponse.json(updatedTag);
  } catch (error: any) {
    console.error('Error updating tag:', error);
    if (error.code === 'P2025') { // Registro no encontrado
        return NextResponse.json({ message: 'Etiqueta no encontrada.' }, { status: 404 });
    }
    return NextResponse.json({ message: translations.admin.taxonomies.saveError }, { status: 500 });
  }
}

// DELETE - Eliminar una etiqueta existente
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();
  const tagId = params.id;

  // Verificar autenticación y permisos (ej. EDITOR+)
  if (!session?.user?.id) {
    return NextResponse.json({ message: translations.auth.unauthorized }, { status: 401 });
  }
  const userId = session.user.id;
  const userRole = session.user.role;
  if (!hasPermission(userRole, 'manage_blog_taxonomies')) { // Usar permiso específico
    return NextResponse.json({ message: 'No autorizado para gestionar etiquetas' }, { status: 403 });
  }

  try {
    // Opcional: Verificar si la etiqueta está en uso
    // const postsUsingTag = await prisma.post.count({ where: { tags: { some: { id: tagId } } } });
    // if (postsUsingTag > 0) {
    //   return NextResponse.json({ message: 'No se puede eliminar la etiqueta porque está asignada a posts.' }, { status: 400 });
    // }

    const deletedTag = await prisma.tag.delete({
      where: { id: tagId },
    });

    // Registrar acción administrativa ANTES de devolver respuesta
    await logAdminAction(
      userId,
      'BLOG_DELETE_TAG',
      `Etiqueta eliminada: ${deletedTag.name} (ID: ${tagId})`
    );

    return NextResponse.json({ message: translations.admin.taxonomies.deleteSuccess });
  } catch (error: any) {
    console.error('Error deleting tag:', error);
     if (error.code === 'P2025') { // Registro no encontrado
        return NextResponse.json({ message: 'Etiqueta no encontrada.' }, { status: 404 });
    }
    // Podríamos añadir lógica para no permitir eliminar si está en uso (error P2014 de FK constraint en relación many-to-many)
    return NextResponse.json({ message: translations.admin.taxonomies.deleteError }, { status: 500 });
  }
}