// Script para solucionar problemas de aplicación de temas en todos los componentes públicos
const fs = require('fs');
const path = require('path');

// Función para hacer copia de seguridad de un archivo
function backupFile(filePath) {
  const timestamp = new Date().toISOString().replace(/:/g, '').split('.')[0];
  const backupDir = path.join(process.cwd(), 'backup');
  
  // Crear directorio de backup si no existe
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, `${fileName}.bak.${timestamp}`);
  
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
  
  // Verificar si ya tiene los estilos aplicados
  if (content.includes('style={{') && 
      content.includes('var(--background-value') && 
      content.includes('var(--typography-heading-')) {
    console.log('⚠️ El archivo Header.tsx ya parece tener los estilos aplicados.');
    return true;
  }
  
  // Modificar el contenido para aplicar variables CSS
  let updatedContent = content;
  
  // 1. Modificación del elemento header para usar variables CSS de fondo
  if (!updatedContent.includes('backgroundColor: \'var(--background-value')) {
    updatedContent = updatedContent.replace(
      /<header\s+className={`header-component.*?}[^>]*>/,
      match => {
        if (match.includes('style={{')) {
          return match.replace(/style={{([^}]*)}}/,
            style => {
              return style.replace('}', ', backgroundColor: \'var(--background-value, white)\'}');
            }
          );
        } else {
          return match.replace(/>\s*$/, 
            ' style={{\n        backgroundColor: \'var(--background-value, white)\',\n        backgroundImage: \'var(--background-type) === "image" ? url(var(--background-imageUrl)) : none\'\n      }}>'
          );
        }
      }
    );
  }
  
  // 2. Modificar el texto del sitio para usar tipografía del tema
  if (!updatedContent.includes('fontFamily: \'var(--typography-heading-fontFamily')) {
    updatedContent = updatedContent.replace(
      /<span\s+className="text-lg\s+font-semibold">\s*{\s*siteName\s*}\s*<\/span>/g,
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
  }
  
  // 3. Modificar los enlaces del menú para usar estilos de enlace del tema
  if (!updatedContent.includes('color: \'var(--typography-link-color')) {
    updatedContent = updatedContent.replace(
      /<Link\s+href={.*?}\s+className="transition"[^>]*>/g,
      match => {
        if (match.includes('style={{')) {
          return match;
        } else {
          return match.replace(
            'className="transition"',
            `className="transition"
                      style={{
                        color: 'var(--typography-link-color, #333)',
                        fontFamily: 'var(--typography-link-fontFamily, inherit)',
                        fontSize: 'var(--typography-link-fontSize, inherit)'
                      }}`
          );
        }
      }
    );
  }
  
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
  
  // Verificar si ya tiene los estilos aplicados
  if (content.includes('backgroundColor: \'var(--background-value') && 
      content.includes('color: \'var(--typography-paragraph-color')) {
    console.log('⚠️ El archivo Footer.tsx ya parece tener los estilos aplicados.');
    return true;
  }
  
  // Modificar el contenido para aplicar variables CSS
  let updatedContent = content;
  
  // 1. Modificación del elemento footer para usar variables CSS
  updatedContent = updatedContent.replace(
    /<footer\s+className=(?:"|'|`).*?(?:"|'|`)[^>]*>/g,
    `<footer 
        className={\`footer-component mt-auto \${stickyClass}\`} 
        data-visible="true"
        style={{
          backgroundColor: 'var(--background-value, white)',
          color: 'var(--typography-paragraph-color, inherit)',
          height: footerConfig.height !== 'auto' ? footerConfig.height : 'auto',
          border: 'none' // Eliminar borde verde de depuración
        }}>`
  );
  
  // 2. Si hay un div para contenido HTML secundario, aplica estilos de tipografía
  if (updatedContent.includes('dangerouslySetInnerHTML={{ __html: secondaryHtml }}')) {
    updatedContent = updatedContent.replace(
      /<div\s+className=".*?"\s+dangerouslySetInnerHTML={{ __html: secondaryHtml }}/g,
      `<div 
              className="border-t border-gray-200 pt-6 content-html"
              style={{
                fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
                fontSize: 'var(--typography-paragraph-fontSize, inherit)'
              }}
              dangerouslySetInnerHTML={{ __html: secondaryHtml }}`
    );
  }
  
  // 3. Modificar estilos de las tarjetas widget para usar variables
  if (!updatedContent.includes('--footer-cards-background')) {
    updatedContent = updatedContent.replace(
      /<style>{`[\s\S]*?`}<\/style>/g,
      `<style>{`
                .widget-card {
                  background: var(--footer-cards-background, #f5f5f5);
                  border-radius: var(--footer-cards-borderRadius, 12px);
                  box-shadow: var(--footer-cards-boxShadow, none);
                  border: var(--footer-cards-borderWidth, 1px) solid var(--footer-cards-borderColor, transparent);
                  color: var(--footer-cards-color, inherit);
                  padding: var(--footer-cards-padding, 1rem);
                }
                /* Forzar el fondo, borde y shadow de los hijos a ser transparentes para dejar ver el wrapper */
                .widget-card > * {
                  background: transparent !important;
                  box-shadow: none !important;
                  border: none !important;
                }
              `}</style>`
    );
  }
  
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
  
  // Verificar si ya tiene los estilos aplicados
  if (content.includes('backgroundColor: \'var(--background-value') && 
      content.includes('color: \'var(--typography-paragraph-color')) {
    console.log('⚠️ El archivo Sidebar.tsx ya parece tener los estilos aplicados.');
    return true;
  }
  
  // Modificar el contenido para aplicar variables CSS
  let updatedContent = content;
  
  // 1. Modificación del elemento aside para usar variables CSS
  if (!updatedContent.includes('backgroundColor: \'var(--background-value')) {
    updatedContent = updatedContent.replace(
      /<aside\s+className=(?:"|'|`).*?(?:"|'|`)[^>]*>/g,
      match => {
        if (match.includes('style={{')) {
          // Ya tiene un estilo, agregar las propiedades dentro
          return match.replace(/style={{([^}]*)}}/,
            style => {
              return style.replace('}', `,
              backgroundColor: 'var(--background-value, #f5f5f5)',
              color: 'var(--typography-paragraph-color, inherit)'
            }`);
            }
          );
        } else {
          // No tiene estilo, agregar el bloque completo
          return match.replace(/>$/,
            `
            style={{
              backgroundColor: 'var(--background-value, #f5f5f5)',
              color: 'var(--typography-paragraph-color, inherit)'
            }}
          >`
          );
        }
      }
    );
  }
  
  // 2. Modificar estilos de las tarjetas widget para usar variables
  if (!updatedContent.includes('--sidebar-cards-background')) {
    updatedContent = updatedContent.replace(
      /<style>{`[\s\S]*?`}<\/style>/g,
      `<style>{`
                  .widget-card {
                    background: var(--sidebar-cards-background, #fff);
                    border-radius: var(--sidebar-cards-borderRadius, 12px);
                    box-shadow: var(--sidebar-cards-boxShadow, none);
                    border: var(--sidebar-cards-borderWidth, 1px) solid var(--sidebar-cards-borderColor, #e5e7eb);
                    color: var(--sidebar-cards-color, inherit);
                    padding: var(--sidebar-cards-padding, 1rem);
                    margin-bottom: 1.5rem;
                  }
                `}</style>`
    );
  }
  
  // 3. Si hay un div para contenido HTML personalizado, aplica estilos de tipografía
  if (updatedContent.includes('dangerouslySetInnerHTML={{ __html: customHtml }}')) {
    updatedContent = updatedContent.replace(
      /<div\s+className=".*?"\s+dangerouslySetInnerHTML={{ __html: customHtml }}/g,
      `<div 
                className="content-html"
                style={{
                  fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
                  fontSize: 'var(--typography-paragraph-fontSize, inherit)'
                }}
                dangerouslySetInnerHTML={{ __html: customHtml }}`
    );
  }
  
  // Escribir el archivo modificado
  return writeFile(filePath, updatedContent);
}

// Función para verificar y corregir el app/(public)/layout.tsx
function checkPublicLayout() {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'layout.tsx');
  
  // Leer contenido del archivo
  const content = readFile(filePath);
  if (!content) return false;
  
  // Verificar si contiene transformaciones que deban ser eliminadas
  let needsUpdate = false;
  
  // Verificar bloques de transformación
  if (content.includes("// Convertir del formato de elementos al formato esperado por el componente Header") ||
      content.includes("// Convertir del formato de widgets al formato esperado por el componente Footer") ||
      content.includes("// Convertir del formato de la API al formato esperado por el componente Sidebar")) {
    needsUpdate = true;
    console.log('⚠️ El layout.tsx contiene transformaciones que deben ser eliminadas.');
    console.log('   Por favor, ejecute el script fix-public-layout-transformations.js para corregir este problema.');
  } else {
    console.log('✅ El layout.tsx no contiene transformaciones problemáticas.');
  }
  
  return !needsUpdate;
}

// Función para verificar y corregir el app/(public)/portfolio/page.tsx
function checkPortfolioPage() {
  const filePath = path.join(process.cwd(), 'app', '(public)', 'portfolio', 'page.tsx');
  
  // Si el archivo no existe, no hay nada que hacer
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ No se encontró el archivo portfolio/page.tsx, omitiendo.');
    return true;
  }
  
  // Crear copia de seguridad
  if (!backupFile(filePath)) return false;
  
  // Leer contenido del archivo
  const content = readFile(filePath);
  if (!content) return false;
  
  // Verificar si ya tiene los estilos aplicados
  if (content.includes('backgroundColor: \'var(--background-value') && 
      content.includes('fontFamily: \'var(--typography')) {
    console.log('✅ El archivo portfolio/page.tsx ya tiene los estilos aplicados correctamente.');
    return true;
  }
  
  // Modificar el contenido para aplicar variables CSS
  let updatedContent = content;
  
  // Asegurarse de que está aplicando las variables de CSS
  if (!updatedContent.includes
