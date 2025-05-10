import Link from 'next/link';
import Image from 'next/image';
import { translations } from '@/app/translations';
import { fetchNavigationMenu } from '@/actions/menu-actions';
import { getThemeConfigsForComponent, generateCssFromThemeConfigs } from '@/lib/themeUtils';
import { fetchSocialConfig } from '@/actions/social-actions';

// Define type for navigation menu items
interface NavMenuItem {
  id?: string;
  label: string;
  target?: string;
  url?: string;
  customUrl?: string;
  openInNewTab?: boolean;
}

// Define type for header element config
interface HeaderElementConfig {
  type: string;
  visible: boolean;
  position: string;
  logoUrl?: string;
  html?: string;
}

// Define type for social media links
interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

// Props interface
export interface HeaderProps {
  siteName?: string;
  logoUrl?: string | null;
  config?: any; // Config from GlobalConfig
  stickyClass?: string; // Class for sticky positioning
  globalConfig?: any; // Global config for theme assignments
  pathname?: string; // Current path
}

export default async function HeaderUpdated({
  siteName = translations.common.appName,
  logoUrl: globalLogoUrl,
  config,
  stickyClass = '',
  globalConfig,
  pathname = '/'
}: HeaderProps) {
  
  // Obtener temas específicos para el componente Header en la ruta actual
  const { lightConfig, darkConfig } = globalConfig 
    ? await getThemeConfigsForComponent('header', pathname, globalConfig)
    : { lightConfig: null, darkConfig: null };
  
  // Generar CSS para los temas específicos del Header
  // El selector '.header-component' se aplicará solo al Header
  const headerThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.header-component');
  
  // Obtener menú de navegación usando la acción del servidor
  const navigationMenuResult = await fetchNavigationMenu();
  const navigationItems = navigationMenuResult?.items || [];
  
  // Obtener configuración social
  const socialConfig = await fetchSocialConfig();
  const socialIcons = socialConfig?.links || [];
  
  // Procesar los elementos del menú recuperados y mapear target/customUrl a url
  const navItems = navigationItems
    .filter((item: any) => item && item.label)
    .map((item: any) => {
      // Determinar la URL basada en target y customUrl
      let url = '/';
      if (item.target === 'home') {
        url = '/';
      } else if (item.target === 'blog') {
        url = '/blog';
      } else if (item.target === 'portfolio') {
        url = '/portfolio';
      } else if (item.target === 'custom' && item.customUrl) {
        url = item.customUrl;
      } else if (item.target?.startsWith('/')) {
        // Si target comienza con /, es una ruta directa
        url = item.target;
      }
      
      // Devolver el item con url establecida
      return {
        ...item,
        url: url
      };
    })
    .filter((item: NavMenuItem) => item.url); // Filtrar solo los que tienen url
  
  // Parse config y establecer valores por defecto si no hay configuración
  let headerElements: HeaderElementConfig[] = [
    { type: "logo", visible: true, position: "top-left" },
    { type: "text", visible: true, position: "top-center" },
    { type: "menu", visible: true, position: "top-right" },
    { type: "social", visible: true, position: "bottom-left" },
    { type: "theme", visible: true, position: "bottom-right" },
    { type: "html", visible: false, position: "center-center" }
  ];

  try {
    // Parse header configuration if available
    if (config) {
      // If config is a string, try to parse it
      const configData = typeof config === 'string' ? JSON.parse(config) : config;
      
      // Use configData.elements if available
      if (configData && configData.elements && Array.isArray(configData.elements)) {
        headerElements = configData.elements;
      }
    }
  } catch (error) {
    console.error('Error parsing header config:', error);
  }
  
  // Crear una matriz para posicionar elementos
  const positionMatrix = {
    'top-left': null as HeaderElementConfig | null,
    'top-center': null as HeaderElementConfig | null,
    'top-right': null as HeaderElementConfig | null,
    'center-left': null as HeaderElementConfig | null,
    'center-center': null as HeaderElementConfig | null,
    'center-right': null as HeaderElementConfig | null,
    'bottom-left': null as HeaderElementConfig | null,
    'bottom-center': null as HeaderElementConfig | null,
    'bottom-right': null as HeaderElementConfig | null
  };

  // Colocar cada elemento en su posición
  headerElements.forEach(element => {
    if (element.visible && element.position in positionMatrix) {
      positionMatrix[element.position as keyof typeof positionMatrix] = element;
    }
  });
  
  // Función para renderizar un elemento del header basado en su tipo
  const renderHeaderElement = (element: HeaderElementConfig | null) => {
    if (!element) return null;
    
    switch (element.type) {
      case 'logo':
        return (
          <div className="header-element logo-element">
            <Link href="/" className="flex items-center">
              {element.logoUrl || globalLogoUrl ? (
                <Image 
                  src={element.logoUrl || globalLogoUrl || ''} 
                  alt={siteName} 
                  width={40} 
                  height={40}
                  className="max-h-10 w-auto"
                />
              ) : (
                <span className="text-xl font-bold">Logo</span>
              )}
            </Link>
          </div>
        );
      
      case 'text':
        return (
          <div className="header-element text-element">
            <span className="text-lg font-semibold">{siteName}</span>
          </div>
        );
      
      case 'menu':
        return (
          <div className="header-element menu-element">
            <nav className="hidden md:block">
              <ul className="flex space-x-4">
                {navItems.map((item: NavMenuItem, index: number) => (
                  <li key={item.id || `nav-${index}`}>
                    <Link 
                      href={item.url!}
                      className="text-gray-700 hover:text-primary transition"
                      target={item.openInNewTab ? "_blank" : undefined}
                      rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        );
      
      case 'social':
        return (
          <div className="header-element social-element">
            <div className="flex space-x-3">
              {socialIcons && socialIcons.map((social: SocialLink, index: number) => (
                <a 
                  key={`social-${index}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-primary transition"
                  aria-label={social.platform}
                >
                  {social.icon ? (
                    <span dangerouslySetInnerHTML={{ __html: social.icon }}></span>
                  ) : (
                    <span>{social.platform.substring(0, 1).toUpperCase()}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        );
      
      case 'theme':
        return (
          <div className="header-element theme-element">
            {/* ThemeSwitcher will be implemented in a separate component */}
            <button className="theme-switcher-placeholder p-2 bg-gray-200 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        );
      
      case 'html':
        return element.html ? (
          <div 
            className="header-element html-element"
            dangerouslySetInnerHTML={{ __html: element.html }}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <>
      {/* Inyectar CSS para los temas específicos del header */}
      {headerThemeCSS && (
        <style id="header-theme-css" dangerouslySetInnerHTML={{ __html: headerThemeCSS }} />
      )}
      
      <header className={`header-component w-full shadow-sm ${stickyClass}`} data-visible="true">
        <div className="container mx-auto px-4 py-3">
          {/* Fila superior */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1 flex justify-start">
              {renderHeaderElement(positionMatrix['top-left'])}
            </div>
            <div className="flex-1 flex justify-center">
              {renderHeaderElement(positionMatrix['top-center'])}
            </div>
            <div className="flex-1 flex justify-end">
              {renderHeaderElement(positionMatrix['top-right'])}
            </div>
          </div>
          
          {/* Fila central */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1 flex justify-start">
              {renderHeaderElement(positionMatrix['center-left'])}
            </div>
            <div className="flex-1 flex justify-center">
              {renderHeaderElement(positionMatrix['center-center'])}
            </div>
            <div className="flex-1 flex justify-end">
              {renderHeaderElement(positionMatrix['center-right'])}
            </div>
          </div>
          
          {/* Fila inferior */}
          <div className="flex justify-between items-center">
            <div className="flex-1 flex justify-start">
              {renderHeaderElement(positionMatrix['bottom-left'])}
            </div>
            <div className="flex-1 flex justify-center">
              {renderHeaderElement(positionMatrix['bottom-center'])}
            </div>
            <div className="flex-1 flex justify-end">
              {renderHeaderElement(positionMatrix['bottom-right'])}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
