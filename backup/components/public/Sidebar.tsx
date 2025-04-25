'use client';

import { useEffect, useState } from 'react';
import { WidgetType } from '@prisma/client';
import WidgetRenderer from './WidgetRenderer';

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

// Sidebar configuration interface
interface SidebarConfig {
  showWidgets: boolean;
  customHtmlContent?: string;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
}

export interface SidebarProps {
  widgets?: Widget[];
  config?: any; // Config from GlobalConfig
  stickyClass?: string; // Class for sticky positioning
  position?: 'left' | 'right';
  className?: string;
  globalConfig?: any; // Global config for theme assignments
  pathname?: string; // Current path
}

export default function Sidebar({ 
  widgets = [],
  config,
  stickyClass = '',
  position = 'right',
  className = '',
  globalConfig,
  pathname = '/'
}: SidebarProps) {
  // State for theme styles
  const [themeStyles, setThemeStyles] = useState<string | null>(null);
  
  // Parse config
  let sidebarConfig: SidebarConfig = {
    showWidgets: true,
    backgroundColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    width: 'w-64'
  };
  
  try {
    // Parse sidebar configuration if available
    if (config) {
      // If config is a string, try to parse it
      const configData = typeof config === 'string' ? JSON.parse(config) : config;
      
      // Merge with default values
      sidebarConfig = {
        ...sidebarConfig,
        ...configData,
      };
    }
  } catch (e) {
    console.error('Error parsing sidebar config:', e);
  }
  
  // Get custom HTML content
  let customHtmlContent = sidebarConfig.customHtmlContent || '';
  
  // Effect to load theme configurations - only runs in client
  useEffect(() => {
    // Load theme styles
    async function loadThemeStyles() {
      if (pathname) {
        try {
          // Use the fetch API to call theme configurations
          const response = await fetch(`/api/themes/component?component=sidebar&pathname=${encodeURIComponent(pathname)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.css) {
              setThemeStyles(data.css);
            }
          }
        } catch (error) {
          console.error('Error loading sidebar theme:', error);
        }
      }
    }
    
    loadThemeStyles();
  }, [pathname]);
  
  // Position classes
  const positionClasses = position === 'left' ? 'order-first' : 'order-last';
  
  return (
    <>
      {/* Inyectar CSS para los temas específicos del sidebar - solo en cliente */}
      {themeStyles && (
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      )}
      
      <aside 
        className={`sidebar-component ${sidebarConfig.backgroundColor} ${sidebarConfig.width} p-4 ${positionClasses} ${stickyClass} ${className}`}
        data-position={position}
        data-visible="true"
      >
        <div className="sidebar-debug px-2 py-1 mb-4 bg-gray-100 text-xs rounded">
          <div>Posición: {position}</div>
          <div>Config: {config ? "Presente" : "Ausente"}</div>
        </div>
        {/* Widgets - only if showWidgets is true and we have widgets */}
        {sidebarConfig.showWidgets && widgets.length > 0 && (
          <div className="space-y-6">
            {widgets.map(widget => (
              <div key={widget.id} className="mb-6">
                <WidgetRenderer widget={widget} />
              </div>
            ))}
          </div>
        )}
        
        {/* Custom HTML content */}
        {customHtmlContent && (
          <div 
            className="content-html"
            dangerouslySetInnerHTML={{ __html: customHtmlContent }}
          />
        )}
      </aside>
    </>
  );
}
