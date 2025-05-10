import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import CookieBanner from "@/components/public/CookieBanner";
import ThemeSwitcher from "@/components/public/ThemeSwitcher";
import Sidebar from "@/components/public/Sidebar";
import LoadingSpinner from "@/components/core/LoadingSpinner";
import MaintenanceMode from "@/components/public/MaintenanceMode";
import PageViewTracker from "@/components/public/PageViewTracker";
import PageConfigHandler from "@/components/public/PageConfigHandler";
import JsonLdScript from "@/components/core/JsonLdScript";
import { generateBaseMetadata, generateWebsiteJsonLd, GlobalConfig } from "@/lib/seoUtils";
import { getGlobalConfig } from "@/lib/config";
import { getThemeConfigsForRoute, generateCssFromThemeConfigs } from "@/lib/themeUtils";
import { getSectionWithItems, SiteSectionWithItems } from "@/lib/config";
import { SectionType } from "@prisma/client";
import { Metadata } from "next";
import Script from "next/script";

// A type to help TypeScript recognize our model while types catch up
type PrismaWithStaticPage = typeof prisma & {
  staticPage: any;
};

// Type for GlobalConfig with our new fields
interface ExtendedGlobalConfig {
  id: string;
  siteName: string;
  siteUrl?: string;
  description?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  maintenanceMode?: boolean;
  createdAt: Date;
  updatedAt: Date;
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
  cookieBannerText?: string;
  cookieBannerLinkPageId?: number | null;
  defaultLightThemePresetId?: number | null;
  defaultDarkThemePresetId?: number | null;
  themeAssignments?: string;
  loadingSpinnerConfig?: string;
  themeSwitcherConfig?: string;
  stickyElementsConfig?: string;
  header?: string;
  footer?: string;
  sidebar?: string;
}

