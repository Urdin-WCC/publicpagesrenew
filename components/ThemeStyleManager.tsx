'use client';

import React, { useEffect, useState } from 'react';
import { getThemeConfigsForComponent, getThemeConfigsForRoute, generateCssFromThemeConfigs } from '@/lib/themeUtils';

interface ThemeStyleManagerProps {
  pathname: string;
  globalConfig: any;
  componentName?: string;
  selector?: string;
}

/**
 * ThemeStyleManager - Componente para gestionar y aplicar estilos de tema
 * 
 * Este componente se encarga de cargar las configuraciones de tema para una ruta
 * o componente específico y generar el CSS correspondiente. El CSS se aplica
 * dinámicamente a través de un elemento <style>.
 * 
 * @param {string} pathname - La ruta actual
 * @param {object} globalConfig - La configuración global
 * @param {string} componentName - Nombre del componente (opcional)
 * @param {string} selector - Selector CSS para aplicar los estilos (opcional)
 */
export default function ThemeStyleManager({
  pathname,
  globalConfig,
  componentName,
  selector
}: ThemeStyleManagerProps) {
  const [css, setCss] = useState<string>('');

  useEffect(() => {
    // Esta función asíncrona carga las configuraciones de tema y genera el CSS
    async function loadThemeStyles() {
      try {
        // Determinar si debemos cargar configuraciones para una ruta o un componente
        const configs = componentName
          ? await getThemeConfigsForComponent(componentName, pathname, globalConfig)
          : await getThemeConfigsForRoute(pathname, globalConfig);

        // Generar CSS a partir de las configuraciones
        const generatedCss = generateCssFromThemeConfigs(
          configs.lightConfig, 
          configs.darkConfig,
          selector
        );

        // Actualizar el estado con el CSS generado
        setCss(generatedCss);
      } catch (error) {
        console.error('Error loading theme styles:', error);
        // En caso de error, establecer CSS vacío para evitar errores en el renderizado
        setCss('');
      }
    }

    // Cargar estilos al montar el componente o cuando cambien las dependencias
    loadThemeStyles();
  }, [pathname, globalConfig, componentName, selector]);

  // Si no hay CSS, no renderizar nada
  if (!css) {
    return null;
  }

  // Renderizar el CSS en un elemento <style>
  return (
    <style dangerouslySetInnerHTML={{ __html: css }} />
  );
}
