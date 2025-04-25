// Script para mostrar cómo aplicar correctamente los estilos de tema en los componentes
const fs = require('fs');
const path = require('path');

// Crear directorio de ejemplos si no existe
const examplesDir = path.join(process.cwd(), 'examples');
if (!fs.existsSync(examplesDir)) {
  fs.mkdirSync(examplesDir, { recursive: true });
}

/**
 * EJEMPLO: HEADER COMPONENT
 * 
 * Este ejemplo muestra cómo modificar el componente Header para que use las variables CSS
 * generadas por generateCssFromThemeConfigs
 */
const headerExampleTSX = `
// Ejemplo modificado de Header.tsx que aplica variables CSS de tema correctamente

export default async function Header({
  siteName = translations.common.appName,
  logoUrl: globalLogoUrl,
  config,
  stickyClass = '',
  globalConfig,
  pathname = '/'
}: HeaderProps) {
  
  // [MANTENER] Obtener temas específicos para el componente Header en la ruta actual
  const { lightConfig, darkConfig } = globalConfig 
    ? await getThemeConfigsForComponent('header', pathname, globalConfig)
    : { lightConfig: null, darkConfig: null };
  
  // [MANTENER] Generar CSS para los temas específicos del Header con su selector
  const headerThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.header-component');
  
  // ... resto del código ...
  
  // [MODIFICAR] Función renderHeaderElement para usar variables CSS de tema
  const renderHeaderElement = (element: HeaderElementConfig | null) => {
    if (!element) return null;
    
    switch (element.type) {
      case 'logo':
        return (
          <div className="header-element logo-element">
            <Link href="/" className="flex items-center">
              {/* Logo implementation... */}
            </Link>
          </div>
        );
      
      case 'text':
        return (
          <div className="header-element text-element">
            {/* [MODIFICAR] Aplicar las variables de tema a los estilos */}
            <span 
              className="text-lg font-semibold"
              style={{
                fontFamily: 'var(--typography-heading-fontFamily)',
                color: 'var(--typography-heading-color)',
                fontWeight: 'var(--typography-heading-fontWeight)',
                fontSize: 'var(--typography-heading-fontSize)'
              }}
            >
              {siteName}
            </span>
          </div>
        );
      
      case 'menu':
        return (
          <div className="header-element menu-element">
            <nav className="hidden md:block">
              <ul className="flex space-x-4">
                {navItems.map((item: NavMenuItem, index: number) => (
                  <li key={item.id || \`nav-\${index}\`}>
                    {/* [MODIFICAR] Aplicar las variables de tema a los enlaces */}
                    <Link 
                      href={item.url!}
                      className="transition"
                      style={{
                        color: 'var(--typography-link-color)',
                        fontFamily: 'var(--typography-link-fontFamily)',
                        fontSize: 'var(--typography-link-fontSize)'
                      }}
                      target={item.openInNewTab ? "_blank" : undefined}
                      rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        );
      
      // ... otros casos ...
    }
  };

  return (
    <>
      {/* [MANTENER] Inyectar CSS para los temas específicos del header */}
      {headerThemeCSS && (
        <style id="header-theme-css" dangerouslySetInnerHTML={{ __html: headerThemeCSS }} />
      )}
      
      {/* [MODIFICAR] Aplicar variables CSS al elemento header */}
      <header 
        className={\`header-component w-full shadow-sm \${stickyClass}\`} 
        data-visible="true"
        style={{
          backgroundColor: 'var(--background-value, white)',
          // Si el tipo de fondo es imagen, aplica la imagen de fondo
          backgroundImage: 'var(--background-type) === "image" ? url(var(--background-imageUrl)) : none'
        }}
      >
        <div className="container mx-auto px-4 py-3">
          {/* Resto del componente... */}
        </div>
      </header>
    </>
  );
}
`;

/**
 * EJEMPLO: SIDEBAR COMPONENT
 * 
 * Este ejemplo muestra cómo modificar el componente Sidebar para que use las variables CSS
 */
