/**
 * Script para ejecutar todas las pruebas relacionadas con el sistema de categorías
 * Este script ejecuta una serie de pruebas para verificar el correcto funcionamiento
 * del sistema de categorías en blog y portfolio
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Lista de scripts de prueba a ejecutar
const testScripts = [
  {
    name: 'Blog - Categoría Única',
    script: 'test-blog-single-category.js',
    description: 'Verifica la funcionalidad de categoría única en el blog'
  },
  {
    name: 'Blog - API Categorías',
    script: 'test-blog-api-categories.js',
    description: 'Prueba los endpoints API de blog para categorías'
  },
  {
    name: 'Portfolio - API Categorías',
    script: 'test-portfolio-public-vs-admin.js',
    description: 'Prueba acceso a categorías en Portfolio en vista pública vs. admin'
  }
];

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Función para ejecutar un script
async function runTest(testInfo) {
  console.log(`\n${colors.bright}${colors.blue}======================================${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}EJECUTANDO: ${testInfo.name}${colors.reset}`);
  console.log(`${colors.blue}${testInfo.description}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}======================================${colors.reset}\n`);

  try {
    const { stdout, stderr } = await execPromise(`node ${testInfo.script}`);
    
    if (stderr) {
      console.error(`${colors.red}ERROR EN ${testInfo.name}:${colors.reset}\n${stderr}`);
      return false;
    }
    
    console.log(stdout);
    console.log(`\n${colors.green}✅ Prueba ${testInfo.name} completada exitosamente${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}ERROR EJECUTANDO ${testInfo.name}:${colors.reset}\n`, error);
    return false;
  }
}

// Función principal para ejecutar todas las pruebas
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.magenta}============================================${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}SISTEMA DE PRUEBAS DE CATEGORÍAS BLOG/PORTFOLIO${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}============================================${colors.reset}\n`);

  const results = [];
  
  // Verifica si el servidor está en ejecución
  console.log(`${colors.cyan}Verificando si el servidor está en ejecución...${colors.reset}`);
  try {
    const response = await fetch('http://localhost:3000/api/blog');
    if (!response.ok) {
      console.warn(`${colors.yellow}⚠️ La API devolvió estado ${response.status}. Algunas pruebas podrían fallar.${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Servidor detectado en http://localhost:3000${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}❌ No se pudo conectar al servidor. Asegúrate de que la aplicación esté en ejecución con 'npm run dev'.${colors.reset}`);
    console.log(`${colors.yellow}Algunas pruebas que necesitan el servidor API podrían fallar.${colors.reset}\n`);
  }

  // Ejecutar cada prueba
  for (const test of testScripts) {
    const success = await runTest(test);
    results.push({ name: test.name, success });
  }

  // Mostrar resumen de resultados
  console.log(`\n${colors.bright}${colors.cyan}====================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}RESUMEN DE RESULTADOS${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================${colors.reset}\n`);

  let allPassed = true;
  results.forEach(result => {
    if (result.success) {
      console.log(`${colors.green}✅ ${result.name}: PASÓ${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ ${result.name}: FALLÓ${colors.reset}`);
      allPassed = false;
    }
  });

  console.log(`\n${allPassed ? colors.green + '✅ TODAS LAS PRUEBAS PASARON' : colors.red + '❌ ALGUNAS PRUEBAS FALLARON'}${colors.reset}`);

  // Recordatorio de documentación
  console.log(`\n${colors.yellow}ℹ️ Documentación disponible en:${colors.reset}`);
  console.log(`${colors.yellow}  - docs/blog-categorias-solucion.md${colors.reset}`);
  console.log(`${colors.yellow}  - docs/ui-category-updates.md${colors.reset}`);
}

// Ejecutar todas las pruebas
runAllTests().catch(error => {
  console.error(`${colors.red}Error ejecutando las pruebas:${colors.reset}`, error);
});
