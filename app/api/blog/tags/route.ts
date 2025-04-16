import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Importar auth
import { hasPermission } from '@/lib/auth-utils'; // Importar helper de permisos
import { generateSlug } from '@/lib/utils';
import { translations } from '@/app/translations';
import { logAdminAction } from '@/lib/stats'; // Importar logAdminAction

export async function GET(request: Request) {
  // const session = await auth();
  // // Podríamos requerir estar autenticado para ver la lista, incluso si es pública en el formulario
  // if (!session) {
  //   return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  // }

  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }, // Ordenar alfabéticamente
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ message: 'Error al obtener las etiquetas' }, { status: 500 });
  }
}

// POST - Crear una nueva etiqueta
export async function POST(request: Request) {
  const session = await auth();

  // Verificar autenticación y permisos (ej. EDITOR+)
  if (!session?.user?.id) {
    return NextResponse.json({ message: translations.auth.unauthorized }, { status: 401 });
  }
  const userId = session.user.id; // Guardar userId
  const userRole = session.user.role;
  if (!hasPermission(userRole, 'manage_blog_taxonomies')) { // Usar permiso específico
    return NextResponse.json({ message: 'No autorizado para gestionar etiquetas' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name } = body; // Las etiquetas suelen tener solo nombre

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'El nombre es obligatorio y debe ser un texto.' }, { status: 400 });
    }

    // Generar slug automáticamente
    const slug = generateSlug(name);

    // Verificar si ya existe una etiqueta con el mismo slug
    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    });


    if (existingTag) {
      return NextResponse.json({ message: `Ya existe una etiqueta con el slug '${slug}'.` }, { status: 409 });
    }

    const newTag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug: slug,
      },
    });

    // Registrar acción administrativa DESPUÉS de crear
    await logAdminAction(
      userId,
      'BLOG_CREATE_TAG',
      `Etiqueta creada: ${newTag.name} (ID: ${newTag.id})`
    );

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ message: translations.admin.taxonomies.saveError }, { status: 500 });
  }
}

// Aquí irían las funciones PUT, DELETE para el CRUD de etiquetas, protegidas por rol EDITOR+