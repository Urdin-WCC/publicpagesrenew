// Script para hacer una copia de seguridad del proyecto en GitHub
// Ejecutar con: node backup-to-github.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para ejecutar comandos y mostrar la salida
function runCommand(command, options = {}) {
  console.log(`\n🚀 Ejecutando: ${command}`);
  try {
    const output = execSync(command, { 
      encoding: 'utf-8', 
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });
    return { success: true, output };
  } catch (error) {
    console.error(`❌ Error al ejecutar el comando: ${error.message}`);
    if (error.stdout) console.log(`Salida estándar: ${error.stdout}`);
    if (error.stderr) console.log(`Salida de error: ${error.stderr}`);
    return { success: false, error };
  }
}

async function backupToGithub() {
  console.log('\n📦 PREPARANDO COPIA DE SEGURIDAD EN GITHUB...');
  
  // 1. Verificar si el directorio actual es un repositorio Git
  console.log('1. Verificando si estamos en un repositorio Git...');
  
  if (!fs.existsSync('.git')) {
    console.log('❌ No estamos en un repositorio Git. Inicializando uno nuevo...');
    runCommand('git init');
  } else {
    console.log('✅ Estamos en un repositorio Git.');
  }
  
  // 2. Verificar el estado actual
  console.log('\n2. Verificando estado actual del repositorio...');
  const statusResult = runCommand('git status --porcelain');
  
  if (statusResult.success) {
    const hasChanges = statusResult.output.trim() !== '';
    
    if (hasChanges) {
      console.log(`✅ Hay cambios para guardar: ${statusResult.output.split('\n').length} archivos modificados.`);
    } else {
      console.log('ℹ️ No hay cambios para guardar.');
      console.log('ℹ️ Puedes continuar o intentar hacer cambios primero.');
    }
  }
  
  // 3. Añadir archivos al área de preparación
  console.log('\n3. Añadiendo archivos al área de preparación...');
  const addResult = runCommand('git add .');
  
  if (addResult.success) {
    console.log('✅ Archivos añadidos correctamente.');
  }
  
  // 4. Crear un commit con un mensaje descriptivo
  console.log('\n4. Creando commit con los cambios...');
  
  const commitMessage = 'Actualización: Refactorización del sistema de temas multi-ruta';
  const commitDescription = [
    'Cambios implementados:',
    '- Actualizado modelo ThemePreset para soportar configuraciones light/dark',
    '- Modificado GlobalConfig con nuevos campos para temas y configuraciones UI',
    '- Creado archivo lib/themeUtils.ts con utilidades para el sistema de temas',
    '- Actualizado layout público para usar el nuevo sistema',
    '- Añadida documentación completa en docs/theme-system-refactoring.md',
    '- Actualizado README.md con información sobre el nuevo sistema'
  ].join('\n');
  
  const commitCommand = `git commit -m "${commitMessage}" -m "${commitDescription}"`;
  const commitResult = runCommand(commitCommand);
  
  if (commitResult.success) {
    console.log('✅ Commit creado correctamente.');
    console.log(`   ID del commit: ${commitResult.output.split(' ')[1]}`);
  }
  
  // 5. Verificar si hay un remote configurado
  console.log('\n5. Verificando si hay un repositorio remoto configurado...');
  const remoteResult = runCommand('git remote -v');
  
  let needSetup = !remoteResult.success || !remoteResult.output.includes('origin');
  
  if (needSetup) {
    console.log('ℹ️ No hay un repositorio remoto configurado o no se llama "origin"');
    console.log('ℹ️ Para configurar un repositorio remoto, usa:');
    console.log('   git remote add origin https://github.com/USUARIO/REPOSITORIO.git');
    
    // Preguntar si quiere seguir con push aunque no haya remote
    console.log('\nℹ️ IMPORTANTE: Sin un repositorio remoto configurado no se puede hacer push.');
  } else {
    console.log('✅ Repositorio remoto "origin" configurado correctamente.');
    
    // 6. Push al repositorio remoto
    console.log('\n6. Enviando cambios al repositorio remoto...');
    console.log('   ATENCIÓN: Si es la primera vez, usa "git push -u origin main" en lugar de "git push"');
    
    const pushResult = runCommand('git push', { stdio: 'inherit' });
    
    if (pushResult.success) {
      console.log('✅ Cambios enviados correctamente al repositorio remoto.');
    }
  }
  
  console.log('\n📝 RESUMEN DE LA OPERACIÓN:');
  console.log('• Se han preparado los cambios para el respaldo');
  console.log('• Se ha creado un commit con un mensaje descriptivo');
  
  if (!needSetup) {
    console.log('• Se ha intentado enviar los cambios al repositorio remoto');
  } else {
    console.log('• No se ha podido enviar los cambios porque no hay un repositorio remoto configurado');
    console.log('• Configura un repositorio remoto y luego ejecuta "git push -u origin main"');
  }
  
  console.log('\n✅ COPIA DE SEGURIDAD PREPARADA');
}

// Ejecutar la función
backupToGithub()
  .catch(error => {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  });
