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
    
    // Cargar categorías para cada proyecto directamente
    console.log(`🔍 Obteniendo categorías para ${projects.length} proyectos`);
    
    // Enfoque mejorado: una sola consulta para obtener categorías para todos los proyectos
    // MySQL no admite arrays directamente en consultas, así que construimos una consulta segura
    let projectCategories: any[] = [];
    
    // Solo ejecutar la consulta si hay proyectos
    if (projects.length > 0) {
      // Construir una lista de proyecto IDs como una cadena de formato '1','2','3'
      const projectIds = projects.map(p => `'${p.id}'`).join(',');
      
      // Usar esa cadena en la consulta SQL
      const categoriesQuery = `
        SELECT 
          p.id as projectId,
          c.id as categoryId,
          c.name as categoryName,
          c.slug as categorySlug
        FROM 
          Project p
        LEFT JOIN Category c ON p.categoryId = c.id
        WHERE 
          p.id IN (${projectIds})
          AND p.deleted = FALSE
      `;
      
      // Ejecutar la consulta construida
      projectCategories = await prisma.$queryRawUnsafe(categoriesQuery);
      console.log(`🔍 Obtenidas categorías para ${projects.length} proyectos`);
    }
    
    // Crear un mapa de proyectos a categorías
    const projectCategoriesMap = new Map();
    
    // Inicializar cada proyecto con un array vacío de categorías
    for (const project of projects) {
      projectCategoriesMap.set(project.id, []);
    }
    
    // Agregar categorías a sus proyectos correspondientes
    if (Array.isArray(projectCategories)) {
      for (const row of projectCategories) {
        if (row.categoryId) {
          const categoryEntry = {
            id: row.categoryId,
            name: row.categoryName,
            slug: row.categorySlug
          };
          
          // Añadir categoría al proyecto correspondiente
          const categories = projectCategoriesMap.get(row.projectId) || [];
          categories.push(categoryEntry);
          projectCategoriesMap.set(row.projectId, categories);
        }
      }
    }
    
    // Asignar las categorías a cada proyecto
    for (const project of projects) {
      project.categories = projectCategoriesMap.get(project.id) || [];
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
    
    // Nueva implementación para categoría única
    let categoryId = null;
    let categoryData = null;
    
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
    
    // Actualizar el proyecto con la categoría
    if (categoryId) {
      await prisma.$executeRaw`
        UPDATE Project
        SET categoryId = ${categoryId}
        WHERE id = ${projectId}
      `;
      console.log(`✅ Actualizado proyecto con categoryId: ${categoryId}`);
      
      // Obtener detalles de la categoría para respuesta
      try {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
          select: { id: true, name: true, slug: true }
        });
        
        if (category) {
          categoryData = category;
          console.log(`✅ Categoría obtenida: ${category.name} (${category.id})`);
        }
      } catch (error) {
        console.error(`❌ Error obteniendo categoría ${categoryId}:`, error);
      }
    }
    
    // Obtener proyecto actualizado con relaciones
    const projectWithRelations = await prisma.$queryRaw`
      SELECT 
        p.*, 
        u.name as authorName,
        u.email as authorEmail,
        c.id as categoryId,
        c.name as categoryName,
        c.slug as categorySlug
      FROM 
        Project p
      LEFT JOIN User u ON p.authorId = u.id
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE p.id = ${newProject[0].id}
    `;
    
    // Construir la respuesta final
    const project = Array.isArray(projectWithRelations) && projectWithRelations.length > 0 
      ? projectWithRelations[0] 
      : null;
    
    if (!project) {
      return NextResponse.json({ message: 'Error al crear el proyecto' }, { status: 500 });
    }
    
    // Obtener categoría del proyecto
    const projectCategories = project.categoryId ? [{
      id: project.categoryId,
      name: project.categoryName,
      slug: project.categorySlug
    }] : [];
    
    // Parsear additionalImageUrls
    const projectAdditionalImages = [];
    try {
      if (project.additionalImageUrls) {
        // @ts-ignore - we know project.additionalImageUrls is a string
        const parsedImages = JSON.parse(project.additionalImageUrls);
        if (Array.isArray(parsedImages)) {
          // @ts-ignore - assigning to projectAdditionalImages
          projectAdditionalImages.push(...parsedImages);
        }
      }
    } catch (error) {
      console.error("Error parsing additionalImageUrls:", error);
    }
    
    const finalProject = {
      id: project.id,
      title: project.title,
      slug: project.slug,
      content: project.content,
      excerpt: project.excerpt,
      coverImage: project.coverImage,
      additionalImageUrls: projectAdditionalImages,
      displayType: project.displayType,
      status: project.status,
      featured: project.featured === 1 || project.featured === true,
      authorDisplayName: project.authorDisplayName,
      author: {
        id: project.authorId,
        name: project.authorName,
        email: project.authorEmail
      },
      categories: projectCategories,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
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
