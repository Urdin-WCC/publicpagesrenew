import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CookieBanner from "@/components/public/CookieBanner";

// A type to help TypeScript recognize our model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

// Type for GlobalConfig with our new fields
interface ExtendedGlobalConfig {
  cookieBannerText?: string;
  cookieBannerLinkPageId?: number | null;
}

async function getCookieBannerSettings() {
  // Get current global config
  const globalConfig = await prisma.globalConfig.findUnique({
    where: { id: "global" },
  });

  // Cast to extended type to access our new fields
  const extendedConfig = globalConfig as unknown as ExtendedGlobalConfig;
  
  if (!extendedConfig?.cookieBannerText || !extendedConfig?.cookieBannerLinkPageId) {
    return {
      cookieBannerText: "",
      privacyPage: null,
    };
  }

  // Get the privacy policy page information
  const prismaExtended = prisma as PrismaWithStaticPage;
  const privacyPage = await prismaExtended.staticPage.findUnique({
    where: { 
      id: extendedConfig.cookieBannerLinkPageId,
      isVisible: true,
    },
    select: {
      title: true,
      slug: true,
    },
  });

  return {
    cookieBannerText: extendedConfig.cookieBannerText,
    privacyPage,
  };
}

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { cookieBannerText, privacyPage } = await getCookieBannerSettings();

  return (
    <>
      {children}
      
      {/* Only render the cookie banner if text is provided */}
      {cookieBannerText && (
        <CookieBanner 
          text={cookieBannerText}
          privacyPolicySlug={privacyPage?.slug}
          privacyPolicyTitle={privacyPage?.title}
        />
      )}
    </>
  );
}
