/**
 * Script para demostrar el concepto de estilos con ámbito (scoped CSS) para temas
 * 
 * Este script simplemente genera un archivo HTML de demostración que muestra
 * cómo diferentes componentes pueden usar las mismas propiedades CSS
 * pero con valores diferentes sin interferir entre sí.
 */

const fs = require('fs');
const path = require('path');

// Crear directorio de demo si no existe
const demoDir = path.join(process.cwd(), 'demo');
if (!fs.existsSync(demoDir)) {
  fs.mkdirSync(demoDir, { recursive: true });
}

// HTML demostrando el concepto
const demoHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Demo de Estilos con Ámbito para Temas</title>
  <style>
    /* Estilos globales */
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }
    
    .container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .component {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      width: calc(50% - 40px);
      min-height: 200px;
    }
    
    /* ESTILOS CON ÁMBITO PARA CADA COMPONENTE */
    
    /* Variables CSS para el Header */
    .header-component {
      --bg-color: #4a6da7;
      --text-color: white;
      --link-color: #ffd700;
      --font-family: 'Impact', sans-serif;
      --padding: 20px;
      
      background-color: var(--bg-color);
      color: var(--text-color);
      padding: var(--padding);
      font-family: var(--font-family);
    }
    
    /* Variables CSS para el Sidebar */
    .sidebar-component {
      --bg-color: #f5f5f5;
      --text-color: #333;
      --link-color: #0066cc;
      --font-family: 'Arial', sans-serif;
      --padding: 15px;
      
      background-color: var(--bg-color);
      color: var(--text-color);
      padding: var(--padding);
      font-family: var(--font-family);
    }
    
    /* Variables CSS para el Footer */
    .footer-component {
      --bg-color: #333;
      --text-color: #f0f0f0;
      --link-color: #66ccff;
      --font-family: 'Georgia', serif;
      --padding: 10px;
      
      background-color: var(--bg-color);
      color: var(--text-color);
      padding: var(--padding);
      font-family: var(--font-family);
    }
    
    /* Variables CSS para el Main Content */
    .content-component {
      --bg-color: #fff;
      --text-color: #222;
      --link-color: #cc0066;
      --font-family: 'Tahoma', sans-serif;
      --padding: 25px;
      
      background-color: var(--bg-color);
      color: var(--text-color);
      padding: var(--padding);
      font-family: var(--font-family);
    }
    
    /* Estilos para enlaces dentro de cada componente */
    .component a {
      color: var(--link-color);
      text-decoration: none;
      font-weight: bold;
    }
    
    .component a:hover {
      text-decoration: underline;
    }
    
    pre {
      background-color: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
    }
    
    .explanation {
      margin-bottom: 30px;
      padding: 15px;
      background-color: #f9f9f9;
      border-left: 4px solid #4a6da7;
    }
  </style>
</head>
<body>
  <h1>Demo de Estilos con Ámbito para Temas</h1>
  
  <div class="explanation">
    <p>Esta demo muestra cómo aplicar diferentes estilos a diferentes componentes usando las <strong>mismas propiedades CSS</strong> pero con <strong>valores distintos</strong> para cada componente.</p>
    <p>Cada componente tiene sus propias variables CSS (--bg-color, --text-color, etc.) pero con valores únicos para ese componente.</p>
  </div>
  
  <h2>Componentes con estilos independientes</h2>
  
  <div class="container">
    <div class="component header-component">
      <h3>Header Component</h3>
      <p>Este es un encabezado con su propio tema.</p>
      <p>Tiene fondo azul y texto blanco.</p>
      <a href="#">Un enlace en el header</a>
      <pre>
.header-component {
  --bg-color: #4a6da7;
  --text-color: white;
  --link-color: #ffd700;
  --font-family: 'Impact', sans-serif;
}
      </pre>
    </div>
    
    <div class="component sidebar-component">
      <h3>Sidebar Component</h3>
      <p>Esta es una barra lateral con su propio tema.</p>
      <p>Tiene fondo gris claro y texto oscuro.</p>
      <a href="#">Un enlace en el sidebar</a>
      <pre>
