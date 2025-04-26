'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import WidgetRenderer from './WidgetRenderer';

interface DirectFooterProps {
  widgets?: Array<any>;
  pathname?: string;
}

export default async function DirectFooter({ widgets = [], pathname = '/' }: DirectFooterProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del footer desde globalConfig
  let footerConfig: any = {
    widgets: widgets || [],
    height: 'auto',
    showCopyright: true,
    backgroundColor: 'bg-gray-800',
    textColor: 'text-gray-200',
    secondaryHtml: '',
    position: 'relative'
  };

  // Intentar parsear la configuración JSON del footer si existe
  if (globalConfig.footer) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.footer === 'object') {
        footerConfig = { ...footerConfig, ...globalConfig.footer };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.footer === 'string') {
        const parsedConfig = JSON.parse(globalConfig.footer);
        footerConfig = { ...footerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing footer config:', error);
    }
  }

  // Obtener tema asignado al footer
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
      
      console.log('Theme assignments for footer:', themeAssignments);
      
      // Buscar asignación para el footer
      // Primero verificar el formato antiguo (components.footer)
      let footerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.footer) {
        footerThemeId = themeAssignments.components.footer;
      }
      // Si no existe, verificar el formato nuevo (footer directamente)
      else if (themeAssignments.footer) {
        footerThemeId = themeAssignments.footer;
      }
      
      // Si encontramos un ID de tema para el footer, obtener la configuración
      if (footerThemeId) {
        theme = await getThemePresetConfigById(footerThemeId);
        console.log('Footer theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading footer theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    footerConfig.backgroundColor = theme.backgroundColor || footerConfig.backgroundColor;
    footerConfig.textColor = theme.textColor || footerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = footerConfig.backgroundColor.startsWith('bg-') 
    ? footerConfig.backgroundColor 
    : `bg-[${footerConfig.backgroundColor}]`;
  
  const textClass = footerConfig.textColor.startsWith('text-') 
    ? footerConfig.textColor 
    : `text-[${footerConfig.textColor}]`;

  // Año actual para el copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`${bgClass} ${textClass} pt-12 pb-6 border-t border-green-500 relative z-40`}
      data-component="footer"
      data-visible="true"
      style={{ 
        height: footerConfig.height !== 'auto' ? footerConfig.height : 'auto'
      }}
    >
      <div className="container mx-auto px-4">
        {/* Zona de widgets */}
        {footerConfig.widgets && footerConfig.widgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {footerConfig.widgets.map((widget: any, index: number) => (
              <div key={widget.id || index} className="footer-widget">
                <WidgetRenderer widget={widget} />
              </div>
            ))}
          </div>
        )}

        {/* Separador */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* HTML secundario personalizado */}
        {footerConfig.secondaryHtml && (
          <div className="mb-6" dangerouslySetInnerHTML={{ __html: footerConfig.secondaryHtml }} />
        )}

        {/* Copyright */}
        {footerConfig.showCopyright && (
          <div className="text-center text-gray-400 text-sm">
            <p>
              © {currentYear} {globalConfig.siteName || 'Neurowitch'}. Todos los derechos reservados.
            </p>
          </div>
        )}
      </div>
      
      {/* Panel de información para depuración */}
      <div className="absolute bottom-0 left-0 transform translate-y-full bg-white text-black p-2 text-xs border border-green-500 z-50">
        <p className="font-bold">Footer Configuration:</p>
        <ul className="list-disc list-inside">
          <li>Background: {footerConfig.backgroundColor}</li>
          <li>Text Color: {footerConfig.textColor}</li>
          <li>Widgets: {footerConfig.widgets?.length || 0}</li>
          <li>Height: {footerConfig.height}</li>
          <li>Theme ID: {theme?.id || 'No theme applied'}</li>
        </ul>
      </div>
    </footer>
  );
}
