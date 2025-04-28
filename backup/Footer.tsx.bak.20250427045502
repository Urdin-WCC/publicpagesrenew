import { WidgetType } from '@prisma/client';
import { getThemeConfigsForComponent, generateCssFromThemeConfigs } from '@/lib/themeUtils';
import WidgetRenderer from './WidgetRenderer';
import dynamic from 'next/dynamic';
import FooterHtmlContent from './FooterHtmlContent';

// Widget interface para la configuración del footer
interface FooterWidget {
  id?: string;
  title: string;
  type: WidgetType | string;
  content?: string | null;
  config?: any;
  order?: number;
  isActive?: boolean;
}

// Footer configuration interface
interface FooterConfig {
  widgets?: FooterWidget[];
  columns?: number;
  backgroundColor?: string;
  textColor?: string;
  height?: string;
  secondaryHtml?: string;
  visible?: boolean;
}

export interface FooterProps {
  config?: any; // Config from GlobalConfig
  stickyClass?: string; // Class for sticky positioning
  globalConfig?: any; // Global config for theme assignments
  pathname?: string; // Current path
}

export default async function Footer({ 
  config,
  stickyClass = '',
  globalConfig,
  pathname = '/'
}: FooterProps) {
  // Obtener temas específicos para el componente Footer en la ruta actual
  const { lightConfig, darkConfig } = globalConfig 
    ? await getThemeConfigsForComponent('footer', pathname, globalConfig)
    : { lightConfig: null, darkConfig: null };
  
  // Generar CSS para los temas específicos del Footer
  const footerThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.footer-component');
  
  // Parse config con valores predeterminados
  let footerConfig: FooterConfig = {
    columns: 3,
    backgroundColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    height: 'auto',
    secondaryHtml: '',
    widgets: [],
    visible: true
  };
  
  try {
    // Parse footer configuration if available
    if (config) {
      // Si es string, intentar parsearlo
      const configData = typeof config === 'string' ? JSON.parse(config) : config;
      
      // Combinar con valores predeterminados
      footerConfig = {
        ...footerConfig,
        ...configData,
      };
      
      console.log('Parsed footer config:', footerConfig);
    }
  } catch (error) {
    console.error('Error parsing footer config:', error);
  }
  
  // Si el footer no es visible, no renderizar nada
  if (footerConfig.visible === false) {
    return null;
  }
  
  // Obtener el HTML secundario
  const secondaryHtml = footerConfig.secondaryHtml || '';
  
  // Determinar clases de columnas basado en la configuración
  const columnClasses = `grid-cols-1 md:grid-cols-${footerConfig.columns || 3}`;
  
  // Obtener widgets de la configuración y asegurar que todos tienen un id
  const configWidgets = (footerConfig.widgets || []).map((widget, index) => ({
    ...widget,
    id: widget.id || `footer-widget-${index}` // Garantizar que siempre hay un id
  }));
  
  return (
    <>
      {/* Inyectar CSS para los temas específicos del footer */}
      {footerThemeCSS && (
        <style id="footer-theme-css" dangerouslySetInnerHTML={{ __html: footerThemeCSS }} />
      )}
      
      <style>{`
        .footer-component {
          min-width: 0;
          overflow-x: auto;
          padding: var(--footer-padding-base, 1rem);
          box-sizing: border-box;
        }
      `}</style>
      <footer 
        className={`footer-component mt-auto ${stickyClass}`} 
        data-visible="true"
        style={{
          backgroundColor: 'var(--background-value, white)',
          color: 'var(--typography-paragraph-color, inherit)',
          height: footerConfig.height !== 'auto' ? footerConfig.height : 'auto',
          border: 'none' // Eliminar borde verde de depuración
        }}
      >
        <div className="w-full" style={{ maxWidth: "100%", height: "100%" }}>
          {/* Widgets grid - solo si hay widgets en la configuración */}
          {configWidgets.length > 0 && (
            <div className={`grid ${columnClasses} gap-6 mb-6`}>
              <style>{`
                .widget-card {
                  background: var(--footer-cards-background, #f5f5f5);
                  border-radius: var(--footer-cards-borderRadius, 12px);
                  box-shadow: var(--footer-cards-boxShadow, none);
                  border: var(--footer-cards-borderWidth, 1px) solid var(--footer-cards-borderColor, transparent);
                  color: var(--footer-cards-color, inherit);
                  padding: var(--footer-cards-padding, 1rem);
                }
                /* Forzar el fondo, borde y shadow de los hijos a ser transparentes para dejar ver el wrapper */
                .widget-card > * {
                  background: transparent !important;
                  box-shadow: none !important;
                  border: none !important;
                }
              `}</style>
              {configWidgets.map((widget, index: number) => {
                // Detección del tipo de fondo
                let cardBackgroundType = lightConfig?.cards?.background?.type || "color";
                let cardBackgroundValue = lightConfig?.cards?.background?.value || "#fff";
                let cardThemeId = lightConfig?.id;
                let style: React.CSSProperties = {};
                if (cardBackgroundType === "image" && cardThemeId) {
                  style.backgroundImage = `url(/images/backgrounds/card-${cardThemeId}.jpg)`;
                  style.backgroundSize = "cover";
                  style.backgroundPosition = "center";
                  style.backgroundRepeat = "no-repeat";
                } else if (cardBackgroundType === "gradient") {
                  style.backgroundImage = cardBackgroundValue;
                } else if (cardBackgroundType === "color") {
                  style.background = cardBackgroundValue;
                }
                return (
                  <div key={widget.id || `widget-${index}`} className="widget-card" style={style}>
                    <WidgetRenderer 
                      widget={widget as any} 
                    />
                  </div>
                )
              })}
            </div>
          )}
          
          {/* HTML Secundario personalizado - barra horizontal con wrapper HTML */}
          {secondaryHtml && (
            <div 
              className="border-t border-gray-200 pt-6 content-html"
              style={{
                fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
                fontSize: 'var(--typography-paragraph-fontSize, inherit)'
              }}
            >
              <FooterHtmlContent content={secondaryHtml} />
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
