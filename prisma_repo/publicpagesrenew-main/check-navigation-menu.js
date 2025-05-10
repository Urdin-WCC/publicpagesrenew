// Script para verificar el formato actual del menú de navegación
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Verificando formato actual del menú de navegación...");
    
    // Obtener el valor actual
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !result.length || !result[0].navigationMenu) {
      console.log("No hay datos de menú o la columna navigationMenu está vacía.");
      return;
    }
    
    const currentMenu = result[0].navigationMenu;
    console.log("Valor actual del menú:");
    console.log(currentMenu);
    
    // Verificar si contiene comas entre campos
    const hasCommas = currentMenu.includes('","') || currentMenu.includes(', "');
    console.log("\n¿El JSON contiene comas entre campos?", hasCommas ? "SÍ ✅" : "NO ❌");
    
    // Verificar si contiene comillas dobles juntas (lo que indicaría falta de comas)
    const hasMissingCommas = currentMenu.includes('""');
    console.log("¿El JSON tiene comillas dobles juntas (indicando falta de comas)?", hasMissingCommas ? "SÍ ❌" : "NO ✅");
    
    // Reescribir como JSON formateado para mostrar claramente
    try {
      const parsedMenu = JSON.parse(currentMenu);
      console.log("\nEstructura del menú parseado:");
      const jsonString = JSON.stringify(parsedMenu, null, 2);
      console.log(jsonString);

      // Verificar si la cadena JSON resultante tiene comas
      const jsonHasCommas = jsonString.includes(',');
      console.log("\n¿El JSON reconstruido contiene comas?", jsonHasCommas ? "SÍ ✅" : "NO ❌");

      console.log("\nRealizar comprobación más explícita consultando un campo directamente:");
      console.log("Primer elemento id:", parsedMenu[0].id);
      console.log("Primer elemento label:", parsedMenu[0].label);
    } catch (parseError) {
      console.error("Error al parsear el JSON:", parseError);
      console.log("El JSON actual NO es válido X");
    }
  } catch (error) {
    console.error("Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
