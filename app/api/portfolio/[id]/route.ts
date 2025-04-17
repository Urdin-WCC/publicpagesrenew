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

// GET: Obtener un proyecto específico por ID
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    // Get project with author info using raw SQL
    const projectResult = await prisma.$queryRaw`
      SELECT p.*, u.id as authorId, u.name as authorName
      FROM Project p
      LEFT JOIN User u ON p.authorId = u.id
      WHERE p.id = ${id}
    `;
    
    const project = Array.isArray(projectResult) && projectResult.length > 0 
      ? projectResult[0] 
      : null;

    if (!project) {
      return NextResponse.json({ message: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Format author information
    if (project.authorId) {
      project.author = {
        id: project.authorId,
        name: project.authorName
      };
    }

    // Obtener categorías desde el campo JSON categoryIds
    try {
      let projectCategories = [];
      
      // Parsear categoryIds si existe
      const categoryIds = project.categoryIds ? JSON.parse(project.categoryIds) : [];
      
      if (categoryIds.length > 0) {
        // Construir placeholders para la consulta IN
        const placeholders = categoryIds.map(() => '?').join(',');
        
        // Obtener detalles completos de las categorías
        const categoriesResult = await prisma.$queryRawUnsafe(`
          SELECT id, name, slug
          FROM Category
          WHERE id IN (${placeholders})
        `, ...categoryIds);
        
        projectCategories = Array.isArray(categoriesResult) ? categoriesResult : [];
      }
      
      // Asignar categorías al proyecto
      project.categories = projectCategories;
      console.log(`Loaded ${projectCategories.length} categories for project ${id}`);
    } catch (error) {
      console.error("Error fetching project categories from JSON:", error);
      project.categories = [];
    }

    // Si el proyecto está marcado como eliminado, solo permitir acceso a usuarios autenticados
    if (project.deleted) {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ message: 'Proyecto no encontrado' }, { status: 404 });
      }
    }

    // Parsear additionalImageUrls si existe
    const projectWithParsedImages = {
      ...project,
      additionalImageUrls: project.additionalImageUrls ? JSON.parse(project.additionalImageUrls) : [],
    };

    return NextResponse.json(projectWithParsedImages);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ message: 'Error al obtener el proyecto' }, { status: 500 });
  }
}

