/**
 * Test para verificar la sanitización de HTML y manejo de enlaces
 */

// Mock del DOM para pruebas
function createMockDom(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

// Función que simula el proceso de sanitización
function sanitizeHtml(html) {
  const tempDiv = createMockDom(html);
  
  // Procesar todos los enlaces
  const links = tempDiv.querySelectorAll('a');
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    
    // Limpiar y validar href
    if (!href || href === '') {
      link.setAttribute('href', '#');
    } else if (href.includes('<') || href.includes('>')) {
      // Si el href contiene HTML, reemplazarlo con #
      link.setAttribute('href', '#');
    }

    // Manejar enlaces externos
    if (href.startsWith('http') || href.startsWith('//')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    } else {
      // Para enlaces internos, eliminar target si está vacío
      const targetAttr = link.getAttribute('target');
      if (targetAttr === '') {
        link.removeAttribute('target');
      }
    }
  });
  
  return tempDiv.innerHTML;
}

// Casos de prueba
const tests = [
  {
    name: 'Enlaces con target vacío',
    input: '<a href="/page" target="">Internal link</a>',
    expectedOutput: '<a href="/page">Internal link</a>',
    description: 'Debe eliminar el target vacío'
  },
  {
    name: 'Enlaces externos',
    input: '<a href="https://example.com">External link</a>',
    expectedOutput: '<a href="https://example.com" target="_blank" rel="noopener noreferrer">External link</a>',
    description: 'Debe añadir target="_blank" y rel="noopener noreferrer" a enlaces externos'
  },
  {
    name: 'URLs con HTML',
    input: '<a href="/page/<script>alert(1)</script>">Malicious link</a>',
    expectedOutput: '<a href="#">Malicious link</a>',
    description: 'Debe reemplazar URLs maliciosas con #'
  },
  {
    name: 'Links sin href',
    input: '<a>Empty link</a>',
    expectedOutput: '<a href="#">Empty link</a>',
    description: 'Debe añadir href="#" a enlaces sin href'
  },
  {
    name: 'Enlaces con target específico',
    input: '<a href="/page" target="custom">Custom target</a>',
    expectedOutput: '<a href="/page" target="custom">Custom target</a>',
    description: 'Debe mantener targets personalizados'
  }
];

// Ejecutar pruebas
function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  tests.forEach(test => {
    console.log(`\nEjecutando test: ${test.name}`);
    console.log('Descripción:', test.description);
    
    const result = sanitizeHtml(test.input);
    const passed = result === test.expectedOutput;
    
    if (passed) {
      console.log('✅ Test pasado');
      passedTests++;
    } else {
      console.log('❌ Test fallido');
      console.log('Esperado:', test.expectedOutput);
      console.log('Recibido:', result);
      failedTests++;
    }
  });

  console.log('\nResumen de pruebas:');
  console.log(`Total: ${tests.length}`);
  console.log(`Pasadas: ${passedTests}`);
  console.log(`Fallidas: ${failedTests}`);
}

// Ejecutar las pruebas si estamos en un navegador
if (typeof window !== 'undefined') {
  console.log('Iniciando pruebas de sanitización HTML...');
  runTests();
}
