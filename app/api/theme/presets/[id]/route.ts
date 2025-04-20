import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/stats';

// GET: Fetch a single theme preset by ID
export async function GET(req: NextRequest, context: { params: { id: string } }) {
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
    return NextResponse.json({ error: 'No tienes permisos para acceder a esta información' }, { status: 403 });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de tema no válido' }, { status: 400 });
    }

    // Use raw query to bypass type checking issues
    const result = await prisma.$queryRaw`
      SELECT id, name, config
      FROM ThemePreset
      WHERE id = ${id}
    `;

    // Check if a preset was found
    const preset = Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!preset) {
      return NextResponse.json({ error: 'Tema no encontrado' }, { status: 404 });
    }

    // Parse the config from string to JSON object
    let configObj = {};
    try {
      configObj = JSON.parse(preset.config);
    } catch (error) {
      console.error('Error parsing theme config:', error);
    }

    // Return the preset with parsed config
    return NextResponse.json({
      id: preset.id,
      name: preset.name,
      config: configObj
    });
  } catch (error) {
    console.error('Error fetching theme preset:', error);
    return NextResponse.json({ error: 'Error al obtener el tema' }, { status: 500 });
  }
}

// PUT: Update a theme preset by ID
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
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
    return NextResponse.json({ error: 'No tienes permisos para modificar temas' }, { status: 403 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de tema no válido' }, { status: 400 });
    }

    const { name, config } = await req.json();
    const updateData: { name?: string, config?: string } = {};

    // Validate if name is provided and valid
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'El nombre del tema no puede estar vacío' }, { status: 400 });
      }
      updateData.name = name.trim();

      // Check if another preset with this name already exists (excluding current ID)
      const nameCheckResult = await prisma.$queryRaw`
        SELECT id, name FROM ThemePreset
        WHERE name = ${updateData.name} AND id != ${id}
        LIMIT 1
      `;

      if (Array.isArray(nameCheckResult) && nameCheckResult.length > 0) {
        return NextResponse.json({ error: 'Ya existe otro tema con este nombre' }, { status: 400 });
      }
    }

    // Validate if config is provided and valid
    if (config !== undefined) {
      if (typeof config !== 'object') {
        return NextResponse.json({ error: 'La configuración del tema debe ser un objeto válido' }, { status: 400 });
      }
      updateData.config = JSON.stringify(config);
    }

    // Check if the theme exists
    const existingThemeResult = await prisma.$queryRaw`
      SELECT id FROM ThemePreset
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!(Array.isArray(existingThemeResult) && existingThemeResult.length > 0)) {
      return NextResponse.json({ error: 'Tema no encontrado' }, { status: 404 });
    }

    // Update the theme using raw query to bypass type checking issues
    let updateStatement = `UPDATE ThemePreset SET`;
    const updateParams: any[] = [];
    let paramIndex = 1;

    if (updateData.name) {
      updateStatement += ` name = $${paramIndex++},`;
      updateParams.push(updateData.name);
    }

    if (updateData.config) {
      updateStatement += ` config = $${paramIndex++},`;
      updateParams.push(updateData.config);
    }

    // Remove trailing comma
    updateStatement = updateStatement.slice(0, -1);
    updateStatement += ` WHERE id = $${paramIndex} RETURNING id, name, config`;
    updateParams.push(id);

    // Execute update
    const result = await prisma.$queryRawUnsafe(updateStatement, ...updateParams);
    const updatedTheme = Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!updatedTheme) {
      return NextResponse.json({ error: 'Error al actualizar el tema' }, { status: 500 });
    }

    // Log the admin action
    await logAdminAction(
      session.user.id,
      'Actualizar tema',
      `Tema actualizado: ${updatedTheme.name} (ID: ${updatedTheme.id})`
    );

    // Parse the config for the response
    let configObj = {};
    try {
      configObj = JSON.parse(updatedTheme.config);
    } catch (error) {
      console.error('Error parsing updated theme config:', error);
    }

    // Return the updated theme with parsed config
    return NextResponse.json({
      id: updatedTheme.id,
      name: updatedTheme.name,
      config: configObj
    });
  } catch (error) {
    console.error('Error updating theme preset:', error);
    return NextResponse.json({ error: 'Error al actualizar el tema' }, { status: 500 });
  }
}

// DELETE: Delete a theme preset by ID
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
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
    return NextResponse.json({ error: 'No tienes permisos para eliminar temas' }, { status: 403 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de tema no válido' }, { status: 400 });
    }

    // Get the theme to be deleted (for logging)
    const result = await prisma.$queryRaw`
      SELECT id, name
      FROM ThemePreset
      WHERE id = ${id}
    `;

    const themeToDelete = Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!themeToDelete) {
      return NextResponse.json({ error: 'Tema no encontrado' }, { status: 404 });
    }

    // Delete the theme
    await prisma.$queryRaw`
      DELETE FROM ThemePreset
      WHERE id = ${id}
    `;

    // Log the admin action
    await logAdminAction(
      session.user.id,
      'Eliminar tema',
      `Tema eliminado: ${themeToDelete.name} (ID: ${id})`
    );

    return NextResponse.json({ message: 'Tema eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting theme preset:', error);
    return NextResponse.json({ error: 'Error al eliminar el tema' }, { status: 500 });
  }
}
