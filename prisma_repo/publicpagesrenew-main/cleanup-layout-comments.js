// Script para limpiar los comentarios de transformación en layout.tsx
const fs = require('fs');
const path = require('path');

// Ruta al archivo de layout
const layoutPath = path.join(process.cwd(), 'app', '(public)', 'layout.tsx');

// Crear copia de seguridad
const timestamp = new Date().toISOString().replace(/:/g, '').split('.')[0];
const backupPath = path.join(process.cwd(), 'backup', `layout.tsx.bak.${timestamp}`);
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
  
  // 1. Eliminar comentarios de transformación para el footer
  layoutContent = layoutContent.replace(
    /\/\/\s*La configuraci[óoóò]n del footer puede tener un formato diferente[,]? adaptarla/g,
    "// Usar la configuración del footer desde la API"
  );
  
  layoutContent = layoutContent.replace(
    /\/\/\s*Convertir del formato de widgets al formato esperado por el componente Footer/g,
    "// Configuración del footer"
  );
  
  // 2. Eliminar comentarios de transformación para la sidebar
  layoutContent = layoutContent.replace(
    /\/\/\s*La configuraci[óoóò]n de la barra lateral puede tener un formato diferente[,]? adaptarla/g,
    "// Usar la configuración de la sidebar desde la API"
  );
  
  layoutContent = layoutContent.replace(
    /\/\/\s*Convertir del formato de la API al formato esperado por el componente Sidebar/g,
    "// Configuración de la sidebar"
  );
  
  // 3. Eliminar comentarios de transformación para el header
  layoutContent = layoutContent.replace(
    /\/\/\s*La configuraci[óoóò]n del header puede tener un formato diferente[,]? adaptarla/g,
    "// Usar la configuración del header desde la API"
  );
  
  layoutContent = layoutContent.replace(
    /\/\/\s*Convertir del formato de elementos al formato esperado por el componente Header/g,
    "// Configuración del header"
  );
  
  // 4. Eliminar transformaciones de configuración remanentes
  // Reemplazar cualquier transformación de headerConfig
  layoutContent = layoutContent.replace(
    /\/\/\s*Crear un nuevo objeto de configuración con el formato esperado[\s\S]*?headerConfig\s*=\s*\{[\s\S]*?\};/g,
    "headerConfig = headerConfigResponse;"
  );
  
  // Reemplazar cualquier transformación de footerConfig
  layoutContent = layoutContent.replace(
    /footerConfig\s*=\s*\{[\s\S]*?widgets\s*:[\s\S]*?height\s*:[\s\S]*?secondaryHtml\s*:[\s\S]*?\};/g,
    "footerConfig = footerConfigResponse;"
  );
  
  // Reemplazar cualquier transformación de sidebarConfig
  layoutContent = layoutContent.replace(
    /sidebarConfig\s*=\s*\{[\s\S]*?showWidgets\s*:[\s\S]*?width\s*:[\s\S]*?widgets\s*:[\s\S]*?\};/g,
    "sidebarConfig = sidebarConfigResponse;"
  );
  
  // Escribir el contenido actualizado al archivo
  fs.writeFileSync(layoutPath, layoutContent, 'utf8');
  console.log(`✅ Archivo layout.tsx limpiado correctamente`);
  
  console.log(`
📋 Resumen de cambios:
1. Eliminados comentarios de transformación para el Header, Footer y Sidebar
2. Reemplazados bloques de transformación de configuración remanentes
  `);
  
} catch (error) {
  console.error('❌ Error actualizando layout.tsx:', error);
}
