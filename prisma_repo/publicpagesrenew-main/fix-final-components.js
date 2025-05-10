// Script final para implementar solución completa de temas
const fs = require('fs');
const path = require('path');

// Función para hacer copia de seguridad de un archivo
function backupFile(filePath) {
  const backupDir = path.join(process.cwd(), 'backup');
  
  // Crear directorio de backup si no existe
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, `${fileName}.bak.${Date.now()}`);
  
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

// Función para modificar el Sidebar.tsx
function modifySidebar() {
  const filePath = path.join(process.cwd(), 'components', 'public', 'Sidebar.tsx');
  
  // Crear copia de seguridad
  if (!backupFile(filePath)) return false;
  
  // Leer contenido del archivo
  const content = readFile(filePath);
  if (!content) return false;
  
  // Buscar el patrón del elemento <aside> actual
  const asidePattern = /<aside\s+className={\`sidebar-component\s+\$\{sidebarConfig\.backgroundColor\}\s+\$\{sidebarConfig\.textColor\}\s+\$\{widthClass\}.*?\}/s;
  if (!asidePattern.test(content)) {
    console.log('⚠️ Patrón de <aside> no encontrado en Sidebar.tsx. El archivo puede tener un formato diferente.');
    return false;
  }
  
  // Reemplazar con la nueva versión que utiliza variables CSS
  const updatedContent = content.replace(
    asidePattern,
    `<aside 
      className={\`sidebar-component \${widthClass} p-4 \${positionClasses} \${className}\`}
      data-position={position}
      data-visible="true"
      style={{
        backgroundColor: 'var(--background-value, #f5f5f5)',
        backgroundImage: 'var(--background-type) === "image" ? \`url(var(--background-imageUrl))\` : "none"',
        color: 'var(--typography-paragraph-color, inherit)'
      }}`
  );
  
  // Si hay un div para contenido HTML personalizado, aplicar estilos de tipografía
  const finalContent = updatedContent.replace(
    /<div\s+className="content-html"\s+dangerouslySetInnerHTML/g,
    `<div 
            className="content-html"
            style={{
              fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
              fontSize: 'var(--typography-paragraph-fontSize, inherit)'
            }}
            dangerouslySetInnerHTML`
  );
  
  // Escribir el archivo modificado
  return writeFile(filePath, finalContent);
}

// Función para modificar el Footer.tsx
function modifyFooter() {
  const filePath = path.join(process.cwd(), 'components', 'public', 'Footer.tsx');
  
  // Crear copia de seguridad
  if (!backupFile(filePath)) return false;
  
  // Leer contenido del archivo
  const content = readFile(filePath);
  if (!content) return false;
  
  // Buscar el patrón del elemento <footer> actual
  const footerPattern = /<footer\s+className={\`footer-component\s+\$\{footerConfig\.backgroundColor\}\s+\$\{footerConfig\.textColor\}.*?\}/s;
  if (!footerPattern.test(content)) {
    console.log('⚠️ Patrón de <footer> no encontrado en Footer.tsx. El archivo puede tener un formato diferente.');
    return false;
  }
  
  // Reemplazar con la nueva versión que utiliza variables CSS
  let updatedContent = content.replace(
    footerPattern,
    `<footer 
        className={\`footer-component border-t border-gray-200 mt-auto \${stickyClass}\`} 
        data-visible="true"
        style={{
          backgroundColor: 'var(--background-value, white)',
          backgroundImage: 'var(--background-type) === "image" ? \`url(var(--background-imageUrl))\` : "none"',
          color: 'var(--typography-paragraph-color, inherit)',
          height: footerConfig.height !== 'auto' ? footerConfig.height : 'auto'
        }}`
  );
  
  // Si hay un div para contenido HTML secundario, aplicar estilos de tipografía
  updatedContent = updatedContent.replace(
    /<div\s+className="mb-6 content-html"\s+dangerouslySetInnerHTML/g,
    `<div 
              className="mb-6 content-html"
              style={{
                fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
                fontSize: 'var(--typography-paragraph-fontSize, inherit)'
              }}
              dangerouslySetInnerHTML`
  );
  
  // Si hay un div para copyright, aplicar estilos de tipografía
  updatedContent = updatedContent.replace(
    /<div className="text-center text-sm">/g,
    `<div className="text-center text-sm" style={{ 
              fontFamily: 'var(--typography-paragraph-fontFamily, inherit)', 
              fontSize: 'var(--typography-paragraph-fontSize, 14px)'
            }}>`
  );
  
  // Escribir el archivo modificado
  return writeFile(filePath, updatedContent);
}

// Función para verificar que el Header.tsx tenga estilos aplicados
function checkHeader() {
  const filePath = path.join(process.cwd(), 'components', 'public', 'Header.tsx');
  const content = readFile(filePath);
  
  if (!content) return false;
  
  // Verificar si ya tiene style={{backgroundColor:
  const hasStylesApplied = content.includes('style={{') && content.includes('backgroundColor: \'var(--background-value');
  
  return hasStylesApplied;
}

// Función principal
function main() {
  console.log('🔧 Iniciando implementación final de la solución para temas...');
  
  // Verificar el Header
  const headerHasStyles = checkHeader();
  console.log(`📝 Header: ${headerHasStyles ? '✅ Ya tiene estilos aplicados' : '❌ No tiene estilos aplicados'}`);
  
  // Modificar los componentes
  const sidebarSuccess = modifySidebar();
  const footerSuccess = modifyFooter();
  
  if (sidebarSuccess && footerSuccess) {
    console.log('✅ Todos los componentes han sido actualizados correctamente');
    
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
