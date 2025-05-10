import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/auth-utils';
import { generateSlug } from '@/lib/utils';
import { logAdminAction } from '@/lib/stats';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// GET: Obtener todas las categorías de proyectos
export async function GET(request: Request) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching project categories:', error);
    return NextResponse.json({ message: 'Error al obtener las categorías de proyectos' }, { status: 500 });
  }
}

// POST: Crear una nueva categoría de proyectos
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  const userRole = session.user?.role as Role | undefined;
  const userId = session.user?.id;

  // Verificar permiso para gestionar taxonomías
  if (!hasPermission(userRole, 'manage_blog_taxonomies')) { // Reutilizamos el permiso de blog
    return NextResponse.json(
      { message: 'No tienes permiso para gestionar categorías de proyectos' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'El nombre es obligatorio y debe ser un texto.' },
        { status: 400 }
      );
    }

    // Generar slug automáticamente
    const slug = generateSlug(name);

    // Verificar si ya existe una categoría con el mismo slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: `Ya existe una categoría con el slug '${slug}'.` },
        { status: 409 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug,
        description: description?.trim() || null,
      },
    });

    // Registrar la acción administrativa
    await logAdminAction(
      userId as string,
      'CREATE_PROJECT_CATEGORY',
      `Categoría de proyecto creada: ${name} (ID: ${newCategory.id})`
    );

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating project category:', error);
    return NextResponse.json(
      { message: 'Error al crear la categoría de proyecto' },
      { status: 500 }
    );
  }
}
