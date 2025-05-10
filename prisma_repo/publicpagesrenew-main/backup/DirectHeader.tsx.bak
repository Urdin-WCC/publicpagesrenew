'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    showSocialIcons: true,
    logoUrl: globalConfig.logoUrl || '',
    socialIcons: [],
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Debug: imprimir logoUrl del globalConfig
  console.log('Header debug - globalConfig.logoUrl:', globalConfig.logoUrl);
'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }


'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  // Asegúrate de que todos los valores de configuración están correctos
  console.log('Header final config:', {
    showLogo: headerConfig.showLogo,
    showSiteName: headerConfig.showSiteName,
    showSocialIcons: headerConfig.showSocialIcons,
    logoUrl: headerConfig.logoUrl,
    socialIcons: headerConfig.socialIcons ? headerConfig.socialIcons.length : 0,
    backgroundColor: headerConfig.backgroundColor,
    textColor: headerConfig.textColor
  });

  // Aplica el tema si existe
  let headerStyles = {};
  if (theme) {
    headerStyles = {
      backgroundColor: theme.background?.value || headerConfig.backgroundColor,
      color: theme.typography?.heading?.color || headerConfig.textColor,
    };
  }

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
      style={headerStyles}
    >
'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;


'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">
            {headerConfig.showLogo && (
              <Link href="/" className="flex items-center">
'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">

'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">
            {headerConfig.showLogo && headerConfig.logoUrl && (
              <Link href="/" className="flex items-center">
                {headerConfig.logoUrl ? (
                  <div className="w-10 h-10 relative border border-gray-300">
                    <Image
                      src={headerConfig.logoUrl}
                      alt={globalConfig.siteName || 'Logo'}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-gray-500 font-bold">Logo</span>
                  </div>
                )}
'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">
            {headerConfig.showLogo && headerConfig.logoUrl && (
              <Link href="/" className="flex items-center">

'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">
            {headerConfig.showLogo && headerConfig.logoUrl && (
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 relative">
                  <Image
                    src={headerConfig.logoUrl}
                    alt={globalConfig.siteName || 'Logo'}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
            {headerConfig.showSiteName && (
              <Link href="/" className="text-xl font-bold">
                {globalConfig.siteName || 'Neurowitch'}
              </Link>
            )}
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url || '#'}
                className={`hover:text-primary transition-colors ${
                  pathname === item.url ? 'font-medium' : ''
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Búsqueda (si está habilitada) */}
          {headerConfig.showSearch && <HeaderSearch />}

          {/* Íconos sociales (si están habilitados) */}
          {headerConfig.showSocialIcons && headerConfig.socialIcons && headerConfig.socialIcons.length > 0 && (
            <div className="hidden md:flex items-center space-x-3">
              {headerConfig.socialIcons.map((icon: any, index: number) => (
                <a 
                  key={index}
                  href={icon.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-primary"
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <span>{icon.icon || 'Icon'}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">
            {headerConfig.showLogo && headerConfig.logoUrl && (
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 relative">
                  <Image
                    src={headerConfig.logoUrl}
                    alt={globalConfig.siteName || 'Logo'}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
            {headerConfig.showSiteName && (
              <Link href="/" className="text-xl font-bold">
                {globalConfig.siteName || 'Neurowitch'}
              </Link>
            )}
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url || '#'}
                className={`hover:text-primary transition-colors ${
                  pathname === item.url ? 'font-medium' : ''
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>


'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">
            {headerConfig.showLogo && headerConfig.logoUrl && (
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 relative">
                  <Image
                    src={headerConfig.logoUrl}
                    alt={globalConfig.siteName || 'Logo'}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
            {headerConfig.showSiteName && (
              <Link href="/" className="text-xl font-bold">
                {globalConfig.siteName || 'Neurowitch'}
              </Link>
            )}
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url || '#'}
                className={`hover:text-primary transition-colors ${
                  pathname === item.url ? 'font-medium' : ''
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Búsqueda (si está habilitada) */}
          {headerConfig.showSearch && <HeaderSearch />}

          {/* Botón móvil */}
          <div className="md:hidden">
            <button className="p-2 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Panel de información para depuración */}
      <div className="absolute bottom-0 left-0 transform translate-y-full bg-white text-black p-2 text-xs border border-blue-500 z-50 max-w-xs overflow-auto">
'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">
            {headerConfig.showLogo && headerConfig.logoUrl && (
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 relative">
                  <Image
                    src={headerConfig.logoUrl}
                    alt={globalConfig.siteName || 'Logo'}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
            {headerConfig.showSiteName && (
              <Link href="/" className="text-xl font-bold">
                {globalConfig.siteName || 'Neurowitch'}
              </Link>
            )}
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url || '#'}
                className={`hover:text-primary transition-colors ${
                  pathname === item.url ? 'font-medium' : ''
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Búsqueda (si está habilitada) */}
          {headerConfig.showSearch && <HeaderSearch />}

          {/* Botón móvil */}
          <div className="md:hidden">
            <button className="p-2 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      

'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">
            {headerConfig.showLogo && headerConfig.logoUrl && (
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 relative">
                  <Image
                    src={headerConfig.logoUrl}
                    alt={globalConfig.siteName || 'Logo'}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
            {headerConfig.showSiteName && (
              <Link href="/" className="text-xl font-bold">
                {globalConfig.siteName || 'Neurowitch'}
              </Link>
            )}
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url || '#'}
                className={`hover:text-primary transition-colors ${
                  pathname === item.url ? 'font-medium' : ''
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Búsqueda (si está habilitada) */}
          {headerConfig.showSearch && <HeaderSearch />}

          {/* Botón móvil */}
          <div className="md:hidden">
            <button className="p-2 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Panel de información para depuración */}
      <div className="absolute bottom-0 left-0 transform translate-y-full bg-white text-black p-2 text-xs border border-blue-500 z-50">
        <p className="font-bold">Header Configuration:</p>
        <ul className="list-disc list-inside">
          <li>Background: {headerConfig.backgroundColor}</li>
          <li>Text Color: {headerConfig.textColor}</li>
          <li>Show Logo: {headerConfig.showLogo ? 'Yes' : 'No'}</li>
          <li>Show Site Name: {headerConfig.showSiteName ? 'Yes' : 'No'}</li>
          <li>Logo URL: {headerConfig.logoUrl ? '✅' : '❌'}</li>
          <li>Social Icons: {headerConfig.socialIcons?.length || 0}</li>
          <li>Theme ID: {theme?.id || 'No theme applied'}</li>
        </ul>
'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">
            {headerConfig.showLogo && headerConfig.logoUrl && (
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 relative">
                  <Image
                    src={headerConfig.logoUrl}
                    alt={globalConfig.siteName || 'Logo'}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
            {headerConfig.showSiteName && (
              <Link href="/" className="text-xl font-bold">
                {globalConfig.siteName || 'Neurowitch'}
              </Link>
            )}
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url || '#'}
                className={`hover:text-primary transition-colors ${
                  pathname === item.url ? 'font-medium' : ''
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Búsqueda (si está habilitada) */}
          {headerConfig.showSearch && <HeaderSearch />}

          {/* Botón móvil */}
          <div className="md:hidden">
            <button className="p-2 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Panel de información para depuración */}
      <div className="absolute bottom-0 left-0 transform translate-y-full bg-white text-black p-2 text-xs border border-blue-500 z-50">
        <p className="font-bold">Header Configuration:</p>
'use server';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemePresetConfigById } from '@/lib/themeUtils';
import HeaderSearch from './HeaderSearch';
import { SiteSectionWithItems } from '@/lib/config';

interface DirectHeaderProps {
  menuItems?: Array<any>;
  pathname?: string;
}

export default async function DirectHeader({ menuItems = [], pathname = '/' }: DirectHeaderProps) {
  // Obtener la configuración global directamente de la base de datos
  const globalConfig = await getGlobalConfig();
  if (!globalConfig) {
    console.error('No se pudo obtener la configuración global');
    return null;
  }

  // Extraer configuración del header desde globalConfig
  let headerConfig: any = {
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    logoUrl: globalConfig.logoUrl || '',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-800',
    position: 'sticky'
  };

  // Intentar parsear la configuración JSON del header si existe
  if (globalConfig.header) {
    try {
      // Si ya es un objeto, usarlo directamente
      if (typeof globalConfig.header === 'object') {
        headerConfig = { ...headerConfig, ...globalConfig.header };
      } 
      // Si es un string, parsearlo
      else if (typeof globalConfig.header === 'string') {
        const parsedConfig = JSON.parse(globalConfig.header);
        headerConfig = { ...headerConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error parsing header config:', error);
    }
  }

  // Obtener tema asignado al header
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
      
      console.log('Theme assignments:', themeAssignments);
      
      // Buscar asignación para el header
      // Primero verificar el formato antiguo (components.header)
      let headerThemeId = null;
      
      if (themeAssignments.components && themeAssignments.components.header) {
        headerThemeId = themeAssignments.components.header;
      }
      // Si no existe, verificar el formato nuevo (header directamente)
      else if (themeAssignments.header) {
        headerThemeId = themeAssignments.header;
      }
      
      // Si encontramos un ID de tema para el header, obtener la configuración
      if (headerThemeId) {
        theme = await getThemePresetConfigById(headerThemeId);
        console.log('Header theme:', theme);
      }
    }
  } catch (error) {
    console.error('Error loading header theme:', error);
  }

  // Si tenemos un tema, combinar con la configuración
  if (theme) {
    headerConfig.backgroundColor = theme.backgroundColor || headerConfig.backgroundColor;
    headerConfig.textColor = theme.textColor || headerConfig.textColor;
    // Otros estilos del tema...
  }

  // Clases dinámicas basadas en configuración
  const bgClass = headerConfig.backgroundColor.startsWith('bg-') 
    ? headerConfig.backgroundColor 
    : `bg-[${headerConfig.backgroundColor}]`;
  
  const textClass = headerConfig.textColor.startsWith('text-') 
    ? headerConfig.textColor 
    : `text-[${headerConfig.textColor}]`;

  return (
    <header
      className={`${bgClass} ${textClass} shadow-sm border-b border-blue-500 relative z-50`}
      data-component="header"
      data-visible="true"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center space-x-2">
            {headerConfig.showLogo && headerConfig.logoUrl && (
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 relative">
                  <Image
                    src={headerConfig.logoUrl}
                    alt={globalConfig.siteName || 'Logo'}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
            {headerConfig.showSiteName && (
              <Link href="/" className="text-xl font-bold">
                {globalConfig.siteName || 'Neurowitch'}
              </Link>
            )}
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url || '#'}
                className={`hover:text-primary transition-colors ${
                  pathname === item.url ? 'font-medium' : ''
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Búsqueda (si está habilitada) */}
          {headerConfig.showSearch && <HeaderSearch />}

          {/* Botón móvil */}
          <div className="md:hidden">
            <button className="p-2 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Panel de información para depuración */}
      <div className="absolute bottom-0 left-0 transform translate-y-full bg-white text-black p-2 text-xs border border-blue-500 z-50">
        <p className="font-bold">Header Configuration:</p>
        <ul className="list-disc list-inside">
          <li>Background: {headerConfig.backgroundColor}</li>
          <li>Text Color: {headerConfig.textColor}</li>
          <li>Show Logo: {headerConfig.showLogo ? 'Yes' : 'No'}</li>
          <li>Show Site Name: {headerConfig.showSiteName ? 'Yes' : 'No'}</li>
          <li>Theme ID: {theme?.id || 'No theme applied'}</li>
        </ul>
      </div>
    </header>
  );
}
