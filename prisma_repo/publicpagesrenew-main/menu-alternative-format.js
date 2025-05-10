// Script para probar un formato alternativo para el menú de navegación
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Creando un nuevo formato para el menú de navegación...");
    
    // Crear elementos del menú con el mismo contenido
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
    
    // Crearemos un JSON aplanado con comillas simples para evitar problemas de escape
    const manualJSON = `[
      {
        "id": "${menuItems[0].id}",
        "label": "${menuItems[0].label}",
        "target": "${menuItems[0].target}",
        "customUrl": "${menuItems[0].customUrl}",
        "openInNewTab": ${menuItems[0].openInNewTab}
      },
      {
        "id": "${menuItems[1].id}",
        "label": "${menuItems[1].label}",
        "target": "${menuItems[1].target}",
        "customUrl": "${menuItems[1].customUrl}",
        "openInNewTab": ${menuItems[1].openInNewTab}
      }
    ]`;
    
    console.log("JSON construido manualmente:");
    console.log(manualJSON);
    
    // Verificar manualmente
    try {
      const parsed = JSON.parse(manualJSON);
      console.log("\nVerificación de parsing correcta:", !!parsed);
      console.log("Elementos encontrados:", parsed.length);
    } catch (e) {
      console.error("Error en verificación de parsing:", e);
      return;
    }
    
    // Actualizar en la base de datos con el formato manual
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET navigationMenu = ?
      WHERE id = 'global'
    `, manualJSON);
    
    console.log("\n✅ Menú con formato manual guardado exitosamente.");
    console.log("Por favor, reinicia el servidor de desarrollo (si está en ejecución) y recarga la página.");
    
    // Verificar que se guardó correctamente
    const result = await prisma.$queryRaw`
      SELECT navigationMenu
      FROM GlobalConfig
      WHERE id = 'global'
    `;
    
    if (result && result.length > 0) {
      console.log("\nValor guardado en la base de datos:");
      console.log(result[0].navigationMenu);
      
      try {
        const savedJson = JSON.parse(result[0].navigationMenu);
        console.log("\nVerificación del JSON guardado:");
        console.log(JSON.stringify(savedJson, null, 2));
      } catch (e) {
        console.error("Error al parsear el JSON guardado:", e);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
