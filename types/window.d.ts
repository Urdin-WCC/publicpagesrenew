// Extender la interfaz Window para incluir nuestras variables personalizadas
interface Window {
  __PAGE_CONFIG__?: {
    showHeader?: boolean;
    showFooter?: boolean;
    showSidebar?: boolean;
    sidebarPosition?: string;
    themeConfig?: {
      light: boolean;
      dark: boolean;
    };
  };
  
  __PAGE_SPECIFIC_THEMES__?: {
    light?: any;
    dark?: any;
  };
  
  shouldShowSidebar?: () => boolean;
  getSidebarPosition?: () => string;
}
