import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server"; // Importar NextRequest
import { applyRateLimit, getMaxAttempts, getWindowMs } from "@/lib/rate-limit";

/**
 * Next-Auth API route handler with rate limiting
 *
 * This handler applies rate limiting to credential sign-in attempts to prevent brute force attacks.
 * The rate limit is configurable through environment variables:
 * - RATE_LIMIT_MAX_ATTEMPTS: Maximum number of login attempts allowed in the time window (default: 5)
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 60000 - 1 minute)
 */

// Export the GET handler directly from auth.ts
export const GET = handlers.GET;

/**
 * Custom POST handler with rate limiting
 *
 * This handler wraps the original POST handler from auth.ts with rate limiting
 * for credential sign-in attempts.
 */
export async function POST(req: NextRequest, { params }: { params: { nextauth: string[] } }) { // Cambiar tipo de req a NextRequest
  // Only apply rate limiting to credential sign-in attempts
  // Verificar la ruta específica del callback de credenciales usando pathname
  if (req.nextUrl.pathname === "/api/auth/callback/credentials") {
    // Apply rate limiting with values from environment variables
    const { limited, remaining } = applyRateLimit(req);

    if (limited) {
      return NextResponse.json(
        {
          error: "Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo después de " +
                 Math.ceil(getWindowMs() / 60000) + " minutos.",
          status: 429
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(getWindowMs() / 1000).toString(),
            "X-RateLimit-Limit": getMaxAttempts().toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(Date.now() / 1000 + getWindowMs() / 1000).toString()
          }
        }
      );
    }

    // Add rate limit headers
    // handlers.POST ahora solo espera req en NextAuth v5
    const originalResponse = await handlers.POST(req);

    // Crear una nueva respuesta basada en la original para poder modificar cabeceras
    // Es necesario clonar o crear una nueva respuesta si queremos modificarla
    const response = new Response(originalResponse.body, {
      status: originalResponse.status,
      headers: originalResponse.headers,
    });

    // Añadir nuestras cabeceras de rate limit
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  // For all other auth routes, proceed normally
  // Pasar el objeto { params } también aquí
  // handlers.POST ahora solo espera req
  return handlers.POST(req);
}
