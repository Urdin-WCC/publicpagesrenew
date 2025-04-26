'use server';

import React from 'react';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import WidgetRenderer from './WidgetRenderer';

interface DirectSidebarProps {
  position?: 'left' | 'right';
  className?: string;
  pathname?: string;
}

export default async function DirectSidebar({ 
  position = 'right', 
  className = '', 
  pathname = '/' 
}: DirectSidebarProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del sidebar desde globalConfig
  let sidebarConfig: any = {
    widgets: [],
    width: 'w-64',
    visible: true,
    backgroundColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    customHtmlContent: '',
    position: position || 'right',
    showWidgets: true
  };

  // Intentar parsear la configuración JSON del sidebar si existe
  if (globalConfig.sidebar) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.sidebar === 'object') {
        sidebarConfig = { ...sidebarConfig, ...globalConfig.sidebar };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.sidebar === 'string') {
        const parsedConfig = JSON.parse(globalConfig.sidebar);
        sidebarConfig = { ...sidebarConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing sidebar config:', error);
    }
  }

  // Obtener tema asignado al sidebar
  let theme: any = null;
  try {
    // Verificar si hay asignaciones de tema
    if (globalConfig.themeAssignments) {
      let themeAssignments: any = {};
      
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.themeAssignments === 'object') {
        themeAssignments = globalConfig.themeAssignments;
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.themeAssignments === 'string') {
        themeAssignments = JSON.parse(globalConfig.themeAssignments);
      }
      
      console.log('Theme assignments for sidebar:', themeAssignments);
      
      // Buscar asignación para el sidebar
      // Primero verificar el formato antiguo (components.sidebar)
      let sidebarThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.sidebar) {
        sidebarThemeId = themeAssignments.components.sidebar;
      }
      // Si no existe, verificar el formato nuevo (sidebar directamente)
      else if (themeAssignments.sidebar) {
        sidebarThemeId = themeAssignments.sidebar;
      }
      
      // Si encontramos un ID de tema para el sidebar, obtener la configuración
      if (sidebarThemeId) {
        theme = await getThemePresetConfigById(sidebarThemeId);
        console.log('Sidebar theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading sidebar theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    sidebarConfig.backgroundColor = theme.backgroundColor || sidebarConfig.backgroundColor;
    sidebarConfig.textColor = theme.textColor || sidebarConfig.textColor;
    // Otros estilos del tema...
  }

  // Si la sidebar no es visible, retornar null
  if (sidebarConfig.visible === false) {
    return null;
  }

  // Clases dinámicas basadas en configuración
  const bgClass = sidebarConfig.backgroundColor.startsWith('bg-') 
    ? sidebarConfig.backgroundColor 
    : `bg-[${sidebarConfig.backgroundColor}]`;
  
  const textClass = sidebarConfig.textColor.startsWith('text-') 
    ? sidebarConfig.textColor 
    : `text-[${sidebarConfig.textColor}]`;
    
  // Establecer el ancho basado en la configuración
  let widthClass = sidebarConfig.width || 'w-64';
  if (!widthClass.startsWith('w-')) {
    widthClass = `w-[${widthClass}]`;
  }

  return (
    <aside
      className={`${bgClass} ${textClass} ${widthClass} p-4 border-${position === 'left' ? 'r' : 'l'} border-orange-500 relative ${className}`}
      data-component="sidebar"
      data-position={position}
      data-visible="true"
    >
      {/* Contenido HTML personalizado */}
      {sidebarConfig.customHtmlContent && (
        <div className="mb-6" dangerouslySetInnerHTML={{ __html: sidebarConfig.customHtmlContent }} />
      )}

      {/* Widgets */}
      {sidebarConfig.showWidgets && sidebarConfig.widgets && sidebarConfig.widgets.length > 0 && (
        <div className="space-y-6">
          {sidebarConfig.widgets.map((widget: any, index: number) => (
            <div key={widget.id || index} className="sidebar-widget">
              <WidgetRenderer widget={widget} />
            </div>
          ))}
        </div>
      )}
      
      {sidebarConfig.widgets && sidebarConfig.widgets.length === 0 && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">No hay widgets configurados en este sidebar</p>
        </div>
      )}
      
      {/* Panel de información para depuración */}
      <div className="absolute bottom-0 left-0 transform translate-y-full bg-white text-black p-2 text-xs border border-orange-500 z-50">
        <p className="font-bold">Sidebar Configuration:</p>
        <ul className="list-disc list-inside">
          <li>Background: {sidebarConfig.backgroundColor}</li>
          <li>Text Color: {sidebarConfig.textColor}</li>
          <li>Position: {position}</li>
          <li>Width: {sidebarConfig.width}</li>
          <li>Widgets: {sidebarConfig.widgets?.length || 0}</li>
          <li>Theme ID: {theme?.id || 'No theme applied'}</li>
        </ul>
      </div>
    </aside>
  );
}
