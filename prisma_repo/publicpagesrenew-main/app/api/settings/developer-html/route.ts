import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { getServerSession, getCurrentUserRole } from '@/lib/auth';
import { updateGlobalConfig, getGlobalConfig } from '@/lib/config-server';
import { logAdminAction } from '@/lib/stats';

/**
 * Ruta de API para gestionar el contenido HTML personalizado del desarrollador
 * 
 * SEGURIDAD CRÍTICA: Esta ruta debe estar restringida SOLO a usuarios con rol MASTER
 * debido al riesgo de seguridad de XSS que implica la inyección de HTML arbitrario.
 */

/**
 * Obtiene el contenido HTML personalizado actual
 */
export async function GET() {
  try {
    // 1. Verificar autenticación y rol (debe ser MASTER)
    const userRole = await getCurrentUserRole();
    if (!userRole || userRole !== Role.MASTER) {
      return NextResponse.json({ message: 'No autorizado. Se requiere rol MASTER.' }, { status: 403 });
    }

    // 2. Obtener la configuración global
    const globalConfig = await getGlobalConfig();
    if (!globalConfig) {
      return NextResponse.json({ message: 'No se pudo obtener la configuración global.' }, { status: 500 });
    }

    // 3. Devolver el contenido HTML personalizado (si existe)
    return NextResponse.json({ 
      htmlContent: globalConfig.developerHtmlContent || '' 
    });
  } catch (error) {
    console.error('Error al obtener el contenido HTML personalizado:', error);
    return NextResponse.json({ message: 'Error del servidor.' }, { status: 500 });
  }
}

/**
 * Actualiza el contenido HTML personalizado
 */
export async function PUT(request: NextRequest) {
  try {
    // 1. Verificar autenticación y rol (debe ser MASTER)
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: 'No autenticado.' }, { status: 401 });
    }

    const userRole = await getCurrentUserRole();
    if (userRole !== Role.MASTER) {
      return NextResponse.json({ message: 'No autorizado. Se requiere rol MASTER.' }, { status: 403 });
    }

    // 2. Obtener el contenido HTML del cuerpo de la solicitud
    const body = await request.json();
    const htmlContent = body.htmlContent;

    if (htmlContent === undefined) {
      return NextResponse.json({ message: 'Se requiere el campo htmlContent.' }, { status: 400 });
    }

    // 3. Actualizar la configuración global con el nuevo contenido HTML
    await updateGlobalConfig({
      developerHtmlContent: htmlContent
    });

    // 4. Registrar la acción en el sistema de auditoría
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'update_developer_html',
      details: { 
        contentLength: htmlContent.length,
        // No incluimos el contenido completo para evitar problemas de almacenamiento
        contentPreview: htmlContent.substring(0, 100) + (htmlContent.length > 100 ? '...' : '')
      },
      module: 'HTML_Wrapper_Module'
    });

    // 5. Devolver respuesta de éxito
    return NextResponse.json({ 
      success: true, 
      message: 'Contenido HTML actualizado correctamente.' 
    });
  } catch (error) {
    console.error('Error al actualizar el contenido HTML personalizado:', error);
    return NextResponse.json({ message: 'Error del servidor.' }, { status: 500 });
  }
}
