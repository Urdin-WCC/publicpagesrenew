import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGlobalConfig } from "@/lib/config-server";
import { generatePageMetadata, GlobalConfig } from "@/lib/seoUtils";
import RelatedPosts from "@/components/public/RelatedPosts";
import FixedHtmlRenderer from "@/components/public/FixedHtmlRenderer";

interface BlogPostParams {
  slug: string;
}

/**
 * Obtiene un post específico usando una consulta SQL directa
 */
async function getBlogPost(slug: string) {
  try {
    console.log(`Buscando post con slug: ${slug}`);
    
    // Buscar directamente el post con el slug proporcionado
    const result = await prisma.$queryRaw`
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.contentHtml, 
        p.excerpt,
        p.coverImage,
        p.metaTitle, 
        p.metaDescription, 
        p.metaKeywords,
        p.categoryIds,
        p.publishedAt,
        p.status,
        p.showHeader,
        p.showFooter,
        p.showSidebar,
        p.sidebarPosition,
        u.name as authorName
      FROM Post p
      LEFT JOIN User u ON p.authorId = u.id
      WHERE p.slug = ${slug}
      AND p.status = 'PUBLISHED'
      AND p.deleted = false
      LIMIT 1
    `;
    
    if (Array.isArray(result) && result.length > 0) {
      const post = result[0];
      console.log(`Post encontrado: ${post.title}`);
      
      // Convertir categoryIds de string JSON a array
      if (typeof post.categoryIds === 'string') {
        try {
          post.categoryIds = JSON.parse(post.categoryIds);
        } catch (e) {
          console.error('Error parsing categoryIds:', e);
          post.categoryIds = [];
        }
      } else if (!post.categoryIds) {
        post.categoryIds = [];
      }
      
      return post;
    }
    
    console.log(`No se encontró post con slug '${slug}'`);
    return null;
  } catch (error) {
    console.error(`Error al obtener el post '${slug}':`, error);
    return null;
  }
}

/**
 * Obtiene las categorías para un post
 */
async function getCategoriesForPost(categoryIds: number[]) {
  if (!categoryIds || categoryIds.length === 0) return [];
  
  try {
    // Consulta para obtener categorías por IDs
    const categories = await prisma.$queryRaw`
      SELECT id, name, slug
      FROM Category
      WHERE id IN (${categoryIds.join(',')})
      AND isActive = true
    `;
    
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('Error al obtener categorías del post:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: BlogPostParams }): Promise<Metadata> {
  // Asegúrate de que params sea esperado antes de usarlo
  const slug = String(params?.slug || '');
  
  // Obtener el post
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: "Post no encontrado",
      description: "El artículo que estás buscando no existe",
    };
  }
  
  // Obtener configuración global para SEO predeterminada
  const config = await getGlobalConfig() as any as GlobalConfig;
  if (!config) {
    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
    };
  }
  
  // Crear un extracto del contenido HTML si no hay descripción
  let description = post.metaDescription || post.excerpt;
  if (!description && post.contentHtml) {
    // Eliminar etiquetas HTML y obtener primeros 160 caracteres
    description = post.contentHtml
      .replace(/<\/?[^>]+(>|$)/g, "") // Eliminar tags HTML
      .substring(0, 160) // Cortar a 160 caracteres
      .trim();
      
    if (description.length === 160) {
      description += "..."; // Agregar puntos suspensivos si se cortó
    }
  }
  
  // Usar función de utilidad para generar metadatos
  return generatePageMetadata(config, {
    title: post.metaTitle || post.title,
    description: description || config?.globalMetaDescription || undefined,
    url: `/blog/${post.slug}`,
    type: "article",
    image: post.coverImage || undefined,
    // Nota: Estas propiedades no están en el tipo básico, pero podrían agregarse 
    // en futuras versiones o en una extensión personalizada del tipo
  });
}

export default async function BlogPost({ params }: { params: BlogPostParams }) {
  // Asegúrate de que params sea esperado antes de usarlo
  const slug = String(params?.slug || '');
  
  // Obtener el post
  const post = await getBlogPost(slug);
  
  // Si no existe el post, mostrar 404
  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }
  
  // Obtener categorías del post
  const categories = await getCategoriesForPost(post.categoryIds);
  
  // Formato para la fecha de publicación
  const publishedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  // Configuración de visualización de página
  const pageConfig = {
    showHeader: post.showHeader !== undefined ? Boolean(post.showHeader) : true,
    showFooter: post.showFooter !== undefined ? Boolean(post.showFooter) : true,
    showSidebar: post.showSidebar !== undefined ? Boolean(post.showSidebar) : true,
    sidebarPosition: post.sidebarPosition || 'right'
  };
  
  // Almacenar la configuración para que el layout pueda acceder a ella
  const pageConfigScript = `
    <script>
      window.__PAGE_CONFIG__ = ${JSON.stringify(pageConfig)};
    </script>
  `;
  
  return (
    <>
      {/* Insertar script con configuración de página */}
      <div dangerouslySetInnerHTML={{ __html: pageConfigScript }} />
      
      <div className="w-full" style={{ 
        maxWidth: "100%",
        padding: 'var(--spacing-padding, 2rem 1rem)', /* Usar variable de tema para padding */
        height: '100%', /* Asegurar que ocupa toda la altura disponible */
        minHeight: '100%'
      }}>
        {/* Imagen destacada */}
        {post.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden max-h-96 flex justify-center">
            <img
              src={post.coverImage}
              alt={post.title}
              className="object-cover w-full h-full"
              style={{maxHeight: "400px"}}
            />
          </div>
        )}
        
        {/* Título del post */}
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        {/* Metadatos: autor, fecha y categorías */}
        <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-8">
          {post.authorName && (
            <span className="mr-4">Por: {post.authorName}</span>
          )}
          
          {publishedDate && (
            <span className="mr-4">Publicado: {publishedDate}</span>
          )}
          
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span>Categorías:</span>
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/blog/category/${category.slug}`}
                  className="text-primary hover:underline mr-2"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Contenido principal del post */}
        <div className="mb-12">
          <FixedHtmlRenderer 
            content={post.contentHtml || ""}
            className="prose max-w-none"
          />
        </div>
        
        {/* Posts relacionados */}
        <RelatedPosts postId={post.id} categoryIds={post.categoryIds} />
      </div>
    </>
  );
}
