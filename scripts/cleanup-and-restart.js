/**
 * Cleanup and Restart Script for Public Interface
 * 
 * Este script ayuda a limpiar y reiniciar el entorno de desarrollo cuando
 * hay problemas con la interfaz pública.
 * 
 * Uso:
 * node scripts/cleanup-and-restart.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

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

// Limpiar la caché
async function clearCaches() {
  // Limpiar caché de Next.js
  log('\n🧹 Limpiando caché de Next.js...', colors.cyan);
  
  const nextCacheDir = path.join(process.cwd(), '.next/cache');
  if (fs.existsSync(nextCacheDir)) {
    try {
      log('Eliminando el directorio .next/cache');
      execCommand('rm -rf ./.next/cache');
    } catch (error) {
      log(`Error al eliminar la caché de Next.js: ${error.message}`, colors.red);
    }
  } else {
    log('El directorio de caché de Next.js no existe, omitiendo...', colors.yellow);
  }
}

// Reiniciar servidor de desarrollo
async function restartDev() {
  log('\n🔄 Reiniciando servidor de desarrollo...', colors.cyan);
  
  // Verificar si hay procesos en ejecución
  const isWindows = process.platform === 'win32';
  const processCommand = isWindows
    ? `tasklist /FI "IMAGENAME eq node.exe" /FO CSV | findstr /i "next dev"`
    : `ps aux | grep "next dev" | grep -v grep`;

  // Intentar detener procesos existentes
  try {
    if (isWindows) {
      execCommand('taskkill /f /im node.exe /fi "WINDOWTITLE eq next dev"', true);
    } else {
      execCommand('pkill -f "next dev"', true);
    }
    log('Procesos antiguos detenidos.', colors.green);
  } catch (error) {
    log('No se encontraron procesos para detener o no se pudieron detener.', colors.yellow);
  }

  // Iniciar nuevo proceso de desarrollo
  log('\n▶️ Iniciando el servidor de desarrollo con --turbo');
  const startCommand = os.platform() === 'win32'
    ? 'start cmd /k "npm run dev"'
    : 'npm run dev &';
  
  // En entornos de producción, este comando podría fallar
  // Es principalmente para desarrollo local
  try {
    execCommand(startCommand);
    log('✅ Servidor de desarrollo iniciado correctamente.', colors.green);
  } catch (error) {
    log('⚠️ No se pudo iniciar el servidor de desarrollo automáticamente.', colors.yellow);
    log('Por favor, ejecuta "npm run dev" manualmente.', colors.yellow);
  }
}

// Verificar estructura de tema
async function checkThemeStructure() {
  log('\n🔍 Verificando estructura de temas...', colors.cyan);

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Obtener configuración global
    const config = await prisma.$queryRaw`
      SELECT 
        themeAssignments, 
        defaultLightThemePresetId,
        defaultDarkThemePresetId
      FROM GlobalConfig 
      WHERE id = 'global'
    `;

    if (!config || !Array.isArray(config) || config.length === 0) {
      log('⚠️ No se encontró la configuración global.', colors.yellow);
      return;
    }

    const globalConfig = config[0];
    
    // Verificar themeAssignments
    log('\nEstructura de asignaciones de temas:');
    if (!globalConfig.themeAssignments) {
      log('⚠️ No hay asignaciones de tema definidas.', colors.yellow);
    } else {
      try {
        const themeAssignments = typeof globalConfig.themeAssignments === 'string'
          ? JSON.parse(globalConfig.themeAssignments)
          : globalConfig.themeAssignments;

        log(JSON.stringify(themeAssignments, null, 2), colors.blue);

        // Verificar estructura
        if (themeAssignments.header) {
          log('✅ Formato directo encontrado para header', colors.green);
        } else if (themeAssignments.components?.header) {
          log('✅ Formato components.header encontrado', colors.green);
        } else {
          log('⚠️ No se encontró configuración para header', colors.yellow);
        }

        if (themeAssignments.footer) {
          log('✅ Formato directo encontrado para footer', colors.green);
        } else if (themeAssignments.components?.footer) {
          log('✅ Formato components.footer encontrado', colors.green);
        } else {
          log('⚠️ No se encontró configuración para footer', colors.yellow);
        }

        if (themeAssignments.sidebar) {
          log('✅ Formato directo encontrado para sidebar', colors.green);
        } else if (themeAssignments.components?.sidebar) {
          log('✅ Formato components.sidebar encontrado', colors.green);
        } else {
          log('⚠️ No se encontró configuración para sidebar', colors.yellow);
        }
      } catch (error) {
        log(`❌ Error al parsear themeAssignments: ${error.message}`, colors.red);
        log(`Raw themeAssignments: ${globalConfig.themeAssignments}`, colors.yellow);
      }
    }

    // Verificar temas predeterminados
    log('\nTemas predeterminados:');
    log(`Light Theme ID: ${globalConfig.defaultLightThemePresetId || 'No definido'}`, 
        globalConfig.defaultLightThemePresetId ? colors.green : colors.yellow);
    log(`Dark Theme ID: ${globalConfig.defaultDarkThemePresetId || 'No definido'}`,
        globalConfig.defaultDarkThemePresetId ? colors.green : colors.yellow);

    // Cerrar conexión Prisma
    await prisma.$disconnect();

  } catch (error) {
    log(`❌ Error al verificar la estructura de temas: ${error.message}`, colors.red);
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Reparar asignaciones de tema (arreglar formato si es necesario)
async function repairThemeAssignments() {
  log('\n🔧 Reparando asignaciones de tema...', colors.cyan);

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Obtener configuración global
    const config = await prisma.$queryRaw`
      SELECT themeAssignments 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;

    if (!config || !Array.isArray(config) || config.length === 0) {
      log('⚠️ No se encontró la configuración global.', colors.yellow);
      return;
    }

    const globalConfig = config[0];
    
    if (!globalConfig.themeAssignments) {
      log('No hay asignaciones de tema para reparar.', colors.yellow);
      return;
    }

    // Parsear asignaciones existentes
    const themeAssignments = typeof globalConfig.themeAssignments === 'string'
      ? JSON.parse(globalConfig.themeAssignments)
      : globalConfig.themeAssignments;

    // Crear una estructura limpia
    let repaired = {};

    // Migrar desde formato antiguo a nuevo si es necesario
    if (themeAssignments.components) {
      log('🔄 Convirtiendo de formato antiguo (components) a formato directo...', colors.blue);
      
      // Copiar componentes al nivel superior
      if (themeAssignments.components.header) {
        repaired.header = themeAssignments.components.header;
      }
      
      if (themeAssignments.components.footer) {
        repaired.footer = themeAssignments.components.footer;
      }
      
      if (themeAssignments.components.sidebar) {
        repaired.sidebar = themeAssignments.components.sidebar;
      }

      // Mantener routes si existe
      if (themeAssignments.routes) {
        repaired.routes = themeAssignments.routes;
      }
    } else {
      log('El formato ya es adecuado, solo limpiando...', colors.blue);
      
      // Copiar componentes existentes
      if (themeAssignments.header) {
        repaired.header = themeAssignments.header;
      }
      
      if (themeAssignments.footer) {
        repaired.footer = themeAssignments.footer;
      }
      
      if (themeAssignments.sidebar) {
        repaired.sidebar = themeAssignments.sidebar;
      }
      
      if (themeAssignments.routes) {
        repaired.routes = themeAssignments.routes;
      }
    }

    // Asegurarse de que cada componente tenga valores light/dark
    ['header', 'footer', 'sidebar'].forEach(component => {
      if (repaired[component]) {
        repaired[component] = {
          light: repaired[component].light || null,
          dark: repaired[component].dark || null,
          ...repaired[component]
        };
      }
    });

    // Guardar la nueva estructura en la base de datos
    const repairedJson = JSON.stringify(repaired, null, 2);
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET themeAssignments = ?
      WHERE id = 'global'
    `, repairedJson);

    log('✅ Asignaciones de tema reparadas correctamente.', colors.green);

  } catch (error) {
    log(`❌ Error al reparar asignaciones de tema: ${error.message}`, colors.red);
  } finally {
    await prisma.$disconnect();
  }
}

// Función principal
async function main() {
  log('\n🚀 Iniciando limpieza y reinicio del entorno...', colors.green);

  // Verificar estructura de tema
  await checkThemeStructure();

  // Preguntar si desea reparar asignaciones de tema
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\n¿Desea reparar las asignaciones de tema? (s/n) ', async (answer) => {
    if (answer.toLowerCase() === 's') {
      await repairThemeAssignments();
    } else {
      log('Omitiendo reparación de asignaciones de tema.', colors.yellow);
    }
    
    // Continuar con el resto del proceso
    await clearCaches();
    await restartDev();
    
    log('\n✨ Proceso completado. La interfaz pública debería funcionar correctamente ahora.\n', colors.green);
    rl.close();
  });
}

// Ejecutar la función principal
main().catch(console.error);
