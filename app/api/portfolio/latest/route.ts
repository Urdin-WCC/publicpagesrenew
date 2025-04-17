import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Obtener los proyectos más recientes (para widgets)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '5', 10);
  const onlyFeatured = searchParams.get('featured') === 'true';

  try {    // Construir la consulta SQL para obtener los proyectos más recientes
    let sqlQuery = `
      SELECT p.id, p.title, p.slug, p.excerpt, p.coverImage, 
             p.publishedAt, p.featured
      FROM Project p
      WHERE p.status = ?
      AND p.deleted = FALSE
    `;

    // Get status from query parameters, default to 'PUBLISHED'
    const status = searchParams.get('status') || 'PUBLISHED';
    
    const queryParams = [status]; // Add status as first parameter

    // Filtrar por destacados si se solicita
    if (onlyFeatured) {
      sqlQuery += ` AND p.featured = TRUE`;
    }

    // Añadir ordenamiento y límite
    sqlQuery += ` ORDER BY p.publishedAt DESC LIMIT ?`;
    queryParams.push(limit.toString()); // Convert limit to string for queryRawUnsafe

    // Ejecutar la consulta
    const projects = await prisma.$queryRawUnsafe(sqlQuery, ...queryParams);

    // Para cada proyecto, obtener sus categorías
    for (const project of projects as any[]) {
      try {
        const categoriesResult = await prisma.$queryRaw`
          SELECT c.id, c.name, c.slug
          FROM Category c
          LEFT JOIN _CategoryToProject cp ON c.id = cp.A
          WHERE cp.B = ${project.id}
        `;
        
        project.categories = Array.isArray(categoriesResult) ? categoriesResult : [];
      } catch (error) {
        console.error("Error fetching categories for project:", project.id, error);
        project.categories = [];
      }
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching latest projects:', error);
    return NextResponse.json({ message: 'Error al obtener los proyectos recientes' }, { status: 500 });
  }
}
