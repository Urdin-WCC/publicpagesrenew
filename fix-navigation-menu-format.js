// Script para corregir el formato del menú de navegación
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Corrigiendo formato del menú de navegación...");
    
    // Obtener valor actual
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !result.length || !result[0].navigationMenu) {
      console.log("No se encontró el menú de navegación en la base de datos.");
      return;
    }
    
    const currentMenuRaw = result[0].navigationMenu;
    console.log("Valor actual:");
    console.log(currentMenuRaw);
    
    // Parsear el menú actual (JavaScript puede hacerlo a pesar del formato irregular)
    const menuItems = JSON.parse(currentMenuRaw);
    
    if (!Array.isArray(menuItems)) {
      console.log("El valor actual no es un array válido.");
      return;
    }
    
    // Crear nuevo JSON con formato correcto usando stringify
    const correctJSON = JSON.stringify(menuItems);
    
    // Guardar JSON con formato corregido
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig 
      SET navigationMenu = '${correctJSON.replace(/'/g, "''")}'
      WHERE id = 'global'
    `);
    
    console.log("\nJSON corregido:");
    console.log(JSON.stringify(JSON.parse(correctJSON), null, 2));
    
    console.log("\n✅ Formato corregido y guardado exitosamente.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
