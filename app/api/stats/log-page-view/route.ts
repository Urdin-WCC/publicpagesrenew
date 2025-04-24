import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { anonymizeIp, getClientIp } from '@/lib/stats';

/**
 * API para registrar visitas a páginas
 * 
 * Este endpoint acepta peticiones POST con datos de una visita a página y los almacena en la base de datos.
 * No requiere autenticación ya que es llamado desde la parte pública del sitio.
 * 
 * @param request Objeto Request de NextJS con los datos de la petición
 */
export async function POST(request: Request) {
  try {
    // Extraer JSON del body
    const body = await request.json();
    
    // Validar que exista url como mínimo
    if (!body || !body.url) {
      console.error('Missing required page view data');
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    const url = body.url;
    const referrer = body.referrer || null;
    
    // Extraer User-Agent del encabezado
    const userAgent = request.headers.get('user-agent') || null;
    
    // Extraer y anonimizar IP del cliente
    const clientIp = getClientIp(request);
    const anonymizedIp = anonymizeIp(clientIp);
    
    // Guardar en base de datos usando $queryRaw para evitar problemas con Prisma
    try {
      // Primero intentamos con INSERT directo
      await prisma.$queryRaw`
        INSERT INTO PageView (url, referrer, ipAddress, userAgent, timestamp)
        VALUES (${url}, ${referrer || null}, ${anonymizedIp || null}, ${userAgent}, NOW())
      `;
    } catch (dbError) {
      console.warn('Error usando INSERT directo, intentando con create:', dbError);
      
      // Si falla, intentamos con la API de Prisma
      await prisma.pageView.create({
        data: {
          url: url,
          referrer: referrer || undefined,
          ipAddress: anonymizedIp || undefined,
          userAgent: userAgent || undefined,
          timestamp: new Date()
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Registrar error pero no interrumpir la experiencia del usuario
    console.error('Error saving page view:', error);
    
    // Devolver error 400 para que sea visible en la consola de desarrollo
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// Endpoint GET para pruebas - solo en desarrollo
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }
  
  try {
    const count = await prisma.pageView.count();
    return NextResponse.json({ message: 'Page view API is working', count });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
