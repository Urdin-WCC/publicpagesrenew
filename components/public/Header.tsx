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
                // Usar la ruta fija para el logo
                const logoSrc = "/images/logo.png";
                console.log('Using fixed logo URL:', logoSrc);
                
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
                      href={item.url!}
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
                    <span className="social-icon">
                      {/* Renderizar icono basado en la plataforma */}
                      {social.icon === "facebook" && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                        </svg>
                      )}
                      {social.icon === "twitter" && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      )}
                      {social.icon === "instagram" && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      )}
                      {social.icon === "linkedin" && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                        </svg>
                      )}
                      {social.icon === "youtube" && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                      )}
                      {/* Si no coincide ninguno de los iconos conocidos, mostrar la primera letra */}
                      {!["facebook", "twitter", "instagram", "linkedin", "youtube"].includes(social.icon) && (
                        <span>{(social.name || social.platform || "S").substring(0, 1).toUpperCase()}</span>
                      )}
                    </span>
                  ) : (
                    <span>{(social.name || social.platform || "S").substring(0, 1).toUpperCase()}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        );
      
      case 'theme':
        return (
          <div className="header-element theme-element">
            {/* No necesitamos renderizar el ThemeSwitcher aquí, ya se renderiza en el layout */}
            <div className="theme-switcher-placeholder"></div>
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
