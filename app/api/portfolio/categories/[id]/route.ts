import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/auth-utils';
import { logAdminAction } from '@/lib/stats';
import { generateSlug } from '@/lib/utils';
import { Role } from '@prisma/client';

interface RouteParams {
  params: { id: string };
}

// GET: Obtener una categoría específica por ID
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    // Find related projects separately
    const relatedProjects = await prisma.project.findMany({
      where: {
        deleted: false,
        categories: {
          some: { id }
        }
      },
      select: {
        id: true,
        title: true,
        slug: true
      }
    });
    
    // Combine the results
    const result = category ? {
      ...category,
      projects: relatedProjects
    } : null;

    if (!category) {
      return NextResponse.json({ message: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching project category:', error);
    return NextResponse.json(
      { message: 'Error al obtener la categoría de proyecto' },
      { status: 500 }
    );
  }
}

// PUT: Actualizar una categoría existente
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  const userRole = session.user?.role as Role | undefined;
  const userId = session.user?.id;

  // Verificar permiso para gestionar taxonomías
  if (!hasPermission(userRole, 'manage_blog_taxonomies')) { // Reutilizamos el permiso de blog
    return NextResponse.json(
      { message: 'No tienes permiso para gestionar categorías de proyectos' },
      { status: 403 }
    );
  }

  try {
    // Verificar si la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ message: 'Categoría no encontrada' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'El nombre es obligatorio y debe ser un texto.' },
        { status: 400 }
      );
    }

    // Generar nuevo slug si el nombre cambió
    let slug = existingCategory.slug;
    if (name !== existingCategory.name) {
      slug = generateSlug(name);

      // Verificar si el nuevo slug ya existe
      const slugExists = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: id }, // Excluir la categoría actual
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { message: `Ya existe una categoría con el slug '${slug}'.` },
          { status: 409 }
        );
      }
    }

    // Actualizar la categoría
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
    });

    // Registrar la acción administrativa
    await logAdminAction(
      userId as string,
      'UPDATE_PROJECT_CATEGORY',
      `Categoría de proyecto actualizada: ${name} (ID: ${id})`
    );

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating project category:', error);
    return NextResponse.json(
      { message: 'Error al actualizar la categoría de proyecto' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una categoría
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  const userRole = session.user?.role as Role | undefined;
  const userId = session.user?.id;

  // Verificar permiso para gestionar taxonomías
  if (!hasPermission(userRole, 'manage_blog_taxonomies')) { // Reutilizamos el permiso de blog
    return NextResponse.json(
      { message: 'No tienes permiso para gestionar categorías de proyectos' },
      { status: 403 }
    );
  }

  try {
    // Verificar si la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json({ message: 'Categoría no encontrada' }, { status: 404 });
    }
    
    // Check if any projects are using this category
    const projectsUsingCategory = await prisma.project.count({
      where: {
        categories: {
          some: { id }
        }
      }
    });

    // Opcional: Verificar si hay proyectos asociados y decidir si permitir la eliminación
    if (projectsUsingCategory > 0) {
      // Alternativa 1: No permitir eliminar categorías con proyectos
      // return NextResponse.json(
      //   { message: 'No se puede eliminar una categoría que tiene proyectos asociados' },
      //   { status: 400 }
      // );

      // Alternativa 2: Desconectar los proyectos de la categoría antes de eliminarla
      // Desconectar proyectos de la categoría
      const projectsWithCategory = await prisma.project.findMany({
        where: {
          categories: {
            some: { id }
          }
        },
        select: { id: true }
      });
      
      // Update each project to remove the category
      for (const project of projectsWithCategory) {
        await prisma.project.update({
          where: { id: project.id },
          data: {
            categories: {
              disconnect: { id }
            }
          }
        });
      }
    }

    // Eliminar la categoría
    await prisma.category.delete({
      where: { id },
    });

    // Registrar la acción administrativa
    await logAdminAction(
      userId as string,
      'DELETE_PROJECT_CATEGORY',
      `Categoría de proyecto eliminada: ${existingCategory.name} (ID: ${id})`
    );

    return NextResponse.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting project category:', error);
    return NextResponse.json(
      { message: 'Error al eliminar la categoría de proyecto' },
      { status: 500 }
    );
  }
}