const sidebarExampleTSX = `
// Ejemplo modificado de Sidebar.tsx que aplica variables CSS de tema correctamente

export default async function Sidebar({ 
  config, 
  globalConfig, 
  pathname = '/' 
}: SidebarProps) {
  
  // [MANTENER] Obtener temas específicos para el componente Sidebar
  const { lightConfig, darkConfig } = globalConfig 
    ? await getThemeConfigsForComponent('sidebar', pathname, globalConfig)
    : { lightConfig: null, darkConfig: null };
  
  // [MANTENER] Generar CSS para los temas específicos del Sidebar
  const sidebarThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.sidebar-component');
  
  // Parsear la configuración del sidebar
  const sidebarConfig = parseSidebarConfig(config);
  
  // Renderizar widgets
  const renderWidgets = () => {
    // ... (código existente)
  };
  
  return (
    <>
      {/* [MANTENER] Inyectar CSS para los temas específicos del sidebar */}
      {sidebarThemeCSS && (
        <style id="sidebar-theme-css" dangerouslySetInnerHTML={{ __html: sidebarThemeCSS }} />
      )}
      
      {/* [MODIFICAR] Aplicar variables CSS al elemento sidebar */}
      <aside 
        className={\`sidebar-component w-\${sidebarConfig.width || '300px'} h-full overflow-auto\`}
        style={{
          backgroundColor: 'var(--background-value, #f5f5f5)',
          backgroundImage: 'var(--background-type) === "image" ? url(var(--background-imageUrl)) : none',
          color: 'var(--typography-paragraph-color, #333)'
        }}
      >
        <div className="p-4">
          {sidebarConfig.showWidgets && renderWidgets()}
          
          {/* [MODIFICAR] Aplicar variables CSS al contenido personalizado */}
          {sidebarConfig.customHtmlContent && (
            <div 
              className="mt-6" 
              style={{
                fontFamily: 'var(--typography-paragraph-fontFamily)',
                fontSize: 'var(--typography-paragraph-fontSize)'
              }}
              dangerouslySetInnerHTML={{ __html: sidebarConfig.customHtmlContent }} 
            />
          )}
        </div>
      </aside>
    </>
  );
}
`;

/**
 * EJEMPLO: FOOTER COMPONENT
 */
const footerExampleTSX = `
// Ejemplo modificado de Footer.tsx que aplica variables CSS de tema correctamente

export default async function Footer({ 
  config, 
  globalConfig, 
  pathname = '/' 
}: FooterProps) {
  
  // [MANTENER] Obtener temas específicos para el componente Footer
  const { lightConfig, darkConfig } = globalConfig 
    ? await getThemeConfigsForComponent('footer', pathname, globalConfig)
    : { lightConfig: null, darkConfig: null };
  
  // [MANTENER] Generar CSS para los temas específicos del Footer
  const footerThemeCSS = generateCssFromThemeConfigs(lightConfig, darkConfig, '.footer-component');
  
  // Parsear la configuración del footer
  const footerConfig = parseFooterConfig(config);
  
  return (
    <>
      {/* [MANTENER] Inyectar CSS para los temas específicos del footer */}
      {footerThemeCSS && (
        <style id="footer-theme-css" dangerouslySetInnerHTML={{ __html: footerThemeCSS }} />
      )}
      
      {/* [MODIFICAR] Aplicar variables CSS al elemento footer */}
      <footer 
        className="footer-component w-full" 
        style={{
          backgroundColor: 'var(--background-value, white)',
          backgroundImage: 'var(--background-type) === "image" ? url(var(--background-imageUrl)) : none',
          color: 'var(--typography-paragraph-color, black)',
          minHeight: footerConfig.height || 'auto'
        }}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Contenido del footer... */}
          
          {/* [MODIFICAR] Aplicar variables CSS a los elementos del footer */}
          {footerConfig.secondaryHtml && (
            <div 
              className="mt-6"
              style={{
                fontFamily: 'var(--typography-paragraph-fontFamily)',
                fontSize: 'var(--typography-paragraph-fontSize)'
              }}
              dangerouslySetInnerHTML={{ __html: footerConfig.secondaryHtml }}
            />
          )}
          
          {/* Copyright */}
          {footerConfig.showCopyright && (
            <div 
              className="text-center mt-8"
              style={{
                fontSize: 'var(--typography-paragraph-fontSize, 14px)',
                color: 'var(--typography-paragraph-color, inherit)'
              }}
            >
              &copy; {new Date().getFullYear()} {translations.common.appName}. {translations.footer.allRightsReserved}
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
`;

/**
 * DOCUMENTACIÓN SOBRE CÓMO APLICAR LA SOLUCIÓN
 */
const implementationGuideMD = `# Guía de Implementación: Aplicación de Temas en Componentes

## Problema Identificado

Cada componente (Header, Sidebar, Footer) está generando correctamente sus variables CSS específicas, pero no las está usando en su estructura HTML/CSS. 

Por ejemplo, un componente genera:
\`\`\`css
.header-component {
  --background-value: #4a6da7;
  --typography-heading-color: #ffffff;
}
\`\`\`

Pero no usa estas variables en sus elementos:
\`\`\`jsx
<header className="header-component">
  <!-- No usa var(--background-value) para su fondo -->
</header>
\`\`\`

## Solución

La solución tiene dos partes:

1. Mantener la generación actual de variables CSS en cada componente
2. Aplicar esas variables CSS a los elementos HTML mediante la propiedad \`style\`

## Pasos Concretos por Componente

### Header.tsx

1. **Mantener la generación de CSS y su inyección:**
   \`\`\`jsx
   const { lightConfig, darkConfig
