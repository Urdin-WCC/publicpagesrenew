import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

// A type to help TypeScript recognize our model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

export async function generateMetadata(): Promise<Metadata> {
  // Get the homepage
  const prismaExtended = prisma as PrismaWithStaticPage;
  const homepage = await prismaExtended.staticPage.findFirst({
    where: {
      isHomePage: true,
    },
  });

  return {
    title: homepage?.title || "Página Principal",
    description: "Bienvenido a nuestro sitio web",
  };
}

export default async function HomePage() {
  // Get the homepage
  const prismaExtended = prisma as PrismaWithStaticPage;
  const homepage = await prismaExtended.staticPage.findFirst({
    where: {
      isHomePage: true,
    },
  });

  // If no homepage is set, show 404
  if (!homepage || !homepage.isVisible) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{homepage.title}</h1>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: homepage.contentHtml }}
      />
    </div>
  );
}
