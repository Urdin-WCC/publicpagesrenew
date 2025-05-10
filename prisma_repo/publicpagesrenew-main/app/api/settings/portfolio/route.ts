import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { logAdminAction } from '@/lib/stats';

// Importar la interfaz y valores por defecto desde config-server.ts
import { PortfolioConfig, defaultPortfolioConfig } from '@/lib/config-server';



// GET - Obtener la configuración del portfolio
export async function GET(request: Request) {
  const session = await auth();

  // Solo los admins pueden ver la configuración
  if (!session?.user || !hasPermission(session.user.role, 'manage_settings')) { // Asumiendo permiso 'manage_settings' para ADMIN+
    return NextResponse.json({ message: translations.auth.unauthorized }, { status: 403 });
  }

  try {
    // Intentar obtener la configuración global
    let globalConfig = await prisma.globalConfig.findUnique({
      where: { id: 'global' },
    });

    // Si no existe, crear una configuración por defecto
    if (!globalConfig) {
      globalConfig = await prisma.globalConfig.create({
        data: {
          id: 'global',
          siteName: 'Neurowitch',
          siteUrl: 'http://localhost:3000',
          maintenanceMode: false,
          blogConfig: JSON.stringify({
            portfolio: defaultPortfolioConfig
          }),
        },
      });
    }

    // Parsear la configuración guardada como JSON
    let savedConfig = {};
    if (globalConfig?.blogConfig) {
      try {
        // Parsear blogConfig que puede ser string o ya un objeto JSON
        const blogConfig = typeof globalConfig.blogConfig === 'string' 
          ? JSON.parse(globalConfig.blogConfig) 
          : globalConfig.blogConfig;
        
        // Acceder a la propiedad portfolio dentro de blogConfig
        if (blogConfig && blogConfig.portfolio) {
          savedConfig = blogConfig.portfolio;
        }
      } catch (e) {
        console.error('Error parsing portfolio config from blogConfig:', e);
      }
    }

    // Combinar configuración guardada con valores por defecto
    const currentConfig = {
      ...defaultPortfolioConfig,
      ...savedConfig, // Asegurar que es un objeto parcial
    };

    return NextResponse.json(currentConfig);
  } catch (error) {
    console.error('Error fetching portfolio config:', error);
    return NextResponse.json({ message: 'Error al obtener la configuración del portfolio' }, { status: 500 });
  }
}

// PUT - Actualizar la configuración del portfolio
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
    const body = await request.json() as Partial<PortfolioConfig>;

    // Validación básica (se podría usar Zod para algo más robusto)
    const newConfig: Partial<PortfolioConfig> = {};
    if (typeof body.projectsPerPage === 'number' && body.projectsPerPage > 0) newConfig.projectsPerPage = body.projectsPerPage;
    if (body.defaultDisplayType) newConfig.defaultDisplayType = body.defaultDisplayType;
    if (typeof body.showSidebarInList === 'boolean') newConfig.showSidebarInList = body.showSidebarInList;
    if (typeof body.showSidebarInProject === 'boolean') newConfig.showSidebarInProject = body.showSidebarInProject;
    if (body.layoutMode === 'grid' || body.layoutMode === 'list') newConfig.layoutMode = body.layoutMode;

    // Obtener configuración actual para merge seguro
    const existingGlobalConfig = await prisma.globalConfig.findUnique({
      where: { id: 'global' },
    });

    // Parsear la configuración guardada como JSON
    let existingPortfolioConfig = {};
    let existingBlogConfig = {};
    if (existingGlobalConfig?.blogConfig) {
      try {
        // Parsear blogConfig que puede ser string o ya un objeto JSON
        existingBlogConfig = typeof existingGlobalConfig.blogConfig === 'string'
          ? JSON.parse(existingGlobalConfig.blogConfig)
          : existingGlobalConfig.blogConfig;
          
        existingPortfolioConfig = existingBlogConfig.portfolio || {};
      } catch (e) {
        console.error('Error parsing existing portfolio config from blogConfig:', e);
      }
    }

    // Preparar la configuración actualizada
    const mergedConfig = {
      ...existingPortfolioConfig, // Mantener otras posibles claves no relacionadas
      ...newConfig, // Sobrescribir con los nuevos valores validados
    };

    // Preparar la configuración de blog actualizada
    const updatedBlogConfig = {
      ...existingBlogConfig,
      portfolio: mergedConfig
    };

    // Convertir a JSON string
    const blogConfigString = JSON.stringify(updatedBlogConfig);

    // Usar upsert para crear el registro 'global' si no existe
    await prisma.globalConfig.upsert({
      where: { id: 'global' },
      update: {
        blogConfig: blogConfigString,
      },
      create: {
        id: 'global', // Necesario para la creación
        blogConfig: JSON.stringify({
          ...existingBlogConfig,
          portfolio: {
            ...defaultPortfolioConfig, // Empezar con defaults si se crea
            ...newConfig,
          }
        }),
        // Asegúrate de incluir otros campos requeridos por GlobalConfig si los hubiera al crear
        siteName: 'Neurowitch',
        siteUrl: 'http://localhost:3000',
        maintenanceMode: false,
      },
    });

    // Registrar acción administrativa
    await logAdminAction(
        userId,
        'PORTFOLIO_UPDATE_SETTINGS', // Acción más específica
        'Configuración del portfolio actualizada' // Detalles simples por ahora
    );

    // Devolver la configuración completa actualizada
    return NextResponse.json(mergedConfig);
  } catch (error) {
    console.error('Error updating portfolio config:', error);
    return NextResponse.json({ message: translations.notifications.saveError }, { status: 500 });
  }
}
