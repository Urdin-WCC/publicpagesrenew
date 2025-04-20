import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/stats';

// POST: Duplicate a theme preset by ID
export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
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
    return NextResponse.json({ error: 'No tienes permisos para duplicar temas' }, { status: 403 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
  }

  try {
    // Convert the ID to a number (ThemePreset uses Int id)
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de tema no válido' }, { status: 400 });
    }

    // Find the original theme preset using raw SQL query
    const result = await prisma.$queryRaw`
      SELECT id, name, config
      FROM ThemePreset
      WHERE id = ${id}
    `;

    const originalTheme = Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!originalTheme) {
      return NextResponse.json({ error: 'Tema no encontrado' }, { status: 404 });
    }

    // Create a duplicate name
    const newName = `Copia de ${originalTheme.name}`;
    
    // Check if a theme with this name already exists
    const existingThemeResult = await prisma.$queryRaw`
      SELECT id, name
      FROM ThemePreset
      WHERE name = ${newName}
      LIMIT 1
    `;

    const existingTheme = Array.isArray(existingThemeResult) && existingThemeResult.length > 0
      ? existingThemeResult[0] 
      : null;

    // If a theme with this name already exists, append a number
    let finalName = newName;
    if (existingTheme) {
      let counter = 1;
      let nameExists = true;
      
      while (nameExists) {
        const nameWithCounter = `${newName} (${counter})`;
        
        const checkThemeResult = await prisma.$queryRaw`
          SELECT id, name
          FROM ThemePreset
          WHERE name = ${nameWithCounter}
          LIMIT 1
        `;
        
        const checkTheme = Array.isArray(checkThemeResult) && checkThemeResult.length > 0
          ? checkThemeResult[0]
          : null;
        
        if (!checkTheme) {
          finalName = nameWithCounter;
          nameExists = false;
        } else {
          counter++;
        }
      }
    }

    // Create a new theme preset with the same config as the original
    const insertResult = await prisma.$queryRaw`
      INSERT INTO ThemePreset (name, config)
      VALUES (${finalName}, ${originalTheme.config})
      RETURNING id, name
    `;

    const newTheme = Array.isArray(insertResult) && insertResult.length > 0
      ? insertResult[0]
      : { id: 0, name: finalName };

    // Log the admin action
    await logAdminAction(
      session.user.id,
      'Duplicar tema',
      `Tema duplicado: ${originalTheme.name} -> ${newTheme.name}`
    );

    return NextResponse.json(newTheme, { status: 201 });
  } catch (error) {
    console.error('Error duplicating theme preset:', error);
    return NextResponse.json({ error: 'Error al duplicar el tema' }, { status: 500 });
  }
}