/**
 * Generate the metadata for the public layout
 * @returns Metadata object for Next.js
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Get global config for SEO settings
    const config = await getGlobalConfig() as any as GlobalConfig;
    
    if (!config) {
      return {
        title: "Neurowitch",
        description: "Sitio web creado con Neurowitch CMS",
      };
    }
    
    // Generate base metadata using our utility function
    return generateBaseMetadata(config);
  } catch (error) {
    console.error("Error generating metadata:", error);
    // Return a default metadata object if there's an error
    return {
      title: "Neurowitch",
      description: "Sitio web creado con Neurowitch CMS",
    };
  }
}

async function getCookieBannerSettings() {
  try {
    // Use our robust getGlobalConfig function instead of direct Prisma call
    const globalConfig = await getGlobalConfig();
    
    // Early return if no config or required fields
    if (!globalConfig) {
      return { cookieBannerText: "", privacyPage: null };
    }

    // Cast to extended type to access our new fields
    const extendedConfig = globalConfig as unknown as ExtendedGlobalConfig;
    
    if (!extendedConfig.cookieBannerText || !extendedConfig.cookieBannerLinkPageId) {
      return { cookieBannerText: "", privacyPage: null };
    }

    let privacyPage = null;
    // Get the privacy policy page information
    try {
      const prismaExtended = prisma as PrismaWithStaticPage;
      privacyPage = await prismaExtended.staticPage.findUnique({
        where: { 
          id: extendedConfig.cookieBannerLinkPageId,
          isVisible: true,
        },
        select: {
          title: true,
          slug: true,
        },
      });
    } catch (privacyError) {
      console.error("Error fetching privacy page:", privacyError);
      // Continue with null privacyPage
    }

    return {
      cookieBannerText: extendedConfig.cookieBannerText,
      privacyPage,
    };
  } catch (error) {
    console.error("Error in getCookieBannerSettings:", error);
    return {
      cookieBannerText: "",
      privacyPage: null,
    };
  }
}

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { cookieBannerText, privacyPage } = await getCookieBannerSettings();
  
  // Get global config for JSON-LD and tracking scripts
  const config = await getGlobalConfig() as any;
  
  // Generate Website JSON-LD data
  const websiteJsonLd = config ? generateWebsiteJsonLd(config as GlobalConfig) : null;

  // Verificar si el sitio está en modo mantenimiento
  const isMaintenanceMode = config?.maintenanceMode || false;

  // Get theme configurations based on current route
  const { lightConfig, darkConfig } = config ? await getThemeConfigsForRoute('/', config) : { lightConfig: null, darkConfig: null };
  
  // Debug theme configurations
  console.log("Light theme config:", lightConfig);
  console.log("Dark theme config:", darkConfig);
  console.log("Theme assignments:", config?.themeAssignments);
  
  // Generate CSS for themes
  const themeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig);
  
  // Debug generated CSS
  console.log("Generated theme CSS:", themeCSS);

  // Parse configs for various components
  let loadingSpinnerConfig: any = { enabled: true }; // Default to enabled for testing
  let themeSwitcherConfig: any = { enabled: true, position: 'bottom-right', style: 'icon-only' };
  let stickyElementsConfig: any = { header: false, footer: false, themeSwitcher: true };
  let headerConfig: any = null;
  let footerConfig: any = null;
  let sidebarConfig: any = null;

  // Log original config values for debugging
  console.log('Original config values:', {
    loadingSpinnerConfig: config?.loadingSpinnerConfig,
    themeSwitcherConfig: config?.themeSwitcherConfig,
    stickyElementsConfig: config?.stickyElementsConfig,
    header: config?.header,
    footer: config?.footer,
    sidebar: config?.sidebar
  });

  // Helper function to safely parse JSON
  const safeParseJson = (jsonString: string | null | undefined, defaultValue: any = null) => {
    if (!jsonString) return defaultValue;
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      return parsed || defaultValue;
    } catch (error) {
      console.error(`Error parsing JSON: ${error}`);
      return defaultValue;
    }
  };

  // Parse loading spinner config
  loadingSpinnerConfig = safeParseJson(config?.loadingSpinnerConfig, loadingSpinnerConfig);

  // Parse theme switcher config
  themeSwitcherConfig = safeParseJson(config?.themeSwitcherConfig, themeSwitcherConfig);

  // Parse sticky elements config
  stickyElementsConfig = safeParseJson(config?.stickyElementsConfig, stickyElementsConfig);

  // Obtener configuración del header desde la API dedicada
  try {
    // Intentar importar la función fetchHeaderConfig
    const { fetchHeaderConfig } = await import('@/actions/header-actions');
    const headerConfigResponse = await fetchHeaderConfig();
    
    // La configuración del header puede tener un formato diferente, adaptarla
    if (headerConfigResponse && headerConfigResponse.elements) {
      // Convertir del formato de elementos al formato esperado por el componente Header
      const elements = headerConfigResponse.elements;
      
      // Extraer valores relevantes de los elementos
      const logoElement = elements.find((e: any) => e.type === 'logo');
      const socialElement = elements.find((e: any) => e.type === 'social');
      const textElement = elements.find((e: any) => e.type === 'text');
      
      // Crear un nuevo objeto de configuración con el formato esperado
      headerConfig = {
        showLogo: logoElement?.visible ?? true,
        showSiteName: textElement?.visible ?? true,
        showSocialIcons: socialElement?.visible ?? true,
        logoUrl: logoElement?.logoUrl,
        backgroundColor: 'white', // Valores predeterminados
        textColor: 'black',
        socialIcons: [] // Llenar esto si hay información disponible
      };
      
      console.log('Header config from API:', headerConfig);
    } else {
      // Fallback a la configuración del objeto global
      headerConfig = safeParseJson(config?.header, headerConfig);
      console.log('Using fallback header config from global config');
    }
  } catch (error) {
    console.error('Error fetching header config:', error);
    // Fallback a la configuración del objeto global
    headerConfig = safeParseJson(config?.header, headerConfig);
  }
  
  // Obtener configuración del footer desde la API dedicada
  try {
    // Intentar importar la función fetchFooterConfig
    const { fetchFooterConfig } = await import('@/actions/footer-actions');
    const footerConfigResponse = await fetchFooterConfig();
    
    // La configuración del footer puede tener un formato diferente, adaptarla
    if (footerConfigResponse) {
      // Convertir del formato de widgets al formato esperado por el componente Footer
      footerConfig = {
        widgets: footerConfigResponse.widgets || [],
        height: footerConfigResponse.height || 'auto',
        secondaryHtml: footerConfigResponse.secondaryHtml || '',
        backgroundColor: 'white', // Valores predeterminados
        textColor: 'black'
      };
      
      console.log('Footer config from API:', footerConfig);
    } else {
      // Fallback a la configuración del objeto global
      footerConfig = safeParseJson(config?.footer, footerConfig);
      console.log('Using fallback footer config from global config');
    }
  } catch (error) {
    console.error('Error fetching footer config:', error);
    // Fallback a la configuración del objeto global
    footerConfig = safeParseJson(config?.footer, footerConfig);
  }
  
  // Obtener configuración de la barra lateral desde la API dedicada
  try {
    // Intentar importar la función fetchSidebarConfig
    const { fetchSidebarConfig } = await import('@/actions/sidebar-actions');
    const sidebarConfigResponse = await fetchSidebarConfig();
    
    // La configuración de la barra lateral puede tener un formato diferente, adaptarla
    if (sidebarConfigResponse) {
      // Convertir del formato de la API al formato esperado por el componente Sidebar
      sidebarConfig = {
        showWidgets: true,
        customHtmlContent: '',
        backgroundColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        width: sidebarConfigResponse.width || 'w-64',
        widgets: sidebarConfigResponse.widgets || [],
        visible: sidebarConfigResponse.visible !== false
      };
      
      console.log('Sidebar config from API:', sidebarConfig);
    } else {
      // Fallback a la configuración del objeto global
      sidebarConfig = safeParseJson(config?.sidebar, sidebarConfig);
      console.log('Using fallback sidebar config from global config');
    }
  } catch (error) {
    console.error('Error fetching sidebar config:', error);
    // Fallback a la configuración del objeto global
    sidebarConfig = safeParseJson(config?.sidebar, sidebarConfig);
  }
  
  // Log parsed configurations for debugging
  console.log('Parsed configurations:', {
    loadingSpinnerConfig,
    themeSwitcherConfig,
    stickyElementsConfig,
    headerConfig,
    footerConfig,
    sidebarConfig
  });

  // Fetch sections data for header, footer, sidebar
  const [headerSection, footerSection] = await Promise.all([
    getSectionWithItems(SectionType.HEADER),
    getSectionWithItems(SectionType.FOOTER),
  ]);

  // Determine sticky classes based on configuration
  const stickyClasses = {
    header: stickyElementsConfig?.header ? 'sticky top-0 z-30' : '',
    footer: stickyElementsConfig?.footer ? 'sticky bottom-0 z-30' : '',
    themeSwitcher: stickyElementsConfig?.themeSwitcher ? 'sticky' : 'fixed',
  };

  return (
    <>
      {/* Inject theme CSS variables */}
      <style id="neurowitch-theme-css" dangerouslySetInnerHTML={{ __html: themeCSS }} />
      
      {/* Add JSON-LD structured data for the website */}
      {websiteJsonLd && <JsonLdScript data={websiteJsonLd} />}
      
      {/* Google Analytics Script - Only include if configured */}
      {config?.googleAnalyticsId && (
        <>
          <Script 
            src={`https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.googleAnalyticsId}');
            `}
          </Script>
        </>
      )}
      
      {/* Google Tag Manager Script - Only include if configured */}
      {config?.googleTagManagerId && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${config.googleTagManagerId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${config.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}
      
      {/* Mostrar la página de mantenimiento o el contenido normal */}
      {/* Componente para registrar visitas de página - solo en modo normal */}
      {!isMaintenanceMode && <PageViewTracker />}

      {isMaintenanceMode ? (
        <MaintenanceMode />
      ) : (
        <>
          {/* Conditionally render loading spinner - ahora con config */}
          <LoadingSpinner config={loadingSpinnerConfig} />
          
          {/* Main layout */}
          <div className="flex flex-col min-h-screen">
          {/* 
            Uso de un script cliente para controlar la visibilidad de elementos basado en __PAGE_CONFIG__ 
            Esta configuración es establecida por las páginas individuales
          */}
          {/* Componente cliente que maneja la configuración de página después de hidratación */}
          <PageConfigHandler />

          {/* Definición inicial de PAGE_CONFIG si no existe */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window.__PAGE_CONFIG__ === 'undefined') {
                  window.__PAGE_CONFIG__ = {
                    showHeader: true,
                    showFooter: true,
                    showSidebar: true,
                    sidebarPosition: 'right'
                  };
                }
              `,
            }}
          />
          
          {/* Header - La visibilidad se controla vía JS basado en __PAGE_CONFIG__ */}
          <Header 
            menuItems={headerSection?.menuItems || []}
            siteName={config?.siteName || "Neurowitch"}
            logoUrl={config?.logoUrl}
            config={headerConfig}
            stickyClass={stickyClasses.header}
            globalConfig={config}
            pathname="/"
          />
          
          {/* Contenido principal con soporte para sidebar */}
          <div className="flex flex-1">
            {/* Sidebar - Only show when page config has showSidebar=true */}
            <Sidebar 
              config={sidebarConfig} 
              position="left"
              className="hidden md:block" // Hidden on mobile
              globalConfig={config}
              pathname="/"
            />
            
            {/* Main content */}
            <main className="flex-grow px-4">
              {children}
            </main>
            
            {/* Sidebar - Only show when page config has showSidebar=true */}
            {/* Rendered conditionally at runtime based on client JS */}
            <Sidebar 
              config={sidebarConfig} 
              position="right"
              className="hidden md:block" // Hidden on mobile
              globalConfig={config}
              pathname="/"
            />
          </div>
          
          
          {/* Footer - La visibilidad se controla vía JS basado en __PAGE_CONFIG__ */}
          <Footer 
            widgets={footerSection?.widgets || []}
            text={config?.siteName ? `© ${new Date().getFullYear()} ${config.siteName}. Todos los derechos reservados.` : undefined}
            config={footerConfig}
            stickyClass={stickyClasses.footer}
            globalConfig={config}
            pathname="/"
          />
          </div>
          
          {/* Theme switcher - Temporalmente mostrado incondicionalmente para depuración */}
          <ThemeSwitcher 
            position="bottom-right"
            style="icon-only"
          />
        </>
      )}
      
      {/* Only render the cookie banner if text is provided */}
      {cookieBannerText && !isMaintenanceMode && (
        <CookieBanner 
          text={cookieBannerText}
          privacyPolicySlug={privacyPage?.slug}
          privacyPolicyTitle={privacyPage?.title}
        />
      )}
    </>
  );
}
