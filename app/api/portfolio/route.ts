import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { logAdminAction } from '@/lib/stats';
import { hasPermission } from '@/lib/auth-utils';
import { Role } from '@prisma/client';
import { getPortfolioConfig } from '@/lib/config-server';
import { generateSlug } from '@/lib/utils';

// GET: Obtener lista de proyectos (con filtros y paginación)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const status = searchParams.get('status') as string | null;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';

  try {
    // No hay necesidad de verificar si el modelo Project existe

    // Determinar si es una solicitud de la página pública o del admin
    const session = await auth();
    const isAdmin = session?.user && hasPermission(session.user.role, 'edit_any_post');
    
    console.log('Auth session:', session ? 'Session exists' : 'No session');
    console.log('Is admin user:', isAdmin);

    // Construir la consulta con filtros
    const whereClause: any = {
      deleted: false,
    };

    // Filtrar por estado
    // Si es admin y se especifica un estado, usar ese estado
    // Si es admin y no se especifica estado, mostrar todos
    // Si no es admin (público), mostrar solo publicados independientemente del parámetro status
    if (status && isAdmin) {
      whereClause.status = status;
    } else if (!isAdmin) {
      // En páginas públicas solo mostrar proyectos publicados
      whereClause.status = 'PUBLISHED';
    }

    // Filtrar por búsqueda si se proporciona
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    // Filtrar por categoría si se proporciona
    if (categoryId) {
      whereClause.categories = {
        some: {
          id: categoryId,
        },
      };
    }

    console.log('Executing direct SQL query to fetch projects');
    
    // Construir la consulta SQL básica para proyectos no eliminados
    let sqlQuery = `
      SELECT p.*, u.name as authorName 
      FROM Project p 
      LEFT JOIN User u ON p.authorId = u.id 
      WHERE p.deleted = false
    `;
    
    // Añadir filtros basados en searchParams
    const queryParams: any[] = [];
    
    // Aplicar el filtro de estado
    if (status && isAdmin) {
      sqlQuery += ` AND p.status = ?`;
      queryParams.push(status);
      console.log('Admin with status filter:', status);
    } else if (!isAdmin) {
      // En páginas públicas solo mostrar proyectos publicados
      sqlQuery += ` AND p.status = 'PUBLISHED'`;
      console.log('Public view - forcing PUBLISHED status filter');
    } else {
      console.log('Admin without status filter - showing all status values');
    }
    
    if (search) {
      sqlQuery += ` AND (p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Añadir ordenamiento y paginación
    sqlQuery += ` ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, (page - 1) * limit);
    
    // Log the SQL query with params for debugging
    console.log('Final SQL Query:', sqlQuery);
    console.log('Query parameters:', queryParams);
    
    // Ejecutar consulta SQL para obtener proyectos
    const projects = await prisma.$queryRawUnsafe<any[]>(sqlQuery, ...queryParams);
    
    // Log projects basic info
    console.log('Projects returned:', projects.length);
    console.log('Projects status values:', projects.map(p => p.status));
    
    // Consulta para contar total de proyectos (para paginación)
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM Project p 
      WHERE p.deleted = false
    `;
    
    // Añadir los mismos filtros al count
    const countParams: any[] = [];
    
    // Aplicar el mismo filtro de estado al count que aplicamos a la consulta principal
    if (status && isAdmin) {
      countQuery += ` AND p.status = ?`;
      countParams.push(status);
    } else if (!isAdmin) {
      // En páginas públicas solo contar proyectos publicados
      countQuery += ` AND p.status = 'PUBLISHED'`;
    }
    
    if (search) {
      countQuery += ` AND (p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Ejecutar consulta para contar
    const totalResult = await prisma.$queryRawUnsafe<{total: any}[]>(countQuery, ...countParams);
    // Convertir el BigInt a Number para evitar errores de incompatibilidad
    const totalProjects = typeof totalResult[0].total === 'bigint' 
      ? Number(totalResult[0].total) 
      : totalResult[0].total;
    
    // Cargar categorías para cada proyecto usando el campo categoryIds (JSON)
    try {
      // Para cada proyecto, obtener sus categorías asociadas desde el campo JSON
      for (const project of projects as any[]) {
        // Inicializar categories como array vacío por defecto
        project.categories = [];
        
        // Parsear categoryIds si existe
        let categoryIds = [];
        try {
          if (project.categoryIds) {
            categoryIds = JSON.parse(project.categoryIds);
          }
        } catch (parseError) {
          console.error(`Error parsing categoryIds for project ${project.id}:`, parseError);
          categoryIds = [];
        }
        
        // Si hay categorías, obtener sus detalles
        if (categoryIds.length > 0) {
          // Construir placeholders para la consulta IN
          const placeholders = categoryIds.map(() => '?').join(',');
          
          // Obtener detalles de las categorías
          try {
            const categoriesResult = await prisma.$queryRawUnsafe(`
              SELECT id, name, slug
              FROM Category
              WHERE id IN (${placeholders})
            `, ...categoryIds);
            
            project.categories = Array.isArray(categoriesResult) ? categoriesResult : [];
          } catch (fetchError) {
            console.error(`Error fetching categories for project ${project.id}:`, fetchError);
          }
        }
      }
    } catch (error) {
      console.error("Error loading project categories from JSON:", error);
      // Si hay error, inicializar como arreglo vacío para evitar errores
      for (const project of projects as any[]) {
        if (!project.categories) project.categories = [];
      }
    }

    // Obtener la configuración del portfolio
    let portfolioConfig;
    try {
      portfolioConfig = await getPortfolioConfig();
    } catch (error) {
      console.error('Error fetching portfolio config:', error);
      portfolioConfig = {
        projectsPerPage: 12,
        defaultDisplayType: 'GALLERY',
        showSidebarInList: true,
        showSidebarInProject: true,
        layoutMode: 'grid',
      };
    }

    // Parsear additionalImageUrls para cada proyecto
    const projectsWithParsedImages = projects.map((project: any) => ({
      ...project,
      additionalImageUrls: project.additionalImageUrls ? JSON.parse(project.additionalImageUrls) : [],
    }));

    return NextResponse.json({
      projects: projectsWithParsedImages,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: page,
      totalProjects,
      portfolioConfig,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Error al obtener los proyectos' }, { status: 500 });
  }
}

// POST: Crear un nuevo proyecto
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }
  const userId = session.user.id;
  const userRole = session.user.role;

  // Verificar permiso para crear proyectos
  if (!hasPermission(userRole, 'create_post')) { // Reutilizamos el permiso de posts
    return NextResponse.json({ message: 'No tienes permiso para crear proyectos' }, { status: 403 });
  }

  try {
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
    if (!title || !slug || !content) {
      return NextResponse.json(
        { message: 'Faltan campos obligatorios (título, slug, contenido)' },
        { status: 400 }
      );
    }

    // Establecer estado por defecto si no se proporciona
    status = status || 'DRAFT';

    // Verificar permiso para publicar (si el estado es PUBLISHED)
    if (status === 'PUBLISHED' && !hasPermission(userRole, 'publish_post')) {
      status = 'DRAFT'; // Forzar a borrador si no tiene permiso
    }

    // Verificar si el slug ya existe usando SQL directo
    try {
      const query = `SELECT id FROM Project WHERE slug = ?`;
      const result = await prisma.$queryRaw`SELECT id FROM Project WHERE slug = ${slug}`;
      const existingSlug = Array.isArray(result) && result.length > 0 ? result[0] : null;

      if (existingSlug) {
        return NextResponse.json(
          { message: 'El slug ya existe. Elige un título diferente o modifica el slug.' },
          { status: 409 }
        );
      }
    } catch (err) {
      console.error('Error checking slug:', err);
      // Continuar con la creación del proyecto aunque no se pueda verificar el slug
    }

    console.log('Creating project using direct SQL');
    
    // Generate a CUID-like ID for the project
    const projectId = `cuid${Math.floor(Math.random() * 1000000)}`;
    
    // Crear el proyecto usando SQL directo
    const newProject = await prisma.$queryRaw<any[]>`
      INSERT INTO Project (
        id,
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
        authorId,
        createdAt,
        updatedAt,
        deleted
      ) 
      VALUES (
        ${projectId},
        ${title}, 
        ${slug}, 
        ${content}, 
        ${excerpt || null}, 
        ${coverImage || null}, 
        ${additionalImageUrls ? JSON.stringify(additionalImageUrls) : null}, 
        ${displayType || 'SINGLE'}, 
        ${status}, 
        ${featured || false}, 
        ${authorDisplayName || null}, 
        ${userId},
        CURRENT_TIMESTAMP(),
        CURRENT_TIMESTAMP(),
        FALSE
      )
      RETURNING *
    `;
    
    // Procesar las categorías para guardarlas como JSON
    const categoryIdsJson = Array.isArray(categories) 
      ? JSON.stringify(categories.filter(Boolean))  // Filtrar valores nulos o vacíos
      : JSON.stringify([]);
      
    // Actualizar el proyecto con las categorías en formato JSON
    if (Array.isArray(categories) && categories.length > 0) {
      try {
        await prisma.$executeRaw`
          UPDATE Project
          SET categoryIds = ${categoryIdsJson}
          WHERE id = ${projectId}
        `;
        console.log(`Stored ${categories.length} categories in project ${projectId} as JSON: ${categoryIdsJson}`);
      } catch (error) {
        console.error('Error storing categories as JSON:', error);
        // No detener la ejecución, sólo registrar el error
      }
    }
    
    // Obtener el proyecto completo con relaciones
    const projectWithRelations = await prisma.$queryRaw<any[]>`
      SELECT p.*, u.name as authorName 
      FROM Project p 
      LEFT JOIN User u ON p.authorId = u.id 
      WHERE p.id = ${newProject[0].id}
    `;
    
    // Obtener las categorías del proyecto que acabamos de crear (desde el campo JSON)
    let projectCategories = [];
    try {
      // Obtener el proyecto actualizado con su campo categoryIds
      const projectWithCategories = await prisma.$queryRaw`
        SELECT categoryIds FROM Project WHERE id = ${projectId}
      `;
      
      // Parsear el campo categoryIds
      let categoryIds = [];
      if (projectWithCategories[0].categoryIds) {
        try {
          categoryIds = JSON.parse(projectWithCategories[0].categoryIds);
        } catch (parseError) {
          console.error('Error parsing categoryIds:', parseError);
        }
      }
      
      // Si hay IDs de categorías, obtener sus detalles
      if (categoryIds.length > 0) {
        // Construir placeholders para la consulta IN
        const placeholders = categoryIds.map(() => '?').join(',');
        
        // Obtener detalles de las categorías
        const categoriesResult = await prisma.$queryRawUnsafe(`
          SELECT id, name, slug
          FROM Category
          WHERE id IN (${placeholders})
        `, ...categoryIds);
        
        projectCategories = Array.isArray(categoriesResult) ? categoriesResult : [];
      }
      
      console.log('Categories attached to new project (from JSON):', projectCategories);
    } catch (error) {
      console.error('Error fetching project categories from JSON:', error);
      projectCategories = [];
    }
    
    const finalProject = {
      ...projectWithRelations[0],
      categories: projectCategories
    };

    // Registrar la acción administrativa
    await logAdminAction(
      userId,
      'CREATE_PROJECT',
      `Proyecto creado: ${finalProject.title} (ID: ${finalProject.id})`
    );

    return NextResponse.json(finalProject, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    // Manejar error de slug duplicado (por si acaso la verificación anterior falla por concurrencia)
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return NextResponse.json({ message: 'Error: El slug ya existe. Elige un título diferente.' }, { status: 409 });
    }
    // Manejar error de usuario no encontrado (P2025)
    if (error.code === 'P2025') {
      console.error("Prisma error P2025 details:", error.meta);
      return NextResponse.json({ message: 'Error: No se encontró un registro relacionado requerido (posiblemente autor o categoría).' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error interno del servidor al crear el proyecto' }, { status: 500 });
  }
}
