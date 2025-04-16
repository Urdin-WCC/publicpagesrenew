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

// PUT - Actualizar una categoría existente
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  const categoryId = params.id;

  // Verificar autenticación y permisos (ej. EDITOR+)
  if (!session?.user?.id) {
    return NextResponse.json({ message: translations.auth.unauthorized }, { status: 401 });
  }
  const userId = session.user.id;
  const userRole = session.user.role;
  if (!hasPermission(userRole, 'manage_blog_taxonomies')) { // Usar permiso específico
    return NextResponse.json({ message: 'No autorizado para gestionar categorías' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'El nombre es obligatorio y debe ser un texto.' }, { status: 400 });
    }

    // Generar nuevo slug si el nombre cambia
    const slug = generateSlug(name);

    // Verificar si ya existe OTRA categoría con el mismo slug
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: slug,
        id: { not: categoryId }, // Excluir la categoría actual
      },
    });

    if (existingCategory) {
      return NextResponse.json({ message: `Ya existe otra categoría con el slug '${slug}'.` }, { status: 409 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        slug: slug,
        description: description?.trim() || null,
      },
    });

    // Registrar acción administrativa
    await logAdminAction(
      userId,
      'BLOG_UPDATE_CATEGORY',
      `Categoría actualizada: ${updatedCategory.name} (ID: ${categoryId})`
    );

    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.code === 'P2025') { // Código de Prisma para "Registro no encontrado"
        return NextResponse.json({ message: 'Categoría no encontrada.' }, { status: 404 });
    }
    return NextResponse.json({ message: translations.admin.taxonomies.saveError }, { status: 500 });
  }
}

// DELETE - Eliminar una categoría existente
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();
  const categoryId = params.id;

  // Verificar autenticación y permisos (ej. EDITOR+)
  if (!session?.user?.id) {
    return NextResponse.json({ message: translations.auth.unauthorized }, { status: 401 });
  }
  const userId = session.user.id;
  const userRole = session.user.role;
  if (!hasPermission(userRole, 'manage_blog_taxonomies')) { // Usar permiso específico
    return NextResponse.json({ message: 'No autorizado para gestionar categorías' }, { status: 403 });
  }

  try {
    // Opcional: Verificar si la categoría está en uso antes de eliminar
    // const postsUsingCategory = await prisma.post.count({ where: { categoryId: categoryId } });
    // if (postsUsingCategory > 0) {
    //   return NextResponse.json({ message: 'No se puede eliminar la categoría porque está asignada a posts.' }, { status: 400 });
    // }

    const deletedCategory = await prisma.category.delete({
      where: { id: categoryId },
    });

    // Registrar acción administrativa ANTES de devolver respuesta
    await logAdminAction(
      userId,
      'BLOG_DELETE_CATEGORY',
      `Categoría eliminada: ${deletedCategory.name} (ID: ${categoryId})`
    );

    return NextResponse.json({ message: translations.admin.taxonomies.deleteSuccess });
  } catch (error: any) {
    console.error('Error deleting category:', error);
     if (error.code === 'P2025') { // Código de Prisma para "Registro no encontrado"
        return NextResponse.json({ message: 'Categoría no encontrada.' }, { status: 404 });
    }
    // Podríamos añadir lógica para no permitir eliminar si está en uso (error P2003 de FK constraint)
    return NextResponse.json({ message: translations.admin.taxonomies.deleteError }, { status: 500 });
  }
}