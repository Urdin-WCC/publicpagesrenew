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

  // TODO: Implementar lógica de acceso basada en rol si es necesario
  // Por ejemplo, los colaboradores solo ven sus posts, editores+ ven todos.
  // Los no autenticados podrían ver solo los publicados.

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const searchTerm = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';
  const tagSlug = searchParams.get('tag') || '';
  const status = searchParams.get('status') || undefined; // Filtrar por estado (DRAFT, PUBLISHED, ARCHIVED)

  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {
      deleted: false, // No mostrar posts borrados lógicamente
      OR: searchTerm
        ? [
            { title: { contains: searchTerm } },
            { content: { contains: searchTerm } },
          ]
        : undefined,
      categories: categorySlug
        ? { some: { slug: categorySlug } }
        : undefined,
      tags: tagSlug ? { some: { slug: tagSlug } } : undefined,
      status: status ? status : undefined, // Aplicar filtro de estado si se proporciona
    };

    // TODO: Ajustar whereClause según el rol del usuario si es necesario

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: limit,
      include: {
        author: {
          select: { id: true, name: true, email: true }, // Incluir datos del autor
        },
        categories: {
          select: { id: true, name: true, slug: true }, // Incluir categorías
        },
        tags: {
          select: { id: true, name: true, slug: true }, // Incluir etiquetas
        },
      },
    });

    const totalPosts = await prisma.post.count({ where: whereClause });

    // Obtener la configuración del blog
    const blogConfig = await getBlogConfig();

    return NextResponse.json({
      posts,
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
  } // <- Corregir cierre de llave aquí

  try {
    const body = await request.json();
    // Asegurarse de que status sea del tipo PostStatus o undefined y añadir authorDisplayName
    let { title, content, slug, status, categoryIds, tagIds, coverImage, excerpt, featured, authorDisplayName } = body as {
        title: string;
        content: string;
        slug: string;
        status?: PostStatus;
        categoryIds?: string[];
        tagIds?: string[];
        coverImage?: string;
        excerpt?: string;
        featured?: boolean;
        authorDisplayName?: string; // Añadir campo
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

    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        status,
        excerpt,
        coverImage,
        featured: featured || false,
        // @ts-ignore - Prisma schema includes authorDisplayName, but TS type generation might be lagging/cached
        authorDisplayName: authorDisplayName || undefined,
        author: {
          connect: { id: userId }
        },
        categories: categoryIds && categoryIds.length > 0
          ? { connect: categoryIds.map(id => ({ id })) }
          : undefined,
        tags: tagIds && tagIds.length > 0
          ? { connect: tagIds.map(id => ({ id })) }
          : undefined,
      },
       include: { // Incluir datos relacionados en la respuesta
        author: { select: { id: true, name: true } },
        categories: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      }
    });

    // Registrar la acción administrativa ANTES de devolver la respuesta
    await logAdminAction(
      userId,
      'BLOG_CREATE_POST', // Usar prefijo para claridad
      `Post creado: ${newPost.title} (ID: ${newPost.id})`
    );

    return NextResponse.json(newPost, { status: 201 });

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