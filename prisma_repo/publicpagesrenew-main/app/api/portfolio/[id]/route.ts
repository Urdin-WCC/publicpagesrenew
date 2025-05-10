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
    console.log(`🔍 Obteniendo proyecto con ID: ${id}`);
    
    // Obtener proyecto con autor y categoría en una sola consulta SQL
    const projectResult = await prisma.$queryRaw`
      SELECT 
        p.*,
        u.id as authorId,
        u.name as authorName,
        u.email as authorEmail,
        c.id as categoryId,
        c.name as categoryName,
        c.slug as categorySlug
      FROM 
        Project p
        LEFT JOIN User u ON p.authorId = u.id
        LEFT JOIN Category c ON p.categoryId = c.id
      WHERE 
        p.id = ${id}
    `;
    
    // Verificar si el proyecto fue encontrado
    const project = Array.isArray(projectResult) && projectResult.length > 0 
      ? projectResult[0] 
      : null;
      
    if (!project) {
      console.log(`❌ Proyecto no encontrado: ${id}`);
      return NextResponse.json({ message: 'Proyecto no encontrado' }, { status: 404 });
    }
    
    console.log(`✅ Proyecto encontrado: ${project.title}`);
    
    // Si el proyecto está marcado como eliminado, solo permitir acceso a usuarios autenticados
    if (project.deleted) {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ message: 'Proyecto no encontrado' }, { status: 404 });
      }
    }
    
    // 2. Construcción de datos del autor
    const author = project.authorId ? {
      id: project.authorId,
      name: project.authorName,
      email: project.authorEmail
    } : null;
    
    // 3. Construcción de categorías
    type CategoryType = { id: string; name: string; slug: string };
    let categories: CategoryType[] = [];
    
    // Si hay una categoría asociada, agregarla al array
    if (project.categoryId) {
      console.log(`🏷️ Categoría encontrada: ${project.categoryName} (${project.categoryId})`);
      categories = [{
        id: project.categoryId,
        name: project.categoryName,
        slug: project.categorySlug
      }];
    } else {
      console.log(`ℹ️ Proyecto sin categoría`);
    }
    
    // 4. Parsear additionalImageUrls si existe
    let additionalImageUrls = [];
    try {
      additionalImageUrls = project.additionalImageUrls ? JSON.parse(project.additionalImageUrls) : [];
    } catch (error) {
      console.error("Error parsing additionalImageUrls:", error);
      additionalImageUrls = [];
    }
    
    // 5. Construir respuesta final
    const response = {
      id: project.id,
      title: project.title,
      slug: project.slug,
      content: project.content,
      excerpt: project.excerpt,
      coverImage: project.coverImage,
      additionalImageUrls,
      displayType: project.displayType,
      status: project.status,
      featured: project.featured === 1 || project.featured === true, // Convertir a boolean
      authorDisplayName: project.authorDisplayName,
      author,
      categories, // Array de categorías (0 o 1)
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
    
    console.log(`📤 Devolviendo proyecto con ${categories.length} categoría(s)`);
    
    return NextResponse.json(response);
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

    // El problema está ocurriendo aquí. El error indica que no existe la columna 'categoryIds'.
    // Además, hay una discrepancia en el mensaje de log que menciona 'categoryIds' mientras
    // actualizamos 'categoryId' (singular). Vamos a corregir esto.

    // Manejar la categoría - tomamos la primera en caso de que sea un array
    let categoryId = null;
    
    if (Array.isArray(categories) && categories.length > 0) {
      categoryId = categories[0]; // Tomamos sólo la primera categoría
      console.log(`🏷️ Usando la primera categoría del array: ${categoryId}`);
    } else if (typeof categories === 'string') {
      categoryId = categories; // Si ya es un string, lo usamos directamente
      console.log(`🏷️ Usando categoría: ${categoryId}`);
    }
    
    // Si se proporciona el valor "none", guardamos un NULL
    if (categoryId === "none") {
      categoryId = null;
      console.log(`ℹ️ Se seleccionó "Sin categoría"`);
    }
    
    console.log(`🔄 Actualizando proyecto ID ${id} con categoryId: ${categoryId || 'NULL'}`);
    
    // Actualizar el proyecto con SQL directo, usando categoryId en lugar de categoryIds
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
        categoryId = ${categoryId},
        updatedAt = NOW()
      WHERE id = ${id}
    `;
    
    console.log(`✅ Proyecto actualizado exitosamente ${categoryId ? 'con categoría: ' + categoryId : 'sin categoría'}`);
    
    // Recuperar el proyecto actualizado con la categoría
    const updatedProjectResult = await prisma.$queryRaw`
      SELECT 
        p.*, 
        u.name AS authorName,
        c.id AS categoryId,
        c.name AS categoryName,
        c.slug AS categorySlug
      FROM Project p
      LEFT JOIN User u ON p.authorId = u.id
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE p.id = ${id}
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
