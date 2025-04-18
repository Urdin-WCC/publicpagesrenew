import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Asegurar que se importa la instancia correcta
import { auth } from '@/auth'; // Importar auth para obtener sesión
import { logAdminAction } from '@/lib/stats'; // Importar logAdminAction desde lib/stats.ts
import { hasPermission } from '@/lib/auth-utils'; // Importar hasPermission
import { Role, PostStatus } from '@prisma/client'; // Importar tipos necesarios
import { getBlogConfig } from '@/lib/config-server'; // Importar función para obtener la configuración del blog

export async function GET(request: Request) {
  // const session = await auth(); // Descomentar para obtener sesión
  // const userRole = getUserRole(session); // Obtener rol del usuario

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const searchTerm = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';
  const status = searchParams.get('status') || undefined; // Filtrar por estado (DRAFT, PUBLISHED, ARCHIVED)

  const skip = (page - 1) * limit;

  try {
    console.log(`🔍 Obteniendo listado de posts (página: ${page}, límite: ${limit})`);
    
    // Construir la consulta SQL base
    let sqlQuery = `
      SELECT 
        p.*,
        u.id as authorId,
        u.name as authorName,
        u.email as authorEmail,
        c.id as categoryId,
        c.name as categoryName,
        c.slug as categorySlug
      FROM 
        Post p
      LEFT JOIN User u ON p.authorId = u.id
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE 
        p.deleted = FALSE
    `;
    
    // Preparar parámetros para la consulta
    let sqlParams: any[] = [];
    let whereConditions = [];
    
    // Filtrar por estado si se proporciona
    if (status) {
      whereConditions.push(`p.status = ?`);
      sqlParams.push(status);
      console.log(`🏷️ Filtrando por estado: ${status}`);
    }
    
    // Filtrar por término de búsqueda si se proporciona
    if (searchTerm) {
      whereConditions.push(`(p.title LIKE ? OR p.content LIKE ?)`);
      const termWithWildcards = `%${searchTerm}%`;
      sqlParams.push(termWithWildcards, termWithWildcards);
      console.log(`🔎 Buscando: "${searchTerm}"`);
    }
    
    // Filtrar por categoría si se proporciona
    if (categorySlug) {
      // Obtenemos primeiro el ID de la categoría por su slug
      console.log(`🏷️ Buscando categoría con slug: ${categorySlug}`);
      
      const categoryResult = await prisma.$queryRaw`
        SELECT id FROM Category WHERE slug = ${categorySlug}
      `;
      
      if (Array.isArray(categoryResult) && categoryResult.length > 0) {
        const categoryId = categoryResult[0].id;
        whereConditions.push(`p.categoryId = ?`);
        sqlParams.push(categoryId);
        console.log(`✅ Categoría encontrada. Filtrando por categoryId: ${categoryId}`);
      } else {
        console.log(`❌ Categoría no encontrada: ${categorySlug}`);
        
        // Si no se encuentra la categoría, devolver directamente respuesta vacía
        return NextResponse.json({
          posts: [],
          totalPages: 0,
          currentPage: page,
          totalPosts: 0,
          blogConfig: await getBlogConfig()
        });
      }
    }
    
    // Añadir condiciones WHERE si hay alguna
    if (whereConditions.length > 0) {
      sqlQuery += ` AND ${whereConditions.join(' AND ')}`;
    }
    
    // Añadir ordenamiento y paginación
    sqlQuery += ` ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`;
    sqlParams.push(limit, skip);
    
    // Ejecutar consulta para obtener posts
    console.log(`🔄 Ejecutando consulta SQL para obtener posts...`);
    const postsResult = await prisma.$queryRawUnsafe(sqlQuery, ...sqlParams);
    const posts = Array.isArray(postsResult) ? postsResult : [];
    
    console.log(`✅ Obtenidos ${posts.length} posts`);
    
    // Construir consulta para contar el total de posts
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM Post p 
      WHERE p.deleted = FALSE
    `;
    
    // Preparar parámetros para la consulta de conteo
    let countParams: any[] = [];
    
    // Duplicar las condiciones WHERE para la consulta de conteo
    if (whereConditions.length > 0) {
      countQuery += ` AND ${whereConditions.join(' AND ')}`;
      countParams = [...sqlParams.slice(0, sqlParams.length - 2)]; // Excluir limit y offset
    }
    
    // Ejecutar consulta para obtener total de posts
    const totalResult = await prisma.$queryRawUnsafe<{ total: number | bigint }[]>(countQuery, ...countParams);
    const totalPosts = typeof totalResult[0].total === 'bigint' ? Number(totalResult[0].total) : totalResult[0].total;
    
    console.log(`📊 Total posts: ${totalPosts}`);
    
    // Procesar y formatear los posts
    type CategoryType = { id: string; name: string; slug: string };
    
    const enhancedPosts = posts.map((post: any) => {
      // Construir objeto de autor
      const author = post.authorId ? {
        id: post.authorId,
        name: post.authorName,
        email: post.authorEmail
      } : null;
      
      // Construir array de categorías
      const categories: CategoryType[] = post.categoryId ? [{
        id: post.categoryId,
        name: post.categoryName,
        slug: post.categorySlug
      }] : [];
      
      // Limpiar y formatear post para devolución
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        status: post.status,
        featured: post.featured === 1 || post.featured === true, // Convertir a boolean
        authorDisplayName: post.authorDisplayName,
        author,
        categories, // Array de categorías (0 o 1)
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      };
    });
    
    // Obtener la configuración del blog
    console.log(`🔄 Obteniendo configuración del blog...`);
    const blogConfig = await getBlogConfig();
    
    console.log(`📤 Devolviendo ${enhancedPosts.length} posts`);
    
    return NextResponse.json({
      posts: enhancedPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts,
      blogConfig, // Incluir la configuración completa del blog
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Asegurarse de que el mensaje de error esté en español si es visible para el usuario
    return NextResponse.json({ message: 'Error al obtener los posts' }, { status: 500 });
  }
}
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }
  const userId = session.user.id;
  const userRole = session.user.role;

  // Verificar permiso para crear
  if (!hasPermission(userRole, 'create_post')) {
     return NextResponse.json({ message: 'No autorizado para crear posts' }, { status: 403 });
  } 

  try {
    const body = await request.json();
    // Asegurarse de que status sea del tipo PostStatus o undefined 
    let { title, content, slug, status, categories, coverImage, excerpt, featured, authorDisplayName } = body as {
        title: string;
        content: string;
        slug: string;
        status?: PostStatus;
        categories?: string[];
        coverImage?: string;
        excerpt?: string;
        featured?: boolean;
        authorDisplayName?: string;
    };

    // Validar campos obligatorios básicos
    if (!title || !slug || !content) {
        return NextResponse.json({ message: 'Faltan campos obligatorios (título, slug, contenido)' }, { status: 400 });
    }

    // Establecer estado por defecto si no se proporciona
    status = status || PostStatus.DRAFT;

    // Verificar permiso para publicar (si el estado es PUBLISHED)
    if (status === PostStatus.PUBLISHED && !hasPermission(userRole, 'publish_post')) {
        status = PostStatus.DRAFT; // Forzar a borrador si no tiene permiso
    }

    // Verificar si el slug ya existe usando SQL directo
    try {
      const result = await prisma.$queryRaw`SELECT id FROM Post WHERE slug = ${slug}`;
      const existingSlug = Array.isArray(result) && result.length > 0 ? result[0] : null;

      if (existingSlug) {
        return NextResponse.json(
          { message: 'El slug ya existe. Elige un título diferente o modifica el slug.' },
          { status: 409 }
        );
      }
    } catch (err) {
      console.error('Error checking slug:', err);
      // Continuar con la creación del post aunque no se pueda verificar el slug
    }

    console.log('Creating post using direct SQL');
    
    // Generate a CUID-like ID for the post
    const postId = `cuid${Math.floor(Math.random() * 1000000)}`;
    
    // Crear el post usando SQL directo (sin incluir categoryIds todavía)
    const newPost = await prisma.$queryRaw<any[]>`
      INSERT INTO Post (
        id,
        title, 
        slug, 
        content, 
        excerpt, 
        coverImage, 
        status, 
        featured, 
        authorDisplayName, 
        authorId,
        createdAt,
        updatedAt,
        deleted
      ) 
      VALUES (
        ${postId},
        ${title}, 
        ${slug}, 
        ${content}, 
        ${excerpt || null}, 
        ${coverImage || null}, 
        ${status}, 
        ${featured || false}, 
        ${authorDisplayName || null}, 
        ${userId},
        CURRENT_TIMESTAMP(),
        CURRENT_TIMESTAMP(),
        FALSE
      )
    `;
    
    console.log(`✅ Post created successfully with ID: ${postId}`);
    
    // Nueva implementación para una sola categoría
    let categoryData = null;
    
    // Si se proporciona una categoría, tomamos sólo la primera (en caso de que el frontend
    // no se haya actualizado todavía y envíe un array)
    let categoryId = null;
    if (Array.isArray(categories) && categories.length > 0) {
      categoryId = categories[0]; // Tomamos sólo la primera categoría
      console.log(`Usando la primera categoría del array: ${categoryId}`);
    } else if (typeof categories === 'string') {
      categoryId = categories; // Si ya es un string, lo usamos directamente
      console.log(`Usando categoría: ${categoryId}`);
    }
    
    // Si tenemos un ID de categoría, obtener sus detalles
    if (categoryId) {
      try {
        // Actualizar el post con la referencia a la categoría seleccionada
        await prisma.$executeRaw`
          UPDATE Post
          SET categoryId = ${categoryId}
          WHERE id = ${postId}
        `;
        
        // Obtener detalles de la categoría para la respuesta
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
          select: { id: true, name: true, slug: true }
        });
        
        if (category) {
          console.log(`✅ Asignada categoría: ${category.name} (${category.id})`);
          categoryData = category;
        }
      } catch (error) {
        console.error(`❌ Error al asignar categoría ${categoryId}:`, error);
      }
    }
    
    // Obtener el post completo con relaciones
    const postWithRelations = await prisma.$queryRaw<any[]>`
      SELECT p.*, u.name as authorName 
      FROM Post p 
      LEFT JOIN User u ON p.authorId = u.id 
      WHERE p.id = ${postId}
    `;
    
    // La categoría ya se ha obtenido anteriormente en categoryData
    console.log(`✅ Post created with ${categoryData ? 'category: ' + categoryData.name : 'no category'}`);
    
    // Usar la categoría individual en formato compatible con la respuesta anterior
    const finalPost = {
      ...postWithRelations[0],
      categories: categoryData ? [categoryData] : []
    };

    // Registrar la acción administrativa
    await logAdminAction(
      userId,
      'BLOG_CREATE_POST',
      `Post creado: ${finalPost.title} (ID: ${finalPost.id})`
    );

    return NextResponse.json(finalPost, { status: 201 });

  } catch (error: any) {
    console.error("Error creating post:", error);
    // Manejar error de slug duplicado (por si acaso la verificación anterior falla por concurrencia)
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return NextResponse.json({ message: 'Error: El slug ya existe. Elige un título diferente.' }, { status: 409 });
    }
     // Manejar error de usuario no encontrado (P2025)
     if (error.code === 'P2025') {
        console.error("Prisma error P2025 details:", error.meta);
        return NextResponse.json({ message: 'Error: No se encontró un registro relacionado requerido (posiblemente autor, categoría o etiqueta).' }, { status: 400 });
     }
    return NextResponse.json({ message: 'Error interno del servidor al crear el post' }, { status: 500 });
  }
}
