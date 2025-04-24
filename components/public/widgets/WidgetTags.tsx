import { translations } from '@/app/translations';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

interface WidgetTagsProps {
  title?: string;
  config?: {
    showPostCount?: boolean;
    limit?: number;
  };
}

// Función para obtener los tags (no implementada actualmente ya que el sistema de tags fue eliminado)
async function getTags(config: WidgetTagsProps['config'] = {}): Promise<Tag[]> {
  try {
    // Nota: Esta función devuelve un array vacío porque el sistema de tags ha sido eliminado
    console.log("Sistema de tags no implementado");
    return [];
  } catch (error) {
    console.error("Error obteniendo tags:", error);
    return [];
  }
}

export default async function WidgetTags({ 
  title, 
  config = {
    showPostCount: true,
    limit: 10
  } 
}: WidgetTagsProps) {
  // Obtener tags
  const tags = await getTags(config);
  
  // No mostrar el widget si no hay tags
  if (tags.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title || translations.public.tags || 'Etiquetas'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link 
              key={tag.id}
              href={`/blog/tag/${tag.slug}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm inline-flex items-center"
            >
              {tag.name}
              {config.showPostCount && tag.postCount !== undefined && (
                <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {tag.postCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
