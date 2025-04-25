import { translations } from '@/app/translations';
import { WidgetType } from '@prisma/client';
import WidgetRenderer from './WidgetRenderer';
import { getThemeConfigsForComponent, generateCssFromThemeConfigs } from '@/lib/themeUtils';

// Widget from database
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
  showWidgets: boolean;
  showCopyright: boolean;
  customCopyrightText?: string;
  customHtmlContent?: string;
  backgroundColor?: string;
  textColor?: string;
  columns?: number;
  footerHeight?: string;
}

export interface FooterProps {
  text?: string;
  widgets?: Widget[];
  config?: any; // Config from GlobalConfig
  stickyClass?: string; // Class for sticky positioning
  globalConfig?: any; // Global config for theme assignments
  pathname?: string; // Current path
}

export default async function Footer({ 
  text = `© ${new Date().getFullYear()} ${translations.common.appName}. Todos los derechos reservados.`, 
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
  // El selector '.footer-component' se aplicará solo al Footer
  const footerThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.footer-component');
  // Parse config
  let footerConfig: FooterConfig = {
    showWidgets: true,
    showCopyright: true,
    columns: 3,
    backgroundColor: 'bg-gray-100',
    textColor: 'text-gray-500'
  };
  
  try {
    // Parse footer configuration if available
    if (config) {
      // If config is a string, try to parse it
      const configData = typeof config === 'string' ? JSON.parse(config) : config;
      
      // Merge with default values
      footerConfig = {
        ...footerConfig,
        ...configData,
      };
      
      console.log('Parsed footer config:', footerConfig);
    }
  } catch (e) {
    console.error('Error parsing footer config:', e);
  }
  
  // Get custom HTML content
  let customHtmlContent = footerConfig.customHtmlContent || '';
  
  // Get custom copyright text
  const copyrightText = footerConfig.customCopyrightText || text;
  
  // Determine column classes based on config
  const columnClasses = `grid-cols-1 md:grid-cols-${footerConfig.columns || 3}`;
  
  return (
    <>
      {/* Inyectar CSS para los temas específicos del footer */}
      {footerThemeCSS && (
        <style id="footer-theme-css" dangerouslySetInnerHTML={{ __html: footerThemeCSS }} />
      )}
      
      <footer className={`footer-component ${footerConfig.backgroundColor} border-t border-gray-200 mt-auto ${stickyClass}`} data-visible="true">
        {/* Debug info */}
        <div className="footer-debug px-2 py-1 mb-2 bg-gray-100 text-xs rounded">
          <div>Config: {typeof config === 'object' ? 'Objeto presente' : typeof config}</div>
          <div>Custom HTML: {customHtmlContent ? 'Presente' : 'No disponible'}</div>
          <div>Widgets: {widgets.length || 0}</div>
        </div>
      <div className="container mx-auto px-4 py-6">
        {/* Widgets grid - only if showWidgets is true and we have widgets */}
        {footerConfig.showWidgets && widgets.length > 0 && (
          <div className={`grid ${columnClasses} gap-4 mb-4`}>
            {widgets.map(widget => (
              <WidgetRenderer key={widget.id} widget={widget} />
            ))}
          </div>
        )}
        
        {/* Custom HTML content */}
        {customHtmlContent && (
          <div 
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: customHtmlContent }}
          />
        )}
        
        {/* Copyright text - only if showCopyright is true */}
        {footerConfig.showCopyright && (
          <div className={`text-center text-sm ${footerConfig.textColor}`}>
            {copyrightText}
          </div>
        )}
      </div>
      </footer>
    </>
  );
}
