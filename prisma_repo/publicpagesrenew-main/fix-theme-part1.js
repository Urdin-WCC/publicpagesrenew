// Primera parte del script para solucionar problemas de aplicación de temas
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

// Exportar funciones comunes
module.exports = {
  backupFile,
  readFile,
  writeFile
};
