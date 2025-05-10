// Importación segura del enum WidgetType para cliente/SSR
import { WidgetType } from '@/lib/widget-client';
import { getThemeConfigsForComponent, generateCssFromThemeConfigs } from '@/lib/themeUtils';
import WidgetRenderer from './WidgetRenderer';

// Widget interface
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

// Sidebar configuration interface
interface SidebarConfig {
  showWidgets?: boolean;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  visible?: boolean;
  customHtml?: string;
  widgets?: any[];
}

export interface SidebarProps {
  widgets?: Widget[];
  config?: any; // Config from GlobalConfig
  position?: 'left' | 'right';
  className?: string;
  globalConfig?: any; // Global config for theme assignments
  pathname?: string; // Current path
}

export default async function Sidebar({ 
  widgets = [],
  config,
  position = 'right',
  className = '',
  globalConfig,
  pathname = '/'
}: SidebarProps) {
  // Obtener temas específicos para el componente Sidebar en la ruta actual
  const { lightConfig, darkConfig } = globalConfig 
    ? await getThemeConfigsForComponent('sidebar', pathname, globalConfig)
    : { lightConfig: null, darkConfig: null };
  
  // Generar CSS para los temas específicos del Sidebar
  const sidebarThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.sidebar-component');
  
  // Parse config con valores predeterminados
  let sidebarConfig: SidebarConfig = {
    showWidgets: true,
    backgroundColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    width: 'w-64',
    visible: true,
    customHtml: ''
  };
  
  try {
    // Parse sidebar configuration if available
    if (config) {
      // Si es string, intentar parsearlo
      const configData = typeof config === 'string' ? JSON.parse(config) : config;
      
      // Combinar con valores predeterminados
      sidebarConfig = {
        ...sidebarConfig,
        ...configData,
      };
      
      console.log('Parsed sidebar config:', sidebarConfig);
    }
  } catch (error) {
    console.error('Error parsing sidebar config:', error);
  }
  
  // Obtener el HTML personalizado
  const customHtml = sidebarConfig.customHtml || '';
  
  // Clases de posición
  const positionClasses = position === 'left' ? 'order-first' : 'order-last';
  
  // Visibilidad
  if (sidebarConfig.visible === false) {
    // Si está explícitamente configurado como invisible, no renderizar
    return null;
  }

  // Obtener widgets de la configuración si están disponibles
  // y asegurar que todos tengan un id válido
  const configWidgets = (sidebarConfig.widgets || []).map((widget, index) => ({
    ...widget,
    id: widget.id || `sidebar-widget-${index}` // Garantizar que siempre hay un id
  }));
  
  // Combinar widgets externos con los de la configuración
  // y asegurar que todos tengan un id válido
  const allWidgets = [
    ...widgets.map((widget, index) => ({
      ...widget,
      id: widget.id || `sidebar-extern-${index}`
    })),
    ...configWidgets
  ];

  return (
    <>
      {/* Inyectar CSS para los temas específicos del sidebar */}
      {sidebarThemeCSS && (
        <style id="sidebar-theme-css" dangerouslySetInnerHTML={{ __html: sidebarThemeCSS }} />
      )}
      
      <style>{`
        .sidebar-component {
          min-width: 0;
          overflow-x: auto;
          padding: var(--sidebar-padding-base, 1rem);
          box-sizing: border-box;
          flex-shrink: 0;
        }
      `}</style>
      {/** 
        Resolución del ancho:
        - Si es px/%, se pone en style.
        - Si empieza por "w-", se agrega a la clase.
      */}
      {(() => {
        let widthClass = "";
        let widthStyle: React.CSSProperties = {};
        if (typeof sidebarConfig.width === "string") {
          if (/^\d+(px|rem|em|vw|%)$/.test(sidebarConfig.width.trim())) {
            widthStyle.width = sidebarConfig.width.trim();
          } else if (sidebarConfig.width.startsWith("w-")) {
            widthClass = sidebarConfig.width;
          }
        }
        return (
          <aside 
            className={`sidebar-component ${positionClasses} ${widthClass} ${className}`}
            data-position={position}
            data-visible="true"
            style={{
              backgroundColor: 'var(--background-value, #f5f5f5)',
              color: 'var(--typography-paragraph-color, inherit)',
              ...widthStyle,
              border: 'none',
              height: '100%', /* Altura mínima para ocupar todo el espacio disponible */
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Widgets - solo si showWidgets es true y hay widgets */}
            {sidebarConfig.showWidgets && allWidgets.length > 0 && (
              <div className="space-y-6">
                <style>{`
                  .widget-card {
                    background: var(--sidebar-cards-background, #fff);
                    border-radius: var(--sidebar-cards-borderRadius, 12px);
                    box-shadow: var(--sidebar-cards-boxShadow, none);
                    border: var(--sidebar-cards-borderWidth, 1px) solid var(--sidebar-cards-borderColor, #e5e7eb);
                    color: var(--sidebar-cards-color, inherit);
                    padding: var(--sidebar-cards-padding, 1rem);
                    margin-bottom: 1.5rem;
                  }
                `}</style>
                {allWidgets.map((widget: Widget, index: number) => {
                  // Determinar el estilo de fondo para este widget
                  let widgetStyle: React.CSSProperties = {};
                  
                  // Depurar widget config para diagnóstico
                  if (widget.id === "sidebar-widget-0") {
                    console.log("Widget config debug:", 
                      JSON.stringify({ 
                        id: widget.id, 
                        config: widget.config, 
                        background: widget.config?.background 
                      }));
                  }
                  
                  // Para widgets con configuración de fondo específica
                  if (widget.config?.background) {
                    // Depurar widget background para diagnóstico
                    console.log(`Widget ${widget.id} background:`, widget.config.background);
                    
                    // Obtener el tipo de fondo y valor de manera más flexible
                    const bgType = widget.config.background?.type || 
                                  (widget.config.background?.url ? "image" : 
                                   (widget.config.background?.value?.includes("gradient") ? "gradient" : "color"));
                    
                    const bgValue = widget.config.background?.value || "";
                    const bgUrl = widget.config.background?.url || null;
                    
                    // Aplicar fondo según el tipo
                    if (bgType === "image" || bgUrl) {
                      // Url para imagen: intentar varias convenciones
                      const imageUrl = bgUrl || 
                                      `/images/backgrounds/widget-${widget.id}.webp` || 
                                      `/images/backgrounds/widget-${widget.id}.jpg` || 
                                      `/images/backgrounds/widget-${widget.id}.png` || 
                                      `/images/backgrounds/widget-${widget.id}.img`;
                      
                      // Para imágenes, configurar propiedades individuales sin usar 'background'
                      widgetStyle = {
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                      };
                      
                      console.log(`Widget ${widget.id} using image:`, imageUrl);
                    } 
                    // Gradiente o color plano
                    else if (bgType === "gradient" || bgType === "color") {
                      widgetStyle = {
                        background: bgValue
                      };
                      console.log(`Widget ${widget.id} using ${bgType}:`, bgValue);
                    }
                  }
                  // Si widget.background está disponible directamente (formato alternativo)
                  else if (widget.background) {
                    console.log(`Widget ${widget.id} has direct background:`, widget.background);
                    
                    if (typeof widget.background === 'string') {
                      // Background es un string simple (color o url)
                      widgetStyle = {
                        background: widget.background
                      };
                    } else if (widget.background.type === "image" || widget.background.url) {
                      // Background es objeto con url de imagen
                      const imageUrl = widget.background.url || 
                                      `/images/backgrounds/widget-${widget.id}.webp` || 
                                      `/images/backgrounds/widget-${widget.id}.jpg`;
                      
                      widgetStyle = {
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                      };
                    }
                  }
                  
                  console.log(`Final widget ${widget.id} style:`, widgetStyle);
                  
                  return (
                    <div 
                      key={widget.id || `widget-${index}`} 
                      className="widget-card"
                      style={widgetStyle}
                    >
                      <WidgetRenderer widget={widget} />
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* HTML Personalizado */}
            {customHtml && (
              <div 
                className="content-html"
                style={{
                  fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
                  fontSize: 'var(--typography-paragraph-fontSize, inherit)'
                }}
                dangerouslySetInnerHTML={{ __html: customHtml }}
              />
            )}
          </aside>
        );
      })()}
    </>
  );
}
