import { ReactNode, Suspense } from "react";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ThemeSwitcher from "@/components/public/ThemeSwitcher";
import LoadingSpinner from "@/components/core/LoadingSpinner";
import { translations } from "@/app/translations";
import MaintenanceMode from "@/components/public/MaintenanceMode";
import { getGlobalConfig, getSectionWithItems } from "@/lib/config";
import { SectionType } from "@prisma/client";
import { getThemeConfigsForRoute, generateCssFromThemeConfigs } from "@/lib/themeUtils";
import { headers } from "next/headers";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Get current pathname from headers
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '/';

  // Fetch required data
  const [globalConfig, headerSection, footerSection] = await Promise.all([
    getGlobalConfig(),
    getSectionWithItems(SectionType.HEADER),
    getSectionWithItems(SectionType.FOOTER)
  ]);

  // Determine theme configs based on route/context
  const { lightConfig, darkConfig } = await getThemeConfigsForRoute(pathname, globalConfig);
  
  // Generate CSS from theme configs
  const themeCss = generateCssFromThemeConfigs(lightConfig, darkConfig);
  
  // Get site configuration
  const siteName = globalConfig?.siteName ?? translations.common.appName;
  
  // Parse JSON configuration fields
  const loadingSpinnerConfig = typeof globalConfig?.loadingSpinnerConfig === 'string'
    ? JSON.parse(globalConfig?.loadingSpinnerConfig || '{}')
    : globalConfig?.loadingSpinnerConfig || { enabled: false };
    
  const themeSwitcherConfig = typeof globalConfig?.themeSwitcherConfig === 'string'
    ? JSON.parse(globalConfig?.themeSwitcherConfig || '{}')
    : globalConfig?.themeSwitcherConfig || { enabled: true, position: 'bottom-right' };
    
  const stickyElementsConfig = typeof globalConfig?.stickyElementsConfig === 'string'
    ? JSON.parse(globalConfig?.stickyElementsConfig || '{}')
    : globalConfig?.stickyElementsConfig || { header: false, footer: false, sidebar: false, themeSwitcher: false };

  // Check for maintenance mode
  if (globalConfig?.maintenanceMode) {
    return <MaintenanceMode />;
  }

  // Determine CSS classes for sticky elements
  const headerClasses = `${stickyElementsConfig.header ? 'sticky top-0 z-50' : ''}`;
  const footerClasses = `${stickyElementsConfig.footer ? 'sticky bottom-0 z-40' : ''}`;
  const themeSwitcherClasses = `${stickyElementsConfig.themeSwitcher ? 'fixed' : 'absolute'} ${themeSwitcherConfig.position || 'bottom-right'}`;

  // Return the layout
  return (
    <>
      <head>
         <style id="dynamic-theme-styles" dangerouslySetInnerHTML={{ __html: themeCss }} />
         <title>{siteName}</title>
         <meta name="description" content={`Sitio web ${siteName}`} />
      </head>
      <div className="flex flex-col min-h-screen">
        {loadingSpinnerConfig.enabled && 
          <LoadingSpinner overlayColor={loadingSpinnerConfig.overlayColor} />
        }
        <Header
          menuItems={(headerSection?.menuItems ?? []).map(item => ({ label: item.label, url: item.url }))}
          siteName={siteName}
          className={headerClasses}
        />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </main>
        <Footer 
          text={`© ${new Date().getFullYear()} ${siteName}. Todos los derechos reservados.`} 
          widgets={footerSection?.widgets ?? []} 
          className={footerClasses}
        />
        {themeSwitcherConfig.enabled && (
          <ThemeSwitcher className={themeSwitcherClasses} />
        )}
      </div>
    </>
  );
}
