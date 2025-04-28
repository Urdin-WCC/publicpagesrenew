/**
 * Script para convertir imágenes de fondo de temas a formato .img
 * Este script realiza las siguientes operaciones:
 * 1. Verifica si existen imágenes en public/images/backgrounds/
 * 2. Si existen, crea copias con extensión .img
 * 3. No elimina los originales para mantener compatibilidad
 */

const fs = require('fs');
const path = require('path');

// Directorio donde se encuentran los fondos
const backgroundsDir = path.join(__dirname, 'public', 'images', 'backgrounds');

// Función principal
async function convertBackgrounds() {
  console.log('Iniciando conversión de imágenes de fondo...');
  
  try {
    // Verificar si existe el directorio
    if (!fs.existsSync(backgroundsDir)) {
      console.log('El directorio de fondos no existe, creando...');
      fs.mkdirSync(backgroundsDir, { recursive: true });
      console.log('Directorio creado. No hay imágenes para convertir.');
      return;
    }
    
    // Leer archivos en el directorio
    const files = fs.readdirSync(backgroundsDir);
    console.log(`Encontrados ${files.length} archivos en ${backgroundsDir}`);
    
    // Filtrar solo imágenes
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    });
    
    console.log(`Encontradas ${imageFiles.length} imágenes de fondo`);
    
    // Convertir cada imagen
    for (const file of imageFiles) {
      const filePath = path.join(backgroundsDir, file);
      const fileBaseName = path.basename(file, path.extname(file));
      
      // Solo procesar archivos que comiencen con "main-" o "card-"
      if (fileBaseName.startsWith('main-') || fileBaseName.startsWith('card-')) {
        const imgFilePath = path.join(backgroundsDir, `${fileBaseName}.img`);
        
        // Verificar si ya existe el archivo .img
        if (fs.existsSync(imgFilePath)) {
          console.log(`El archivo ${fileBaseName}.img ya existe, omitiendo...`);
          continue;
        }
        
        // Leer el archivo original
        const fileData = fs.readFileSync(filePath);
        
        // Escribir el mismo contenido con la extensión .img
        fs.writeFileSync(imgFilePath, fileData);
        console.log(`Convertido: ${file} -> ${fileBaseName}.img`);
      }
    }
    
    console.log('Conversión completada con éxito.');
  } catch (error) {
    console.error('Error durante la conversión:', error);
  }
}

// Ejecutar la función principal
convertBackgrounds();
