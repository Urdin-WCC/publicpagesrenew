// Script para verificar la implementación correcta de temas en los componentes
const fs = require('fs');
const path = require('path');

// Función para leer un archivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error leyendo archivo ${filePath}:`, error);
    return null;
  }
}

// Función para verificar si un componente está aplicando estilos CSS variables
function checkComponentStyling(filePath, componentName) {
  const content = readFile(filePath);
  if (!content) return false;
  
  // Verificar si tiene style={{ y hace referencia a una variable CSS
  const hasInlineStyles = content.includes('style={{') && 
    (content.includes('var(--background-value') || 
     content.includes('var(--typography'));
  
  // Verificar si inyecta CSS específico para el componente
  const hasThemeInjection = content.includes('generateCssFromThemeConfigs') && 
    content.includes('dangerouslySetInnerHTML={{ __html: ');
  
  return {
    name: componentName,
    hasInlineStyles,
    hasThemeInjection,
    isCorrectlyImplemented: hasInlineStyles && hasThemeInjection
  };
}

// Rutas de los componentes a verificar
const componentsToVerify = [
  { path: path.join(process.cwd(), 'components', 'public', 'Header.tsx'), name: 'Header' },
  { path: path.join(process.cwd(), 'components', 'public', 'Footer.tsx'), name: 'Footer' },
  { path: path.join(process.cwd(), 'components', 'public', 'Sidebar.tsx'), name: 'Sidebar' },
];

// Verificar todos los componentes
console.log('🔍 Verificando implementación de temas en componentes...\n');
const results = componentsToVerify.map(component => checkComponentStyling(component.path, component.name));

// Mostrar resultados
results.forEach(result => {
  const status = result.isCorrectlyImplemented ? '✅ CORRECTO' : '❌ INCOMPLETO';
  const details = [
    `Estilos inline usando variables CSS: ${result.hasInlineStyles ? '✅' : '❌'}`,
    `Inyección de CSS específico: ${result.hasThemeInjection ? '✅' : '❌'}`
  ].join('\n    ');
  
  console.log(`${status} - ${result.name}:`);
  console.log(`    ${details}`);
});

// Comprobar si todos están correctamente implementados
const allImplemented = results.every(r => r.isCorrectlyImplemented);

console.log('\n▶️ Resultado final:');
if (allImplemented) {
  console.log('✅ Todos los componentes implementan correctamente la aplicación de temas.');
  console.log('   La aplicación web ahora debería mostrar correctamente los temas asignados a cada componente.');
} else {
  console.log('⚠️ Algunos componentes no implementan correctamente la aplicación de temas.');
  console.log('   Revise los detalles arriba para hacer las correcciones necesarias.');
}
