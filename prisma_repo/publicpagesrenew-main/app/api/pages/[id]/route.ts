import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/stats";

// A type to help TypeScript recognize our new model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

// GET handler - Fetch a specific page by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = await context;
    
    // Check for auth (only admin or higher can access this)
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error("Error en auth:", authError);
      return NextResponse.json(
        { error: "Error de autenticación" },
        { status: 401 }
      );
    }
    const userRole = session?.user?.role as string | undefined;
    
    if (!session?.user || !userRole || !["ADMIN", "MASTER"].includes(userRole)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Usar SQL directo en lugar de prisma.staticPage que podría no estar disponible
    console.log(`Obteniendo página con ID: ${id}`);
    const pageResult = await prisma.$queryRaw`
      SELECT id, title, slug, contentHtml, 
             showHeader, showFooter, showSidebar, sidebarPosition,
             metaTitle, metaDescription, metaKeywords,
             createdAt, updatedAt
      FROM StaticPage
      WHERE id = ${id}
      LIMIT 1
    `;
    
    const page = Array.isArray(pageResult) && pageResult.length > 0
      ? pageResult[0]
      : null;

    if (!page) {
      return NextResponse.json(
        { error: "Página no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Error al obtener la página" },
      { status: 500 }
    );
  }
}

// PUT handler - Update a specific page
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = await context;
    
    // Check for auth (only admin or higher can access this)
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error("Error en auth:", authError);
      return NextResponse.json(
        { error: "Error de autenticación" },
        { status: 401 }
      );
    }
    const userRole = session?.user?.role as string | undefined;
    
    if (!session?.user || !userRole || !["ADMIN", "MASTER"].includes(userRole)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.slug || !body.contentHtml) {
      return NextResponse.json(
        { error: "Título, slug y contenido son obligatorios" },
        { status: 400 }
      );
    }

    // Usar SQL directo en lugar de prisma.staticPage que podría no estar disponible
    console.log(`Verificando existencia de página con ID: ${id}`);
    const existingPageResult = await prisma.$queryRaw`
      SELECT id, title, slug, contentHtml,
             showHeader, showFooter, showSidebar, sidebarPosition,
             metaTitle, metaDescription, metaKeywords
      FROM StaticPage
      WHERE id = ${id}
      LIMIT 1
    `;
    
    const existingPage = Array.isArray(existingPageResult) && existingPageResult.length > 0
      ? existingPageResult[0]
      : null;

    if (!existingPage) {
      return NextResponse.json(
        { error: "Página no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si el slug ya existe en otra página
    console.log(`Verificando si el slug "${body.slug}" existe en otra página`);
    const slugCheckResult = await prisma.$queryRaw`
      SELECT id
      FROM StaticPage
      WHERE slug = ${body.slug} AND id <> ${id}
      LIMIT 1
    `;
    
    const slugExistsOnAnotherPage = Array.isArray(slugCheckResult) && slugCheckResult.length > 0
      ? slugCheckResult[0]
      : null;

    if (slugExistsOnAnotherPage) {
      return NextResponse.json(
        { error: "Ya existe otra página con este slug" },
        { status: 400 }
      );
    }

    // Actualizar la página con SQL directo
    const showHeader = body.showHeader !== undefined ? body.showHeader : existingPage.showHeader;
    const showFooter = body.showFooter !== undefined ? body.showFooter : existingPage.showFooter;
    const showSidebar = body.showSidebar !== undefined ? body.showSidebar : existingPage.showSidebar;
    const sidebarPosition = body.sidebarPosition || existingPage.sidebarPosition || 'left';
    
    console.log(`Actualizando página con ID: ${id}`);
    await prisma.$queryRaw`
      UPDATE StaticPage
      SET 
        title = ${body.title}, 
        slug = ${body.slug}, 
        contentHtml = ${body.contentHtml},
        showHeader = ${showHeader},
        showFooter = ${showFooter},
        showSidebar = ${showSidebar},
        sidebarPosition = ${sidebarPosition},
        metaTitle = ${body.metaTitle || ''},
        metaDescription = ${body.metaDescription || ''},
        metaKeywords = ${body.metaKeywords || ''},
        updatedAt = CURRENT_TIMESTAMP()
      WHERE id = ${id}
    `;
    
    // Obtener la página actualizada
    const updatedPageResult = await prisma.$queryRaw`
      SELECT id, title, slug, contentHtml,
             showHeader, showFooter, showSidebar, sidebarPosition,
             metaTitle, metaDescription, metaKeywords,
             createdAt, updatedAt
      FROM StaticPage
      WHERE id = ${id}
      LIMIT 1
    `;
    
    const updatedPage = Array.isArray(updatedPageResult) && updatedPageResult.length > 0
      ? updatedPageResult[0]
      : null;
    
    if (!updatedPage) {
      throw new Error("No se pudo obtener la página actualizada");
    }

    // Log admin action
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "UPDATE_PAGE",
        `Página actualizada: ${body.title} (${body.slug})`
      );
    }

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Error al actualizar la página" },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a specific page
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = await context;
    
    // Check for auth (only admin or higher can access this)
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error("Error en auth:", authError);
      return NextResponse.json(
        { error: "Error de autenticación" },
        { status: 401 }
      );
    }
    const userRole = session?.user?.role as string | undefined;
    
    if (!session?.user || !userRole || !["ADMIN", "MASTER"].includes(userRole)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Verificar si la página existe usando SQL directo
    console.log(`Verificando existencia de página con ID: ${id}`);
    const pageResult = await prisma.$queryRaw`
      SELECT id, title, slug
      FROM StaticPage
      WHERE id = ${id}
      LIMIT 1
    `;
    
    const page = Array.isArray(pageResult) && pageResult.length > 0
      ? pageResult[0]
      : null;

    if (!page) {
      return NextResponse.json(
        { error: "Página no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la página usando SQL directo
    console.log(`Eliminando página con ID: ${id}`);
    await prisma.$queryRaw`
      DELETE FROM StaticPage
      WHERE id = ${id}
    `;

    // Log admin action
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "DELETE_PAGE",
        `Página eliminada: ${page.title} (${page.slug})`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Error al eliminar la página" },
      { status: 500 }
    );
  }
}
