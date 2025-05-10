// Script para corregir las transformaciones en el layout público
const fs = require('fs');
const path = require('path');

// Ruta al archivo de layout
const layoutPath = path.join(process.cwd(), 'app', '(public)', 'layout.tsx');

// Crear copia de seguridad
const backupPath = path.join(process.cwd(), 'backup', 'layout.tsx');
try {
  // Asegurarse de que existe el directorio de backup
  if (!fs.existsSync(path.join(process.cwd(), 'backup'))) {
    fs.mkdirSync(path.join(process.cwd(), 'backup'), { recursive: true });
  }

  fs.copyFileSync(layoutPath, backupPath);
  console.log(`✅ Se ha creado una copia de seguridad en ${backupPath}`);
} catch (backupError) {
  console.error('❌ Error creando copia de seguridad:', backupError);
  process.exit(1);
}

// Leer el contenido del archivo
try {
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  console.log(`📝 Archivo layout.tsx leído correctamente (${layoutContent.length} bytes)`);
  
  // 1. Corregir transformación de headerConfig
  // Reemplazar el bloque que convierte la configuración del header
  const headerTransformBlock = `// La configuración del header puede tener un formato diferente, adaptarla
    if (headerConfigResponse && headerConfigResponse.elements) {
      // Convertir del formato de elementos al formato esperado por el componente Header
      const elements = headerConfigResponse.elements;
      
      // Extraer valores relevantes de los elementos
      const logoElement = elements.find((e: any) => e.type === 'logo');
      const socialElement = elements.find((e: any) => e.type === 'social');
      const textElement = elements.find((e: any) => e.type === 'text');
      
      // Crear un nuevo objeto de configuración con el formato esperado
      headerConfig = {
        showLogo: logoElement?.visible ?? true,
        showSiteName: textElement?.visible ?? true,
        showSocialIcons: socialElement?.visible ?? true,
        logoUrl: logoElement?.logoUrl,
        backgroundColor: 'white', // Valores predeterminados
        textColor: 'black',
        socialIcons: [] // Llenar esto si hay información disponible
      };`;
  
  const headerDirectBlock = `// Usar la configuración del header directamente como viene de la API
    if (headerConfigResponse) {
      // Pasar la configuración completa sin transformar
      headerConfig = headerConfigResponse;
      
      console.log('Header config from API (no transformation):', headerConfig);
    }`;
  
  layoutContent = layoutContent.replace(headerTransformBlock, headerDirectBlock);
  
  // 2. Corregir transformación de footerConfig
  // Reemplazar el bloque que convierte la configuración del footer
  const footerTransformBlock = `// La configuración del footer puede tener un formato diferente, adaptarla
    if (footerConfigResponse) {
      // Convertir del formato de widgets al formato esperado por el componente Footer
      footerConfig = {
        widgets: footerConfigResponse.widgets || [],
        height: footerConfigResponse.height || 'auto',
        secondaryHtml: footerConfigResponse.secondaryHtml || '',
        backgroundColor: 'white', // Valores predeterminados
        textColor: 'black'
      };`;
  
  const footerDirectBlock = `// Usar la configuración del footer directamente como viene de la API
    if (footerConfigResponse) {
      // Pasar la configuración completa sin transformar
      footerConfig = footerConfigResponse;
      
      console.log('Footer config from API (no transformation):', footerConfig);
    }`;
  
  layoutContent = layoutContent.replace(footerTransformBlock, footerDirectBlock);
  
  // 3. Corregir transformación de sidebarConfig
  // Reemplazar el bloque que convierte la configuración de la barra lateral
  const sidebarTransformBlock = `// La configuración de la barra lateral puede tener un formato diferente, adaptarla
    if (sidebarConfigResponse) {
      // Convertir del formato de la API al formato esperado por el componente Sidebar
      sidebarConfig = {
        showWidgets: true,
        customHtmlContent: '',
        backgroundColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        width: sidebarConfigResponse.width || 'w-64',
        widgets: sidebarConfigResponse.widgets || [],
        visible: sidebarConfigResponse.visible !== false
      };`;
  
  const sidebarDirectBlock = `// Usar la configuración de la barra lateral directamente como viene de la API
    if (sidebarConfigResponse) {
      // Pasar la configuración completa sin transformar
      sidebarConfig = sidebarConfigResponse;
      
      console.log('Sidebar config from API (no transformation):', sidebarConfig);
    }`;
  
  layoutContent = layoutContent.replace(sidebarTransformBlock, sidebarDirectBlock);
  
  // 4. Corregir la forma en que se pasan los widgets al Footer
  // Eliminar widgets={footerSection?.widgets || []} para evitar duplicidades
  const footerComponentLine = `<Footer 
            widgets={footerSection?.widgets || []}
            text={config?.siteName ? \`© \${new Date().getFullYear()} \${config.siteName}. Todos los derechos reservados.\` : undefined}
            config={footerConfig}
            stickyClass={stickyClasses.footer}
            globalConfig={config}
            pathname="/"
          />`;
          
  const footerComponentFixed = `<Footer 
            text={config?.siteName ? \`© \${new Date().getFullYear()} \${config.siteName}. Todos los derechos reservados.\` : undefined}
            config={footerConfig}
            stickyClass={stickyClasses.footer}
            globalConfig={config}
            pathname="/"
          />`;
          
  layoutContent = layoutContent.replace(footerComponentLine, footerComponentFixed);
  
  // 5. Corregir la forma en que se pasan menuItems al Header
  // Eliminar menuItems={headerSection?.menuItems || []} para evitar duplicidades
  const headerComponentLine = `<Header 
            menuItems={headerSection?.menuItems || []}
            siteName={config?.siteName || "Neurowitch"}
            logoUrl={config?.logoUrl}
            config={headerConfig}
            stickyClass={stickyClasses.header}
            globalConfig={config}
            pathname="/"
          />`;
          
  const headerComponentFixed = `<Header 
            siteName={config?.siteName || "Neurowitch"}
            logoUrl={config?.logoUrl}
            config={headerConfig}
            stickyClass={stickyClasses.header}
            globalConfig={config}
            pathname="/"
          />`;
          
  layoutContent = layoutContent.replace(headerComponentLine, headerComponentFixed);

  // Escribir el contenido actualizado al archivo
  fs.writeFileSync(layoutPath, layoutContent, 'utf8');
  console.log(`✅ Archivo layout.tsx actualizado correctamente`);
  
  console.log(`
📋 Resumen de cambios:
1. Eliminada transformación de configuración del header
2. Eliminada transformación de configuración del footer
3. Eliminada transformación de configuración de la barra lateral
4. Eliminado paso de widgets duplicados al Footer
5. Eliminado paso de menuItems duplicados al Header

La configuración ahora se pasa directamente a los componentes sin transformaciones intermedias.
  `);
  
} catch (error) {
  console.error('❌ Error actualizando layout.tsx:', error);
}
