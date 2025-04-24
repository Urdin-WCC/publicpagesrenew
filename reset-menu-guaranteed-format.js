// Script para reiniciar el menú de navegación con un formato garantizado y estándar
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Creando un nuevo menú de navegación con formato garantizado...");
    
    // Crear un array con los elementos del menú
    const menuItems = [
      {
        "id": "menu-item-" + Date.now() + "1",
        "label": "Inicio",
        "target": "home",
        "customUrl": "",
        "openInNewTab": false
      },
      {
        "id": "menu-item-" + Date.now() + "2",
        "label": "Blog",
        "target": "blog",
        "customUrl": "",
        "openInNewTab": false
      }
    ];
    
    // Convertir a JSON con formato estándar
    const menuJSON = JSON.stringify(menuItems);
    
    console.log("Nuevo menú creado:");
    console.log(menuJSON);
    
    // Verificar JSON
    try {
      const parsed = JSON.parse(menuJSON);
      console.log("\nVerificación de parsing correcta:", !!parsed);
    } catch (e) {
      console.error("Error en verificación de parsing:", e);
      return;
    }
    
    // Actualizar en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET navigationMenu = ?
      WHERE id = 'global'
    `, menuJSON);
    
    console.log("\n✅ Menú guardado exitosamente con formato garantizado.");
    console.log("Por favor, reinicia el servidor de desarrollo (si está en ejecución) y recarga la página para verificar si los cambios surten efecto.");
    
    // Verificar que se guardó correctamente
    const result = await prisma.$queryRaw`
      SELECT navigationMenu
      FROM GlobalConfig
      WHERE id = 'global'
    `;
    
    if (result && result.length > 0) {
      console.log("\nValor guardado en la base de datos:");
      console.log(result[0].navigationMenu);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
