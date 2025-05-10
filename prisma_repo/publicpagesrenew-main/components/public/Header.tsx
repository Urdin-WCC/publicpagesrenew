import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import HeaderHtmlContent from './HeaderHtmlContent';
import Social from './Social';
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
  height?: string; // Altura del encabezado
}

// Define type for social media links
interface SocialLink {
  platform: string;
  name?: string;
  url: string;
  icon?: string;
  newTab?: boolean;
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

export default async function Header({
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
  
  // Buscar el elemento logo para obtener la altura configurada
  const logoElement = headerElements.find(elem => elem.type === 'logo' && elem.visible);
  const headerHeight = logoElement?.height || 'auto';
  
  // Función para renderizar un elemento del header basado en su tipo
  const renderHeaderElement = (element: HeaderElementConfig | null) => {
    if (!element) return null;
    
    switch (element.type) {
      case 'logo':
        return (
          <div className="header-element logo-element">
            <Link href="/" className="flex items-center">
              {/* El logo puede venir de la configuración del elemento o del logoUrl global */}
              {(() => {
                // Usar la ruta fija para el logo con extensión .img
                const logoSrc = "/images/logo.img";
                console.log('Using fixed logo URL with .img extension:', logoSrc);
                
                if (true) {
                  // Logo siempre está en la ruta fija
                  const validLogoSrc = logoSrc;
                    
                  return (
                    <div className="logo-container">
                      {/* Fallback en caso de error de carga */}
                      {/* 
                        Configuración optimizada para que el logo se muestre a su tamaño natural:
                        - width y height establecidos a 0 para que Next.js no aplique restricciones
                        - unoptimized=true para evitar la optimización que podría cambiar el tamaño
                        - Estilos directos para anular cualquier estilo restrictivo
                      */}
                      <Image 
                        src={validLogoSrc}
                        alt={siteName}
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-auto h-auto" 
                        style={{
                          objectFit: "contain",
                          maxWidth: "none",
                          maxHeight: "none"
                        }}
                        unoptimized={true}
                        priority={true}
                      />
                    </div>
                  );
                }
                
                // Si no hay logo, mostrar un logo de texto
                return (
                  <span className="text-xl font-bold text-primary">
                    {siteName.substring(0, 1)}
                  </span>
                );
              })()}
            </Link>
          </div>
        );
      
      case 'text':
        return (
          <div className="header-element text-element">
            <span 
      className="text-lg font-semibold"
      style={{
        fontFamily: 'var(--typography-heading-fontFamily, inherit)',
        color: 'var(--typography-heading-color, inherit)',
        fontWeight: 'var(--typography-heading-fontWeight, 600)',
        fontSize: 'var(--typography-heading-fontSize, inherit)'
      }}
    >
      {siteName}
    </span>
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
                      href={
                        !item.url ||
                        typeof item.url !== "string" ||
                        item.url === "" ||
                        item.url.includes("<") ||
                        item.url.includes(">")
                        ? "#"
                        : item.url
                      }
                      className="transition"
                      style={{
                        color: 'var(--typography-link-color, #333)',
                        fontFamily: 'var(--typography-link-fontFamily, inherit)',
                        fontSize: 'var(--typography-link-fontSize, inherit)'
                      }}
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
            {/* Nuevo componente Social consume la config moderna */}
            {/* Puede ajustarse el prop inline según layout */}
            <Social config={socialConfig} inline />
          </div>
        );
      
      case 'theme':
        return (
          <div className="header-element theme-element">
            {/* No necesitamos renderizar el ThemeSwitcher aquí, ya se renderiza en el layout */}
            <div className="theme-switcher-placeholder"></div>
          </div>
        );
      
      case 'html': {
        if (!element.html) return null;
        
        return (
          <div className="header-element html-element">
            <HeaderHtmlContent content={element.html} />
          </div>
        );
      }
      
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
      
      {/* Estilos adicionales para las capas de posicionamiento */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Sistema de capas que ocupan todo el header */
        .header-position-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center; /* Centrado horizontal por defecto */
          align-items: center; /* Centrado vertical por defecto */
          pointer-events: none; /* Para que las capas no interfieran entre sí */
          z-index: 1;
          padding: 0;
          background: transparent;
        }
        
        /* Elemento espaciador invisible para forzar la altura */
        .layer-spacer {
          height: 100%;
          width: 1px;
          visibility: hidden;
          pointer-events: none;
        }
        
        /* Contenedor de los elementos reales que se posicionarán correctamente */
        .layer-content {
          position: absolute;
          display: flex;
          width: 100%;
          padding: 10px;
        }

        /* Todos los elementos dentro de las capas deben ser interactivos */
        .header-element {
          pointer-events: auto;
          max-width: 100%;
          box-sizing: border-box;
          padding: var(--header-padding-base, 4px);
        }

        /* Estilos para posicionamiento vertical con más fuerza */
        .vertical-top {
          top: 0;
          align-items: flex-start;    /* Alinea elementos en la parte superior */
          padding-top: 10px;          /* Espacio adicional en la parte superior */
        }
        
        .vertical-center {
          top: 50%;
          transform: translateY(-50%);
          align-items: center;        /* Alinea elementos en el centro vertical */
        }
        
        .vertical-bottom {
          bottom: 0;
          align-items: flex-end;      /* Alinea elementos en la parte inferior */
          padding-bottom: 10px;       /* Espacio adicional en la parte inferior */
        }
        
        /* Estilos para posicionamiento horizontal */
        .horizontal-left {
          left: 0;
          justify-content: flex-start; /* Alinea elementos a la izquierda */
          padding-left: 10px;          /* Espacio adicional a la izquierda */
        }
        
        .horizontal-center {
          left: 50%;
          transform: translateX(-50%);
          justify-content: center;     /* Alinea elementos al centro */
        }
        
        .horizontal-right {
          right: 0;
          justify-content: flex-end;   /* Alinea elementos a la derecha */
          padding-right: 10px;         /* Espacio adicional a la derecha */
        }

        /* Combinaciones especiales para transformaciones */
        .vertical-center.horizontal-center {
          transform: translate(-50%, -50%); /* Corregir transformación para center-center */
        }
        
        /* Estilos específicos para elementos */
        .logo-element img {
          max-height: 60px;
        }
        
        .menu-element {
          min-width: 0;
          overflow-x: auto;
        }
        .menu-element nav,
        .menu-element ul {
          min-width: 0;
          max-width: 100%;
          overflow-x: auto;
          flex-wrap: wrap;
        }
        
        /* Configuración del contenedor */
        .header-component .container {
          overflow: visible;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%; /* Ocupar toda la altura del header */
          min-height: 0; /* Eliminar altura mínima para permitir ajuste completo */
          padding-top: var(--header-container-padding-top, 8px);
          padding-bottom: var(--header-container-padding-bottom, 8px);
        }
        
        /* Soporte responsivo */
        @media (max-width: 768px) {
          .header-position-layer {
            padding: 4px;
          }
        }
      `}} />
      
      <header 
        className={`header-component w-full shadow-sm ${stickyClass}`} 
        data-visible="true"
        style={{
          backgroundColor: 'var(--background-value, white)',
          height: headerHeight !== 'auto' ? headerHeight : undefined,
          position: 'relative', // Posición relativa para contenedor padre
        }}>
        <div className="w-full relative min-h-[100px]" style={{ maxWidth: "100%", height: "100%" }}>
          {/* Usamos una rejilla con capas absolutas para posicionar los elementos de manera fija */}
          
          {/* Sistema simplificado de capas - sin espaciadores, posicionamiento directo */}
          
          {/* FILA SUPERIOR */}
          <div className="header-position-layer vertical-top horizontal-left">
            {renderHeaderElement(positionMatrix['top-left'])}
          </div>
          
          <div className="header-position-layer vertical-top horizontal-center">
            {renderHeaderElement(positionMatrix['top-center'])}
          </div>
          
          <div className="header-position-layer vertical-top horizontal-right">
            {renderHeaderElement(positionMatrix['top-right'])}
          </div>
          
          {/* FILA CENTRAL */}
          <div className="header-position-layer vertical-center horizontal-left">
            {renderHeaderElement(positionMatrix['center-left'])}
          </div>
          
          <div className="header-position-layer vertical-center horizontal-center">
            {renderHeaderElement(positionMatrix['center-center'])}
          </div>
          
          <div className="header-position-layer vertical-center horizontal-right">
            {renderHeaderElement(positionMatrix['center-right'])}
          </div>
          
          {/* FILA INFERIOR */}
          <div className="header-position-layer vertical-bottom horizontal-left">
            {renderHeaderElement(positionMatrix['bottom-left'])}
          </div>
          
          <div className="header-position-layer vertical-bottom horizontal-center">
            {renderHeaderElement(positionMatrix['bottom-center'])}
          </div>
          
          <div className="header-position-layer vertical-bottom horizontal-right">
            {renderHeaderElement(positionMatrix['bottom-right'])}
          </div>
        </div>
      </header>
    </>
  );
}
