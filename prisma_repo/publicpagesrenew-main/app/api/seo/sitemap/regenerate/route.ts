import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/stats';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/seo/sitemap/regenerate
 * Regenerates the sitemap.xml file by revalidating the path
 * Protected route: Only accessible to users with admin role or higher
 */
export async function POST(request: NextRequest) {
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
    const userRole = session.user.role;
    if (!userRole || !['MASTER', 'ADMIN'].includes(userRole)) {
      return new NextResponse(JSON.stringify({ error: "Acceso no autorizado" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Revalidate the sitemap path to force Next.js to regenerate it
    revalidatePath('/sitemap.xml');
    
    // Log admin action
    await logAdminAction(
      session.user.id || "unknown", 
      "REGENERATE_SITEMAP", 
      `Usuario ${session.user.email} regeneró el sitemap.xml`
    );
    
    // Return success response
    return new NextResponse(JSON.stringify({ 
      success: true,
      message: "Sitemap regenerado correctamente"
    }), {
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error("Error regenerating sitemap:", error);
    
    // Return error response
    return new NextResponse(JSON.stringify({ 
      error: "Error regenerando el sitemap", 
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
