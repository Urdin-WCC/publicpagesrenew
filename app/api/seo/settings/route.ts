import { NextRequest, NextResponse } from 'next/server';
import { updateGlobalConfig } from '@/lib/config-server';
import { getServerSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/stats';

/**
 * PUT /api/seo/settings
 * Updates the SEO settings in GlobalConfig
 * Protected route: Only accessible to users with admin role or higher
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession();
    
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Verify admin access (role check)
    // Assuming 'user.role' is included in the session via JWT or session callback
    const userRole = session.user.role;
    if (!userRole || !['MASTER', 'ADMIN'].includes(userRole)) {
      return new NextResponse(JSON.stringify({ error: "Acceso no autorizado" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get request data
    const data = await request.json();
    
    // Validate required fields
    if (!data.siteName || !data.siteUrl) {
      return new NextResponse(JSON.stringify({ 
        error: "Los campos siteName y siteUrl son obligatorios" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extract SEO fields
    const seoConfigData = {
      siteName: data.siteName,
      siteUrl: data.siteUrl,
      globalMetaTitle: data.globalMetaTitle || null,
      globalMetaDescription: data.globalMetaDescription || null,
      globalKeywords: data.globalKeywords || null,
      defaultSocialShareImage: data.defaultSocialShareImage || null,
      faviconUrl: data.faviconUrl || null,
      robotsTxtContent: data.robotsTxtContent || null,
      googleAnalyticsId: data.googleAnalyticsId || null,
      googleTagManagerId: data.googleTagManagerId || null,
    };
    
    // Update GlobalConfig
    const updatedConfig = await updateGlobalConfig(seoConfigData);
    
    // Log admin action
    await logAdminAction(
      session.user.id || "unknown", 
      "UPDATE_SEO_SETTINGS", 
      `Usuario ${session.user.email} actualizó la configuración SEO global`
    );
    
    // Return success response
    return new NextResponse(JSON.stringify({ 
      success: true,
      message: "Configuración SEO actualizada correctamente",
      data: updatedConfig
    }), {
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error("Error updating SEO settings:", error);
    
    // Return error response
    return new NextResponse(JSON.stringify({ 
      error: "Error actualizando la configuración SEO", 
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
