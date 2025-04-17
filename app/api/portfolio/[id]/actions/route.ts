import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/auth-utils';
import { logAdminAction } from '@/lib/stats';
// Using string literals for ProjectStatus since enum import might not work
// with the custom Prisma client path configuration
type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface RouteParams {
  params: { id: string };
}

// POST: Ejecutar acciones especiales sobre un proyecto
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await Promise.resolve(params); // Para evitar el error de Next.js
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  const userRole = session.user?.role;
  const userId = session.user?.id;

  // Verificar permiso para editar proyectos
  if (!hasPermission(userRole, 'edit_post')) {
    return NextResponse.json({ message: 'No tienes permiso para editar proyectos' }, { status: 403 });
  }

  try {
    // Obtener el proyecto actual para verificar
    const projectResult = await prisma.$queryRaw`
      SELECT * FROM Project WHERE id = ${id} AND deleted = FALSE
    `;
    
    const existingProject = Array.isArray(projectResult) && projectResult.length > 0 
      ? projectResult[0] 
      : null;

    if (!existingProject) {
      return NextResponse.json({ message: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Verificar si el usuario tiene permiso para editar este proyecto específico
    const isAuthor = existingProject.authorId === userId;
    const canEditAny = hasPermission(userRole, 'edit_any_post');

    if (!isAuthor && !canEditAny) {
      return NextResponse.json(
        { message: 'No tienes permiso para modificar este proyecto' },
        { status: 403 }
      );
    }

    const { action } = await request.json();
    let updateFields: { status?: ProjectStatus; featured?: boolean } = {};
    let actionType = '';
    let actionDetails = '';

    switch (action) {
      case 'publish':
        // Solo los usuarios con permiso para publicar pueden hacerlo
        if (!hasPermission(userRole, 'publish_post')) {
          return NextResponse.json(
            { message: 'No tienes permiso para publicar proyectos' },
            { status: 403 }
          );
        }
        updateFields = { status: 'PUBLISHED' as ProjectStatus };
        actionType = 'PUBLISH_PROJECT';
        actionDetails = `Proyecto publicado: ${existingProject.title} (ID: ${id})`;
        break;

      case 'archive':
        updateFields = { status: 'ARCHIVED' as ProjectStatus };
        actionType = 'ARCHIVE_PROJECT';
        actionDetails = `Proyecto archivado: ${existingProject.title} (ID: ${id})`;
        break;

      case 'unarchive':
        updateFields = { status: 'DRAFT' as ProjectStatus };
        actionType = 'UNARCHIVE_PROJECT';
        actionDetails = `Proyecto desarchivado: ${existingProject.title} (ID: ${id})`;
        break;

      case 'toggleFeatured':
        const newFeaturedValue = !existingProject.featured;
        updateFields = { featured: newFeaturedValue };
        actionType = newFeaturedValue ? 'FEATURE_PROJECT' : 'UNFEATURE_PROJECT';
        actionDetails = newFeaturedValue 
          ? `Proyecto marcado como destacado: ${existingProject.title} (ID: ${id})`
          : `Proyecto desmarcado como destacado: ${existingProject.title} (ID: ${id})`;
        break;

      default:
        return NextResponse.json({ message: 'Acción no válida' }, { status: 400 });
    }

    // Realizar actualización
    if (action === 'toggleFeatured') {
      await prisma.$executeRaw`
        UPDATE Project
        SET 
          featured = ${!existingProject.featured},
          updatedAt = NOW()
        WHERE id = ${id}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE Project
        SET 
          status = ${updateFields.status},
          updatedAt = NOW()
        WHERE id = ${id}
      `;
    }

    // Registrar la acción administrativa
    await logAdminAction(
      userId,
      actionType,
      actionDetails
    );

    // Obtener el proyecto actualizado
    const updatedProjectResult = await prisma.$queryRaw`
      SELECT * FROM Project WHERE id = ${id}
    `;
    
    const updatedProject = Array.isArray(updatedProjectResult) && updatedProjectResult.length > 0 
      ? updatedProjectResult[0] 
      : null;

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error performing project action:', error);
    return NextResponse.json({ message: 'Error al realizar la acción sobre el proyecto' }, { status: 500 });
  }
}
