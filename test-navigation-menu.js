// Script para probar la actualización del campo navigationMenu
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Probando actualización del campo navigationMenu...");
    
    // Datos de prueba para el menú
    const testMenu = [
      {
        id: "menu-item-test",
        label: "Prueba",
        target: "home",
        customUrl: "",
        openInNewTab: false
      }
    ];
    
    // Convertir a string JSON para almacenamiento
    const menuJson = JSON.stringify(testMenu);
    
    // Intentar actualizar primero con el cliente Prisma
    console.log("Método 1: Intentando actualizar con cliente Prisma...");
    try {
      await prisma.globalConfig.update({
        where: { id: 'global' },
        data: { 
          navigationMenu: menuJson,
          updatedAt: new Date()
        }
      });
      console.log("¡Actualización exitosa con cliente Prisma!");
    } catch (prismaError) {
      console.error("Error con cliente Prisma:", prismaError);
      
      // Si falla, intentar con SQL directo
      console.log("\nMétodo 2: Intentando actualizar con SQL directo...");
      try {
        // Escapar comillas simples
        const escapedJson = menuJson.replace(/'/g, "''");
        
        const updateQuery = `
          UPDATE GlobalConfig 
          SET navigationMenu = '${escapedJson}',
              updatedAt = '${new Date().toISOString()}'
          WHERE id = 'global'
        `;
        
        await prisma.$executeRawUnsafe(updateQuery);
        console.log("¡Actualización exitosa con SQL directo!");
      } catch (sqlError) {
        console.error("Error con SQL directo:", sqlError);
      }
    }
    
    // Verificar que se haya guardado correctamente
    console.log("\nVerificando resultado...");
    
    // Usar SQL directo para verificar también
    console.log("Consultando con SQL directo:");
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    console.log("\nResultado de la base de datos:");
    console.log(result);
  } catch (error) {
    console.error("Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
