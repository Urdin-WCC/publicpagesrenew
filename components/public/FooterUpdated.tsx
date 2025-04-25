import { WidgetType } from '@prisma/client';
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

// Footer configuration interface
interface FooterConfig {
  widgets?: any[];
  showWidgets?: boolean;
  showCopyright?: boolean;
  columns?: number;
  backgroundColor?: string;
  textColor?: string;
  height?: string;
  secondaryHtml?: string;
}

export interface FooterProps {
  text?: string;
  widgets?: Widget[];
  config?: any; // Config from GlobalConfig
  stickyClass?: string; // Class for sticky positioning
  globalConfig?: any; // Global config for theme assignments
  pathname?: string; // Current path
}

export default async function FooterUpdated({ 
  text = `© ${new Date().getFullYear()} Neurowitch. Todos los derechos reservados.`, 
  widgets = [],
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
    showWidgets: true,
    showCopyright: true,
    columns: 3,
    backgroundColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    height: 'auto',
    secondaryHtml: ''
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
  
  // Obtener el HTML secundario
  const secondaryHtml = footerConfig.secondaryHtml || '';
  
  // Obtener el texto de copyright personalizado o usar el predeterminado
  const copyrightText = text;
  
  // Determinar clases de columnas basado en la configuración
  const columnClasses = `grid-cols-1 md:grid-cols-${footerConfig.columns || 3}`;
  
  // Estilos para la altura personalizada
  const heightStyle = footerConfig.height && footerConfig.height !== 'auto'
    ? { style: { height: footerConfig.height } }
    : {};
  
  return (
    <>
      {/* Inyectar CSS para los temas específicos del footer */}
      {footerThemeCSS && (
        <style id="footer-theme-css" dangerouslySetInnerHTML={{ __html: footerThemeCSS }} />
      )}
      
      <footer 
        className={`footer-component ${footerConfig.backgroundColor} ${footerConfig.textColor} border-t border-gray-200 mt-auto ${stickyClass}`} 
        data-visible="true"
        {...heightStyle}
      >
        <div className="container mx-auto px-4 py-6">
          {/* Widgets grid - solo si showWidgets es true y hay widgets */}
          {footerConfig.showWidgets && widgets.length > 0 && (
            <div className={`grid ${columnClasses} gap-6 mb-6`}>
              {widgets.map((widget: Widget) => (
                <WidgetRenderer 
                  key={widget.id} 
                  widget={widget} 
                />
              ))}
            </div>
          )}
          
          {/* HTML Secundario personalizado */}
          {secondaryHtml && (
            <div 
              className="mb-6 content-html"
              dangerouslySetInnerHTML={{ __html: secondaryHtml }}
            />
          )}
          
          {/* Texto de copyright - solo si showCopyright es true */}
          {footerConfig.showCopyright && (
            <div className="text-center text-sm">
              {copyrightText}
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
