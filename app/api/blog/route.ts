import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Asegurar que se importa la instancia correcta
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
    // Preparar la cláusula where básica
    const whereClause: any = {
      deleted: false, // No mostrar posts borrados lógicamente
      OR: searchTerm
        ? [
            { title: { contains: searchTerm } },
            { content: { contains: searchTerm } },
          ]
        : undefined,
      status: status ? status : undefined, // Aplicar filtro de estado si se proporciona
    };

    // TODO: Ajustar whereClause según el rol del usuario si es necesario

    // Obtener los posts básicos primero
    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: limit,
      include: {
        author: {
          select: { id: true, name: true, email: true }, // Incluir datos del autor
        },
      },
    });

    // Contar el total para la paginación
    const totalPosts = await prisma.post.count({ where: whereClause });
    
    // Si se busca por categoría, debemos filtrar los posts después de obtenerlos
    let filteredPosts = [...posts];
    
    if (categorySlug) {
      // Obtener el ID de la categoría por su slug
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true }
      });
      
      if (category) {
        // Filtrar los posts que contienen this categoría por ID
        filteredPosts = posts.filter(post => {
          try {
            // @ts-ignore - El campo categoryIds existe en la base de datos
            const categoryIds: string[] = post.categoryIds ? JSON.parse(post.categoryIds as string) : [];
            return categoryIds.includes(category.id);
          } catch {
            return false;
          }
        });
      } else {
        // Si no se encuentra la categoría, no hay posts para mostrar
        filteredPosts = [];
      }
    }
    
    // Obtener las categorías para cada post
    type CategoryType = { id: string; name: string; slug: string };
    
    const enhancedPosts = await Promise.all(filteredPosts.map(async (post) => {
      try {
        // Parsear categoryIds si existe
        // @ts-ignore - El campo categoryIds existe en la base de datos
        const categoryIds: string[] = post.categoryIds ? JSON.parse(post.categoryIds as string) : [];
        
        // Obtener detalles de categorías
        let categories: CategoryType[] = [];
        if (categoryIds.length > 0) {
          categories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true, slug: true }
          });
        }
        
        // Añadir categorías al post
        return {
          ...post,
          categories
        };
      } catch (error) {
        console.error(`Error parsing categories for post ${post.id}:`, error);
        return {
          ...post,
          categories: []
        };
      }
    }));
    
    // Obtener la configuración del blog
    const blogConfig = await getBlogConfig();

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
    let { title, content, slug, status, categoryIds, coverImage, excerpt, featured, authorDisplayName } = body as {
        title: string;
        content: string;
        slug: string;
        status?: PostStatus;
        categoryIds?: string[];
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

    // Verificar si el slug ya existe (opcional, la BD ya lo hace pero esto da mejor feedback)
    const existingSlug = await prisma.post.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ message: 'El slug ya existe. Elige un título diferente o modifica el slug.' }, { status: 409 });
    }

    // Preparar datos para la creación
    const postData: any = {
      title,
      slug,
      content,
      status,
      excerpt,
      coverImage,
      featured: featured || false,
      authorDisplayName: authorDisplayName || undefined,
      author: {
        connect: { id: userId }
      }
    };
    
    // Si hay categorías, convertirlas a JSON
    if (categoryIds && categoryIds.length > 0) {
      postData.categoryIds = JSON.stringify(categoryIds.filter(Boolean));
    }

    // Crear el post
    const newPost = await prisma.post.create({
      data: postData,
      include: { 
        author: { select: { id: true, name: true } }
      }
    });
    
    // Obtener categorías para el nuevo post
    type CategoryType = { id: string; name: string; slug: string };
    let categories: CategoryType[] = [];
    
    try {
      if (categoryIds && categoryIds.length > 0) {
        // Consultar las categorías por sus IDs
        categories = await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, slug: true }
        });
      }
    } catch (error) {
      console.error(`Error fetching categories for new post ${newPost.id}:`, error);
      categories = [];
    }
    
    // Añadir las categorías al post antes de devolverlo
    const postWithCategories = {
      ...newPost,
      categories,
    };

    // Registrar la acción administrativa ANTES de devolver la respuesta
    await logAdminAction(
      userId,
      'BLOG_CREATE_POST', // Usar prefijo para claridad
      `Post creado: ${newPost.title} (ID: ${newPost.id})`
    );

    return NextResponse.json(postWithCategories, { status: 201 });

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
