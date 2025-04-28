/**
 * Script para verificar que todos los componentes HTML personalizados se renderizan correctamente
 * Este script imprime la configuración actual y ayuda a identificar problemas en la renderización de HTML
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== VERIFICANDO COMPONENTES HTML ===');
  
  // 1. Comprobar HTML en Header
  const headerConfig = await prisma.globalConfig.findFirst({
    select: {
      header: true
    }
  });
  
  if (headerConfig?.header) {
    let config;
    try {
      config = typeof headerConfig.header === 'string' 
        ? JSON.parse(headerConfig.header) 
        : headerConfig.header;
      
      // Buscar elementos HTML
      const htmlElements = config.elements?.filter(el => el.type === 'html' && el.visible);
      
      console.log('\n=== HTML EN HEADER ===');
      console.log(`Elementos HTML encontrados: ${htmlElements?.length || 0}`);
      
      htmlElements?.forEach((el, i) => {
        console.log(`\n[Elemento #${i+1} - Posición: ${el.position}]`);
        if (el.html) {
          // Mostrar una vista previa del HTML (primeras 100 caracteres)
          console.log(`Vista previa HTML: ${el.html.substring(0, 100)}${el.html.length > 100 ? '...' : ''}`);
        } else {
          console.log('Elemento HTML sin contenido definido');
        }
      });
    } catch (error) {
      console.error('Error procesando configuración del header:', error);
    }
  } else {
    console.log('No se encontró configuración para el header');
  }
  
  // 2. Comprobar HTML en Footer
  const footerConfig = await prisma.globalConfig.findFirst({
    select: {
      footer: true
    }
  });
  
  if (footerConfig?.footer) {
    let config;
    try {
      config = typeof footerConfig.footer === 'string' 
        ? JSON.parse(footerConfig.footer) 
        : footerConfig.footer;
      
      console.log('\n=== HTML EN FOOTER ===');
      if (config.secondaryHtml) {
        console.log('HTML secundario encontrado en footer:');
        // Mostrar una vista previa del HTML (primeras 100 caracteres)
        console.log(`Vista previa: ${config.secondaryHtml.substring(0, 100)}${config.secondaryHtml.length > 100 ? '...' : ''}`);
      } else {
        console.log('No hay HTML secundario en footer');
      }
      
      // Buscar widgets HTML personalizados
      const htmlWidgets = config.widgets?.filter(w => w.type === 'custom_html' || w.type === 'WidgetDeveloperHTML');
      
      console.log(`\nWidgets HTML encontrados: ${htmlWidgets?.length || 0}`);
      
      htmlWidgets?.forEach((widget, i) => {
        console.log(`\n[Widget #${i+1} - Título: ${widget.title || 'Sin título'}]`);
        console.log(`Tipo: ${widget.type}`);
        if (widget.content) {
          console.log(`Vista previa contenido: ${widget.content.substring(0, 100)}${widget.content.length > 100 ? '...' : ''}`);
        } else {
          console.log('Widget sin contenido definido');
        }
      });
    } catch (error) {
      console.error('Error procesando configuración del footer:', error);
    }
  } else {
    console.log('No se encontró configuración para el footer');
  }
  
  // 3. Comprobar HTML en Sidebar
  const sidebarConfig = await prisma.globalConfig.findFirst({
    select: {
      sidebar: true
    }
  });
  
  if (sidebarConfig?.sidebar) {
    let config;
    try {
      config = typeof sidebarConfig.sidebar === 'string' 
        ? JSON.parse(sidebarConfig.sidebar) 
        : sidebarConfig.sidebar;
      
      console.log('\n=== WIDGETS HTML EN SIDEBAR ===');
      
      // Buscar widgets HTML personalizados
      const htmlWidgets = config.widgets?.filter(w => w.type === 'custom_html' || w.type === 'WidgetDeveloperHTML');
      
      console.log(`Widgets HTML encontrados: ${htmlWidgets?.length || 0}`);
      
      htmlWidgets?.forEach((widget, i) => {
        console.log(`\n[Widget #${i+1} - Título: ${widget.title || 'Sin título'}]`);
        console.log(`Tipo: ${widget.type}`);
        if (widget.content) {
          console.log(`Vista previa contenido: ${widget.content.substring(0, 100)}${widget.content.length > 100 ? '...' : ''}`);
        } else {
          console.log('Widget sin contenido definido');
        }
      });
    } catch (error) {
      console.error('Error procesando configuración del sidebar:', error);
    }
  } else {
    console.log('No se encontró configuración para el sidebar');
  }
  
  // Nota: Según el esquema, el campo developerHtmlContent ya no existe en el modelo GlobalConfig
  console.log('\n=== DEVELOPER HTML ===');
  console.log('Campo developerHtmlContent no encontrado en el modelo GlobalConfig');
  
  console.log('\n=== FIN DE LA VERIFICACIÓN ===');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
