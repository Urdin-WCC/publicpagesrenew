// Manejador de rutas para la sesión de NextAuth.js v5
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// GET handler para el endpoint /api/auth/session
export async function GET() {
  const session = await auth();
  
  // Devolver la sesión como JSON
  return NextResponse.json({
    user: session?.user || null,
    expires: session?.expires || null
  });
}
