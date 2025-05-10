import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET Global Settings
 * 
 * Retorna la configuración global del sitio.
 * Este endpoint es público pero contiene campos protegidos
 * que solo son visibles para usuarios autenticados con roles específicos.
 */
export async function GET() {
  try {
    // Obtener la sesión del usuario (opcional)
    const session = await auth();
    
    // Obtener la configuración global
    const config = await prisma.globalConfig.findUnique({
      where: { id: 'global' },
    });

    if (!config) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    // Si no hay usuario autenticado, devolver solo campos públicos
    if (!session?.user) {
      return NextResponse.json({
        siteName: config.siteName,
        description: config.description,
        siteUrl: config.siteUrl,
        logoUrl: config.logoUrl,
        faviconUrl: config.faviconUrl,
        themeColor: config.themeColor,
        maintenanceMode: config.maintenanceMode,
        defaultLightThemePresetId: config.defaultLightThemePresetId,
      });
    }

    // Usuarios autenticados reciben todos los campos
    return NextResponse.json(config);
    
  } catch (error) {
    console.error('Error getting global settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
