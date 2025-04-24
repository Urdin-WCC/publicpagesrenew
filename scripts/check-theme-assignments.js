/**
 * Script para verificar y reparar asignaciones de tema
 * 
 * Este script analiza la estructura de themeAssignments en GlobalConfig
 * y verifica que todos los componentes tengan sus asignaciones correctas.
 * 
 * Uso: node scripts/check-theme-assignments.js [--repair]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

// Estructura esperada para las asignaciones de tema
const defaultThemeAssignments = {
  header: { light: 1, dark: 2 },
  footer: { light: 1, dark: 2 },
  sidebar: { light: 1, dark: 2 },
  routes: {
    '/blog': { light: 3, dark: 4 },
    '/portfolio': { light: 5, dark: 6 },
    '/': { light: 1, dark: 2 }
  }
};

// Verificar asignaciones de tema
async function checkThemeAssignments(repairMode = false) {
  log('\n🔍 Verificando asignaciones de tema...', colors.cyan);

  try {
    // Obtener configuración global
    const configResult = await prisma.$queryRaw`
      SELECT 
        themeAssignments, 
        defaultLightThemePresetId,
        defaultDarkThemePresetId,
        activeThemeId
      FROM GlobalConfig 
      WHERE id = 'global'
    `;

    if (!configResult || !Array.isArray(configResult) || configResult.length === 0) {
      log('❌ Error: No se encontró configuración global.', colors.red);
      return false;
    }

    const globalConfig = configResult[0];
    
    // Verificar temas predeterminados
    log('\n📊 Temas predeterminados:', colors.magenta);
    log(`→ Light Theme ID: ${globalConfig.defaultLightThemePresetId || 'No definido'}`, 
        globalConfig.defaultLightThemePresetId ? colors.green : colors.yellow);
    log(`→ Dark Theme ID: ${globalConfig.defaultDarkThemePresetId || 'No definido'}`,
        globalConfig.defaultDarkThemePresetId ? colors.green : colors.yellow);
    log(`→ Active Theme ID: ${globalConfig.activeThemeId || 'No definido'}`,
        globalConfig.activeThemeId ? colors.green : colors.yellow);
    
    // Verificar existencia de temas
    const themes = await prisma.$queryRaw`
      SELECT id, name 
      FROM ThemePreset
    `;
    
    log('\n📋 Temas disponibles:', colors.magenta);
    if (!themes || !Array.isArray(themes) || themes.length === 0) {
      log('❌ Error: No se encontraron temas en la base de datos.', colors.red);
    } else {
      themes.forEach(theme => {
        log(`→ ID: ${theme.id}, Nombre: ${theme.name}`, colors.green);
      });
    }
    
    // Verificar asignaciones de tema
    log('\n📝 Asignaciones de tema actuales:', colors.magenta);
    let themeAssignmentsRaw = globalConfig.themeAssignments;
    let themeAssignments = null;
    
    try {
      if (typeof themeAssignmentsRaw === 'string') {
        themeAssignments = JSON.parse(themeAssignmentsRaw);
      } else if (themeAssignmentsRaw) {
        themeAssignments = themeAssignmentsRaw;
      }
    } catch (error) {
      log(`❌ Error al parsear themeAssignments: ${error.message}`, colors.red);
      log(`Raw data: ${themeAssignmentsRaw}`, colors.yellow);
      themeAssignments = null;
    }
    
    // Verificar estructura
    if (!themeAssignments || Object.keys(themeAssignments).length === 0) {
      log('❌ No se encontraron asignaciones de tema o están vacías.', colors.red);
      
      if (repairMode) {
        // Crear estructura predeterminada
        log('\n🛠️ Creando estructura predeterminada...', colors.cyan);
        
        // Usar IDs de tema disponibles o predeterminados
        const firstThemeId = themes.length > 0 ? themes[0].id : 1;
        const secondThemeId = themes.length > 1 ? themes[1].id : 2;
        
        const defaultAssignments = {
          header: { 
            light: globalConfig.defaultLightThemePresetId || firstThemeId, 
            dark: globalConfig.defaultDarkThemePresetId || secondThemeId 
          },
          footer: { 
            light: globalConfig.defaultLightThemePresetId || firstThemeId, 
            dark: globalConfig.defaultDarkThemePresetId || secondThemeId 
          },
          sidebar: { 
            light: globalConfig.defaultLightThemePresetId || firstThemeId, 
            dark: globalConfig.defaultDarkThemePresetId || secondThemeId 
          },
          routes: {
            '/': { 
              light: globalConfig.defaultLightThemePresetId || firstThemeId, 
              dark: globalConfig.defaultDarkThemePresetId || secondThemeId 
            }
          }
        };
        
        const assignmentsJson = JSON.stringify(defaultAssignments, null, 2);
        
        // Guardar en la base de datos
        await prisma.$executeRawUnsafe(`
          UPDATE GlobalConfig
          SET themeAssignments = ?
          WHERE id = 'global'
        `, assignmentsJson);
        
        log('✅ Estructura predeterminada creada y guardada.', colors.green);
        log('📝 Nueva estructura:', colors.blue);
        log(assignmentsJson);
        
        return true;
      } else {
        log('⚠️ Ejecute con --repair para crear una estructura predeterminada.', colors.yellow);
        return false;
      }
    }
    
    log('📝 Estructura actual:', colors.blue);
    log(JSON.stringify(themeAssignments, null, 2));
    
    // Verificar componentes
    const componentsToCheck = ['header', 'footer', 'sidebar'];
    let needsRepair = false;
    let repairedAssignments = { ...themeAssignments };
    
    log('\n🔍 Verificando componentes...', colors.cyan);
    for (const component of componentsToCheck) {
      if (!themeAssignments[component]) {
        if (themeAssignments.components && themeAssignments.components[component]) {
          log(`⚠️ ${component}: Encontrado en formato antiguo (components.${component})`, colors.yellow);
          needsRepair = true;
        } else {
          log(`❌ ${component}: No encontrado`, colors.red);
          needsRepair = true;
        }
      } else {
        log(`✅ ${component}: Configuración encontrada`, colors.green);
        
        // Verificar propiedades light/dark
        if (!themeAssignments[component].light) {
          log(`⚠️ ${component}: Falta propiedad 'light'`, colors.yellow);
          needsRepair = true;
        }
        
        if (!themeAssignments[component].dark) {
          log(`⚠️ ${component}: Falta propiedad 'dark'`, colors.yellow);
          needsRepair = true;
        }
      }
    }
    
    // Verificar routes
    log('\n🔍 Verificando rutas...', colors.cyan);
    if (!themeAssignments.routes) {
      log('⚠️ No se encontró configuración de rutas', colors.yellow);
      needsRepair = true;
    } else {
      log('✅ Configuración de rutas encontrada', colors.green);
      
      // Verificar rutas principales
      const mainRoutes = ['/', '/blog', '/portfolio'];
      for (const route of mainRoutes) {
        if (!themeAssignments.routes[route]) {
          log(`⚠️ Ruta '${route}': No encontrada`, colors.yellow);
          needsRepair = true;
        } else {
          log(`✅ Ruta '${route}': Configuración encontrada`, colors.green);
        }
      }
    }
    
    // Reparar si es necesario
    if (needsRepair && repairMode) {
      log('\n🛠️ Reparando asignaciones de tema...', colors.cyan);
      
      // Migrar desde formato antiguo si es necesario
      if (themeAssignments.components) {
        log('🔄 Migrando desde formato antiguo...', colors.blue);
        
        for (const component of componentsToCheck) {
          if (themeAssignments.components[component]) {
            repairedAssignments[component] = themeAssignments.components[component];
          } else if (!repairedAssignments[component]) {
            // Crear entrada predeterminada
            repairedAssignments[component] = {
              light: globalConfig.defaultLightThemePresetId || 1,
              dark: globalConfig.defaultDarkThemePresetId || 2
            };
          }
        }
        
        // Eliminar componentes para evitar duplicación
        delete repairedAssignments.components;
      }
      
      // Asegurarse de que todos los componentes tengan entradas correctas
      for (const component of componentsToCheck) {
        if (!repairedAssignments[component]) {
          repairedAssignments[component] = {
            light: globalConfig.defaultLightThemePresetId || 1,
            dark: globalConfig.defaultDarkThemePresetId || 2
          };
        } else {
          // Asegurarse de que tenga light/dark
          if (!repairedAssignments[component].light) {
            repairedAssignments[component].light = globalConfig.defaultLightThemePresetId || 1;
          }
          
          if (!repairedAssignments[component].dark) {
            repairedAssignments[component].dark = globalConfig.defaultDarkThemePresetId || 2;
          }
        }
      }
      
      // Asegurarse de que exista routes
      if (!repairedAssignments.routes) {
        repairedAssignments.routes = {};
      }
      
      // Asegurarse de que existan rutas principales
      const mainRoutes = ['/', '/blog', '/portfolio'];
      for (const route of mainRoutes) {
        if (!repairedAssignments.routes[route]) {
          repairedAssignments.routes[route] = {
            light: globalConfig.defaultLightThemePresetId || 1,
            dark: globalConfig.defaultDarkThemePresetId || 2
          };
        }
      }
      
      // Guardar asignaciones reparadas
      const repairedJson = JSON.stringify(repairedAssignments, null, 2);
      
      await prisma.$executeRawUnsafe(`
        UPDATE GlobalConfig
        SET themeAssignments = ?
        WHERE id = 'global'
      `, repairedJson);
      
      log('✅ Asignaciones de tema reparadas y guardadas.', colors.green);
      log('📝 Nueva estructura:', colors.blue);
      log(repairedJson);
      
      return true;
      
    } else if (needsRepair) {
      log('⚠️ Se encontraron problemas. Ejecute con --repair para reparar.', colors.yellow);
      return false;
    } else {
      log('✅ Todas las asignaciones de tema están correctas.', colors.green);
      return true;
    }
    
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, colors.red);
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const repairMode = args.includes('--repair');
  
  log('\n🚀 Verificador de asignaciones de tema', colors.green);
  
  if (repairMode) {
    log('🛠️ Modo de reparación activado', colors.yellow);
  } else {
    log('ℹ️ Modo de solo lectura (use --repair para habilitar reparaciones)', colors.blue);
  }
  
  await checkThemeAssignments(repairMode);
  
  log('\n✨ Proceso completado.\n', colors.green);
}

// Ejecutar la función principal
main().catch(console.error);
