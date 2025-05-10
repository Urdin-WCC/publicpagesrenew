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
      
      <aside 
        className={`sidebar-component p-4 ${positionClasses} ${className}`}
        data-position={position}
        data-visible="true"
        style={{
          backgroundColor: 'var(--background-value, #f5f5f5)',
          color: 'var(--typography-paragraph-color, inherit)',
          width: sidebarConfig.width || 'auto',
          maxWidth: sidebarConfig.width || '320px',
          border: 'none' // Eliminar borde rojo de depuración
        }}
      >
        {/* Widgets - solo si showWidgets es true y hay widgets */}
        {sidebarConfig.showWidgets && allWidgets.length > 0 && (
          <div className="space-y-6">
            {allWidgets.map((widget: Widget, index: number) => (
              <div key={widget.id || `widget-${index}`} className="mb-6">
                <WidgetRenderer widget={widget} />
              </div>
            ))}
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
    </>
  );
}
