import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/stats';
import { ThemeConfig } from '@/types/theme';

// GET: Fetch all theme presets (admin only)
export async function GET(req: NextRequest) {
  // Usar try-catch ya que auth() podría fallar
  let session;
  try {
    session = await auth();
  } catch (authError) {
    console.error("Error in auth:", authError);
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
  }

  // Check if user is authenticated and has admin access
  if (!session?.user || !['MASTER', 'ADMIN'].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'No tienes permisos para acceder a esta información' }, { status: 403 });
  }

  try {
    // Use raw query to bypass type checking issues
    const presets = await prisma.$queryRaw`
      SELECT id, name
      FROM ThemePreset
      ORDER BY name ASC
    `;

    return NextResponse.json(presets);
  } catch (error) {
    console.error('Error fetching theme presets:', error);
    return NextResponse.json({ error: 'Error al obtener los temas' }, { status: 500 });
  }
}

// POST: Create a new theme preset (admin only)
export async function POST(req: NextRequest) {
  // Usar try-catch ya que auth() podría fallar
  let session;
  try {
    session = await auth();
  } catch (authError) {
    console.error("Error in auth:", authError);
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
  }

  // Check if user is authenticated and has admin access
  if (!session?.user || !['MASTER', 'ADMIN'].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'No tienes permisos para crear temas' }, { status: 403 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
  }

  try {
    const { name, config } = await req.json();

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'El nombre del tema es obligatorio' }, { status: 400 });
    }

    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'La configuración del tema es obligatoria' }, { status: 400 });
    }

    // Check if a theme with this name already exists
    const existingThemeResult = await prisma.$queryRaw`
      SELECT id, name 
      FROM ThemePreset 
      WHERE name = ${name}
      LIMIT 1
    `;
    
    const existingTheme = Array.isArray(existingThemeResult) && existingThemeResult.length > 0
      ? existingThemeResult[0]
      : null;

    if (existingTheme) {
      return NextResponse.json({ error: 'Ya existe un tema con este nombre' }, { status: 400 });
    }

    // Create the theme preset
    // Note: config field in ThemePreset is a String type (LongText), so we need to stringify the JSON
    // Using prisma.$queryRaw to bypass type checking issues
    const themePreset = await prisma.$queryRaw`
      INSERT INTO ThemePreset (name, config)
      VALUES (${name}, ${JSON.stringify(config)})
      RETURNING id, name
    `;

    // Convert query result to expected format
    const createdTheme = Array.isArray(themePreset) && themePreset.length > 0 
      ? themePreset[0] 
      : { id: 0, name: name };

    // Log the admin action
    await logAdminAction(
      session.user.id,
      'Crear tema',
      `Tema creado: ${name}`
    );

    return NextResponse.json(createdTheme, { status: 201 });
  } catch (error) {
    console.error('Error creating theme preset:', error);
    return NextResponse.json({ error: 'Error al crear el tema' }, { status: 500 });
  }
}
