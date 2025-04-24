// Script para renombrar y consolidar los componentes del menú de navegación
const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'components', 'admin', 'settings');
const originalPath = path.join(basePath, 'NavigationMenuForm.tsx');
const fixedPath = path.join(basePath, 'NavigationMenuFormFixed.tsx');
const backupPath = path.join(basePath, 'NavigationMenuForm.backup.tsx');

// Función principal
function main() {
  try {
    console.log("Iniciando consolidación de componentes de menú de navegación...");
    
    // Verificar que ambos archivos existen
    if (!fs.existsSync(originalPath)) {
      console.error(`Error: No se encuentra el archivo original en ${originalPath}`);
      return;
    }
    
    if (!fs.existsSync(fixedPath)) {
      console.error(`Error: No se encuentra el archivo corregido en ${fixedPath}`);
      return;
    }
    
    // Crear backup del archivo original
    console.log(`Creando backup del archivo original como ${backupPath}`);
    fs.copyFileSync(originalPath, backupPath);
    
    // Copiar el contenido del archivo fijo sobre el original
    console.log("Copiando contenido de NavigationMenuFormFixed.tsx a NavigationMenuForm.tsx");
    const fixedContent = fs.readFileSync(fixedPath, 'utf8');
    fs.writeFileSync(originalPath, fixedContent, 'utf8');
    
    // Actualizar las importaciones en la página que usa el componente
    const pagePath = path.join(__dirname, 'app', '(admin)', 'admin', 'settings', 'menu', 'page.tsx');
    if (fs.existsSync(pagePath)) {
      console.log("Actualizando importación en la página del menú...");
      let pageContent = fs.readFileSync(pagePath, 'utf8');
      pageContent = pageContent.replace(
        /import NavigationMenuForm from "@\/components\/admin\/settings\/NavigationMenuFormFixed";/g,
        'import NavigationMenuForm from "@/components/admin/settings/NavigationMenuForm";'
      );
      fs.writeFileSync(pagePath, pageContent, 'utf8');
    }
    
    // Comprobar si podemos eliminar el archivo fijo
    console.log("¿Desea eliminar el archivo NavigationMenuFormFixed.tsx? (El script no lo eliminará automáticamente)");
    console.log("Para eliminar manualmente, ejecute:");
    console.log(`rm "${fixedPath}"`);
    
    console.log("\n✅ Proceso completado exitosamente.");
    console.log("Ahora NavigationMenuForm.tsx contiene el código de la versión Fixed");
    console.log("Se ha creado un backup del archivo original como NavigationMenuForm.backup.tsx");
  } catch (error) {
    console.error("Error durante el proceso:", error);
  }
}

main();
