import { ReactNode } from 'react';
import HeaderUpdated from './HeaderUpdated';
import FooterUpdated from './FooterUpdated';
import SidebarUpdated from './SidebarUpdated';
import PageConfigHandler from './PageConfigHandler';
import { WidgetType } from '@prisma/client';
import { getGlobalConfig } from '@/lib/config';
import { SectionType } from '@prisma/client';
import { getSectionWithItems } from '@/lib/config';
import ThemeSwitcherClient from './ThemeSwitcherClient';

interface LayoutPublicProps {
  children: ReactNode;
  pathname: string;
}

interface Widget {
  id: string;
  title: string;
  type: WidgetType; 
  content: string | null;
  config: any;
  order: number;
  isActive: boolean;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default async function LayoutPublicUpdated({
  children,
  pathname = '/'
}: LayoutPublicProps) {
  // Obtener configuración global
  const globalConfig = await getGlobalConfig();
  
  if (!globalConfig) {
    throw new Error("No se pudo cargar la configuración global");
  }
  
  // Obtener datos de secciones para header, footer, sidebar
  const [headerSection, footerSection, sidebarSection] = await Promise.all([
    getSectionWithItems(SectionType.HEADER),
    getSectionWithItems(SectionType.FOOTER),
    getSectionWithItems(SectionType.SIDEBAR)
  ]);
  
  // Variables para elementos sticky
  let stickyClasses = {
    header: '',
    footer: '',
    themeSwitcher: 'fixed'
  };
  
  // Intentar parsear la configuración de elementos sticky
  try {
    const stickyConfigRaw = globalConfig.stickyElementsConfig;
    if (stickyConfigRaw) {
      const stickyConfig = typeof stickyConfigRaw === 'string'
        ? JSON.parse(stickyConfigRaw)
        : stickyConfigRaw;
        
      // Aplicar clases sticky según la configuración
      if (stickyConfig.header) {
        stickyClasses.header = 'sticky top-0 z-30';
      }
      
      if (stickyConfig.footer) {
        stickyClasses.footer = 'sticky bottom-0 z-30';
      }
      
      if (stickyConfig.themeSwitcher) {
        stickyClasses.themeSwitcher = 'fixed';
      } else {
        stickyClasses.themeSwitcher = 'absolute';
      }
    }
  } catch (error) {
    console.error('Error parsing sticky elements config:', error);
  }
  
  // Configuración del Theme Switcher
  let themeSwitcherPosition = 'bottom-right';
  let themeSwitcherStyle = 'icon-only';
  let showThemeSwitcher = true;
  
  // Intentar parsear la configuración del theme switcher
  try {
    const themeSwitcherConfigRaw = globalConfig.themeSwitcherConfig;
    if (themeSwitcherConfigRaw) {
      const themeSwitcherConfig = typeof themeSwitcherConfigRaw === 'string'
        ? JSON.parse(themeSwitcherConfigRaw)
        : themeSwitcherConfigRaw;
      
      showThemeSwitcher = themeSwitcherConfig.visible !== false;
      themeSwitcherPosition = themeSwitcherConfig.position || 'bottom-right';
      themeSwitcherStyle = themeSwitcherConfig.style || 'icon-only';
    }
  } catch (error) {
    console.error('Error parsing theme switcher config:', error);
  }
  
  return (
    <>
      {/* Component for controlling visibility of elements based on page configuration */}
      <PageConfigHandler />
      
      {/* Initialize default PAGE_CONFIG if not set */}
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
      
      <div className="flex flex-col min-h-screen">
        {/* Header Component */}
        <HeaderUpdated 
          siteName={globalConfig.siteName || "Neurowitch"}
          logoUrl={globalConfig.logoUrl}
          config={globalConfig.header}
          stickyClass={stickyClasses.header}
          globalConfig={globalConfig}
          pathname={pathname}
        />
        
        {/* Main content with sidebar */}
        <div className="flex flex-1">
          {/* Left Sidebar */}
          <SidebarUpdated 
            widgets={sidebarSection?.widgets || []}
            config={globalConfig.sidebar}
            position="left"
            className="hidden md:block" // Hidden on mobile
            globalConfig={globalConfig}
            pathname={pathname}
          />
          
          {/* Main content */}
          <main className="flex-grow px-4 py-8">
            {children}
          </main>
          
          {/* Right Sidebar */}
          <SidebarUpdated 
            widgets={sidebarSection?.widgets || []}
            config={globalConfig.sidebar}
            position="right"
            className="hidden md:block" // Hidden on mobile
            globalConfig={globalConfig}
            pathname={pathname}
          />
        </div>
        
        {/* Footer Component */}
        <FooterUpdated 
          text={`© ${new Date().getFullYear()} ${globalConfig.siteName || "Neurowitch"}. Todos los derechos reservados.`}
          widgets={footerSection?.widgets || []}
          config={globalConfig.footer}
          stickyClass={stickyClasses.footer}
          globalConfig={globalConfig}
          pathname={pathname}
        />
      </div>
      
      {/* Theme Switcher - Only shown if configured to be visible */}
      {showThemeSwitcher && (
        <div className="theme-switcher-container">
          <ThemeSwitcherClient 
            position={themeSwitcherPosition as any}
            style={themeSwitcherStyle as any}
          />
        </div>
      )}
    </>
  );
}