// PUT: Actualizar un proyecto existente
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  const userRole = session.user?.role as Role | undefined;
  const userId = session.user?.id;

  // Verificar permiso para editar proyectos
  if (!hasPermission(userRole, 'edit_post')) { // Reutilizamos el permiso de posts
    return NextResponse.json({ message: 'No tienes permiso para editar proyectos' }, { status: 403 });
  }

  try {
    // Verificar si el proyecto existe
    const projectResult = await prisma.$queryRaw`
      SELECT * FROM Project WHERE id = ${id}
    `;
    
    const existingProject = Array.isArray(projectResult) && projectResult.length > 0 
      ? projectResult[0] 
      : null;

    if (!existingProject) {
      return NextResponse.json({ message: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Get categories for this project
    let existingCategories = [];
    try {
      const categoriesResult = await prisma.$queryRaw`
        SELECT id, name, slug
        FROM Category
        LIMIT 20
      `;
      existingCategories = Array.isArray(categoriesResult) ? categoriesResult : [];
      existingProject.categories = existingCategories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      existingProject.categories = [];
    }

    // Verificar si el usuario tiene permiso para editar este proyecto específico
    const isAuthor = existingProject.authorId === userId;
    const canEditAny = hasPermission(userRole, 'edit_any_post'); // Reutilizamos el permiso de posts

    if (!isAuthor && !canEditAny) {
      return NextResponse.json(
        { message: 'No tienes permiso para editar este proyecto' },
        { status: 403 }
      );
    }

    const body = await request.json();
    let {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      additionalImageUrls,
      displayType,
      status,
      featured,
      authorDisplayName,
      categories,
    } = body;

    // Validaciones básicas
    if (!title || !content) {
      return NextResponse.json(
        { message: 'El título y el contenido son obligatorios' },
        { status: 400 }
      );
    }

    // Generar slug si se cambia el título y el slug coincide con el generado anteriormente
    if (title !== existingProject.title && slug === existingProject.slug) {
      slug = generateSlug(title);
    }

    // Verificar permiso para publicar (si el estado es PUBLISHED)
    if (status === 'PUBLISHED' && !hasPermission(userRole, 'publish_post')) {
      status = existingProject.status; // Mantener el estado actual si no tiene permiso para publicar
    }

    // Verificar si el nuevo slug ya existe (si se cambió)
    if (slug !== existingProject.slug) {
      const slugCheckResult = await prisma.$queryRaw`
        SELECT id FROM Project WHERE slug = ${slug} LIMIT 1
      `;

      if (Array.isArray(slugCheckResult) && slugCheckResult.length > 0) {
        return NextResponse.json(
          { message: 'El slug ya existe. Elige un título diferente o modifica el slug.' },
          { status: 409 }
        );
      }
    }

    // Procesar las categorías para almacenarlas como JSON
    const categoryIdsJson = Array.isArray(categories) 
      ? JSON.stringify(categories.filter(Boolean)) // Filtramos valores nulos o vacíos
      : JSON.stringify([]);
      
    console.log('Categories received in PUT request:', categories);
    console.log('Storing categories as JSON:', categoryIdsJson);
    
    // Actualizar el proyecto con SQL directo, incluyendo categoryIds
    await prisma.$executeRaw`
      UPDATE Project
      SET 
        title = ${title},
        slug = ${slug},
        content = ${content},
        excerpt = ${excerpt || null},
        coverImage = ${coverImage || null},
        additionalImageUrls = ${additionalImageUrls ? JSON.stringify(additionalImageUrls) : null},
        displayType = ${displayType},
        status = ${status},
        featured = ${featured || false},
        authorDisplayName = ${authorDisplayName || null},
        categoryIds = ${categoryIdsJson}, /* Nuevo campo para almacenar categorías como JSON */
        updatedAt = NOW()
      WHERE id = ${id}
    `;
    
    console.log(`✅ Project updated successfully with categories stored in categoryIds field`);
    
    // Recuperar el proyecto actualizado
    const updatedProjectResult = await prisma.$queryRaw`
      SELECT * FROM Project WHERE id = ${id}
    `;
    
    const updatedProject = Array.isArray(updatedProjectResult) && updatedProjectResult.length > 0 
      ? updatedProjectResult[0] 
      : null;

    // Registrar la acción administrativa
    await logAdminAction(
      userId as string,
      'UPDATE_PROJECT',
      `Proyecto actualizado: ${title} (ID: ${id})`
    );

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ message: 'Error al actualizar el proyecto' }, { status: 500 });
  }
}

// DELETE: Eliminar un proyecto (marcarlo como eliminado)
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  const userRole = session.user?.role as Role | undefined;
  const userId = session.user?.id;

  // Verificar permiso para eliminar proyectos
  if (!hasPermission(userRole, 'delete_post')) { // Reutilizamos el permiso de posts
    return NextResponse.json({ message: 'No tienes permiso para eliminar proyectos' }, { status: 403 });
  }

  try {
    // Verificar si el proyecto existe
    const projectResult = await prisma.$queryRaw`
      SELECT * FROM Project WHERE id = ${id}
    `;
    
    const existingProject = Array.isArray(projectResult) && projectResult.length > 0 
      ? projectResult[0] 
      : null;

    if (!existingProject) {
      return NextResponse.json({ message: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Verificar si el usuario tiene permiso para eliminar este proyecto específico
    const isAuthor = existingProject.authorId === userId;
    const canDeleteAny = hasPermission(userRole, 'delete_any_post'); // Reutilizamos el permiso de posts

    if (!isAuthor && !canDeleteAny) {
      return NextResponse.json(
        { message: 'No tienes permiso para eliminar este proyecto' },
        { status: 403 }
      );
    }

    // Marcar el proyecto como eliminado (soft delete) usando SQL directo
    await prisma.$executeRaw`
      UPDATE Project
      SET 
        deleted = TRUE,
        updatedAt = NOW()
      WHERE id = ${id}
    `;

    // Registrar la acción administrativa
    await logAdminAction(
      userId as string,
      'DELETE_PROJECT',
      `Proyecto eliminado: ${existingProject.title} (ID: ${id})`
    );

    return NextResponse.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ message: 'Error al eliminar el proyecto' }, { status: 500 });
  }
}
