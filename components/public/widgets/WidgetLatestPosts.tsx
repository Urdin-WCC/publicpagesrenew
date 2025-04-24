import { translations } from '@/app/translations';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string; // Assuming posts have slugs for linking
  createdAt: Date;
}

interface WidgetLatestPostsProps {
  title: string;
  config?: {
    count?: number;
  };
}

// Placeholder function to fetch latest posts
async function getLatestPosts(count: number = 5): Promise<Post[]> {
  // TODO: Implement actual data fetching logic using Prisma (likely needs a dedicated API route or server action)
  console.log(`Placeholder: Fetching ${count} latest posts...`);
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
  // Return dummy data for now
  return [
    { id: '1', title: 'Primer Post de Ejemplo', slug: 'primer-post', createdAt: new Date() },
    { id: '2', title: 'Segundo Post Interesante', slug: 'segundo-post', createdAt: new Date(Date.now() - 86400000) }, // Yesterday
  ];
}

export default async function WidgetLatestPosts({ title, config }: WidgetLatestPostsProps) {
  const postCount = config?.count ?? 5;
  const posts = await getLatestPosts(postCount);

  return (
    <div className="widget p-4 border rounded bg-white shadow-sm mb-4">
      <h3 className="widget-title text-lg font-semibold mb-3">{title || translations.public.recentPosts}</h3>
      {posts.length > 0 ? (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="text-primary hover:underline">
                {post.title}
              </Link>
              {/* Optionally display date */}
              {/* <span className="text-xs text-gray-500 block">{post.createdAt.toLocaleDateString()}</span> */}
            </li>
          ))}
        </ul>
      ) : (
        // Usar traducción sin default
        <p className="text-sm text-gray-500">{translations.admin.blogList.noPostsFound}</p>
      )}
    </div>
  );
}
