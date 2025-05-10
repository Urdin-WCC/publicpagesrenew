import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { logAdminAction } from '@/lib/stats';
// import { getUserRole } from '@/lib/auth-utils';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    console.log(`🔍 Obteniendo post con ID: ${id}`);
    
    // 1. Obtener los datos básicos del post usando SQL directo
    const postResult = await prisma.$queryRaw`
      SELECT 
        p.*,
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
        p.id = ${id}
        AND p.deleted = FALSE
    `;
    
    // Verificar si el post fue encontrado
    const post = Array.isArray(postResult) && postResult.length > 0 
      ? postResult[0] 
      : null;
      
    if (!post) {
      console.log(`❌ Post no encontrado: ${id}`);
      return NextResponse.json({ message: 'Post no encontrado' }, { status: 404 });
    }
    
    console.log(`✅ Post encontrado: ${post.title}`);
    
    // 2. Construcción de datos del autor
    const author = post.authorId ? {
      id: post.authorId,
      name: post.authorName,
      email: post.authorEmail
    } : null;
    
    // 3. Construcción de categorías
    type CategoryType = { id: string; name: string; slug: string };
    let categories: CategoryType[] = [];
    
    // Si hay una categoría asociada, agregarla al array
    if (post.categoryId) {
      console.log(`🏷️ Categoría encontrada: ${post.categoryName} (${post.categoryId})`);
      categories = [{
        id: post.categoryId,
        name: post.categoryName,
        slug: post.categorySlug
      }];
    } else {
      console.log(`ℹ️ Post sin categoría`);
    }
    
    // 4. Construir respuesta final
    const response = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      status: post.status,
      featured: post.featured === 1 || post.featured === true, // Convertir a boolean
      authorDisplayName: post.authorDisplayName,
      author: author,
      categories: categories, // Array de categorías (0 o 1)
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };
    
    console.log(`📤 Devolviendo post con ${categories.length} categoría(s)`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return NextResponse.json({ message: 'Error al obtener el post' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Obtener el post existente usando SQL directo
    const postResult = await prisma.$queryRaw`
      SELECT * FROM Post WHERE id = ${id} AND deleted = FALSE
    `;
    
    const postToUpdate = Array.isArray(postResult) && postResult.length > 0 
      ? postResult[0] 
      : null;

    if (!postToUpdate) {
      return NextResponse.json({ message: 'Post no encontrado' }, { status: 404 });
    }

    // Obtener datos del request
    const body = await request.json();
    let { title, content, slug, status, categories, coverImage, excerpt, featured, authorDisplayName } = body;

    // Usar valores existentes si no se proporcionan
    title = title || postToUpdate.title;
    content = content || postToUpdate.content;
    slug = slug || postToUpdate.slug;
    status = status || postToUpdate.status;
    excerpt = excerpt !== undefined ? excerpt : postToUpdate.excerpt;
    coverImage = coverImage !== undefined ? coverImage : postToUpdate.coverImage;
    featured = featured !== undefined ? featured : postToUpdate.featured;
    authorDisplayName = authorDisplayName !== undefined ? authorDisplayName : postToUpdate.authorDisplayName;

    // Verificar si el nuevo slug ya existe
    if (slug !== postToUpdate.slug) {
      const slugCheckResult = await prisma.$queryRaw`
        SELECT id FROM Post WHERE slug = ${slug} AND id != ${id} LIMIT 1
      `;

      if (Array.isArray(slugCheckResult) && slugCheckResult.length > 0) {
        return NextResponse.json({ message: 'El slug ya existe' }, { status: 409 });
      }
    }

    // Definir publishedAt según estado
    let publishedAt = postToUpdate.publishedAt;
    if (status === 'PUBLISHED' && postToUpdate.status !== 'PUBLISHED') {
      publishedAt = new Date();
    } else if (status !== 'PUBLISHED') {
      publishedAt = null;
    }

    // Nueva implementación para categoría única
    
    // Manejar la categoría - tomamos la primera en caso de que sea un array
    let categoryId = null;
    let categoryData = null;
    
    if (Array.isArray(categories) && categories.length > 0) {
      categoryId = categories[0]; // Tomamos sólo la primera categoría
      console.log(`Usando la primera categoría del array: ${categoryId}`);
    } else if (typeof categories === 'string') {
      categoryId = categories; // Si ya es un string, lo usamos directamente
      console.log(`Usando categoría: ${categoryId}`);
    }
    
    // Actualizar datos básicos del post, incluyendo la categoría
    await prisma.$executeRaw`
      UPDATE Post
      SET 
        title = ${title},
        slug = ${slug},
        content = ${content},
        excerpt = ${excerpt},
        coverImage = ${coverImage},
        status = ${status},
        featured = ${featured},
        authorDisplayName = ${authorDisplayName},
        categoryId = ${categoryId}, -- Actualizar con el ID de la categoría
        publishedAt = ${publishedAt},
        updatedAt = CURRENT_TIMESTAMP()
      WHERE id = ${id}
    `;
    
    // Si tenemos un ID de categoría, obtener sus detalles para la respuesta
    if (categoryId) {
      try {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
          select: { id: true, name: true, slug: true }
        });
        
        if (category) {
          console.log(`✅ Asignada categoría: ${category.name} (${category.id})`);
          categoryData = category;
        }
      } catch (error) {
        console.error(`❌ Error al obtener categoría ${categoryId}:`, error);
      }
    }
    
    console.log(`✅ Post updated successfully with categories stored in categoryIds field`);
    
    // Obtener el post actualizado
    const updatedPostResult = await prisma.$queryRaw`
      SELECT p.*, u.name as authorName 
      FROM Post p
      LEFT JOIN User u ON p.authorId = u.id
      WHERE p.id = ${id}
    `;
    
    const updatedPost = Array.isArray(updatedPostResult) && updatedPostResult.length > 0 
      ? updatedPostResult[0] 
      : null;
    
    // Obtener la categoría directamente después de actualizar
    // Si ya tenemos los datos de la categoría, no necesitamos otra consulta
    if (categoryData) {
      console.log(`✅ Usando datos de categoría ya obtenidos: ${categoryData.name}`);
      
      // Añadir la categoría al post antes de devolverlo
      const finalPost = {
        ...updatedPost,
        categories: [categoryData]
      };
      
      // Registrar acción administrativa
      await logAdminAction(
        userId,
        'BLOG_UPDATE_POST',
        `Post actualizado: ${title} (ID: ${id})`
      );

      return NextResponse.json(finalPost);
    }
    
    // Si no tenemos los datos de la categoría pero tenemos un categoryId en el post actualizado
    // obtenemos la categoría
    type CategoryType = { id: string; name: string; slug: string };
    let postCategories: CategoryType[] = [];
    if (updatedPost.categoryId) {
      try {
        const category = await prisma.category.findUnique({
          where: { id: updatedPost.categoryId },
          select: { id: true, name: true, slug: true }
        });
        
        if (category) {
          console.log(`✅ Categoría obtenida para respuesta: ${category.name}`);
          postCategories = [category];
        }
      } catch (error) {
        console.error(`Error fetching category for updated post ${id}:`, error);
        postCategories = [];
      }
    }
    
    // Construir el post final con las categorías
    const finalPost = {
      ...updatedPost,
      categories: postCategories
    };

    // Registrar acción administrativa
    await logAdminAction(
      userId,
      'BLOG_UPDATE_POST',
      `Post actualizado: ${title} (ID: ${id})`
    );

    return NextResponse.json(finalPost);
  } catch (error) {
    console.error(`Error updating post ${id}:`, error);
    return NextResponse.json({ message: 'Error al actualizar el post' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Verificar si el post existe usando SQL directo
    const postResult = await prisma.$queryRaw`
      SELECT * FROM Post WHERE id = ${id} AND deleted = FALSE
    `;
    
    const postToDelete = Array.isArray(postResult) && postResult.length > 0 
      ? postResult[0] 
      : null;

    if (!postToDelete) {
      return NextResponse.json({ message: 'Post no encontrado o ya eliminado' }, { status: 404 });
    }

    // Borrado lógico usando SQL directo
    await prisma.$executeRaw`
      UPDATE Post
      SET deleted = TRUE, status = 'ARCHIVED', updatedAt = CURRENT_TIMESTAMP()
      WHERE id = ${id}
    `;

    // Registrar acción administrativa
    await logAdminAction(
      userId,
      'BLOG_DELETE_POST',
      `Post eliminado (lógicamente): ${postToDelete.title} (ID: ${id})`
    );

    return NextResponse.json({ message: 'Post eliminado correctamente' });
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    return NextResponse.json({ message: 'Error al eliminar el post' }, { status: 500 });
  }
}
