import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PrivacySettingsForm from "@/components/admin/settings/PrivacySettingsForm";

export const metadata: Metadata = {
  title: "Configuración de Privacidad | Panel de Administración",
  description: "Gestionar configuración del banner de cookies y política de privacidad",
};

// A type to help TypeScript recognize our model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

// Type for GlobalConfig with our new fields
interface ExtendedGlobalConfig {
  cookieBannerText?: string;
  cookieBannerLinkPageId?: number | null;
}

async function getPrivacySettings() {
  // Get current global config
  const globalConfig = await prisma.globalConfig.findUnique({
    where: { id: "global" },
  });

  // Use the extended type to access the staticPage model
  const prismaExtended = prisma as PrismaWithStaticPage;
  
  // Get minimal page data for the dropdown
  const pages = await prismaExtended.staticPage.findMany({
    where: { 
      isVisible: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: { 
      title: "asc",
    },
  });

  // Cast to extended type to access our new fields
  const extendedConfig = globalConfig as unknown as ExtendedGlobalConfig;

  return {
    cookieBannerText: extendedConfig?.cookieBannerText || "",
    cookieBannerLinkPageId: extendedConfig?.cookieBannerLinkPageId || null,
    pages,
  };
}

export default async function PrivacySettingsPage() {
  // Check for auth (only admin or higher can access this)
  const session = await auth();
  const userRole = session?.user?.role as string | undefined;
  
  if (!session?.user || !userRole || !["ADMIN", "MASTER"].includes(userRole)) {
    redirect("/admin");
  }

  const settings = await getPrivacySettings();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración de Privacidad</h1>
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <PrivacySettingsForm 
          initialData={{
            cookieBannerText: settings.cookieBannerText,
            cookieBannerLinkPageId: settings.cookieBannerLinkPageId,
          }} 
          pages={settings.pages}
        />
      </div>
    </div>
  );
}
