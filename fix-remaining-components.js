// Script para corregir los componentes restantes (Sidebar.tsx y Footer.tsx)
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
  const backupPath = path.join(backupDir, `${fileName}.bak`);
  
  // Comprobar si ya existe un backup para no sobrescribirlo
  if (fs.existsSync(backupPath)) {
    console.log(`✅ Ya existe una copia de seguridad para ${filePath}`);
    return true;
  }
  
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
  
  // Analizamos primero el contenido para ver cómo está formateado el componente
  const asideStartMatch = content.match(/<aside.*?>/);
  if (!asideStartMatch) {
    console.log('⚠️ No se encontró el elemento <aside> en Sidebar.tsx');
    return false;
  }
  
  // Modificar el elemento aside para usar variables CSS
  const updatedContent = content.replace(
    /<aside[^>]*>/,
    `<aside 
      className="sidebar-component h-full overflow-auto"
      style={{
        backgroundColor: 'var(--background-value, #f5f5f5)',
        backgroundImage: 'var(--background-type) === "image" ? \`url(\${var(--background-imageUrl)})\` : "none"',
        color: 'var(--typography-paragraph-color, inherit)',
        width: sidebarConfig?.width || '300px',
        display: sidebarConfig?.visible ? 'block' : 'none'
      }}>`
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
  
  // Analizamos primero el contenido para ver cómo está formateado el componente
  const footerStartMatch = content.match(/<footer.*?>/);
  if (!footerStartMatch) {
    console.log('⚠️ No se encontró el elemento <footer> en Footer.tsx');
    return false;
  }
  
  // Modificar el elemento footer para usar variables CSS
  const updatedContent = content.replace(
    /<footer[^>]*>/,
    `<footer 
      className="footer-component w-full" 
      style={{
        backgroundColor: 'var(--background-value, white)',
        backgroundImage: 'var(--background-type) === "image" ? \`url(\${var(--background-imageUrl)})\` : "none"',
        color: 'var(--typography-paragraph-color, inherit)',
        minHeight: footerConfig?.height || 'auto'
      }}>`
  );
  
  // Escribir el archivo modificado
  return writeFile(filePath, updatedContent);
}

// Función principal
function main() {
  console.log('🔧 Corrigiendo los componentes restantes...');
  
  // Modificar los componentes
  const sidebarSuccess = modifySidebar();
  const footerSuccess = modifyFooter();
  
  if (sidebarSuccess && footerSuccess) {
    console.log('✅ Todos los componentes restantes han sido actualizados correctamente');
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
