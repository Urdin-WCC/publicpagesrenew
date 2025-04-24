// Script para depurar el menú de navegación: recupera, muestra y analiza en detalle
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("==== Depurando el menú de navegación (debug-navigation-menu.js) ====");

    // 1. Verificar el valor directamente desde la base de datos
    console.log("\n1. VALOR DIRECTO DESDE LA BASE DE DATOS:");
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;

    if (!result || !result.length) {
      console.log("No se encontró la configuración global en la base de datos.");
      return;
    }

    const navigationMenuRaw = result[0].navigationMenu;
    console.log("Valor crudo del campo navigationMenu:");
    console.log(navigationMenuRaw);
    
    // Información sobre el tipo y longitud
    console.log(`\nTipo del valor: ${typeof navigationMenuRaw}`);
    console.log(`Longitud: ${navigationMenuRaw ? navigationMenuRaw.length : 0} caracteres`);

    // 2. Intentar parsear como JSON
    console.log("\n2. ANÁLISIS JSON:");
    try {
      const parsedMenu = JSON.parse(navigationMenuRaw);
      console.log("✅ El valor se puede parsear como JSON válido.");
      console.log(`Tipo después de parsear: ${typeof parsedMenu}`);
      
      if (Array.isArray(parsedMenu)) {
        console.log(`Es un array con ${parsedMenu.length} elementos`);
        
        // Mostrar información detallada de cada elemento
        parsedMenu.forEach((item, index) => {
          console.log(`\nElemento ${index + 1}:`);
          console.log(`- id: ${item.id || 'no definido'}`);
          console.log(`- label: ${item.label || 'no definido'}`);
          console.log(`- target: ${item.target || 'no definido'}`);
          console.log(`- customUrl: ${item.customUrl || 'no definido'}`);
          console.log(`- openInNewTab: ${item.openInNewTab ? 'sí' : 'no'}`);
        });
      } else {
        console.log("⚠️ El valor parseado NO es un array");
        console.log("Contenido:", parsedMenu);
      }
    } catch (error) {
      console.error("❌ Error al parsear JSON:", error.message);
      
      // 3. Verificar problemas comunes en el formato
      console.log("\n3. ANÁLISIS DE PROBLEMAS COMUNES:");
      
      // Verificar si tiene llaves/corchetes de apertura y cierre
      const hasOpeningBracket = navigationMenuRaw && navigationMenuRaw.trim().startsWith('[');
      const hasClosingBracket = navigationMenuRaw && navigationMenuRaw.trim().endsWith(']');
      console.log(`Tiene corchete de apertura '[': ${hasOpeningBracket ? 'Sí ✅' : 'No ❌'}`);
      console.log(`Tiene corchete de cierre ']': ${hasClosingBracket ? 'Sí ✅' : 'No ❌'}`);
      
      // Verificar comas entre elementos
      const hasCommas = navigationMenuRaw && navigationMenuRaw.includes('","');
      console.log(`Contiene comas entre campos: ${hasCommas ? 'Sí ✅' : 'No ❌'}`);
      
      // Verificar si hay comillas dobles juntas (falta de comas)
      const hasMissingCommas = navigationMenuRaw && navigationMenuRaw.includes('""');
      console.log(`Tiene comillas dobles juntas (posible falta de comas): ${hasMissingCommas ? 'Sí ❌' : 'No ✅'}`);
      
      // Mostrar los primeros 200 caracteres con códigos ASCII para detectar caracteres especiales
      if (navigationMenuRaw) {
        console.log("\nAnálisis de caracteres (primeros 200):");
        const sample = navigationMenuRaw.substring(0, 200);
        let charAnalysis = "";
        for (let i = 0; i < sample.length; i++) {
          const char = sample.charAt(i);
          const code = sample.charCodeAt(i);
          charAnalysis += `${char}(${code}) `;
        }
        console.log(charAnalysis);
      }
    }

    // 4. Verificar con la función getGlobalConfig
    console.log("\n4. VERIFICAR CON getGlobalConfig:");
    try {
      // Importar de forma dinámica (ES modules en CommonJS)
      const { getGlobalConfig } = await import('./lib/config.js');
      const config = await getGlobalConfig();
      
      console.log("¿navigationMenu está presente en el objeto config?", config.navigationMenu !== undefined ? 'Sí ✅' : 'No ❌');
      
      if (config.navigationMenu !== undefined) {
        console.log(`Tipo: ${typeof config.navigationMenu}`);
        
        if (typeof config.navigationMenu === 'string') {
          try {
            const menuFromConfig = JSON.parse(config.navigationMenu);
            console.log(`Parseado correctamente: ${Array.isArray(menuFromConfig) ? 'Sí y es array ✅' : 'Sí pero no es array ⚠️'}`);
            console.log("Contenido:", menuFromConfig);
          } catch (e) {
            console.error("❌ No se puede parsear navigationMenu desde config:", e.message);
          }
        } else {
          console.log("El valor ya es un objeto JavaScript (no string):", config.navigationMenu);
        }
      }
    } catch (importError) {
      console.error("Error al importar getGlobalConfig:", importError);
      console.log("Nota: Esta parte no funcionará si el código está en TypeScript sin compilar.");
      console.log("Recomendación: Ejecutar este test en el entorno Next.js con import dinámico.");
    }

  } catch (error) {
    console.error("Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
