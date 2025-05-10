// Segunda parte del script para solucionar problemas de aplicación de temas en Header
const fs = require('fs');
const path = require('path');
const { backupFile, readFile, writeFile } = require('./fix-theme-part1');

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

// Ejecutar la función si se llama directamente
if (require.main === module) {
  const success = modifyHeader();
  if (success) {
    console.log('✅ Header.tsx modificado con éxito');
  } else {
    console.error('❌ Error al modificar Header.tsx');
  }
}

// Exportar función
module.exports = { modifyHeader };
