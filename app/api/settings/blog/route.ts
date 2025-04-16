import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { logAdminAction } from '@/lib/stats'; // Descomentar cuando esté listo

// Importar la interfaz y valores por defecto desde config-server.ts
import { BlogConfig, defaultBlogConfig } from '@/lib/config-server';

// GET - Obtener la configuración del blog
export async function GET(request: Request) {
  const session = await auth();

  // Solo los admins pueden ver la configuración
  if (!session?.user || !hasPermission(session.user.role, 'manage_settings')) { // Asumiendo permiso 'manage_settings' para ADMIN+
    return NextResponse.json({ message: translations.auth.unauthorized }, { status: 403 });
  }

  try {
    const globalConfig = await prisma.globalConfig.findUnique({
      where: { id: 'global' },
      select: { blogConfig: true },
    });

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
  const session = await auth();

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

    // Obtener configuración actual para merge seguro
     const existingGlobalConfig = await prisma.globalConfig.findUnique({
      where: { id: 'global' },
      select: { blogConfig: true },
    });
     const existingBlogConfig = existingGlobalConfig?.blogConfig as Partial<BlogConfig> || {};

    // Usar upsert para crear el registro 'global' si no existe
    const updatedGlobalConfig = await prisma.globalConfig.upsert({
      where: { id: 'global' },
      update: {
        blogConfig: {
            ...existingBlogConfig, // Mantener otras posibles claves no relacionadas
            ...newConfig, // Sobrescribir con los nuevos valores validados
        },
      },
      create: {
        id: 'global', // Necesario para la creación
        blogConfig: {
            ...defaultBlogConfig, // Empezar con defaults si se crea
            ...newConfig,
        },
        // Asegúrate de incluir otros campos requeridos por GlobalConfig si los hubiera al crear
      },
      select: { blogConfig: true }, // Devolver solo la config actualizada
    });

    // Registrar acción administrativa
    await logAdminAction(
        userId,
        'BLOG_UPDATE_SETTINGS', // Acción más específica
        'Configuración del blog actualizada' // Detalles simples por ahora
    );

    // Devolver la configuración completa actualizada (combinada con defaults)
     const finalConfig = {
      ...defaultBlogConfig,
      ...(updatedGlobalConfig.blogConfig as Partial<BlogConfig> || {}),
    };


    return NextResponse.json(finalConfig);
  } catch (error) {
    console.error('Error updating blog config:', error);
    return NextResponse.json({ message: translations.notifications.saveError }, { status: 500 });
  }
}