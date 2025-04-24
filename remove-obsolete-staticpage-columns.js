// Script para eliminar columnas obsoletas de la tabla StaticPage
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Columnas a eliminar:
 * - menuOrder (ya no necesaria con el nuevo menú de navegación)
 * - includeInMenu (ya no necesaria con el nuevo menú de navegación)
 * - isVisible (ahora gestionado por la protección de páginas en el CMS)
 */

async function main() {
  try {
    console.log("=== Eliminación de columnas obsoletas de la tabla StaticPage ===\n");
    
    // 1. Ver qué columnas existen en la tabla
    console.log("Verificando columnas existentes...");
    const columns = await prisma.$queryRaw`SHOW COLUMNS FROM StaticPage`;
    const existingColumns = columns.map(c => c.Field);
    console.log("Columnas existentes:", existingColumns.join(", "));
    
    // 2. Definir las columnas obsoletas a eliminar
    const obsoleteColumns = [
      'menuOrder',
      'includeInMenu',
      'isVisible'
    ];
    
    // 3. Filtrar solo las columnas que existen
    const columnsToRemove = obsoleteColumns.filter(col => existingColumns.includes(col));
    
    if (columnsToRemove.length === 0) {
      console.log("\n✅ No se encontraron columnas obsoletas para eliminar.");
      rl.close();
      return;
    }
    
    // 4. Hacer una copia de seguridad de los datos antes de eliminar
    console.log("\nHaciendo copia de seguridad de los datos antes de eliminar las columnas...");
    const backupResult = await prisma.$queryRaw`
      SELECT id, title, slug, ${prisma.$raw(columnsToRemove.join(', '))}
      FROM StaticPage
      ORDER BY id ASC
    `;
    
    console.log("\n=== Copia de seguridad de datos ===");
    console.log(JSON.stringify(backupResult, null, 2));
    console.log("=== Fin de la copia de seguridad ===\n");
    
    // 5. Advertencia y confirmación
    console.log(`\n⚠️ ATENCIÓN: Se eliminarán las siguientes columnas: ${columnsToRemove.join(', ')}`);
    console.log("Esta operación no se puede deshacer.");
    console.log("Los datos se han guardado como copia de seguridad en la consola.");
    
    // Solicitar confirmación
    rl.question('\n¿Estás seguro de que deseas eliminar estas columnas? (sí/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'sí' && answer.toLowerCase() !== 'si') {
        console.log("\n❌ Operación cancelada por el usuario.");
        rl.close();
        return;
      }
      
      // 6. Eliminar las columnas una a una
      console.log("\nEliminando columnas obsoletas...");
      for (const column of columnsToRemove) {
        try {
          console.log(`Eliminando columna: ${column}`);
          await prisma.$executeRawUnsafe(`ALTER TABLE StaticPage DROP COLUMN ${column}`);
          console.log(`✅ Columna ${column} eliminada exitosamente.`);
        } catch (error) {
          console.error(`Error al eliminar la columna ${column}:`, error);
        }
      }
      
      console.log("\n=== Proceso completado ===");
      console.log("Las columnas obsoletas han sido eliminadas de la tabla StaticPage.");
      
      // Verificar estructura final
      console.log("\nVerificando estructura final de la tabla...");
      const finalColumns = await prisma.$queryRaw`SHOW COLUMNS FROM StaticPage`;
      const finalColumnNames = finalColumns.map(c => c.Field);
      console.log("Columnas actuales:", finalColumnNames.join(", "));
      
      rl.close();
    });
  } catch (error) {
    console.error("Error general:", error);
    rl.close();
  }
}

rl.on('close', async () => {
  await prisma.$disconnect();
  console.log("Script finalizado.");
  process.exit(0);
});

main().catch(e => {
  console.error("Error en script principal:", e);
  rl.close();
});
