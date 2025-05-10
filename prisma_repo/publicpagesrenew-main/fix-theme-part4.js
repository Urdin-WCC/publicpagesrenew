// Cuarta parte del script para solucionar problemas de aplicación de temas en Sidebar
const fs = require('fs');
const path = require('path');
const { backupFile, readFile, writeFile } = require('./fix-theme-part1');

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
      `<style>{
                  .widget-card {
                    background: var(--sidebar-cards-background, #fff);
                    border-radius: var(--sidebar-cards-borderRadius, 12px);
                    box-shadow: var(--sidebar-cards-boxShadow, none);
                    border: var(--sidebar-cards-borderWidth, 1px) solid var(--sidebar-cards-borderColor, #e5e7eb);
                    color: var(--sidebar-cards-color, inherit);
                    padding: var(--sidebar-cards-padding, 1rem);
                    margin-bottom: 1.5rem;
                  }
                }</style>`
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

// Ejecutar la función si se llama directamente
if (require.main === module) {
  const success = modifySidebar();
  if (success) {
    console.log('✅ Sidebar.tsx modificado con éxito');
  } else {
    console.error('❌ Error al modificar Sidebar.tsx');
  }
}

// Exportar función
module.exports = { modifySidebar };
