/**
 * Script para hacer una copia de seguridad completa del proyecto en un repositorio GitHub
 * 
 * Este script automatiza el proceso de:
 * 1. Inicializar un repositorio Git local si no existe
 * 2. Añadir todos los archivos al staging
 * 3. Crear un commit con un mensaje descriptivo
 * 4. Configurar el repositorio remoto
 * 5. Subir los cambios al repositorio remoto
 * 
 * Uso: node scripts/backup-to-github.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Función para imprimir mensajes con colores
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Configuración del repositorio
const REPO_URL = 'https://github.com/Urdin-WCC/publicpagesrenew.git';
const BRANCH_NAME = 'main';
const COMMIT_MESSAGE = 'Backup completo antes de implementar cambios en la interfaz pública';

// Función para ejecutar comandos con manejo de errores
function execCommand(command, suppressOutput = false) {
  try {
    const options = suppressOutput ? { stdio: 'ignore' } : { stdio: 'inherit' };
    execSync(command, options);
    return true;
  } catch (error) {
    if (!suppressOutput) {
      log(`Error ejecutando: ${command}`, colors.red);
      log(error.message, colors.red);
    }
    return false;
  }
}

// Función principal
async function main() {
  log('\n🚀 Iniciando copia de seguridad a GitHub...', colors.green);
  
  // 1. Verificar si ya existe un repositorio Git
  const isGitRepo = fs.existsSync(path.join(process.cwd(), '.git'));
  
  if (!isGitRepo) {
    log('\n📦 Inicializando repositorio Git...', colors.blue);
    if (!execCommand('git init')) {
      log('❌ Error al inicializar repositorio Git. Abortando.', colors.red);
      process.exit(1);
    }
  } else {
    log('✅ Repositorio Git ya existe.', colors.green);
  }
  
  // 2. Verificar estado actual
  log('\n🔍 Verificando estado actual del repositorio...', colors.blue);
  execCommand('git status');
  
  // 3. Añadir todos los archivos al staging
  log('\n📋 Añadiendo archivos al staging...', colors.blue);
  if (!execCommand('git add .')) {
    log('❌ Error al añadir archivos. Abortando.', colors.red);
    process.exit(1);
  }
  
  // 4. Crear commit
  log('\n💾 Creando commit...', colors.blue);
  if (!execCommand(`git commit -m "${COMMIT_MESSAGE}"`)) {
    log('⚠️ No se pudo crear el commit, posiblemente no hay cambios o hay problemas con la configuración de Git.', colors.yellow);
    // Continuamos de todos modos, ya que podría ser solo que no hay cambios nuevos
  }
  
  // 5. Configurar repositorio remoto
  log('\n🔗 Configurando repositorio remoto...', colors.blue);
  
  // Verificar si ya existe el remoto "origin"
  try {
    const remotes = execSync('git remote').toString().trim().split('\n');
    
    if (remotes.includes('origin')) {
      // Actualizar URL del remoto existente
      log('Actualizando URL del remoto "origin"...', colors.blue);
      if (!execCommand(`git remote set-url origin ${REPO_URL}`)) {
        log('❌ Error al actualizar URL del remoto. Abortando.', colors.red);
        process.exit(1);
      }
    } else {
      // Agregar nuevo remoto
      log('Agregando nuevo remoto "origin"...', colors.blue);
      if (!execCommand(`git remote add origin ${REPO_URL}`)) {
        log('❌ Error al añadir remoto. Abortando.', colors.red);
        process.exit(1);
      }
    }
  } catch (error) {
    log('Error verificando remotos:', colors.red);
    log(error.message, colors.red);
    process.exit(1);
  }
  
  // 6. Subir cambios al repositorio remoto
  log('\n☁️ Subiendo cambios a GitHub...', colors.blue);
  if (!execCommand(`git push -u origin ${BRANCH_NAME}`)) {
    log('\n⚠️ Error al subir cambios. Intentando forzar el push...', colors.yellow);
    
    if (!execCommand(`git push -u origin ${BRANCH_NAME} --force`)) {
      log('❌ Error al forzar el push. Revisa credenciales o permisos.', colors.red);
      
      // Sugerir comandos manuales
      log('\n🔧 Puedes intentar manualmente:', colors.cyan);
      log(`git push -u origin ${BRANCH_NAME} --force`, colors.reset);
      
      process.exit(1);
    }
  }
  
  log('\n✅ Copia de seguridad completada con éxito!', colors.green);
  log(`Repositorio: ${REPO_URL}`, colors.cyan);
  log(`Rama: ${BRANCH_NAME}`, colors.cyan);
  log('\n🚀 Ahora puedes proceder con la implementación de los cambios en la interfaz pública.', colors.green);
}

// Ejecutar la función principal
main().catch(console.error);
