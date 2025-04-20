import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageForm from "@/components/admin/pages/PageForm";

export const metadata: Metadata = {
  title: "Editar Página | Panel de Administración",
  description: "Formulario para editar una página estática existente",
};

// Fetch the page data from the database using raw SQL
async function getPageById(id: number) {
  // Use raw query instead of Prisma model
  try {
    console.log(`Buscando página con ID: ${id}`);
    const result = await prisma.$queryRaw`
      SELECT id, title, slug, contentHtml, isVisible, includeInMenu
      FROM StaticPage
      WHERE id = ${id}
      LIMIT 1
    `;
    
    // Check if we got results
    if (!Array.isArray(result) || result.length === 0) {
      console.log('No se encontró la página');
      return null;
    }
    
    const page = result[0];
    console.log(`Página encontrada: ${page.title}`);
    
    // Obtener asignaciones de temas para esta página
    let lightThemeId = null;
    let darkThemeId = null;
    
    try {
      console.log('Obteniendo configuración global para asignaciones de temas');
      const globalConfigResult = await prisma.$queryRaw`
        SELECT themeAssignments
        FROM GlobalConfig
        WHERE id = 'global'
        LIMIT 1
      `;
      
      if (Array.isArray(globalConfigResult) && globalConfigResult.length > 0) {
        const themeAssignmentsStr = globalConfigResult[0].themeAssignments;
        if (themeAssignmentsStr) {
          const themeAssignments = JSON.parse(themeAssignmentsStr);
          if (themeAssignments.pages && themeAssignments.pages[page.id]) {
            lightThemeId = themeAssignments.pages[page.id].light;
            darkThemeId = themeAssignments.pages[page.id].dark;
            console.log(`Temas encontrados para página: Claro=${lightThemeId}, Oscuro=${darkThemeId}`);
          }
        }
      }
    } catch (themeError) {
      console.error('Error obteniendo asignaciones de temas:', themeError);
    }
    
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      contentHtml: page.contentHtml,
      isVisible: page.isVisible,
      includeInMenu: page.includeInMenu,
      lightThemeId,
      darkThemeId,
    };
  } catch (error) {
    console.error(`Error al buscar la página con ID ${id}:`, error);
    return null;
  }
}

export default async function EditPagePage(props: {
  params: { id: string };
}) {
  // Extract params from props and await them properly
  const { id } = await Promise.resolve(props.params);
  const pageId = parseInt(id);
  
  // Validate that the ID is a number
  if (isNaN(pageId)) {
    notFound();
  }

  // Get the page data
  const pageData = await getPageById(pageId);

  // If page doesn't exist, show 404
  if (!pageData) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Editar Página</h1>
      <PageForm pageId={pageId} initialData={pageData} />
    </div>
  );
}
