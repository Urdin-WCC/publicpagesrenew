// Script principal para orquestar la solución de problemas de aplicación de temas
const fs = require('fs');
const path = require('path');
const { modifyHeader } = require('./fix-theme-part2');
const { modifyFooter } = require('./fix-theme-part3');
const { modifySidebar } = require('./fix-theme-part4');

// Función para verificar y corregir el app/(public)/layout.tsx
function checkPublicLayout() {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'layout.tsx');
  
  // Leer contenido del archivo
  try {
    const content = fs.readFileSync(filePath, 'utf8');
  
    // Verificar si contiene transformaciones que deban ser eliminadas
    if (content.includes("// Convertir del formato de elementos al formato esperado por el componente Header") ||
        content.includes("// Convertir del formato de widgets al formato esperado por el componente Footer") ||
        content.includes("// Convertir del formato de la API al formato esperado por el componente Sidebar")) {
      console.log('⚠️ El layout.tsx contiene transformaciones que deben ser eliminadas.');
      console.log('📄 Por favor, ejecute el siguiente comando para corregir el layout:');
      console.log('   node fix-public-layout-transformations.js');
      return false;
    } else {
      console.log('✅ El layout.tsx no contiene transformaciones problemáticas.');
      return true;
    }
  } catch (error) {
    console.error(`❌ Error leyendo layout.tsx: ${error.message}`);
    return false;
  }
}

// Función principal para ejecutar todas las correcciones
async function main() {
  console.log('🔧 Iniciando script de corrección de temas en componentes públicos...');
  console.log('=================================================================');
  
  // Verificar el layout primero
  console.log('\n📋 Verificando el layout público...');
  const layoutOk = checkPublicLayout();
  if (!layoutOk) {
    console.log('⚠️ Debe corregir el layout antes de continuar.');
    console.log('⚠️ Después de ejecutar fix-public-layout-transformations.js, vuelva a ejecutar este script.');
    return;
  }
  
  // Modificar los componentes uno por uno para evitar problemas de memoria
  console.log('\n📋 Modificando Header.tsx...');
  if (modifyHeader()) {
    console.log('✅ Header.tsx modificado correctamente.');
  } else {
    console.log('❌ Error al modificar Header.tsx.');
  }
  
  console.log('\n📋 Modificando Footer.tsx...');
  if (modifyFooter()) {
    console.log('✅ Footer.tsx modificado correctamente.');
  } else {
    console.log('❌ Error al modificar Footer.tsx.');
  }
  
  console.log('\n📋 Modificando Sidebar.tsx...');
  if (modifySidebar()) {
    console.log('✅ Sidebar.tsx modificado correctamente.');
  } else {
    console.log('❌ Error al modificar Sidebar.tsx.');
  }
  
  console.log('\n=================================================================');
  console.log('🎉 Proceso de corrección finalizado.');
  console.log('📝 Se han realizado las siguientes acciones:');
  console.log('   - Verificado el layout.tsx');
  console.log('   - Modificado Header.tsx para usar variables CSS de tema');
  console.log('   - Modificado Footer.tsx para usar variables CSS de tema');
  console.log('   - Modificado Sidebar.tsx para usar variables CSS de tema');
  console.log('\n📞 Instrucciones para probar los cambios:');
  console.log('   1. Reinicie el servidor Next.js');
  console.log('   2. Visite diferentes páginas públicas para verificar que los componentes');
  console.log('      muestran correctamente los estilos de tema.');
  console.log('   3. Compruebe que se están aplicando los colores, fuentes y otros estilos');
  console.log('      definidos en los temas asignados.');
}

// Ejecutar el script principal
main().catch(error => {
  console.error('❌ Error inesperado:', error);
});
