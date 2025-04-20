import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

// A type to help TypeScript recognize our model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

interface PageParams {
  slug: string;
}

// Generate static params for all visible pages (for static site generation)
export async function generateStaticParams(): Promise<PageParams[]> {
  const prismaExtended = prisma as PrismaWithStaticPage;
  const pages = await prismaExtended.staticPage.findMany({
    where: {
      isVisible: true,
    },
    select: {
      slug: true,
    },
  });

  return pages.map((page) => ({
    slug: page.slug,
  }));
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = params;
  const prismaExtended = prisma as PrismaWithStaticPage;
  
  const page = await prismaExtended.staticPage.findUnique({
    where: { slug },
  });

  if (!page || !page.isVisible) {
    return {
      title: "Página no encontrada",
    };
  }

  return {
    title: page.title,
  };
}

export default async function StaticPage({ params }: { params: PageParams }) {
  const { slug } = params;
  const prismaExtended = prisma as PrismaWithStaticPage;
  
  // Get the page data from Prisma
  const page = await prismaExtended.staticPage.findUnique({
    where: { slug },
  });

  // If page not found or not visible, show 404
  if (!page || !page.isVisible) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: page.contentHtml }}
      />
    </div>
  );
}
