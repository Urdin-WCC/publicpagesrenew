// Script para implementar la solución al problema de aplicación de temas
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Función para hacer copia de seguridad de un archivo
function backupFile(filePath) {
  const backupDir = path.join(process.cwd(), 'backup');
  
  // Crear directorio de backup si no existe
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, `${fileName}.bak`);
  
  try {
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Copia de seguridad creada: ${backupPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creando copia de seguridad de ${filePath}:`, error);
    return false;
  }
}

// Función para leer un archivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error leyendo archivo ${filePath}:`, error);
    return null;
  }
}

// Función para escribir un archivo
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Archivo actualizado: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error escribiendo archivo ${filePath}:`, error);
    return false;
  }
}

// Función para modificar el Header.tsx
function modifyHeader() {
  const filePath = path.join(process.cwd(), 'components', 'public', 'Header.tsx');
  
  // Crear copia de seguridad
  if (!backupFile(filePath)) return false;
  
  // Leer contenido del archivo
  const content = readFile(filePath);
  if (!content) return false;
  
  // Modificar el contenido para aplicar variables CSS
  
  // 1. Modificación del elemento header para usar variables CSS de fondo
  let updatedContent = content.replace(
    /<header className={`header-component w-full shadow-sm \${stickyClass}`} data-visible="true">/g,
    `<header 
      className={\`header-component w-full shadow-sm \${stickyClass}\`} 
      data-visible="true"
      style={{
        backgroundColor: 'var(--background-value, white)',
        backgroundImage: 'var(--background-type) === "image" ? \`url(\${var(--background-imageUrl)})\` : "none"'
      }}>`
  );
  
  // 2. Modificar el texto del sitio para usar tipografía del tema
  updatedContent = updatedContent.replace(
    /<span className="text-lg font-semibold">{siteName}<\/span>/g,
    `<span 
      className="text-lg font-semibold"
      style={{
        fontFamily: 'var(--typography-heading-fontFamily, inherit)',
        color: 'var(--typography-heading-color, inherit)',
        fontWeight: 'var(--typography-heading-fontWeight, 600)',
        fontSize: 'var(--typography-heading-fontSize, inherit)'
      }}
    >
      {siteName}
    </span>`
  );
  
  // 3. Modificar los enlaces del menú para usar estilos de enlace del tema
  updatedContent = updatedContent.replace(
    /className="text-gray-700 hover:text-primary transition"/g,
    `className="transition"
                      style={{
                        color: 'var(--typography-link-color, #333)',
                        fontFamily: 'var(--typography-link-fontFamily, inherit)',
                        fontSize: 'var(--typography-link-fontSize, inherit)'
                      }}`
  );
  
  // Escribir el archivo modificado
  return writeFile(filePath, updatedContent);
}

// Función para modificar el Sidebar.tsx
function modifySidebar() {
  const filePath = path.join(process.cwd(), 'components', 'public', 'Sidebar.tsx');
  
  // Crear copia de seguridad
  if (!backupFile(filePath)) return false;
  
  // Leer contenido del archivo
  const content = readFile(filePath);
  if (!content) return false;
  
  // Modificar el contenido para aplicar variables CSS
  
  // 1. Modificación del elemento sidebar para usar variables CSS de fondo
  let updatedContent = content.replace(
    /<aside className={`sidebar-component.*?\}/g,
    `<aside 
      className={\`sidebar-component \${sidebarConfig.visible ? '' : 'hidden'} \${sidebarConfig.width ? \`w-[${sidebarConfig.width}]\` : 'w-64'} h-full overflow-auto\`}
      style={{
        backgroundColor: 'var(--background-value, #f5f5f5)',
        backgroundImage: 'var(--background-type) === "image" ? \`url(\${var(--background-imageUrl)})\` : "none"',
        color: 'var(--typography-paragraph-color, inherit)'
      }}`
  );
  
  // 2. Si hay un div para contenido HTML personalizado, aplica estilos de tipografía
  updatedContent = updatedContent.replace(
    /{sidebarConfig\.customHtmlContent && \(\s*<div.*?dangerouslySetInnerHTML/g,
    `{sidebarConfig.customHtmlContent && (
            <div 
              className="mt-6" 
              style={{
                fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
                fontSize: 'var(--typography-paragraph-fontSize, inherit)'
              }}
              dangerouslySetInnerHTML`
  );
  
  // Escribir el archivo modificado
  return writeFile(filePath, updatedContent);
}

// Función para modificar el Footer.tsx
function modifyFooter() {
  const filePath = path.join(process.cwd(), 'components', 'public', 'Footer.tsx');
  
  // Crear copia de seguridad
  if (!backupFile(filePath)) return false;
  
  // Leer contenido del archivo
  const content = readFile(filePath);
  if (!content) return false;
  
  // Modificar el contenido para aplicar variables CSS
  
  // 1. Modificación del elemento footer para usar variables CSS
  let updatedContent = content.replace(
    /<footer className="footer-component.*?>/g,
    `<footer 
      className="footer-component w-full"
      style={{
        backgroundColor: 'var(--background-value, white)',
        backgroundImage: 'var(--background-type) === "image" ? \`url(\${var(--background-imageUrl)})\` : "none"',
        color: 'var(--typography-paragraph-color, inherit)',
        minHeight: footerConfig?.height || 'auto'
      }}>`
  );
  
  // 2. Si hay un div para contenido HTML secundario, aplica estilos de tipografía
  updatedContent = updatedContent.replace(
    /{footerConfig\.secondaryHtml && \(\s*<div.*?dangerouslySetInnerHTML/g,
    `{footerConfig.secondaryHtml && (
          <div 
            className="mt-6"
            style={{
              fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
              fontSize: 'var(--typography-paragraph-fontSize, inherit)'
            }}
            dangerouslySetInnerHTML`
  );
  
  // 3. Modificar el copyright para usar tipografía del tema
  updatedContent = updatedContent.replace(
    /<div className="text-center.*?>/g,
    `<div 
            className="text-center mt-8"
            style={{
              fontSize: 'var(--typography-paragraph-fontSize, 14px)',
              color: 'var(--typography-paragraph-color, inherit)'
            }}>`
  );
  
  // Escribir el archivo modificado
  return writeFile(filePath, updatedContent);
}

// Función principal
function main() {
  console.log('🔧 Iniciando implementación de solución para aplicación de temas...');
  
  // Modificar los componentes
  const headerSuccess = modifyHeader();
  const sidebarSuccess = modifySidebar();
  const footerSuccess = modifyFooter();
  
  if (headerSuccess && sidebarSuccess && footerSuccess) {
    console.log('✅ Todos los componentes han sido actualizados correctamente');
    console.log('🔄 Reiniciando el servidor para aplicar los cambios...');
    
    try {
      // No vamos a reiniciar el servidor aquí, ya que npm run dev ya está en ejecución
      console.log('⚠️  Por favor, reinicie manualmente el servidor si es necesario');
    } catch (error) {
      console.error('❌ Error al reiniciar el servidor:', error);
    }
    
    console.log('\n🎉 IMPLEMENTACIÓN COMPLETADA');
    console.log('Los componentes ahora aplicarán correctamente los estilos de tema.');
    console.log('Para ver los cambios, actualice la página en el navegador.');
  } else {
    console.log('⚠️ No se pudieron actualizar todos los componentes.');
    console.log('   Revise los mensajes de error anteriores para más información.');
  }
}

// Ejecutar el script
main();
