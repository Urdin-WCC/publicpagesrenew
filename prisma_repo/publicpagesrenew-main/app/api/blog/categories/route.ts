import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Importar auth para obtener la sesión
import { hasPermission } from '@/lib/auth-utils'; // Importar helper de permisos
import { generateSlug } from '@/lib/utils';
import { translations } from '@/app/translations';
import { logAdminAction } from '@/lib/stats'; // Importar logAdminAction

export async function GET(request: Request) {
  // const session = await auth();
  // if (!session) {
  //   return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  // }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }, // Ordenar alfabéticamente
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Error al obtener las categorías' }, { status: 500 });
  }
}

// POST - Crear una nueva categoría
export async function POST(request: Request) {
  const session = await auth();

  // Verificar si el usuario está autenticado
  if (!session?.user?.id) { // Comprobar id
    return NextResponse.json({ message: translations.auth.unauthorized }, { status: 401 });
  }
  const userId = session.user.id; // Guardar userId
  const userRole = session.user.role;

  // Verificar permiso (ej. EDITOR+) - Usar permiso específico si existe
  if (!hasPermission(userRole, 'manage_blog_taxonomies')) { // Asumiendo permiso 'manage_blog_taxonomies'
    return NextResponse.json({ message: 'No autorizado para gestionar categorías' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'El nombre es obligatorio y debe ser un texto.' }, { status: 400 });
    }

    // Generar slug automáticamente
    const slug = generateSlug(name);

    // Verificar si ya existe una categoría con el mismo slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });


    if (existingCategory) {
      return NextResponse.json({ message: `Ya existe una categoría con el slug '${slug}'.` }, { status: 409 }); // 409 Conflict
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug,
        description: description?.trim() || null, // Descripción opcional
      },
    });

    // Registrar acción administrativa DESPUÉS de crear
    await logAdminAction(
      userId,
      'BLOG_CREATE_CATEGORY',
      `Categoría creada: ${newCategory.name} (ID: ${newCategory.id})`
    );

    return NextResponse.json(newCategory, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating category:', error);
    // Considerar errores específicos, como fallos de validación de Prisma
    return NextResponse.json({ message: translations.admin.taxonomies.saveError }, { status: 500 });
  }
}