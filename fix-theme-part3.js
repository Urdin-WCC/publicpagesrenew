// Tercera parte del script para solucionar problemas de aplicación de temas en Footer
const fs = require('fs');
const path = require('path');
const { backupFile, readFile, writeFile } = require('./fix-theme-part1');

// Función para modificar el Footer.tsx
function modifyFooter() {
  const filePath = path.join(process.cwd(), 'components', 'public', 'Footer.tsx');
  
  // Crear copia de seguridad
  if (!backupFile(filePath)) return false;
  
  // Leer contenido del archivo
  const content = readFile(filePath);
  if (!content) return false;
  
  // Verificar si ya tiene los estilos aplicados
  if (content.includes('backgroundColor: \'var(--background-value')
      && content.includes('color: \'var(--typography-paragraph-color')) {
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
      `<style>{
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
              }</style>`
    );
  }
  
  // Escribir el archivo modificado
  return writeFile(filePath, updatedContent);
}

// Ejecutar la función si se llama directamente
if (require.main === module) {
  const success = modifyFooter();
  if (success) {
    console.log('✅ Footer.tsx modificado con éxito');
  } else {
    console.error('❌ Error al modificar Footer.tsx');
  }
}

// Exportar función
module.exports = { modifyFooter };