.sidebar-component {
  --bg-color: #f5f5f5;
  --text-color: #333;
  --link-color: #0066cc;
  --font-family: 'Arial', sans-serif;
}
      </pre>
    </div>
    
    <div class="component footer-component">
      <h3>Footer Component</h3>
      <p>Este es un pie de página con su propio tema.</p>
      <p>Tiene fondo oscuro y texto claro.</p>
      <a href="#">Un enlace en el footer</a>
      <pre>
.footer-component {
  --bg-color: #333;
  --text-color: #f0f0f0;
  --link-color: #66ccff;
  --font-family: 'Georgia', serif;
}
      </pre>
    </div>
    
    <div class="component content-component">
      <h3>Content Component</h3>
      <p>Este es el contenido principal con su propio tema.</p>
      <p>Tiene fondo blanco y texto negro.</p>
      <a href="#">Un enlace en el contenido</a>
      <pre>
.content-component {
  --bg-color: #fff;
  --text-color: #222;
  --link-color: #cc0066;
  --font-family: 'Tahoma', sans-serif;
}
      </pre>
    </div>
  </div>
  
  <h2>Explicación de la implementación</h2>
  
  <div class="explanation">
    <p>Lo que hace que esto funcione:</p>
    <ol>
      <li>Cada componente tiene su propia clase CSS (header-component, sidebar-component, etc.)</li>
      <li>Cada componente define las mismas variables CSS (--bg-color, --text-color, etc.) pero con valores diferentes</li>
      <li>Las propiedades CSS reales dentro de cada componente usan esas variables: background-color: var(--bg-color);</li>
      <li>El ámbito de CSS asegura que las variables de un componente no afecten a otros componentes</li>
    </ol>
    <p>En una aplicación Next.js, esto se aplicaría usando clases CSS específicas de componente y inyectando los estilos generados por temas como hemos visto que hace el Header.</p>
  </div>
</body>
</html>
`;

// Escribir el archivo HTML
const demoPath = path.join(demoDir, 'theme-scoped-styles.html');
fs.writeFileSync(demoPath, demoHTML);

console.log(`✅ Demo creado en ${demoPath}`);
console.log(`   Abra este archivo en su navegador para ver la demostración.`);

// Generar las instrucciones para adaptar el sistema actual
const readmeContent = `# Adaptación del Sistema de Temas con Estilos con Ámbito

## Problema identificado

Actualmente el sistema de temas tiene dos problemas principales:

1. El mismo conjunto de variables CSS (--background-value, --typography-heading-color, etc.) se está definiendo tanto a nivel global (en :root) como a nivel de componente (.header-component, etc.)
2. Los componentes no están aplicando activamente esas variables en sus elementos visuales

## Solución propuesta

El enfoque debe ser:

1. **Mantener la generación de tema por componente** - Cada componente debe seguir obteniendo su propia configuración de tema
2. **Aplicar efectivamente esas variables** - Los componentes deben usar las variables CSS en sus estilos

## Pasos de implementación

1. **Modificar generateCssFromThemeConfigs** en themeUtils.ts para generar variables CSS con prefijos específicos para componentes cuando se proporciona un selector.
   Por ejemplo:
   \`\`\`css
/* En lugar de: */
   .header-component {
     --background-value: #4a6da7;
   }
   
   /* Usar: */
   .header-component {
     --header-background-value: #4a6da7;
   }
   
   Y luego aplicar en los estilos del componente:
   background-color: var(--header-background-value);
\`\`\`

2. **Modificar los componentes visualmente**:
   - Header.tsx: Agregar estilos inline que utilicen las variables CSS de tema
   - Footer.tsx: Igual
   - Sidebar.tsx: Igual
   
3. **Mantener un solo lugar para generación de tema por componente**:
   - Eliminar la generación de tema global en layout.tsx
   - Dejar que cada componente genere su propio tema

## Beneficios

- Cada componente puede tener su propio conjunto de variables de tema
- Los cambios de tema en un componente no afectan a otros
- Los temas se aplican correctamente a nivel visual
`;

// Escribir el archivo readme
const readmePath = path.join(demoDir, 'README-theme-implementation.md');
fs.writeFileSync(readmePath, readmeContent);

console.log(`✅ Readme creado en ${readmePath}`);
