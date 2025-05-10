import { translations } from '@/app/translations';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

interface WidgetCategoriesProps {
  title?: string;
  config?: {
    showPostCount?: boolean;
    limit?: number;
    sortBy?: 'name' | 'postCount';
  };
}

async function getCategories(config: WidgetCategoriesProps['config'] = {}): Promise<Category[]> {
  try {
    // Usar SQL crudo para manejar el conteo de posts y problemas de prisma
    const categoriesWithCount = await prisma.$queryRaw`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        COUNT(p.id) as postCount 
      FROM 
        Category c 
      LEFT JOIN 
        Post p ON JSON_CONTAINS(p.categoryIds, JSON_ARRAY(c.id)) 
        AND p.status = 'PUBLISHED'
        AND p.deleted = false
      GROUP BY 
        c.id, c.name, c.slug
      ORDER BY 
        ${config.sortBy === 'postCount' ? 'postCount DESC' : 'c.name ASC'}
      ${config.limit ? `LIMIT ${config.limit}` : ''}
    `;
    
    // Convertir el resultado a la estructura esperada
    return (categoriesWithCount as any[]).map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      _count: { posts: Number(category.postCount) }
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return []; // Devolver array vacío en caso de error
  }
}

export default async function WidgetCategories({ 
  title, 
  config = {
    showPostCount: true,
    limit: 10,
    sortBy: 'name'
  } 
}: WidgetCategoriesProps) {
  const categories = await getCategories(config);
  
  // Si no hay categorías, no mostrar el widget
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="widget p-4 border rounded bg-white shadow-sm mb-4">
      <h3 className="widget-title text-lg font-semibold mb-3">{title || translations.public.categories}</h3>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="flex justify-between items-center">
            <Link 
              href={`/blog/category/${category.slug}`} 
              className="text-primary hover:underline"
            >
              {category.name}
            </Link>
            {config.showPostCount && category._count?.posts !== undefined && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {category._count.posts}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
