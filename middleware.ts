import { NextRequest, NextResponse } from 'next/server';

// Forzar el nombre de la cookie para http://localhost
const sessionCookieName = "authjs.session-token";
// const sessionCookieName = process.env.NEXTAUTH_URL?.startsWith("https://")
//   ? "__Secure-next-auth.session-token"
//   : "next-auth.session-token"; // Lógica original comentada

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas del panel de administración
  if (pathname.startsWith('/admin')) {
    console.log(`[Middleware] Checking for cookie '${sessionCookieName}' on path: ${pathname}`); // Log
    const sessionCookie = request.cookies.get(sessionCookieName);
    console.log(`[Middleware] Cookie found:`, sessionCookie ? 'Yes' : 'No'); // Log

    // Si no hay cookie de sesión, redirigir a login
    if (!sessionCookie) {
      console.log(`[Middleware] No session cookie, redirecting to /login`); // Log
      const loginUrl = new URL('/login', request.url);
      // Opcional: añadir callbackUrl para redirigir de vuelta después del login
      // loginUrl.searchParams.set('callbackUrl', request.nextUrl.href);
      return NextResponse.redirect(loginUrl);
    }

    // Si hay cookie, permitir el acceso. La validación real de la sesión
    // y los roles se hará en las páginas/layouts del servidor o componentes cliente.
    return NextResponse.next();
  }

  // Permitir acceso a otras rutas
  return NextResponse.next();
}

// Aplicar el middleware solo a las rutas especificadas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (página de login)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
     // Incluir explícitamente /admin para asegurar que se procese
     '/admin/:path*',
    ],
    // Ya no necesitamos especificar runtime: 'nodejs' aquí
};