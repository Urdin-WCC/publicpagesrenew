import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { logAdminAction } from '@/lib/stats'; // Descomentar cuando esté listo

// Importar la interfaz, valores por defecto y función getGlobalConfig desde config-server.ts
import { BlogConfig, defaultBlogConfig, getGlobalConfig } from '@/lib/config-server';

// GET - Obtener la configuración del blog
export async function GET(request: Request) {
  // Usar try-catch para manejar errores de autenticación
  let session;
  try {
    session = await auth();
  } catch (authError) {
    console.error("Error en auth:", authError);
    return NextResponse.json({ message: "Error de autenticación" }, { status: 401 });
  }

  // Solo los admins pueden ver la configuración
  if (!session?.user || !hasPermission(session.user.role, 'manage_settings')) { // Asumiendo permiso 'manage_settings' para ADMIN+
    return NextResponse.json({ message: translations.auth.unauthorized }, { status: 403 });
  }

  try {
    // Usar getGlobalConfig() corregido de config-server.ts para evitar el problema de activeThemeId
    const globalConfig = await getGlobalConfig();

    // Combinar configuración guardada con valores por defecto
    const currentConfig = {
      ...defaultBlogConfig,
      ...(globalConfig?.blogConfig as Partial<BlogConfig> || {}), // Asegurar que es un objeto parcial
    };

    return NextResponse.json(currentConfig);
  } catch (error) {
    console.error('Error fetching blog config:', error);
    return NextResponse.json({ message: 'Error al obtener la configuración del blog' }, { status: 500 });
  }
}

// PUT - Actualizar la configuración del blog
export async function PUT(request: Request) {
  // Usar try-catch para manejar errores de autenticación
  let session;
  try {
    session = await auth();
  } catch (authError) {
    console.error("Error en auth:", authError);
    return NextResponse.json({ message: "Error de autenticación" }, { status: 401 });
  }

  // Solo los admins pueden guardar la configuración
  if (!session?.user?.id) { // Verificar id
    return NextResponse.json({ message: translations.auth.unauthorized }, { status: 401 });
  }
  const userId = session.user.id; // Guardar userId
  if (!hasPermission(session.user.role, 'manage_settings')) {
    return NextResponse.json({ message: 'No autorizado para gestionar la configuración' }, { status: 403 });
  }

  try {
    const body = await request.json() as Partial<BlogConfig>;

    // Validación básica (se podría usar Zod para algo más robusto)
    const newConfig: Partial<BlogConfig> = {};
    if (typeof body.postsPerPage === 'number' && body.postsPerPage > 0) newConfig.postsPerPage = body.postsPerPage;
    if (typeof body.allowComments === 'boolean') newConfig.allowComments = body.allowComments;
    if (typeof body.showAuthorName === 'boolean') newConfig.showAuthorName = body.showAuthorName;
    if (typeof body.showPublishDate === 'boolean') newConfig.showPublishDate = body.showPublishDate;
    if (typeof body.relatedPostsEnabled === 'boolean') newConfig.relatedPostsEnabled = body.relatedPostsEnabled;
    if (typeof body.relatedPostsCount === 'number' && body.relatedPostsCount >= 0) newConfig.relatedPostsCount = body.relatedPostsCount;

    // Validación para las nuevas opciones
    if (body.listDisplayMode === 'grid' || body.listDisplayMode === 'list') newConfig.listDisplayMode = body.listDisplayMode;
    if (typeof body.showSidebarInList === 'boolean') newConfig.showSidebarInList = body.showSidebarInList;
    if (typeof body.showSidebarInPost === 'boolean') newConfig.showSidebarInPost = body.showSidebarInPost;

    // Obtener configuración actual para merge seguro usando SQL directo para evitar problemas con campos inexistentes
    const result = await prisma.$queryRaw`
      SELECT blogConfig FROM GlobalConfig WHERE id = 'global' LIMIT 1
    `;

    // Verificar si se encontró la configuración global
    const existingBlogConfig = result && Array.isArray(result) && result.length > 0 
      ? (result[0].blogConfig as Partial<BlogConfig>) || {} 
      : {};

    // Preparar la nueva configuración del blog combinando las existentes con las nuevas
    const mergedBlogConfig = JSON.stringify({
      ...existingBlogConfig,
      ...newConfig,
    });

    // Verificar si existe el registro global
    const globalExists = await prisma.$queryRaw`
      SELECT 1 FROM GlobalConfig WHERE id = 'global' LIMIT 1
    `;

    // Actualizar o insertar la configuración global según corresponda
    let updatedGlobalConfig;
    
    if (globalExists && Array.isArray(globalExists) && globalExists.length > 0) {
      // Actualizar la configuración existente
      await prisma.$executeRaw`
        UPDATE GlobalConfig 
        SET blogConfig = ${mergedBlogConfig} 
        WHERE id = 'global'
      `;
    } else {
      // Crear una nueva configuración con los campos requeridos y defaults
      const defaultLoadingSpinnerConfig = JSON.stringify({});
      const defaultThemeSwitcherConfig = JSON.stringify({});
      const defaultStickyElementsConfig = JSON.stringify({});
      const defaultThemeAssignments = JSON.stringify({});
      
      await prisma.$executeRaw`
        INSERT INTO GlobalConfig (
          id, siteName, siteUrl, blogConfig, 
          maintenanceMode, themeAssignments, loadingSpinnerConfig, 
          themeSwitcherConfig, stickyElementsConfig,
          createdAt, updatedAt
        ) VALUES (
          'global', 'Neurowitch', 'http://localhost:3000', ${mergedBlogConfig},
          0, ${defaultThemeAssignments}, ${defaultLoadingSpinnerConfig},
          ${defaultThemeSwitcherConfig}, ${defaultStickyElementsConfig},
          NOW(), NOW()
        )
      `;
    }

    // Recuperar la configuración actualizada
    const updatedResult = await prisma.$queryRaw`
      SELECT blogConfig FROM GlobalConfig WHERE id = 'global' LIMIT 1
    `;

    const updatedBlogConfig = updatedResult && Array.isArray(updatedResult) && updatedResult.length > 0
      ? updatedResult[0]
      : { blogConfig: mergedBlogConfig };

    // Registrar acción administrativa
    await logAdminAction(
        userId,
        'BLOG_UPDATE_SETTINGS', // Acción más específica
        'Configuración del blog actualizada' // Detalles simples por ahora
    );

    // Devolver la configuración completa actualizada (combinada con defaults)
     const finalConfig = {
      ...defaultBlogConfig,
      ...(typeof updatedBlogConfig.blogConfig === 'string' 
          ? JSON.parse(updatedBlogConfig.blogConfig) 
          : updatedBlogConfig.blogConfig || {}),
    };


    return NextResponse.json(finalConfig);
  } catch (error) {
    console.error('Error updating blog config:', error);
    return NextResponse.json({ message: translations.notifications.saveError }, { status: 500 });
  }
}
