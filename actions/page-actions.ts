"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/stats";

/**
 * Obtiene una página estática por su slug
 */
export async function getStaticPageBySlug(slug: string) {
  try {
    console.log(`Buscando página con slug: ${slug}`);
    
    // Buscar directamente la página con el slug proporcionado
    const result = await prisma.$queryRaw`
      SELECT 
        id, 
        title, 
        slug, 
        contentHtml, 
        metaTitle, 
        metaDescription, 
        metaKeywords,
        showHeader,
        showFooter,
        showSidebar,
        sidebarPosition
      FROM StaticPage
      WHERE slug = ${slug}
      LIMIT 1
    `;
    
    if (Array.isArray(result) && result.length > 0) {
      const page = result[0];
      console.log(`Página encontrada: ${page.title}`);
      return page;
    }
    
    console.log(`No se encontró página con slug '${slug}'`);
    return null;
  } catch (error) {
    console.error(`Error al obtener la página '${slug}':`, error);
    return null;
  }
}

export interface PageFormData {
  title: string;
  slug: string;
  contentHtml: string;
  showHeader: boolean;
  showFooter: boolean;
  showSidebar: boolean;
  sidebarPosition: "left" | "right";
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

/**
 * Crea una nueva página estática
 */
export async function createPage(data: PageFormData) {
  try {
    // Autenticación
    const session = await auth();
    const userRole = session?.user?.role as string | undefined;
    
    if (!session?.user || !userRole || !["ADMIN", "MASTER"].includes(userRole)) {
      throw new Error("No autorizado");
    }

    // Validar datos requeridos
    if (!data.title || !data.slug || !data.contentHtml) {
      throw new Error("Título, slug y contenido son obligatorios");
    }

    // Verificar si el slug ya existe
    const slugCheckResult = await prisma.$queryRaw`
      SELECT id FROM StaticPage WHERE slug = ${data.slug} LIMIT 1
    `;

    if (Array.isArray(slugCheckResult) && slugCheckResult.length > 0) {
      throw new Error("Ya existe otra página con este slug");
    }

    // Insertar la nueva página
    const result = await prisma.$queryRaw`
      INSERT INTO StaticPage (
        title,
        slug,
        contentHtml,
        showHeader,
        showFooter,
        showSidebar,
        sidebarPosition,
        metaTitle,
        metaDescription,
        metaKeywords,
        createdAt,
        updatedAt
      )
      VALUES (
        ${data.title},
        ${data.slug},
        ${data.contentHtml},
        ${data.showHeader},
        ${data.showFooter},
        ${data.showSidebar},
        ${data.sidebarPosition || 'left'},
        ${data.metaTitle || ''},
        ${data.metaDescription || ''},
        ${data.metaKeywords || ''},
        NOW(),
        NOW()
      )
    `;

    // Obtener el ID de la página insertada
    const newPageResult = await prisma.$queryRaw`
      SELECT id FROM StaticPage WHERE slug = ${data.slug} LIMIT 1
    `;
    
    const pageId = Array.isArray(newPageResult) && newPageResult.length > 0
      ? newPageResult[0].id
      : null;

    // Registrar acción de administrador
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "CREATE_PAGE",
        `Página creada: ${data.title} (${data.slug})`
      );
    }

    // Revalidar el path para actualizar la caché
    revalidatePath('/admin/pages');

    return { success: true, pageId };
  } catch (error: any) {
    console.error("Error al crear la página:", error);
    return { success: false, error: error.message || "Error al crear la página" };
  }
}

/**
 * Actualiza una página estática existente
 */
export async function updatePage(pageId: number, data: PageFormData) {
  try {
    // Autenticación
    const session = await auth();
    const userRole = session?.user?.role as string | undefined;
    
    if (!session?.user || !userRole || !["ADMIN", "MASTER"].includes(userRole)) {
      throw new Error("No autorizado");
    }

    // Validar datos requeridos
    if (!data.title || !data.slug || !data.contentHtml) {
      throw new Error("Título, slug y contenido son obligatorios");
    }

    // Verificar si la página existe
    const pageCheckResult = await prisma.$queryRaw`
      SELECT id, showHeader, showFooter, showSidebar, sidebarPosition 
      FROM StaticPage 
      WHERE id = ${pageId}
      LIMIT 1
    `;

    if (!Array.isArray(pageCheckResult) || pageCheckResult.length === 0) {
      throw new Error("Página no encontrada");
    }

    const existingPage = pageCheckResult[0];

    // Verificar si el slug ya existe en otra página
    const slugCheckResult = await prisma.$queryRaw`
      SELECT id
      FROM StaticPage
      WHERE slug = ${data.slug} AND id <> ${pageId}
      LIMIT 1
    `;
    
    if (Array.isArray(slugCheckResult) && slugCheckResult.length > 0) {
      throw new Error("Ya existe otra página con este slug");
    }

    // Actualizar la página existente
    await prisma.$queryRaw`
      UPDATE StaticPage
      SET 
        title = ${data.title},
        slug = ${data.slug},
        contentHtml = ${data.contentHtml},
        showHeader = ${data.showHeader},
        showFooter = ${data.showFooter},
        showSidebar = ${data.showSidebar},
        sidebarPosition = ${data.sidebarPosition},
        metaTitle = ${data.metaTitle || ''},
        metaDescription = ${data.metaDescription || ''},
        metaKeywords = ${data.metaKeywords || ''},
        updatedAt = NOW()
      WHERE id = ${pageId}
    `;

    // Registrar acción de administrador
    if (session?.user?.id) {
      await logAdminAction(
        session.user.id,
        "UPDATE_PAGE",
        `Página actualizada: ${data.title} (${data.slug})`
      );
    }

    // Revalidar el path para actualizar la caché
    revalidatePath('/admin/pages');
    revalidatePath(`/admin/pages/edit/${pageId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar la página:", error);
    return { success: false, error: error.message || "Error al actualizar la página" };
  }
}
