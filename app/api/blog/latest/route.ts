import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostStatus } from '@prisma/client';

// GET - Obtener los posts más recientes para widgets, etc.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Permitir especificar cuántos posts devolver (con un límite y valor por defecto)
  const limitParam = searchParams.get('limit');
  let limit = 5; // Valor por defecto
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    // Asegurar que el límite sea un número positivo y no excesivo
    if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 20) {
      limit = parsedLimit;
    }
  }

  try {
    const latestPosts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED, // Solo posts publicados
        deleted: false,             // No eliminados lógicamente
      },
      orderBy: {
        publishedAt: 'desc', // Ordenar por fecha de publicación descendente
      },
      take: limit, // Tomar el número especificado de posts
      select: { // Seleccionar solo los campos necesarios para el widget
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        coverImage: true, // Incluir imagen por si el widget la muestra
      },
    });

    return NextResponse.json(latestPosts);
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return NextResponse.json({ message: 'Error al obtener los últimos posts' }, { status: 500 });
  }
}