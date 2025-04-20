import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/stats";

// A type to help TypeScript recognize our new model while type definitions catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

// GET handler - Fetch all static pages or minimal data if requested
export async function GET(request: NextRequest) {
  try {
    // Check for auth (only admin or higher can access this)
    // Usar try-catch ya que auth() podría fallar con el error de headers
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error("Error in auth:", authError);
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

    // Check if minimal flag is set (for dropdown selects)
    const url = new URL(request.url);
    const minimal = url.searchParams.get("minimal") === "true";

    // Usar SQL directo en lugar de confiar en el modelo StaticPage que podría no estar disponible
    console.log("Consultando páginas estáticas con SQL directo");
    
    // Construir la consulta SQL según sea minimal o completa
    let sqlQuery;
    if (minimal) {
      sqlQuery = `
        SELECT id, title, slug
        FROM StaticPage 
        ORDER BY menuOrder ASC
      `;
    } else {
      sqlQuery = `
        SELECT id, title, slug, contentHtml, menuOrder, includeInMenu, isHomePage, isVisible, createdAt, updatedAt
        FROM StaticPage 
        ORDER BY menuOrder ASC
      `;
    }
    
    const pages = await prisma.$queryRawUnsafe(sqlQuery);
    
    console.log(`Obtenidas ${Array.isArray(pages) ? pages.length : 0} páginas estáticas`);

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Error al obtener páginas" },
      { status: 500 }
    );
  }
}

// POST handler - Create a new static page
export async function POST(request: NextRequest) {
  try {
    // Check for auth (only admin or higher can access this)
    // Usar try-catch ya que auth() podría fallar con el error de headers
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error("Error in auth:", authError);
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

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.slug || !body.contentHtml) {
      return NextResponse.json(
        { error: "Título, slug y contenido son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si el slug ya existe utilizando SQL directo
    const existingPageResult = await prisma.$queryRaw`
      SELECT id FROM StaticPage WHERE slug = ${body.slug} LIMIT 1
    `;
    
    const existingPage = Array.isArray(existingPageResult) && existingPageResult.length > 0 
      ? existingPageResult[0] 
      : null;
    if (existingPage) {
      return NextResponse.json(
        { error: "Ya existe una página con este slug" },
        { status: 400 }
      );
    }

    // Obtener el valor máximo actual de menuOrder
    const maxOrderResult = await prisma.$queryRaw`
      SELECT menuOrder FROM StaticPage ORDER BY menuOrder DESC LIMIT 1
    `;
    
    const newOrder = Array.isArray(maxOrderResult) && maxOrderResult.length > 0
      ? maxOrderResult[0].menuOrder + 1
      : 0;
    
    // Crear la página usando SQL directo
    const isVisible = body.isVisible === undefined ? true : body.isVisible;
    const includeInMenu = body.includeInMenu || false;
    
    const newPageResult = await prisma.$queryRaw`
      INSERT INTO StaticPage (
        title, 
        slug, 
        contentHtml, 
        isVisible, 
        includeInMenu, 
        menuOrder,
        isHomePage,
        createdAt,
        updatedAt
      ) 
      VALUES (
        ${body.title},
        ${body.slug},
        ${body.contentHtml},
        ${isVisible},
        ${includeInMenu},
        ${newOrder},
        false,
        CURRENT_TIMESTAMP(),
        CURRENT_TIMESTAMP()
      )
      RETURNING 
        id, title, slug, contentHtml, isVisible, includeInMenu, 
        menuOrder, isHomePage, createdAt, updatedAt
    `;
    
    const page = Array.isArray(newPageResult) && newPageResult.length > 0
      ? newPageResult[0]
      : null;
      
    if (!page) {
      return NextResponse.json(
        { error: "Error al crear la página" },
        { status: 500 }
      );
    }

    // Log admin action
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "CREATE_PAGE",
        `Página creada: ${body.title} (${body.slug})`
      );
    }

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Error al crear página" },
      { status: 500 }
    );
  }
}
