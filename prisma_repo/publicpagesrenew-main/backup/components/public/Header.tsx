import Link from 'next/link';
import HeaderSearch from './HeaderSearch';
import Image from 'next/image';
import { translations } from '@/app/translations';
import { fetchNavigationMenu } from '@/actions/menu-actions';
import { getThemeConfigsForComponent, generateCssFromThemeConfigs } from '@/lib/themeUtils';

// Define type for menu items from the database
interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  parentId?: string | null;
  sectionId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define type for navigation menu items
interface NavMenuItem {
  id?: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
  order?: number;
}

// Define type for social media links
interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

// Props interface
export interface HeaderProps {
  menuItems?: MenuItem[];
  siteName?: string;
  logoUrl?: string | null;
  config?: any; // Config from GlobalConfig
  stickyClass?: string; // Class for sticky positioning
  globalConfig?: any; // Global config for theme assignments
  pathname?: string; // Current path
}

export default async function Header({ 
  menuItems = [], 
  siteName = translations.common.appName,
  logoUrl,
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
  // Parse config
  let headerConfig = { 
    showLogo: true,
    showSiteName: true,
    showSocialIcons: true,
    backgroundColor: 'white',
    textColor: 'black',
    socialIcons: [] as SocialLink[]
  };
  
  try {
    // Parse header configuration if available
    if (config) {
      // If config is a string, try to parse it
      const configData = typeof config === 'string' ? JSON.parse(config) : config;
      
      // Merge with default values
      headerConfig = {
        ...headerConfig,
        ...configData,
      };
      
      // Log parsed config for debugging
      console.log('Parsed header config:', headerConfig);
    }
  } catch (error) {
    console.error('Error parsing header config:', error);
  }
  
  // Extract social links from config if they exist
  const socialLinks: SocialLink[] = headerConfig.socialIcons || [];
  
  // Debug output
  console.log('Header Config:', {
    showLogo: headerConfig.showLogo,
    showSiteName: headerConfig.showSiteName,
    showSocialIcons: headerConfig.showSocialIcons,
    logoUrl,
    socialLinks: socialLinks.length
  });
  
  // Obtener menú de navegación usando la acción del servidor
  const navigationMenuResult = await fetchNavigationMenu();
  const navigationItems = navigationMenuResult?.items || [];
  
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
      
      console.log(`Procesando item de menú "${item.label}": target=${item.target}, url=${url}`);
      
      // Devolver el item con url establecida
      return {
        ...item,
        url: url
      };
    })
    .filter((item: NavMenuItem) => item.url) // Filtrar solo los que tienen url
    .sort((a: NavMenuItem, b: NavMenuItem) => (a.order || 0) - (b.order || 0));
  
  // Usar ambas fuentes de elementos de menú
  const combinedMenuItems = [
    ...navItems,
    ...menuItems.filter(item => 
      typeof item.url === 'string' && 
      item.url.trim() !== '' && 
      item.isActive
    ).sort((a, b) => a.order - b.order)
  ];
  
  // De-duplicar elementos del menú (si hay alguna coincidencia)
  // Preferir elementos del menú de navegación sobre menuItems si hay duplicados
  const urlSet = new Set();
  const uniqueMenuItems = combinedMenuItems.filter((item: any) => {
    if (urlSet.has(item.url)) {
      return false;
    }
    urlSet.add(item.url);
    return true;
  });

  return (
    <>
      {/* Inyectar CSS para los temas específicos del header */}
      {headerThemeCSS && (
        <style id="header-theme-css" dangerouslySetInnerHTML={{ __html: headerThemeCSS }} />
      )}
      
      <header className={`header-component bg-white shadow-md ${stickyClass}`} data-visible="true">
        {/* Debug info */}
        <div className="header-debug px-2 py-1 mb-2 bg-gray-100 text-xs rounded">
          <div>Config: {typeof config === 'object' ? 'Objeto presente' : typeof config}</div>
          <div>Logo URL: {logoUrl || 'No disponible'}</div>
          <div>Show Logo: {headerConfig.showLogo ? 'Sí' : 'No'}</div>
        </div>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo y nombre del sitio */}
        <Link href="/" className="flex items-center gap-2">
          {headerConfig.showLogo && logoUrl && (
            <Image 
              src={logoUrl} 
              alt={siteName} 
              width={40} 
              height={40}
              className="max-h-10 w-auto"
            />
          )}
          {headerConfig.showSiteName && (
            <span className="text-xl font-bold text-primary">{siteName}</span>
          )}
        </Link>

        {/* Navegación y íconos sociales */}
        <div className="flex items-center">
          {/* Navegación principal */}
          <ul className="hidden md:flex space-x-4">
            {uniqueMenuItems.map((item: any) => (
              <li key={item.id || `nav-${item.url}`}>
                <Link 
                  href={item.url}
                  className="text-gray-600 hover:text-primary"
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Búsqueda global */}
          <HeaderSearch />
          
          {/* Iconos sociales */}
          {headerConfig.showSocialIcons && socialLinks.length > 0 && (
            <div className="flex items-center ml-6 space-x-3">
              {socialLinks.map((social, index) => (
                <a 
                  key={`social-${index}`} 
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-primary"
                  aria-label={social.platform}
                >
                  {social.icon ? (
                    <span dangerouslySetInnerHTML={{ __html: social.icon }}></span>
                  ) : (
                    <span>{social.platform}</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>
      </header>
    </>
  );
}
